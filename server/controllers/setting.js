"use strict";

const { SETTING_SERVICE, PLUGIN_NAME } = require("../constant");
const { getService } = require("../utils");

module.exports = ({ strapi }) => ({
  getSettings: async (ctx) => {
    const config = await getService(SETTING_SERVICE).getConfig();
    ctx.send({ data: config });
  },
  updateSettings: async (ctx) => {
    const data = ctx.request.body;
    await strapi
      .store({
        environment: "",
        type: "plugin",
        name: PLUGIN_NAME,
      })
      .set({ key: "settings", value: data });

    const crons = strapi.cron.jobs;
    const index = crons.findIndex((c) => c.name === PLUGIN_NAME);
    if (index !== -1) {
      strapi.cron.remove(PLUGIN_NAME);
    }
    if (data.manual) {
      const manual = true;
      const backupPath = data.localePath || "../";
      strapi.cron.add({
        [PLUGIN_NAME]: {
          task: async () => {
            const setting = await getService(SETTING_SERVICE).getConfig();
            const bundleIdentifier = Date.now().toString();
            getService("backup").createBackup(
              bundleIdentifier,
              manual,
              setting.hasDB,
              setting.hasUploads,
              backupPath,
              setting.autoRemove
            );
          },
          options: {
            rule: data?.scheduleTime || "0 0 * * 1-7",
          },
        },
      });
    }
    ctx.send({ ok: true });
  },
});
