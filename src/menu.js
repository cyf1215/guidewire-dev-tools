const { checkForUpdates, showUpdateSettings } = require('./updater');

const template = [
  {
    label: '帮助',
    submenu: [
      {
        label: '检查更新',
        click: () => checkForUpdates(true) // true 表示这是手动检查
      },
      {
        label: '更新设置',
        click: () => showUpdateSettings()
      }
    ]
  }
]; 