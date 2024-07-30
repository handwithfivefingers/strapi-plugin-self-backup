"use strict";

const { getService } = require("../utils");
const PLUGIN_NAME = "tm-backup";

module.exports = ({ strapi }) => ({
  getSettings: async (ctx) => {
    const config = await getService("setting").getConfig();
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
      const bundleIdentifier = Date.now().toString();
      const backupDB = true;
      const backupUploads = true;
      const manual = true;
      const backupPath = data.localePath || "../";
      strapi.cron.add({
        [PLUGIN_NAME]: {
          task: () => {
            getService("backup").createBackup(
              bundleIdentifier,
              manual,
              backupDB,
              backupUploads,
              backupPath
            );
            console.log("TRIGGER TASK SUCCESS");
          },
          options: {
            rule:
              process.env.NODE_ENV === "development"
                ? "0,30 * * * * *"
                : data?.scheduleTime,
          },
        },
      });
    }

    // const defaultSetting = await getService("setting").getConfig();
    // console.log("defaultSetting", defaultSetting);

    ctx.send({ ok: true });
  },
});
