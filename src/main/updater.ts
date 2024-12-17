import { updateElectronApp, UpdateSourceType } from 'update-electron-app';
import log from 'electron-log';
import { dialog, app } from 'electron';
import { EventEmitter } from 'events';

// 配置日志输出格式
log.transports.console.format = '[{y}-{m}-{d} {h}:{i}:{s}] [{level}] {text}';

interface UpdateStatus {
  version: string;
}

class Updater extends EventEmitter {
  private updateInstance: any;

  constructor() {
    super();
    this.updateInstance = null;
  }

  init(): void {
    this.updateInstance = updateElectronApp({
      updateSource: {
        type: UpdateSourceType.ElectronPublicUpdateService,
        host: 'https://github.com',
        repo: 'cyf1215/guidewire-dev-tools',
        updatePath: 'releases/latest'
      },
      updateInterval: '1 hour',  // 改回正常的更新间隔
      logger: log,
      notifyUser: false  // 使用自定义通知
    });
  }

  async checkForUpdates(): Promise<void> {
    if (this.updateInstance && this.updateInstance.checkForUpdates) {
      await this.updateInstance.checkForUpdates();
    }
  }

  downloadUpdate(): void {
    if (this.updateInstance && this.updateInstance.downloadUpdate) {
      this.updateInstance.downloadUpdate();
    }
  }

  quitAndInstall(): void {
    if (this.updateInstance && this.updateInstance.quitAndInstall) {
      this.updateInstance.quitAndInstall();
    }
  }
}

let updater: Updater | null = null;

// 配置自动更新
export const initAutoUpdater = (): Updater | null => {
  const isDev = !app.isPackaged;
  log.info('初始化更新器, 是否开发环境:', isDev, '应用版本:', app.getVersion());

  if (!isDev) {
    try {
      if (updater) {
        log.info('更新器已经初始化');
        return updater;
      }

      updater = new Updater();
      updater.init();

      // 监听更新事件
      updater.on('update-available', (status: UpdateStatus) => {
        log.info('检查更新状态:', status);
        dialog.showMessageBox({
          type: 'info',
          title: '发现新版本',
          message: `发现新版本 v${status.version}`,
          detail: `当前版本: v${app.getVersion()}\n最新版本: v${status.version}\n\n是否现在更新？`,
          buttons: ['更新', '稍后'],
          defaultId: 0
        }).then(({ response }) => {
          if (response === 0) {
            updater?.downloadUpdate();
          }
        });
      });

      updater.on('update-not-available', () => {
        log.info('没有可用的更新');
        dialog.showMessageBox({
          type: 'info',
          title: '检查更新',
          message: '当前已是最新版本',
          buttons: ['确定']
        });
      });

      updater.on('update-downloaded', () => {
        dialog.showMessageBox({
          type: 'info',
          title: '更新就绪',
          message: '更新已下载完成',
          detail: '重启应用以完成安装',
          buttons: ['立即重启', '稍后'],
          defaultId: 0
        }).then(({ response }) => {
          if (response === 0) {
            updater?.quitAndInstall();
          }
        });
      });

      log.info('更新器初始化成功');
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

// 手动检查更新
export const checkForUpdates = async (): Promise<void> => {
  try {
    log.info('开始手动检查更新...');

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
      log.info('正在执行更新检查...');
      await updater.checkForUpdates();
    } else {
      log.warn('更新器初始化失败，无法检查更新');
      dialog.showMessageBox({
        type: 'error',
        title: '更新检查失败',
        message: '无法初始化更新器',
        detail: '请确保应用已正确打包并且不在开发环境中运行',
        buttons: ['确定']
      });
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
