const { showUpdateSettings, checkForUpdates } = require('./updater');
const { app } = require('electron');

const template = [
  {
    label: '帮助',
    submenu: [
      {
        label: `当前版本：v${app.getVersion()}`,
        enabled: false  // 禁用点击
      },
      { type: 'separator' },  // 添加分隔线
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