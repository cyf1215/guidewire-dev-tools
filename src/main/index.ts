import { app, BrowserWindow, Menu, ipcMain } from 'electron';
import * as path from 'path';
import { logger } from '../utils/logger';
import { initAutoUpdater, checkForUpdates } from './updater';
import { template } from './menu';
import { DevToolsService } from '../services/devtools';

// 错误处理
process.on('uncaughtException', (error: Error) => {
  logger.error('Uncaught Exception:', error);
  logger.error('错误堆栈:', error.stack);  // 添加错误堆栈信息
  app.quit();
});

process.on('unhandledRejection', (error: unknown) => {
  logger.error('Unhandled Promise Rejection:', error);
  logger.error('错误详情:', error);  // 添加详细错误信息
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
    logger.info('开始创建窗口');  // 添加日志
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
      logger.info('加载开发环境loading页面');  // 添加日志
      await loadingWindow.loadURL('http://localhost:5173/loading.html');
    } else {
      logger.info('加载生产环境loading页面');  // 添加日志
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
      logger.info('加载开发环境主页面');  // 添加日志
      await mainWindow.loadURL('http://localhost:5173');
      mainWindow.webContents.openDevTools();
      logger.info('DevTools opened in development mode');
    } else {
      logger.info('加载生产环境主页面');  // 添加日志
      await mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
    }

    // 窗口关闭事件处理
    mainWindow.on('closed', () => {
      mainWindow = null;
      logger.info('Main window closed');
    });
  } catch (error) {
    logger.error('创建窗口时出错:', error);
    logger.error('错误堆栈:', error instanceof Error ? error.stack : '未知错误');  // 添加错误堆栈信息
    app.quit();
  }
};

// 应用程序准备就绪时创建窗口
app.whenReady().then(async () => {
  logger.info('Electron初始化完成');

  try {
    await initAutoUpdater();
    logger.info('自动更新初始化完成');
  } catch (error) {
    logger.error('自动更新初始化失败:', error);
  }

  createWindow();
});

// 所有窗口关闭时退出应用
app.on('window-all-closed', () => {
  logger.info('所有窗口已关闭');
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
