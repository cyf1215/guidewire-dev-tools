import log from 'electron-log';
import { app } from 'electron';
import * as path from 'path';

// 配置日志文件路径
const userData = app.getPath('userData');
log.transports.file.resolvePathFn = () => path.join(userData, 'logs/main.log');

// 配置日志格式
log.transports.file.format = '[{y}-{m}-{d} {h}:{i}:{s}.{ms}] [{level}] {text}';
log.transports.console.format = '[{y}-{m}-{d} {h}:{i}:{s}.{ms}] [{level}] {text}';

// 配置日志级别
log.transports.file.level = 'debug';
log.transports.console.level = 'debug';

// 配置日志文件大小
log.transports.file.maxSize = 10 * 1024 * 1024; // 10MB

// 配置日志文件保留数量
log.transports.file.archiveLog = (file) => {
  file = file.toString();
  const info = path.parse(file);
  return path.join(info.dir, `${info.name}.old${info.ext}`);
};

export const logger = log;
