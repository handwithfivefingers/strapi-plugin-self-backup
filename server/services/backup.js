// @ts-nocheck
"use strict";

const { createCoreService } = require("@strapi/strapi").factories;
const fs = require("fs");
const archiver = require("archiver");
const mysqldump = require("mysqldump");
const path = require("path");
const { sanitize } = require("@strapi/utils");
const { getService, getCoreStore } = require("../utils");
/**
 *  service
 */

const PLUGIN_NAME = "tm-backup";
const SERVICE_NAME = "backup";

module.exports = createCoreService("plugin::tm-backup.backup-setting", {
  get: async () => {
    return await strapi.db.query("plugin::tm-backup.backup-setting").findMany({
      orderBy: {
        id: "desc",
      },
    });
  },
  getByID: async ({ id }) => {
    return await strapi.db.query("plugin::tm-backup.backup-setting").findOne({
      id: id,
    });
  },
  deleteBackup: async ({ id }) => {
    return await strapi.db.query("plugin::tm-backup.backup-setting").delete({
      where: {
        id: id,
      },
    });
  },
  createBackup: async (
    bundleIdentifier = null,
    manual = true,
    backupDB = true,
    backupUploads = true
  ) => {
    if (!bundleIdentifier) {
      throw Error("You must provide a backup identifier to use this API.");
    }
    const rootDir = process.cwd();
    const backupTempPath = path.join(rootDir, "..", "backup", bundleIdentifier);
    await fs.mkdir(backupTempPath, (err) => {
      if (err) {
        throw Error(
          `Unhandled to create backup path. error: ${err.toString()}`
        );
      }
      strapi.log.info("Backup directory created successfully!");
    });

    /**
     * client
     * connection
     * pool
     * acquireConnectionTimeout
     */
    const dbConnection = strapi.config.database.connection;
    let res;
    if (dbConnection.client === "mysql") {
      res = await getService(SERVICE_NAME).backupMysql(bundleIdentifier, {
        ...dbConnection.connection,
        password: process.env.DATABASE_PASSWORD,
      });
    }

    if (backupUploads) {
      await getService(SERVICE_NAME).backupUploads(bundleIdentifier);
    }

    const createdEntry = await getService(SERVICE_NAME).bundleBackup({
      bundleIdentifier,
      manual,
      hasDB: backupDB,
      hasUploads: backupUploads,
      dbEngine: dbConnection.client,
    });

    await fs.rmdirSync(backupTempPath, { recursive: true });

    return {
      bundleIdentifier,
      manual,
      backupDB,
      backupUploads,
      data: createdEntry,
    };
  },
  bundleBackup: async ({
    bundleIdentifier,
    manual = true,
    hasDB = true,
    hasUploads = true,
    dbEngine,
  }) => {
    try {
      const rootDir = process.cwd();
      const bundleFolder = path.join(rootDir, "..", "backup", bundleIdentifier);
      const zipFolder = path.join(
        rootDir,
        "..",
        "backup",
        `${bundleIdentifier}.zip`
      );
      await getService(SERVICE_NAME).zipFolderToFile(bundleFolder, zipFolder);

      const fileStats = fs.statSync(zipFolder);
      const entity = await strapi.db
        .query("plugin::tm-backup.backup-setting")
        .create({
          data: {
            identifier: bundleIdentifier,
            backupPath: zipFolder,
            hasDB,
            hasUploads,
            manual,
            size: fileStats.size / (1024 * 1024),
            dbEngine: dbEngine,
          },
        });
      // const sanitizedEntity = await sanitizeEntity(entity);

      return {
        // sanitizedEntity,
        identifier: bundleIdentifier,
        backupPath: zipFolder,
        hasDB,
        hasUploads,
        strapiVersion: strapi.config.info.strapi,
        adminVersion: strapi.config.info.version,
        size: fileStats.size / (1024 * 1024),
        manual,
        dbEngine,
      };
    } catch (error) {
      console.log("error", error);
      throw new Error(error);
    }
  },

  backupMysql: async (bundleIdentifier, settings) => {
    strapi.log.info("Starting bookshelf backup from", settings.host);
    const rootDir = process.cwd();
    const pathToDatabaseBackup = path.join(
      rootDir,
      "..",
      "backup",
      bundleIdentifier,
      "/database.sql"
    );
    strapi.log.info("Dumping to", pathToDatabaseBackup);
    const res = await mysqldump({
      connection: {
        host: settings.host,
        user: settings.user,
        port: settings.port,
        password: settings.password,
        database: settings.database,
      },
      // dumpToFile: filePath,
    });

    await fs.appendFileSync(pathToDatabaseBackup, `${res.dump.schema}\n\n`);

    return {
      status: "success",
      content: res,
      message: "db backup succesfully created",
      backupUrl: "https://google.com/zip",
    };
  },
  deleteBackupBundle: async (bundlePath) => {
    const rootDir = process.cwd();
    const fullPath = `${rootDir}${bundlePath}`;
    // ensure exists or throw error
    await fs.lstat(fullPath, (err) => console.log("err is", err));
    await fs.unlinkSync(fullPath);
    return { success: true };
  },
  backupUploads: async (bundleIdentifier) => {
    const rootDir = process.cwd();
    const pathToDatabaseBackup = path.join(
      rootDir,
      "..",
      "backup",
      bundleIdentifier,
      "uploads.zip"
    );
    const savedFile = await getService(SERVICE_NAME).zipFolderToFile(
      `${rootDir}/public/uploads`,
      pathToDatabaseBackup
    );

    return { status: "success", backupPath: savedFile };
  },
  zipFolderToFile: async (pathToFolder, pathToZipFile) => {
    const output = fs.createWriteStream(pathToZipFile);
    const archive = archiver("zip", {
      zlib: { level: 9 }, // Sets the compression level.
    });
    try {
      await archive.pipe(output);
      // append files from a sub-directory, putting its contents at the root of archive
      await archive.directory(pathToFolder, false);
      await archive.finalize();
    } catch (err) {
      throw Error(`Unable to create zip file. error: ${err.toString()}`);
    }
    return output.path;
  },
});
