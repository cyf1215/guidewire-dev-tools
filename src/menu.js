const { showUpdateSettings } = require('./updater');
const { updateElectronApp } = require('update-electron-app');

const template = [
  {
    label: '帮助',
    submenu: [
      {
        label: '检查更新',
        click: () => updateElectronApp({ checkNow: true })
      },
      {
        label: '更新设置',
        click: () => showUpdateSettings()
      }
    ]
  }
]; 