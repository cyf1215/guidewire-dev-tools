import { app } from 'electron';
import { logger } from '../utils/logger';

// React DevTools 安装和管理
export class DevToolsService {
  private static instance: DevToolsService;
  private isReactDevToolsInstalled = false;

  private constructor() {}

  public static getInstance(): DevToolsService {
    if (!DevToolsService.instance) {
      DevToolsService.instance = new DevToolsService();
    }
    return DevToolsService.instance;
  }

  public async installReactDevTools(): Promise<void> {
    try {
      if (this.isReactDevToolsInstalled) {
        logger.info('React DevTools 已安装');
        return;
      }

      const installer = require('electron-devtools-installer');
      const REACT_DEVELOPER_TOOLS = installer.REACT_DEVELOPER_TOOLS;

      await installer.default(REACT_DEVELOPER_TOOLS);
      this.isReactDevToolsInstalled = true;
      logger.info('React DevTools 安装成功');
    } catch (error) {
      logger.error('安装 React DevTools 失败', error);
      throw error;
    }
  }

  public async uninstallReactDevTools(): Promise<void> {
    try {
      if (!this.isReactDevToolsInstalled) {
        logger.info('React DevTools 未安装');
        return;
      }

      const extensionsDir = app.getPath('userData') + '/extensions';
      const fs = require('fs');
      await fs.promises.rm(extensionsDir, { recursive: true, force: true });
      
      this.isReactDevToolsInstalled = false;
      logger.info('React DevTools 卸载成功');
    } catch (error) {
      logger.error('卸载 React DevTools 失败', error);
      throw error;
    }
  }

  public isInstalled(): boolean {
    return this.isReactDevToolsInstalled;
  }
} 