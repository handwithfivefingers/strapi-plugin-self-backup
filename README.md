### UPDATING
- Fixed can't create backup manual (api name issue )
- Fixed only generate Create Schema 
- Implemented deleted file before delete on database
- Lite SQL Backup
- Schedule remove old backup
- Now Entity will create first and update file when file generated successfully ( avoid freeze browser, unable to generate file )
- 

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
- [x] Lite SQL Backup
- [x] Schedule remove old backup


### Todo
- [ ] Postgrest SQL Backup
- [ ] Automatic send mail when backup created 
- [ ] Push backup file to Storage Provider when backup created

### Warning
- You need to create `backup` folder same level at rootDir to avoid restart
