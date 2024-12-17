import { app, BrowserWindow, Menu, ipcMain } from 'electron';
import * as path from 'path';
import { logger } from '../utils/logger';
import { initAutoUpdater, checkForUpdates } from './updater';
import { template } from './menu';
import { DevToolsService } from '../services/devtools';

// 配置日志
logger.transports.file.level = 'debug';
logger.transports.console.level = 'debug';
logger.catchErrors();

// 记录基本信息
logger.info('应用启动');
logger.info(`应用版本: ${app.getVersion()}`);
logger.info(`运行环境: ${process.env.NODE_ENV}`);
logger.info(`可执行文件路径: ${app.getPath('exe')}`);
logger.info(`用户数据路径: ${app.getPath('userData')}`);

// 错误处理
process.on('uncaughtException', (error: Error) => {
  logger.error('未捕获的异常:', error);
  logger.error('错误堆栈:', error.stack);
  app.quit();
});

process.on('unhandledRejection', (error: unknown) => {
  logger.error('未处理的 Promise 拒绝:', error);
  logger.error('错误详情:', error);
});

// 检查是否是 Squirrel 安装事件
if (require('electron-squirrel-startup')) {
  logger.info('处理 Squirrel 启动事件');
  app.quit();
}

// 声明主窗口变量
let mainWindow: BrowserWindow | null = null;

const createWindow = async (): Promise<void> => {
  try {
    logger.info('开始创建窗口');
    logger.info('应用路径:', app.getAppPath());

    // 开发环境下打开开发者工具
    if (!app.isPackaged) {
      require('electron-debug')({ showDevTools: true });
      logger.info('开发环境：已启用开发者工具');
    }

    // 创建加载窗口
    const loadingWindow = new BrowserWindow({
      width: 300,
      height: 350,
      frame: false,
      transparent: true,
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false
      }
    });
    logger.info('加载窗口创建成功');

    // 在开发模式下使用 Vite 开发服务器
    if (process.env.NODE_ENV === 'development') {
      logger.info('加载开发环境loading页面');
      await loadingWindow.loadURL('http://localhost:5173/loading.html');
    } else {
      const loadingPath = path.join(app.getAppPath(), 'dist/renderer/loading.html');
      logger.info('加载生产环境loading页面:', loadingPath);
      await loadingWindow.loadFile(loadingPath);
    }
    logger.info('加载页面加载完成');

    // 创建主窗口
    mainWindow = new BrowserWindow({
      width: 1024,
      height: 768,
      show: false,
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false,
        webSecurity: false,
        preload: path.join(app.getAppPath(), 'dist/preload/index.js'),
      },
    });
    logger.info('主窗口创建成功');

    // 主窗口加载完成后的处理
    mainWindow.once('ready-to-show', () => {
      loadingWindow.close();
      mainWindow?.show();
      logger.info('主窗口显示成功');
    });

    mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
      logger.error('页面加载失败:', {
        errorCode,
        errorDescription,
        url: mainWindow?.webContents.getURL()
      });
    });

    mainWindow.webContents.on('did-finish-load', () => {
      logger.info('主页面加载完成');
    });

    // 在开发模式下使用 Vite 开发服务器
    if (process.env.NODE_ENV === 'development') {
      logger.info('加载开发环境主页面');
      await mainWindow.loadURL('http://localhost:5173');
      mainWindow.webContents.openDevTools();
      logger.info('开发者工具已打开');
    } else {
      const mainPath = path.join(app.getAppPath(), 'dist/renderer/index.html');
      logger.info('加载生产环境主页面:', mainPath);
      await mainWindow.loadFile(mainPath);
    }

    // 窗口关闭事件处理
    mainWindow.on('closed', () => {
      mainWindow = null;
      logger.info('主窗口已关闭');
    });
  } catch (error) {
    logger.error('创建窗口时出错:', error);
    logger.error('错误堆栈:', error instanceof Error ? error.stack : '未知错误');
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
