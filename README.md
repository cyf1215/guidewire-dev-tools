# Guidewire Dev Tools

一个基于 Electron 的开发工具应用。

## 功能特性

- 支持 React Developer Tools
- 开发环境热重载
- 跨平台支持 (Windows, macOS, Linux)

## 开发环境要求

- Node.js (推荐 v18 或更高版本)
- npm 或 yarn 包管理器

## 安装

1. 克隆项目

   ```bash
   git clone https://github.com/cyf1215/guidewire-dev-tools.git
   cd guidewire-dev-tools
   ```

2. 安装依赖

   ```bash
   npm install
   ```

   或者使用 yarn

   ```bash
   yarn install
   ```

## 开发

启动开发环境：

```bash
npm start
```

或者使用 yarn

```bash
yarn start
```

## 打包

### 打包所有平台

### 仅打包当前平台

```bash
npm run package
```

## 开发注意事项

1. 开发模式下会自动开启 DevTools
2. 支持热重载，修改代码后应用会自动刷新
3. 主进程代码修改需要重启应用

## 脚本命令说明

- `npm start`: 启动开发环境
- `npm run package`: 打包应用
- `npm run make`: 构建安装包
- `npm run publish`: 发布应用
- `npm run lint`: 运行代码检查

## 依赖说明

主要开发依赖：
- electron: ^33.0.0
- electron-forge: ^7.6.0
- electron-devtools-installer: ^3.2.0
- electron-reloader: ^1.2.3

## 调试

1. 开发模式下自动打开 DevTools
2. React Developer Tools 扩展会自动安装
3. 可以通过 Console 查看日志输出

## 问题排查

如果遇到安装或启动问题：

1. 删除 node_modules 文件夹和 package-lock.json
2. 重新运行 `npm install`
3. 确保 Node.js 版本兼容
4. 检查错误日志输出

## 许可证

MIT

## 作者

Ifan Cao <ifan.cao@capgemini.com>
