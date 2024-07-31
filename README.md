# Strapi plugin Self Backup

Backup your data without any provider
### Install
```
npm install @handwithfivefingers/strapi-plugin-self-backup
```

### Turn it on
At `rootDir/config/plugins.js`
```
"tm-backup": {
  enabled: true
}
```
At `rootDir/.env` need `DATABASE_PASSWORD` available
```
DATABASE_PASSWORD=xxx
```

Create `backup` folder

```
.
├── rootDir
│   └── file12.ext
└── backup

```

### Features
![Dashboard](./images/dashboard.png?raw=true "Dashboard")

![Setting](./images/setting.png?raw=true "Setting")


### Completed Implement ✓
- [x] mysql Backup
- [x] Manual create backup
- [x] Delete/Download

### Todo
- [ ] Lite SQL Backup
- [ ] Postgrest SQL Backup
- [ ] Automatic send mail when backup created 
- [ ] Push backup file to Storage Provider when backup created
- [ ] Schedule remove old backup

### Warning
- You need to create `backup` folder same level at rootDir to avoid restart
