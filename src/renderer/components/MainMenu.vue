<template>
  <div class="menu-container">
    <h2>AI 助手控制台</h2>
    <div class="menu-items">
      <el-card v-for="item in menuItems" :key="item.path"
               class="menu-item" @click="$router.push(item.path)">
        <div class="menu-icon">
          <el-icon><component :is="item.icon" /></el-icon>
        </div>
        <div class="menu-title">{{ item.title }}</div>
        <div class="menu-desc">{{ item.description }}</div>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ChatRound, Document, Setting } from '@element-plus/icons-vue'

const menuItems = [
  {
    title: 'AI 聊天',
    description: '与多个 AI 模型进行对话',
    path: '/chat',
    icon: ChatRound
  },
  {
    title: '文档处理',
    description: '文档分析与处理',
    path: '/docs',
    icon: Document
  },
  {
    title: '系统设置',
    description: '配置 API 密钥和其他设置',
    path: '/settings',
    icon: Setting
  }
]
</script>

<style scoped>
.menu-container {
  max-width: 900px;
  margin: 40px auto;
  padding: 0 20px;
}

.menu-items {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-top: 30px;
}

.menu-item {
  cursor: pointer;
  transition: all 0.3s;
}

.menu-item:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.menu-icon {
  font-size: 24px;
  color: var(--el-color-primary);
  margin-bottom: 12px;
}

.menu-title {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 8px;
}

.menu-desc {
  color: #666;
  font-size: 14px;
}
</style>
