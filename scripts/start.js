const { platform } = process;
const { spawn } = require('child_process');

if (platform === 'win32') {
  // Windows 平台
  spawn('chcp 65001 && electron-vite dev', {
    shell: true,
    stdio: 'inherit',
  });
} else {
  // MacOS/Linux 平台
  spawn('electron-vite', ['dev'], {
    shell: true,
    stdio: 'inherit',
  });
}
