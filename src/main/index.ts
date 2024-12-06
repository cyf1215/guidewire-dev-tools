import { app, BrowserWindow, Menu, ipcMain } from 'electron';
import * as path from 'path';
import { logger } from '../utils/logger';
import { initAutoUpdater, checkForUpdates } from './updater';
import { template } from './menu';
import { DevToolsService } from '../services/devtools';

// 错误处理
process.on('uncaughtException', (error: Error) => {
  logger.error('Uncaught Exception:', error);
  app.quit();
});

process.on('unhandledRejection', (error: unknown) => {
  logger.error('Unhandled Promise Rejection:', error);
});

// 检查是否是 Squirrel 安装事件
if (require('electron-squirrel-startup')) {
  logger.info('Handling Squirrel startup event');
  app.quit();
}

// 声明主窗口变量
let mainWindow: BrowserWindow | null = null;

const createWindow = async (): Promise<void> => {
  try {
    // 创建加载窗口
    const loadingWindow = new BrowserWindow({
      width: 300,
      height: 350,
      frame: false,
      transparent: true,
      webPreferences: {
        nodeIntegration: true
      }
    });

    // 在开发模式下使用 Vite 开发服务器
    if (process.env.NODE_ENV === 'development') {
      await loadingWindow.loadURL('http://localhost:5173/loading.html');
    } else {
      await loadingWindow.loadFile(path.join(__dirname, '../renderer/loading.html'));
    }

    // 创建主窗口
    mainWindow = new BrowserWindow({
      width: 1024,
      height: 768,
      show: false,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        preload: path.join(__dirname, '../preload/index.js'),
      },
    });

    // 主窗口加载完成后的处理
    mainWindow.once('ready-to-show', () => {
      loadingWindow.close();
      mainWindow?.show();
      logger.info('Main window is now visible');
    });

    // 在开发模式下使用 Vite 开发服务器
    if (process.env.NODE_ENV === 'development') {
      await mainWindow.loadURL('http://localhost:5173');
      mainWindow.webContents.openDevTools();
      logger.info('DevTools opened in development mode');
    } else {
      await mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
    }

    // 窗口关闭事件处理
    mainWindow.on('closed', () => {
      mainWindow = null;
      logger.info('Main window closed');
    });
  } catch (error) {
    logger.error('创建窗口时出错:', error);
    app.quit();
  }
};

// 应用程序初始化
app.whenReady().then(async () => {
  try {
    logger.info('Application starting up', {
      autoUpdate: process.env.AUTO_UPDATE === 'true',
      version: app.getVersion()
    });
    
    // 初始化更新器
    initAutoUpdater();
    
    await createWindow();
    
    // 设置菜单
    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
      }
    });
  } catch (error) {
    logger.error('Failed to initialize application:', error);
    app.quit();
  }
});

// 窗口关闭处理
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    logger.info('All windows closed, quitting application');
    app.quit();
  }
});

// 开发模式热重载
const isDev = process.env.NODE_ENV === 'development';

if (isDev) {
  try {
    require('electron-reloader')(module);
    logger.info('Development hot reload enabled');
  } catch (error) {
    logger.warn('Failed to enable hot reload:', error);
  }
}

// 添加 IPC 处理
ipcMain.handle('check-for-updates', async () => {
  try {
    await checkForUpdates();
  } catch (error) {
    logger.error('检查更新失败:', error);
    throw error;
  }
});

ipcMain.handle('get-app-version', () => {
  return app.getVersion();
});

ipcMain.handle('get-app-path', () => {
  return app.getAppPath();
});

ipcMain.handle('open-dev-tools', () => {
  if (mainWindow) {
    mainWindow.webContents.openDevTools();
  }
});

ipcMain.handle('close-dev-tools', () => {
  if (mainWindow) {
    mainWindow.webContents.closeDevTools();
  }
});

ipcMain.handle('reload-app', () => {
  if (mainWindow) {
    mainWindow.reload();
  }
});

// React DevTools 相关处理
ipcMain.handle('install-react-devtools', async () => {
  try {
    const devToolsService = DevToolsService.getInstance();
    await devToolsService.installReactDevTools();
    if (mainWindow) {
      mainWindow.reload();
    }
  } catch (error) {
    logger.error('安装 React DevTools 失败:', error);
    throw error;
  }
});

ipcMain.handle('uninstall-react-devtools', async () => {
  try {
    const devToolsService = DevToolsService.getInstance();
    await devToolsService.uninstallReactDevTools();
    if (mainWindow) {
      mainWindow.reload();
    }
  } catch (error) {
    logger.error('卸载 React DevTools 失败:', error);
    throw error;
  }
});

ipcMain.handle('is-react-devtools-installed', () => {
  const devToolsService = DevToolsService.getInstance();
  return devToolsService.isInstalled();
}); 