import { autoUpdater } from 'electron';
import log from 'electron-log';
import { dialog, app } from 'electron';
import { EventEmitter } from 'events';
import * as path from 'path';

// 配置日志输出格式
log.transports.console.format = '[{y}-{m}-{d} {h}:{i}:{s}] [{level}] {text}';

interface UpdateInfo {
  version: string;
  releaseNotes?: string;
}

class Updater extends EventEmitter {
  private initialized: boolean = false;

  constructor() {
    super();
    this.setupAutoUpdater();
  }

  private setupAutoUpdater(): void {
    if (process.platform === 'win32') {
      try {
        // Windows 平台使用 Squirrel.Windows
        const server = 'https://github.com/cyf1215/guidewire-dev-tools';
        const url = `${server}/releases/latest/download/RELEASES`;

        log.info('设置更新服务器:', url);
        autoUpdater.setFeedURL({
          url,
          headers: {
            'User-Agent': 'Guidewire Dev Tools'
          }
        });

        // 配置更新事件处理
        autoUpdater.on('error', (err: Error) => {
          log.error('更新错误:', err);
          this.emit('error', err);
        });

        autoUpdater.on('checking-for-update', () => {
          log.info('正在检查更新...');
          this.emit('checking-for-update');
        });

        autoUpdater.on('update-available', () => {
          log.info('发现新版本');
          dialog.showMessageBox({
            type: 'info',
            title: '发现新版本',
            message: '发现新版本，是否更新？',
            detail: `当前版本: ${app.getVersion()}`,
            buttons: ['更新', '稍后']
          }).then(({ response }) => {
            if (response === 0) {
              this.emit('update-available');
            }
          });
        });

        autoUpdater.on('update-not-available', () => {
          log.info('当前已是最新版本');
          dialog.showMessageBox({
            type: 'info',
            title: '检查更新',
            message: '当前已是最新版本',
            detail: `当前版本: ${app.getVersion()}`,
            buttons: ['确定']
          });
          this.emit('update-not-available');
        });

        autoUpdater.on('update-downloaded', (event, releaseNotes, releaseName) => {
          log.info('更新下载完成:', { releaseNotes, releaseName });
          dialog.showMessageBox({
            type: 'info',
            title: '安装更新',
            message: '更新已下载完成',
            detail: `版本: ${releaseName}\n\n更新说明:\n${releaseNotes}\n\n是否立即重启应用以完成安装？`,
            buttons: ['重启', '稍后']
          }).then(({ response }) => {
            if (response === 0) {
              autoUpdater.quitAndInstall();
            }
          });
          this.emit('update-downloaded');
        });

        this.initialized = true;
        log.info('更新器初始化完成');
      } catch (err) {
        log.error('更新器初始化失败:', err);
        this.initialized = false;
      }
    } else {
      log.warn('当前平台不支持自动更新');
    }
  }

  init(): void {
    try {
      log.info('正在初始化更新器...');

      if (!this.initialized) {
        log.warn('更新器未初始化，当前平台可能不支持自动更新');
        return;
      }

      // 设置自动检查更新间隔
      setInterval(() => {
        this.checkForUpdates().catch(err => {
          log.error('自动检查更新失败:', err);
        });
      }, 60 * 60 * 1000); // 每小时检查一次

      // 启动时检查一次更新
      setTimeout(() => {
        this.checkForUpdates().catch(err => {
          log.error('初始检查更新失败:', err);
        });
      }, 10000); // 延迟10秒检查，确保应用完全启动

      log.info('更新器初始化完成');
    } catch (err) {
      log.error('更新器初始化失败:', err);
      throw err;
    }
  }

  async checkForUpdates(): Promise<void> {
    try {
      if (!this.initialized) {
        throw new Error('更新器未初始化或当前平台不支持自动更新');
      }

      log.info('正在检查更新...');
      await autoUpdater.checkForUpdates();
    } catch (err) {
      log.error('检查更新失败:', err);
      throw err;
    }
  }
}

let updater: Updater | null = null;

export const initAutoUpdater = (): Updater | null => {
  const isDev = !app.isPackaged;
  log.info('初始化更新器, 是否开发环境:', isDev, '应用版本:', app.getVersion());

  if (!isDev) {
    try {
      if (!updater) {
        updater = new Updater();
        updater.init();
      }
      return updater;
    } catch (err) {
      log.error('更新器初始化失败:', err);
      return null;
    }
  } else {
    log.info('开发环境中不启用自动更新');
    return null;
  }
};

export const checkForUpdates = async (): Promise<void> => {
  try {
    if (!app.isPackaged) {
      dialog.showMessageBox({
        type: 'info',
        title: '开发环境提示',
        message: '开发环境中不支持更新检查',
        detail: '请使用打包后的应用测试更新功能',
        buttons: ['确定']
      });
      return;
    }

    if (!updater) {
      log.info('更新器未初始化，正在初始化...');
      updater = initAutoUpdater();
    }

    if (updater) {
      await updater.checkForUpdates();
    } else {
      throw new Error('无法初始化更新器');
    }
  } catch (err) {
    log.error('检查更新失败:', err);
    dialog.showMessageBox({
      type: 'error',
      title: '更新检查失败',
      message: err instanceof Error ? err.message : '未知错误',
      buttons: ['确定']
    });
  }
};
