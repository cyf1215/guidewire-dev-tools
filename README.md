# Guidewire Dev Tools

一个基于 Electron、Vue 3 和 TypeScript 的 Guidewire 开发工具应用。

## 功能特性

- 使用 TypeScript + Vue 3 开发，提供更好的类型安全性和开发体验
- 基于 Element Plus 的现代化 UI 界面
- 支持 Vue DevTools
- 开发环境热重载
- 跨平台支持 (Windows, macOS, Linux)
- 自动更新功能

## 安装方式

### 方式一：直接下载安装（推荐）

1. 访问 [Releases](https://github.com/cyf1215/guidewire-dev-tools/releases) 页面
2. 下载最新版本的安装包：
   - Windows: `Guidewire Dev Tools Setup.exe`
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

- Node.js (>= 18.0.0)
- npm 或 yarn 包管理器
- TypeScript 5.7 或更高版本
- Vue 3.3 或更高版本

## 开发

启动开发环境：

```bash
# 启动应用（开发模式）
npm start

# 构建应用
npm run build

# 预览构建后的应用
npm run preview

# 代码格式化
npm run format

# 代码检查
npm run lint

# 修复代码格式问题
npm run lint:fix
```

## 项目结构

```
src/
├── main/              # 主进程
│   ├── index.ts       # 主进程入口
│   ├── menu.ts        # 菜单配置
│   └── updater.ts     # 自动更新
├── preload/           # 预加载脚本
│   └── preload.ts     # 预加载脚本入口
├── renderer/          # 渲染进程
│   ├── App.vue        # 根组件
│   ├── index.html     # HTML 模板
│   ├── loading.html   # 加载页面
│   ├── renderer.ts    # 渲染进程入口
│   ├── router.ts      # 路由配置
│   ├── components/    # Vue 组件
│   ├── views/         # 页面视图
│   ├── styles/        # 样式文件
├── types/             # TypeScript 类型定义
├── utils/             # 工具函数
├── services/          # 服务层
└── constants/         # 常量定义
```

## 打包和发布

```bash
# 打包应用
npm run package

# 构建安装包
npm run make

# 发布新版本
npm run release

# 清理构建文件
npm run clean
```

## 开发注意事项

1. 开发模式下会自动开启 DevTools
2. 支持热重载，修改代码后应用会自动刷新
3. 主进程代码修改需要重启应用
4. TypeScript 和 ESLint 错误会在控制台显示
5. 使用 Prettier 进行代码格式化

## 主要依赖

- electron: ^33.0.0
- vue: ^3.5.13
- element-plus: ^2.9.0
- typescript: ^5.7.2
- electron-forge: ^7.6.0
- electron-vite: ^2.3.0
- vue-router: ^4.5.0
- electron-store: ^8.1.0
- electron-log: ^5.2.3

## 调试

1. 开发模式下自动打开 DevTools
2. Vue DevTools 扩展会自动安装
3. 可以通过 Console 查看日志输出
4. TypeScript 提供了更好的代码提示和类型检查

## 问题排查

如果遇到安装或启动问题：

1. 删除 node_modules 文件夹和 package-lock.json
2. 删除 out 和 dist 目录
3. 重新运行 `npm install`
4. 运行 `npm start`
5. 确保 Node.js 版本兼容（>=18.0.0）
6. 检查错误日志输出

## 安装说明

### Windows 用户

1. 下载最新版本的安装程序 `Guidewire Dev Tools Setup.exe`
2. 运行安装程序
3. 程序将安装到用户目录下：`%LOCALAPPDATA%\guidewire-dev-tools`
4. 等待安装完成
5. 从开始菜单或桌面快捷方式启动程序

### 卸载说明

1. 从 Windows 控制面板卸载
2. 或使用开始菜单中的卸载选项

## 作者

Ifan Cao <ifan.cao@capgemini.com>
