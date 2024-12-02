const { dialog } = require('electron');
const { autoUpdater } = require('electron-updater');

// 配置日志
autoUpdater.logger = require('electron-log');
autoUpdater.logger.transports.file.level = 'info';

// 检查更新
exports.checkForUpdates = () => {
  // 检查更新
  autoUpdater.checkForUpdates();

  // 发现更新
  autoUpdater.on('update-available', (info) => {
    dialog.showMessageBox({
      type: 'info',
      title: '发现新版本',
      message: `发现新版本 ${info.version}，是否更新？`,
      detail: '应用将在下载完成后自动安装更新',
      buttons: ['更新', '稍后'],
      defaultId: 0
    }).then(({ response }) => {
      if (response === 0) {
        autoUpdater.downloadUpdate();
      }
    });
  });

  // 更新下载进度
  autoUpdater.on('download-progress', (progressObj) => {
    // 可以在这里更新进度条
  });

  // 更新下载完成
  autoUpdater.on('update-downloaded', () => {
    dialog.showMessageBox({
      type: 'info',
      title: '更新就绪',
      message: '更新已下载完成，重启应用以完成安装',
      buttons: ['立即重启', '稍后'],
      defaultId: 0
    }).then(({ response }) => {
      if (response === 0) {
        autoUpdater.quitAndInstall(false, true);
      }
    });
  });

  // 检查更新错误
  autoUpdater.on('error', (err) => {
    dialog.showErrorBox('更新出错', err.message);
  });
}; 