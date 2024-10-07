"use strict";
const PLUGIN_NAME = "tm-backup";

const createDefaultConfig = async () => {
  const pluginStore = strapi.store({
    environment: "",
    type: "plugin",
    name: PLUGIN_NAME,
  });

  const value = {};
  await pluginStore.set({ key: "settings", value });
  return strapi
    .store({
      environment: "",
      type: "plugin",
      name: PLUGIN_NAME,
    })
    .get({ key: "settings" });
};

module.exports = ({ strapi }) => ({
  getConfig: async () => {
    let config = await strapi
      .store({
        environment: "",
        type: "plugin",
        name: PLUGIN_NAME,
      })
      .get({ key: "settings" });

    if (!config) {
      config = await createDefaultConfig();
    }
    return config;
  },
});
