const { PLUGIN_NAME } = require("../constant");

const path = require("path");
const archiver = require("archiver");
const mysqldump = require("mysqldump");
const fs = require("fs");

const getCoreStore = () => {
  return strapi.store({ type: "plugin", name: PLUGIN_NAME });
};

const getService = (name) => {
  return strapi.plugin(PLUGIN_NAME).service(name);
};

const compressSql = async ({ connection, bundleIdentifier }) => {
  try {
    const rootDir = process.cwd();
    const pathToDatabaseBackup = path.join(rootDir, "..", "backup", bundleIdentifier, "/database.sql");
    strapi.log.info("Dumping to", pathToDatabaseBackup);
    const res = await mysqldump({
      connection: {
        host: connection.host,
        user: connection.user,
        port: connection.port,
        password: connection.password,
        database: connection.database,
      },
    });

    await fs.appendFileSync(pathToDatabaseBackup, `SET FOREIGN_KEY_CHECKS = 0;\n\n`);
    await fs.appendFileSync(pathToDatabaseBackup, `${res.dump.schema}\n\n`);
    await fs.appendFileSync(pathToDatabaseBackup, `${res.dump.data}\n\n`);
    await fs.appendFileSync(pathToDatabaseBackup, `SET FOREIGN_KEY_CHECKS = 1;\n\n`);

    return {
      status: true,
      message: `Compress success to backup/${bundleIdentifier}/database.sql`,
    };
  } catch (error) {
    throw error;
  }
};
const compressSqlite = async ({ connection, bundleIdentifier }) => {
  console.log("start compress sqlite", connection, bundleIdentifier);
  const rootDir = process.cwd();
  const pathToDatabaseBackup = path.join(rootDir, "..", "backup", bundleIdentifier, "database.db");
  await fs.copyFileSync(`${connection.filename}`, pathToDatabaseBackup);
  return {
    status: "success",
    message: `Compress success to backup/${bundleIdentifier}/database.db`,
  };
};

const compressUploads = async ({ bundleIdentifier }) => {
  try {
    const rootDir = process.cwd();
    const pathToDatabaseBackup = path.join(rootDir, "..", "backup", bundleIdentifier, "uploads.zip");
    const savedFile = await zipFolder(`${rootDir}/public/uploads`, pathToDatabaseBackup);
    return { status: "success", backupPath: savedFile };
  } catch (err) {
    throw err;
  }
};

const zipFolder = async (pathToFolder, pathToZipFile) => {
  const output = fs.createWriteStream(pathToZipFile);
  const archive = archiver("zip", {
    zlib: { level: 9 }, // Sets the compression level.
  });
  try {
    console.log("Starting Compress");
    await archive.pipe(output);
    await archive.directory(pathToFolder, false);
    await archive.finalize();
  } catch (err) {
    console.log("Compress error", err);
    throw Error(`Unable to create zip file. error: ${err.toString()}`);
  }
  console.log("END Compress");

  return output.path;
};

module.exports = {
  getCoreStore,
  getService,
  compressSql,
  compressUploads,
  zipFolder,
  compressSqlite,
};
