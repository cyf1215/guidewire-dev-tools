import { app, BrowserWindow, Menu } from 'electron';
import * as path from 'path';
import { initAutoUpdater } from './updater';
import { template } from './menu';

// 设置环境变量
process.env.ELECTRON_ENABLE_LOGGING = 'false';

// 错误处理
process.on('uncaughtException', (error: Error) => {
  console.error('未捕获的异常:', error);
});

process.on('unhandledRejection', (error: unknown) => {
  console.error('未处理的 Promise 拒绝:', error);
});

// 检查是否是 Squirrel 安装事件
if (require('electron-squirrel-startup')) {
  if (process.platform === 'win32') {
    const squirrelCommand = process.argv[1];
    switch (squirrelCommand) {
      case '--squirrel-install':
      case '--squirrel-updated':
        app.quit();
        break;
      case '--squirrel-uninstall':
        app.quit();
        break;
      case '--squirrel-obsolete':
        app.quit();
        break;
    }
  }
  app.quit();
}

const createWindow = (): void => {
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

  loadingWindow.loadFile(path.join(__dirname, 'loading.html'));

  // 创建主窗口
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    show: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  // 主窗口加载完成后的处理
  mainWindow.once('ready-to-show', () => {
    loadingWindow.close();
    mainWindow.show();
  });

  mainWindow.loadFile(path.join(__dirname, 'index.html'));

  // 只在开发模式下打开 DevTools
  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools();
  }
};

// 应用程序初始化
app.whenReady().then(() => {
  // 初始化更新器
  initAutoUpdater();
  
  createWindow();
  
  // 设置菜单
  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// 窗口关闭处理
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// 开发模式热重载
const isDev = process.env.NODE_ENV === 'development';

if (isDev) {
  try {
    require('electron-reloader')(module);
  } catch (_) {
    // 忽略错误
  }
} 