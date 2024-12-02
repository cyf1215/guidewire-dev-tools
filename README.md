# Guidewire Dev Tools

一个基于 Electron 的开发工具应用。

## 功能特性

- 支持 React Developer Tools
- 开发环境热重载
- 跨平台支持 (Windows, macOS, Linux)

## 安装方式

### 方式一：直接下载安装（推荐）

1. 访问 [Releases](https://github.com/cyf1215/guidewire-dev-tools/releases) 页面
2. 下载最新版本的安装包：
   - Windows: `guidewire-dev-tools-[版本号].Setup.exe`
   - macOS: 即将支持
   - Linux: 即将支持
3. 运行安装程序，按照提示完成安装

### 方式二：从源码构建

1. 克隆项目

   ```bash
   git clone https://github.com/cyf1215/guidewire-dev-tools.git
   cd guidewire-dev-tools
   ```

2. 安装依赖

   ```bash
   npm install
   ```

3. 构建应用

   ```bash
   npm run make
   ```

4. 安装包位置：
   - Windows: `out/make/squirrel.windows/x64`
   - macOS: `out/make/zip/darwin/x64`
   - Linux: `out/make/deb/x64` 或 `out/make/rpm/x64`

## 开发环境要求

- Node.js (推荐 v18 或更高版本)
- npm 或 yarn 包管理器

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

## 安装说明

### Windows 用户

1. 下载最新版本的安装程序 `Guidewire Dev Tools Setup.exe`
2. 运行安装程序
3. 选择安装位置（默认为 `C:\Program Files\Guidewire Dev Tools`）
4. 等待安装完成
5. 从开始菜单或桌面快捷方式启动程序

### 卸载说明

1. 从 Windows 控制面板卸载
2. 或使用开始菜单中的卸载选项
