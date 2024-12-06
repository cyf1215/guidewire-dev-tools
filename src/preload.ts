import { contextBridge, ipcRenderer } from 'electron';

// 定义暴露给渲染进程的 API 接口
interface IElectronAPI {
  // 这里定义需要暴露给渲染进程的方法类型
  // 例如:
  // sendMessage: (message: string) => void;
  // onResponse: (callback: (event: Electron.IpcRendererEvent, ...args: any[]) => void) => void;
}

// 通过 contextBridge 暴露 API 到渲染进程
contextBridge.exposeInMainWorld('electronAPI', {
  // 这里可以添加需要暴露给渲染进程的方法
  // 例如:
  // sendMessage: (message: string) => ipcRenderer.send('message', message),
  // onResponse: (callback) => ipcRenderer.on('response', callback)
} as IElectronAPI);

// 为 window 对象添加 electronAPI 类型定义
declare global {
  interface Window {
    electronAPI: IElectronAPI;
  }
} 