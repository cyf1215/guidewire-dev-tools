// 应用配置
export const APP_CONFIG = {
  DEV_SERVER_PORT: 5173,
  DEV_SERVER_URL: 'http://localhost:5173',
  LOADING_WINDOW: {
    WIDTH: 300,
    HEIGHT: 350
  },
  MAIN_WINDOW: {
    WIDTH: 1024,
    HEIGHT: 768
  }
} as const;

// 日志级别
export const LOG_LEVELS = {
  FILE: 'info',
  CONSOLE: 'debug'
} as const;

// IPC 通道
export const IPC_CHANNELS = {
  CHECK_UPDATES: 'check-for-updates',
  GET_APP_VERSION: 'get-app-version',
  GET_APP_PATH: 'get-app-path',
  OPEN_DEV_TOOLS: 'open-dev-tools',
  CLOSE_DEV_TOOLS: 'close-dev-tools',
  RELOAD_APP: 'reload-app',
  INSTALL_REACT_DEVTOOLS: 'install-react-devtools',
  UNINSTALL_REACT_DEVTOOLS: 'uninstall-react-devtools',
  IS_REACT_DEVTOOLS_INSTALLED: 'is-react-devtools-installed'
} as const; 