// 格式化错误信息
const formatError = (error: unknown): string => {
  if (error instanceof Error) {
    return `${error.name}: ${error.message}\n${error.stack}`;
  }
  return String(error);
};

// 导出日志工具
export const logger = {
  info: (message: string, ...args: unknown[]) => {
    console.log(`[INFO] ${message}`, ...args);
  },
  error: (message: string, error?: unknown) => {
    if (error) {
      console.error(`[ERROR] ${message}`, formatError(error));
    } else {
      console.error(`[ERROR] ${message}`);
    }
  },
  warn: (message: string, ...args: unknown[]) => {
    console.warn(`[WARN] ${message}`, ...args);
  },
  debug: (message: string, ...args: unknown[]) => {
    console.debug(`[DEBUG] ${message}`, ...args);
  }
}; 