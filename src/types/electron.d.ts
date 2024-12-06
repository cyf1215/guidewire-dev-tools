// Electron API 类型定义
export interface IElectronAPI {
  checkForUpdates: () => Promise<void>;
  getAppVersion: () => Promise<string>;
  getAppPath: () => Promise<string>;
  openDevTools: () => Promise<void>;
  closeDevTools: () => Promise<void>;
  reloadApp: () => Promise<void>;
}

// 扩展 Window 接口
declare global {
  interface Window {
    electronAPI: IElectronAPI;
  }
} 