// vue.config.js
module.exports = {
    // 选项...
    publicPath: process.env.NODE_ENV === 'production'
      ? '/production-sub-path/'
      : '/',
    outputDir: 'dist',
    // 其他配置
  };
  