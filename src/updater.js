const { updateElectronApp } = require('update-electron-app');
const log = require('electron-log');
const { dialog, app } = require('electron');

let updater = null;

// 配置自动更新
exports.initAutoUpdater = () => {
  const isDev = process.env.NODE_ENV === 'development';
  if (isDev) {
    log.info('开发环境中不启用自动更新');
    return;
  }

  try {
    updater = updateElectronApp({
      repo: 'cyf1215/guidewire-dev-tools',
      updateInterval: '5 minute',  // 测试用，之后改回合适的间隔
      logger: log,
      notifyUser: false,
      onUpdateCheck: (status) => {
        if (status === false) {
          log.info('没有可用的更新');
          return;
        }

        if (status && status.version) {
          dialog.showMessageBox({
            type: 'info',
            title: '发现新版本',
            message: `发现新版本 v${status.version}`,
            detail: `当前版本: v${app.getVersion()}\n最新版本: v${status.version}\n\n是否现在更新？`,
            buttons: ['更新', '稍后'],
            defaultId: 0
          }).then(({ response }) => {
            if (response === 0) {
              updater.downloadUpdate();
            }
          });
        }
      },
      onUpdateDownloaded: () => {
        dialog.showMessageBox({
          type: 'info',
          title: '更新就绪',
          message: '更新已下载完成',
          detail: '重启应用以完成安装',
          buttons: ['立即重启', '稍后'],
          defaultId: 0
        }).then(({ response }) => {
          if (response === 0) {
            updater.quitAndInstall();
          }
        });
      }
    });

    log.info('更新器初始化成功');
  } catch (err) {
    log.error('更新器初始化失败:', err);
  }
};

// 手动检查更新
exports.checkForUpdates = async () => {
  try {
    if (!updater) {
      log.info('更新器未初始化，正在初始化...');
      exports.initAutoUpdater();
    }
    
    if (updater) {
      log.info('正在检查更新...');
      await updater.checkForUpdates();
    }
  } catch (err) {
    log.error('检查更新失败:', err);
  }
}; 