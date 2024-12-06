# Guidewire Dev Tools

一个基于 Electron 和 TypeScript 的开发工具应用。

## 功能特性

- 使用 TypeScript 开发，提供更好的类型安全性
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
- TypeScript 5.7 或更高版本

## 开发

启动开发环境：

```bash
# 启动应用
npm start

# 仅编译 TypeScript
npm run build

# 监视模式（自动编译）
npm run watch
```

## 项目结构

```
src/
├── index.ts          # 主进程入口
├── menu.ts          # 菜单配置
├── updater.ts       # 自动更新
├── preload.ts       # 预加载脚本
├── index.html       # 主窗口
└── loading.html     # 加载窗口
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
4. TypeScript 编译错误会在控制台显示
5. 使用 ESLint 进行代码检查

## 脚本命令说明

- `npm start`: 启动开发环境
- `npm run build`: 编译 TypeScript 代码
- `npm run watch`: 监视模式编译
- `npm run package`: 打包应用
- `npm run make`: 构建安装包
- `npm run publish`: 发布应用
- `npm run lint`: 运行代码检查

## 依赖说明

主要开发依赖：
- typescript: ^5.7.2
- electron: ^33.0.0
- electron-forge: ^7.6.0
- electron-devtools-installer: ^3.2.0
- electron-reloader: ^1.2.3
- eslint: ^9.16.0
- @typescript-eslint/eslint-plugin: ^8.17.0
- @typescript-eslint/parser: ^8.17.0

## 调试

1. 开发模式下自动打开 DevTools
2. React Developer Tools 扩展会自动安装
3. 可以通过 Console 查看日志输出
4. TypeScript 提供了更好的代码提示和类型检查

## 问题排查

如果遇到安装或启动问题：

1. 删除 node_modules 文件夹和 package-lock.json
2. 删除 dist 目录（编译输出）
3. 重新运行 `npm install`
4. 运行 `npm run build`
5. 确保 Node.js 版本兼容
6. 检查错误日志输出

## 许可证

MIT

## 作者

Ifan Cao <ifan.cao@capgemini.com>

## 安装说明

### Windows 用户

1. 下载最新版本的安装程序 `Guidewire Dev Tools Setup.exe`
2. 运行安装程序
3. 程序将安装到用户目录下：`%LOCALAPPDATA%\guidewire_dev_tools`（通常是 `C:\Users\[用户名]\AppData\Local\guidewire_dev_tools`）
4. 等待安装完成
5. 从开始菜单或桌面快捷方式启动程序

### 卸载说明

1. 从 Windows 控制面板卸载
2. 或使用开始菜单中的卸载选项
