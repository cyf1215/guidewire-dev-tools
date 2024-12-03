const { dialog, app, ipcMain } = require('electron');
const { autoUpdater } = require('electron-updater');
const log = require('electron-log');
const Store = require('electron-store');

// 创建配置存储实例
const store = new Store();

// 配置日志
log.transports.file.level = 'info';
autoUpdater.logger = log;

// 检查是否是开发环境
const isDev = process.env.NODE_ENV === 'development';

// 配置更新源
autoUpdater.setFeedURL({
  provider: 'github',
  owner: 'cyf1215',
  repo: 'guidewire-dev-tools',
  token: process.env.GITHUB_TOKEN
});

// 从存储中获取自动更新设置
const getAutoUpdateEnabled = () => {
  return store.get('autoUpdate', true); // 默认启用
};

// 设置自动更新开关
exports.setAutoUpdate = (enabled) => {
  store.set('autoUpdate', enabled);
  log.info(`自动更新已${enabled ? '启用' : '禁用'}`);
};

// 检查更新
exports.checkForUpdates = (manual = false) => {
  // 在开发环境中不检查更新
  if (isDev) {
    log.info('开发环境中不检查更新');
    return;
  }

  // 如果不是手动检查且自动更新被禁用，则不检查
  if (!manual && !getAutoUpdateEnabled()) {
    log.info('自动更新已禁用');
    return;
  }

  log.info('开始检查更新...');
  
  // 检查更新
  autoUpdater.checkForUpdates().catch(err => {
    log.error('更新检查失败:', err);
  });

  // 发现更新
  autoUpdater.on('update-available', (info) => {
    log.info('发现新版本:', info.version);
    
    const autoUpdateEnabled = getAutoUpdateEnabled();
    const message = autoUpdateEnabled ? 
      `发现新版本 ${info.version}，是否更新？\n\n您可以在设置中关闭自动更新检查。` :
      `发现新版本 ${info.version}，是否更新？`;

    dialog.showMessageBox({
      type: 'info',
      title: '发现新版本',
      message: message,
      detail: `当前版本: ${app.getVersion()}\n新版本: ${info.version}\n\n应用将在下载完成后自动安装更新`,
      buttons: ['更新', '稍后', '设置'],
      defaultId: 0
    }).then(({ response }) => {
      if (response === 0) {
        autoUpdater.downloadUpdate();
      } else if (response === 2) {
        // 打开更新设置对话框
        showUpdateSettings();
      }
    });
  });

  // 没有可用更新
  autoUpdater.on('update-not-available', () => {
    log.info('当前已是最新版本');
  });

  // 更新下载进度
  autoUpdater.on('download-progress', (progressObj) => {
    log.info(`下载进度: ${progressObj.percent}%`);
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
    
    // 如果是找不到 latest.yml 的错误，只记录日志不显示错误对话框
    if (err.message.includes('latest.yml')) {
      log.info('未找到更新元数据文件，可能是首次发布或未配置自动更新');
      return;
    }
    
    // 其他错误仍然显示错误对话框
    dialog.showErrorBox('更新出错', err.message);
  });
};

// 显示更新设置对话框
const showUpdateSettings = () => {
  const currentSetting = getAutoUpdateEnabled();
  
  dialog.showMessageBox({
    type: 'question',
    title: '自动更新设置',
    message: '是否启用自动更新检查？',
    detail: '启用后，应用将在启动时自动检查更新。\n您随时可以手动检查更新。',
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