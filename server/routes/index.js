module.exports = [
  {
    method: "GET",
    path: "/setting",
    handler: "setting.getSettings",
    config: {
      policies: [],
    },
  },
  {
    method: "PUT",
    path: "/setting",
    handler: "setting.updateSettings",
    config: {
      policies: [],
    },
  },
  {
    method: "GET",
    path: "/backups",
    handler: "backup.get",
    config: {
      policies: [],
    },
  },
  {
    method: "POST",
    path: "/backup",
    handler: "backup.createBackup",
    config: {
      policies: [],
    },
  },
  {
    method: "GET",
    path: "/backup/:id",
    handler: "backup.getBackup",
    config: {
      policies: [],
    },
  },
  {
    method: "DELETE",
    path: "/backup/:id",
    handler: "backup.deleteBackup",
    config: {
      policies: [],
    },
  },
  {
    method: "POST",
    path: "/backup",
    handler: "backup.createBackup",
    config: {
      policies: [],
    },
  },
];
