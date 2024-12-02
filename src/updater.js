const { dialog } = require('electron');
const { autoUpdater } = require('electron-updater');
const log = require('electron-log');

// 配置日志
log.transports.file.level = 'info';
autoUpdater.logger = log;

// 配置更新源
autoUpdater.setFeedURL({
  provider: 'github',
  owner: 'cyf1215',
  repo: 'guidewire-dev-tools',
  token: process.env.GITHUB_TOKEN
});

// 检查更新
exports.checkForUpdates = () => {
  // 检查更新
  autoUpdater.checkForUpdates().catch(err => {
    log.error('更新检查失败:', err);
  });

  // 发现更新
  autoUpdater.on('update-available', (info) => {
    log.info('发现新版本:', info.version);
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
    log.info('下载进度:', progressObj.percent);
    // 这里可以添加进度条更新逻辑
  });

  // 更新下载完成
  autoUpdater.on('update-downloaded', () => {
    log.info('更新下载完成');
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
    log.error('更新错误:', err);
    dialog.showErrorBox('更新出错', err.message);
  });
}; 