const { app, BrowserWindow, Menu } = require('electron');
const path = require('node:path');
const started = require('electron-squirrel-startup');
const { initAutoUpdater } = require('./updater');
const { template } = require('./menu');

// 在文件顶部添加
process.on('uncaughtException', (error) => {
  console.error('未捕获的异常:', error);
});

process.on('unhandledRejection', (error) => {
  console.error('未处理的 Promise 拒绝:', error);
});

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (started) {
  if (process.platform === 'win32') {
    const squirrelCommand = process.argv[1];
    switch (squirrelCommand) {
      case '--squirrel-install':
      case '--squirrel-updated':
        // 执行安装后的操作
        app.quit();
        break;
      case '--squirrel-uninstall':
        // 执行卸载前的清理
        app.quit();
        break;
      case '--squirrel-obsolete':
        app.quit();
        break;
    }
  }
  app.quit();
}

const createWindow = () => {
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

  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    show: false,  // 初始不显示
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  // 主窗口加载完成后
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

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
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

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.

const isDev = process.env.NODE_ENV === 'development';

if (isDev) {
  try {
    require('electron-reloader')(module);
  } catch (_) {}
}

// 在文件最顶部添加
process.env.ELECTRON_ENABLE_LOGGING = false;
