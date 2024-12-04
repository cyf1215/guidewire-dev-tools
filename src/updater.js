const { dialog, app } = require('electron');
const { updateElectronApp } = require('update-electron-app');
const log = require('electron-log');
const Store = require('electron-store');

// 创建配置存储实例
const store = new Store();

// 保存更新器实例
let updater = null;

// 从存储中获取自动更新设置
const getAutoUpdateEnabled = () => {
  return store.get('autoUpdate', true); // 默认启用
};

// 设置自动更新开关
exports.setAutoUpdate = (enabled) => {
  store.set('autoUpdate', enabled);
  log.info(`自动更新已${enabled ? '启用' : '禁用'}`);
  // 重新初始化更新器
  exports.initAutoUpdater();
};

// 配置自动更新
exports.initAutoUpdater = () => {
  const isDev = process.env.NODE_ENV === 'development';
  if (isDev) {
    log.info('开发环境中不启用自动更新');
    return;
  }

  try {
    updater = updateElectronApp({
      logger: log,
      repo: 'cyf1215/guidewire-dev-tools',
      updateInterval: '1 hour',
      enabled: getAutoUpdateEnabled(),
      notifyUser: false,  // 关闭默认通知，使用自定义通知
      onUpdateCheck: (status) => {
        if (!status) {
          dialog.showMessageBox({
            type: 'info',
            title: '检查更新',
            message: '当前已是最新版本',
            detail: `当前版本: v${app.getVersion()}`,
            buttons: ['确定']
          });
          return;
        }

        dialog.showMessageBox({
          type: 'info',
          title: '发现新版本',
          message: `发现新版本 v${status.version}`,
          detail: `当前版本: v${app.getVersion()}\n最新版本: v${status.version}\n\n是否现在更新？`,
          buttons: ['更新', '稍后', '设置'],
          defaultId: 0
        }).then(({ response }) => {
          if (response === 0) {
            updater.downloadUpdate();
          } else if (response === 2) {
            showUpdateSettings();
          }
        });
      }
    });

    log.info('更新器初始化成功');
  } catch (err) {
    log.error('更新器初始化失败:', err);
    dialog.showErrorBox('更新器初始化失败', err.message);
  }
};

// 手动检查更新
exports.checkForUpdates = async () => {
  try {
    if (!updater) {
      log.info('更新器未初始化，正在初始化...');
      exports.initAutoUpdater();
    }
    
    if (!updater) {
      throw new Error('更新器初始化失败');
    }

    log.info('正在检查更新...');
    await updater.checkForUpdates();
  } catch (err) {
    log.error('检查更新失败:', err);
    dialog.showErrorBox('更新检查失败', err.message);
  }
};

// 显示更新设置对话框
const showUpdateSettings = () => {
  const currentSetting = getAutoUpdateEnabled();
  
  dialog.showMessageBox({
    type: 'question',
    title: '自动更新设置',
    message: '是否启用自动更新检查？',
    detail: '启用后，应用将每小时自动检查更新。\n您随时可以手动检查更新。',
    buttons: ['启用', '禁用'],
    defaultId: currentSetting ? 0 : 1
  }).then(({ response }) => {
    const enabled = response === 0;
    exports.setAutoUpdate(enabled);
  });
};

// 导出设置相关方法
exports.showUpdateSettings = showUpdateSettings;
exports.getAutoUpdateEnabled = getAutoUpdateEnabled; 