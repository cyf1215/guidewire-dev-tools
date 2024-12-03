const { showUpdateSettings, checkForUpdates } = require('./updater');

const template = [
  {
    label: '帮助',
    submenu: [
      {
        label: '检查更新',
        click: () => checkForUpdates()
      },
      {
        label: '更新设置',
        click: () => showUpdateSettings()
      }
    ]
  }
];

// 导出模板
exports.template = template; 