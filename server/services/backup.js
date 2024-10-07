// @ts-nocheck
"use strict";

const { createCoreService } = require("@strapi/strapi").factories;
const fs = require("fs");
const path = require("path");
const { getService, compressUploads, compressSql, zipFolder, compressSqlite } = require("../utils");
const { exec } = require("child_process");
const { SETTING_SERVICE } = require("../constant");
/**
 *  service
 */

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
    const entity = await getService(SERVICE_NAME).getByID({ id });
    getService(SERVICE_NAME).deleteSideEffect(entity.backupPath);
    return await strapi.db.query("plugin::tm-backup.backup-setting").delete({
      where: {
        id: id,
      },
    });
  },
  createBackup: async (bundleIdentifier = null, manual = true, backupDB = true, backupUploads = true) => {
    const targetBundle = [];
    try {
      if (!bundleIdentifier) {
        throw Error("You must provide a backup identifier to use this API.");
      }
      const rootDir = process.cwd();
      const backupTempPath = path.join(rootDir, "..", "backup", bundleIdentifier);
      await fs.mkdir(backupTempPath, (err) => {
        if (err) {
          throw Error(`Unhandled to create backup path. error: ${err.toString()}`);
        }
        strapi.log.info("Backup directory created successfully!");
      });

      /**
       * client
       * connection
       * pool
       * acquireConnectionTimeout
       */
      const { client, connection } = strapi.config.database.connection;
      connection.password = process.env.DATABASE_PASSWORD;
      if (backupDB) {
        if (client === "mysql") targetBundle.push(compressSql({ bundleIdentifier, connection }));
        if (client === "sqlite") targetBundle.push(compressSqlite({ bundleIdentifier, connection }));
      }
      if (backupUploads) targetBundle.push(compressUploads({ bundleIdentifier }));
      if (!targetBundle.length) return { status: true, message: "None is select" };

      const entity = await strapi.db.query("plugin::tm-backup.backup-setting").create({
        data: {
          identifier: bundleIdentifier,
          backupPath: "Pending...",
          hasDB: backupDB,
          hasUploads: backupUploads,
          manual,
          size: 0,
          dbEngine: client,
        },
      });

      getService(SERVICE_NAME).backupSideEffect({
        entityID: entity.id,
        entity,
        targetBundle,
        bundleIdentifier,
      }); // Side Effect
      return {
        ...entity,
        status: "success",
      };
    } catch (error) {
      throw error;
    } finally {
      console.log("coming side effect");
    }
  },

  backupSideEffect: async ({ entityID, targetBundle, bundleIdentifier }) => {
    let canDelete = false;
    try {
      if (!entityID) return;
      const [isCompressSQL, isCompressUploads] = await Promise.all(targetBundle);
      if (!isCompressSQL && !isCompressUploads) return;
      const rootDir = process.cwd();

      const bundleFolder = path.join(rootDir, "..", "backup", bundleIdentifier);
      const targetFolder = path.join(rootDir, "..", "backup", `${bundleIdentifier}.zip`);
      // Zip FOLDER
      await zipFolder(bundleFolder, targetFolder);
      // Remove Folder
      getService(SERVICE_NAME).deleteSideEffect(bundleFolder);

      let fileStats = fs.statSync(targetFolder);

      await strapi.db.query("plugin::tm-backup.backup-setting").update({
        where: {
          id: entityID,
        },
        data: {
          backupPath: targetFolder,
          size: fileStats.size / (1024 * 1024),
        },
      });
      canDelete = true;
    } catch (error) {
      console.log("Side Effect error ", error);
      canDelete = false;
    } finally {
      if (canDelete) {
        const setting = await getService(SETTING_SERVICE).getConfig();
        console.log("can delete and setting is", setting);
        if (setting.autoRemove) {
          const record = await strapi.db.query("plugin::tm-backup.backup-setting").findMany({
            filters: {
              id: {
                $lt: entityID,
              },
            },
          });
          for (let r of record) {
            console.log("DELETE ", r.id);
            getService(SERVICE_NAME).deleteSideEffect(r.backupPath);
            await strapi.db.query("plugin::tm-backup.backup-setting").delete({ where: { id: r.id } });
          }
        }
      }
    }
  },

  deleteSideEffect: async (target) => {
    try {
      const stats = fs.lstatSync(target);
      if (stats) {
        fs.unlink(target, (error) => {
          if (error) {
            console.log("error", error);
            exec(`rm -rf ${target}`);
          }
        });
      }
    } catch (error) {
      console.log("deleteSideEffect error", error);
    }
  },
});
