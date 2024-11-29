// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

const { contextBridge, ipcRenderer } = require('electron')

// 通过 contextBridge 暴露 API 到渲染进程
contextBridge.exposeInMainWorld('electronAPI', {
  // 这里可以添加需要暴露给渲染进程的方法
  // 例如:
  // sendMessage: (message) => ipcRenderer.send('message', message),
  // onResponse: (callback) => ipcRenderer.on('response', callback)
})
