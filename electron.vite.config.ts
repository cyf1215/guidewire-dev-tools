import { defineConfig } from 'electron-vite';
import vue from '@vitejs/plugin-vue';
import { resolve } from 'path';

export default defineConfig({
  // 主进程构建配置
  main: {
    build: {
      // 主进程输出目录
      outDir: 'dist/main',
      // 添加源码映射
      sourcemap: true,
      rollupOptions: {
        input: {
          // 主进程入口文件
          index: resolve(__dirname, 'src/main/index.ts')
        },
        // 确保输出格式正确
        output: {
          format: 'cjs'
        }
      }
    }
  },
  // 预加载脚本构建配置
  preload: {
    build: {
      // 预加载脚本输出目录
      outDir: 'dist/preload',
      rollupOptions: {
        input: {
          // 预加载脚本入口文件
          index: resolve(__dirname, 'src/preload/preload.ts')
        }
      }
    }
  },
  // 渲染进程构建配置
  renderer: {
    // 渲染进程源码根目录
    root: resolve(__dirname, 'src/renderer'),
    build: {
      // 渲染进程输出目录
      outDir: resolve(__dirname, 'dist/renderer'),
      rollupOptions: {
        input: {
          // 渲染进程 HTML 入口文件
          index: resolve(__dirname, 'src/renderer/index.html')
        }
      }
    },
    // 启用 Vue 插件
    plugins: [vue()]
  }
});
