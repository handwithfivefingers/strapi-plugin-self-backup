// 'use strict';

const { BACKUP_SERVICE } = require("../constant");
const { getService } = require("../utils");
const { createCoreController } = require("@strapi/strapi").factories;
const fs = require("fs");
/**
 *  controller
 */

module.exports = createCoreController("plugin::tm-backup.backup-setting", ({ strapi }) => ({
  get: async (ctx) => {
    ctx.body = await getService(BACKUP_SERVICE).get();
  },
  createBackup: async (ctx) => {
    try {
      const bundleIdentifier = Date.now().toString();
      const backupDB = ctx.request?.body?.hasDB;
      const backupUploads = ctx.request?.body?.hasUploads;
      const manual = false;
      const result = await getService("backup").createBackup(bundleIdentifier, manual, backupDB, backupUploads);
      if (result.status === "success") {
        ctx.send({
          created: result.data,
        });
      } else {
        ctx.send({
          ...result,
        });
      }
    } catch (error) {
      strapi.log.error(error);
      ctx.send({ status: "failure", message: error.toString() });
    }
  },
  getBackup: async (ctx) => {
    const backup = await getService("backup").getByID({
      id: ctx.params.id,
    });
    await fs.lstat(`${backup.backupPath}`, (err) => console.log("err is", err));
    ctx.body = await fs.createReadStream(`${backup.backupPath}`);
    ctx.set("Content-Type", `application/zip`);
    ctx.set("Content-disposition", `attachment; filename=backup.zip`);
    ctx.status = 200;
  },
  deleteBackup: async (ctx) => {
    const backup = await getService("backup").deleteBackup({
      id: ctx.params.id,
    });
    ctx.send({ status: "successs" });
  },
}));
