import { contextBridge, ipcRenderer } from 'electron';

// API 类型定义
interface IElectronAPI {
  checkForUpdates: () => Promise<void>;
  getAppVersion: () => Promise<string>;
  getAppPath: () => Promise<string>;
  openDevTools: () => Promise<void>;
  closeDevTools: () => Promise<void>;
  reloadApp: () => Promise<void>;
  installReactDevTools: () => Promise<void>;
  uninstallReactDevTools: () => Promise<void>;
  isReactDevToolsInstalled: () => Promise<boolean>;
}

// 创建 API 对象
const electronAPI: IElectronAPI = {
  checkForUpdates: () => ipcRenderer.invoke('check-for-updates'),
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  getAppPath: () => ipcRenderer.invoke('get-app-path'),
  openDevTools: () => ipcRenderer.invoke('open-dev-tools'),
  closeDevTools: () => ipcRenderer.invoke('close-dev-tools'),
  reloadApp: () => ipcRenderer.invoke('reload-app'),
  installReactDevTools: () => ipcRenderer.invoke('install-react-devtools'),
  uninstallReactDevTools: () => ipcRenderer.invoke('uninstall-react-devtools'),
  isReactDevToolsInstalled: () => ipcRenderer.invoke('is-react-devtools-installed')
};

// 通过 contextBridge 暴露 API 到渲染进程
contextBridge.exposeInMainWorld('electronAPI', electronAPI);

// 为 window 对象添加 electronAPI 类型定义
declare global {
  interface Window {
    electronAPI: IElectronAPI;
  }
} 