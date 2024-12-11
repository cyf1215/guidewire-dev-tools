# Guidewire Dev Tools

一个为 Guidewire 开发人员设计的工具集，集成了多种 AI 模型支持。

## 功能特点

- 多模型 AI 聊天支持
  - OpenAI
  - DeepSeek
  - Ollama (本地模型)
- 智能对话历史记录
- 实时流式响应
- Markdown 格式支持
- 代码高亮显示
- 使用 TypeScript 开发，提供更好的类型安全性
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

1. 克隆仓库
```bash
git clone https://github.com/cyf1215/guidewire-dev-tools.git
cd guidewire-dev-tools
```

2. 安装依赖
```bash
npm install
```

3. 启动开发环境
```bash
npm run start
```

4. 打包应用
```bash
npm run make
```

5. 安装包位置：
   - Windows: `out/make/squirrel.windows/x64`
   - macOS: `out/make/zip/darwin/x64`
   - Linux: `out/make/deb/x64` 或 `out/make/rpm/x64`

## 开发环境要求

- Node.js >= 18.0.0
- npm 或 yarn
- TypeScript 5.7 或更高版本
- Electron 33.0.0+

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
│   └── styles/        # 样式文件
```

## 配置说明

### API 配置
- OpenAI API Key
- DeepSeek API Key
- Ollama 本地服务地址 (默认: http://localhost:11434)

### 模型配置
- 支持在对话过程中随时切换不同的 AI 模型
- 每条消息都会显示对应的模型来源和时间戳
- 支持实时流式输出

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

## 问题排查

如果遇到安装或启动问题：

1. 删除 node_modules 文件夹和 package-lock.json
2. 删除 dist 目录（编译输出）
3. 重新运行 `npm install`
4. 运行 `npm run build`
5. 确保 Node.js 版本兼容
6. 检查错误日志输出

## 更新日志

### v0.0.18
- 新增多模型切换支持
- 优化 AI 聊天界面
- 添加消息时间戳显示
- 改进界面样式和用户体验

### v0.0.17
- 初始版本发布
- 基础聊天功能
- AI 模型集成

## 技术栈

- Electron
- Vue 3
- TypeScript
- Element Plus
- LangChain.js
- Vite

## 安装说明

### Windows 用户

1. 下载最新版本的安装程序 `Guidewire Dev Tools Setup.exe`
2. 运行安装程序
3. 程序将安装到用户目录下：`%LOCALAPPDATA%\guidewire_dev_tools`
4. 等待安装完成
5. 从开始菜单或桌面快捷方式启动程序

### 卸载说明

1. 从 Windows 控制面板卸载
2. 或使用开始菜单中的卸载选项

## 贡献指南

欢迎提交 Issue 和 Pull Request。

## 许可证

MIT License

## 作者

Ifan Cao (ifan.cao@capgemini.com)
