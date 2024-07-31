const { PLUGIN_NAME } = require("../constant");

const getCoreStore = () => {
  return strapi.store({ type: "plugin", name: PLUGIN_NAME });
};

const getService = (name) => {
  return strapi.plugin(PLUGIN_NAME).service(name);
};

module.exports = {
  getCoreStore,
  getService,
};
