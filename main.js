const { default: installExtension, REACT_DEVELOPER_TOOLS } = require('electron-devtools-installer');

// 安装扩展
installExtension(REACT_DEVELOPER_TOOLS)
  .then((name) => console.log(`已添加扩展：${name}`))
  .catch((err) => console.log('安装扩展失败：', err)); 