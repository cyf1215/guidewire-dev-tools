const { checkForUpdates } = require('./updater');
const { app } = require('electron');

const template = [
  {
    label: '帮助',
    submenu: [
      {
        label: `当前版本：v${app.getVersion()}`,
        enabled: false
      },
      { type: 'separator' },
      {
        label: '检查更新',
        click: () => checkForUpdates()
      }
    ]
  }
];

exports.template = template; 