const { updateElectronApp } = require('update-electron-app');
const log = require('electron-log');
const { dialog, app } = require('electron');

// 配置日志输出格式
log.transports.console.format = '[{y}-{m}-{d} {h}:{i}:{s}] [{level}] {text}';
log.transports.file.encoding = 'utf8';

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
      updateInterval: '5 minute',
      logger: log,
      notifyUser: false,
      onUpdateCheck: (status) => {
        log.info('检查更新状态:', status);
        if (status === false) {
          log.info('没有可用的更新');
          dialog.showMessageBox({
            type: 'info',
            title: '检查更新',
            message: '当前已是最新版本',
            buttons: ['确定']
          });
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
    log.info('开始手动检查更新...');
    
    if (!updater) {
      log.info('更新器未初始化，正在初始化...');
      exports.initAutoUpdater();
    }
    
    if (updater) {
      log.info('正在执行更新检查...');
      await updater.checkForUpdates();
    } else {
      log.warn('更新器初始化失败，无法检查更新');
      dialog.showMessageBox({
        type: 'error',
        title: '更新检查失败',
        message: '无法初始化更新器',
        buttons: ['确定']
      });
    }
  } catch (err) {
    log.error('检查更新失败:', err);
    dialog.showMessageBox({
      type: 'error',
      title: '更新检查失败',
      message: err.message,
      buttons: ['确定']
    });
  }
}; 