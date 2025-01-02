<template>
  <div class="menu-wrapper">
    <!-- 左侧主菜单 -->
    <div class="main-menu">
      <!-- 应用标志 -->
      <div class="app-logo">
        <el-icon class="logo-icon"><Monitor /></el-icon>
        <span>GW工具</span>
      </div>
      <!-- 主菜单列表 -->
      <div class="menu-list">
        <div
          v-for="item in menuItems"
          :key="item.path"
          class="menu-item"
          :class="{ active: currentPath.startsWith(item.path) }"
          @click="handleMainMenuClick(item)"
        >
          <!-- 主菜单图标 -->
          <el-icon><component :is="item.icon" /></el-icon>
          <!-- 主菜单文本 -->
          <span class="menu-text">{{ item.title }}</span>
        </div>
      </div>
      <!-- 用户头像 -->
      <div class="user-profile">
        <el-avatar
          :size="32"
          src="https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png"
        />
      </div>
    </div>

    <!-- 子菜单 -->
    <div class="sub-menu-wrapper" :class="{ collapsed: isCollapsed }">
      <div class="sub-menu">
        <!-- 子菜单头部 -->
        <div class="sub-menu-header">
          <span class="sub-menu-title">{{ currentMenu?.title }}</span>
        </div>
        <!-- 子菜单列表 -->
        <div class="sub-menu-list">
          <template v-if="currentMenu?.children">
            <router-link
              v-for="subItem in currentMenu.children"
              :key="subItem.path"
              :to="subItem.path"
              class="sub-menu-item"
              active-class="active"
            >
              <!-- 子菜单图标 -->
              <el-icon><component :is="subItem.icon" /></el-icon>
              <!-- 子菜单文本 -->
              <span class="sub-menu-text">{{ subItem.title }}</span>
            </router-link>
          </template>
        </div>
      </div>
      <!-- 当子菜单折叠时显示的展开按钮 -->
      <div v-if="isCollapsed" class="expand-btn" @click="toggleCollapse">
        <el-icon><ArrowRight /></el-icon>
      </div>

      <!-- 现有的折叠按钮 -->
      <div v-else class="collapse-btn" @click="toggleCollapse">
        <el-icon><ArrowLeft /></el-icon>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import {
  Monitor,
  ChatRound,
  Document,
  Setting,
  ArrowLeft,
  ArrowRight,
  Collection,
  Share,
  Bell,
  Tools,
  Star,
  Upload,
  Download,
  Connection,
  Microphone,
  Plus,
  Search,
} from '@element-plus/icons-vue';

// 获取路由信息
const route = useRoute();
const router = useRouter();
const isCollapsed = ref(false); // 菜单是否折叠的状态
const currentPath = computed(() => route.path); // 当前路径

// 主菜单项
const menuItems = [
  {
    title: '对话',
    path: '/chat',
    icon: ChatRound,
    children: [
      { title: 'AI 聊天', path: '/chat/ai', icon: ChatRound },
      { title: '实时语音', path: '/chat/voice', icon: Microphone },
    ],
  },
  {
    title: '效率',
    path: '/efficiency',
    icon: Tools,
    children: [
      { title: '实时记录', path: '/efficiency/record', icon: Document },
      { title: '阅读助手', path: '/efficiency/reader', icon: Document },
      { title: 'PPT创作', path: '/efficiency/ppt', icon: Document },
    ],
  },
  {
    title: '笔记库',
    path: '/notes',
    icon: Document,
    children: [
      { title: '音视频速读', path: '/notes/media', icon: Upload },
      { title: '链接速读', path: '/notes/links', icon: Connection },
      { title: '格式转换', path: '/notes/convert', icon: Download },
    ],
  },
  {
    title: '设置',
    path: '/settings',
    icon: Setting,
    children: [
      { title: '系统设置', path: '/settings/system', icon: Setting },
      { title: 'API配置', path: '/settings/api', icon: Connection },
    ],
  },
];

// 计算当前菜单
const currentMenu = computed(() => {
  const path = route.path;
  return menuItems.find(item => {
    // 精确匹配主菜单路径或其子菜单路径
    return (
      path === item.path || (item.children && item.children.some(child => child.path === path))
    );
  });
});

// 处理主菜单点击事件
const handleMainMenuClick = (item: (typeof menuItems)[0]) => {
  if (isCollapsed.value) {
    isCollapsed.value = false;
  }

  // 如果已经在当前菜单，且有子菜单，只展开不跳转
  if (currentMenu.value === item && item.children) {
    return;
  }

  // 导航到默认子菜单或当前路径
  if (item.children && item.children.length > 0) {
    router.push(item.children[0].path);
  } else {
    router.push(item.path);
  }
};

// 切换菜单折叠状态
const toggleCollapse = () => {
  isCollapsed.value = !isCollapsed.value;
};
</script>

<style scoped>
.menu-wrapper {
  display: flex;
  height: 100vh;
  background-color: #f5f7fa;
  font-family: 'Microsoft YaHei', 'PingFang SC', 'Hiragino Sans GB', sans-serif;
  position: relative;
  padding: 1px;
  gap: 0;
}

.main-menu {
  width: 90px;
  background: #6b4bfd;
  color: #fff;
  display: flex;
  flex-direction: column;
  padding: 24px 0;
  z-index: 2;
  box-shadow: 2px 0 8px rgba(107, 75, 253, 0.1);
  border-radius: 12px;
  flex-shrink: 0;
}

.app-logo {
  height: 40px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 0 4px;
  margin-bottom: 20px;
  position: relative;
}

.logo-icon {
  font-size: 20px;
  color: #fff;
  background: rgba(255, 255, 255, 0.2);
  padding: 6px;
  border-radius: 6px;
}

.app-logo span {
  font-size: 13px;
  color: #fff;
  width: 80px;
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.version {
  position: absolute;
  top: 4px;
  right: 10px;
  font-size: 12px;
  opacity: 0.8;
}

.main-content {
  flex: 1;
  background: #fff;
  border-radius: 0 12px 12px 0;
  transition: all 0.3s ease;
  overflow: hidden;
  padding: 10px;
  margin: 0;
  border: 1px solid #ebeef5;
  border-left: none;
}

.main-content.menu-collapsed {
  margin-left: 0;
}

.content-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 40px;
}

.header-left {
  display: flex;
  gap: 20px;
  align-items: center;
}

.new-chat-btn {
  background: #409eff;
  border: none;
  height: 40px;
  padding: 0 32px;
  border-radius: 8px;
  font-weight: 500;
  font-size: 14px;
  transition: all 0.3s ease;
  box-shadow: 0 2px 6px rgba(64, 158, 255, 0.2);
}

.new-chat-btn:hover {
  background: #66b1ff;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.3);
}

.search-input {
  width: 320px;
}

.search-input :deep(.el-input__wrapper) {
  border-radius: 8px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
  padding: 0 16px;
  height: 40px;
  transition: all 0.3s ease;
}

.search-input :deep(.el-input__wrapper):hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.search-input :deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 1px #409eff;
}

.channel-btn {
  height: 40px;
  border-radius: 8px;
  border: 1px solid #e4e7ed;
  padding: 0 20px;
  font-size: 14px;
  color: #606266;
  transition: all 0.3s ease;
}

.channel-btn:hover {
  color: #409eff;
  border-color: #409eff;
  background: rgba(64, 158, 255, 0.1);
}

.welcome-section {
  text-align: center;
  margin-bottom: 48px;
}

.welcome-section h1 {
  font-size: 28px;
  color: #303133;
  margin-bottom: 12px;
  font-weight: 600;
}

.subtitle {
  color: #606266;
  font-size: 15px;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 32px;
  padding: 0 48px;
}

.feature-section {
  background: #fff;
  border-radius: 12px;
  padding: 28px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
  transition: all 0.3s ease;
}

.feature-section:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.08);
}

.feature-section h2 {
  font-size: 20px;
  color: #303133;
  margin-bottom: 8px;
  font-weight: 600;
}

.section-subtitle {
  color: #909399;
  font-size: 14px;
  margin-bottom: 24px;
}

.hot-topics {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.hot-topic {
  display: flex;
  align-items: center;
  gap: 16px;
  color: #606266;
  transition: all 0.3s ease;
  padding: 8px 12px;
  border-radius: 8px;
  cursor: pointer;
}

.hot-topic:hover {
  background: #f5f7fa;
  color: #409eff;
}

.topic-number {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f2f6fc;
  border-radius: 6px;
  font-size: 13px;
  color: #909399;
  font-weight: 500;
}

.tools-grid {
  display: grid;
  grid-template-columns: repeat(1, 1fr);
  gap: 20px;
}

.tool-card {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 20px;
  background: #f5f7fa;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.tool-card:hover {
  background: #ecf5ff;
  transform: translateX(4px);
}

.tool-card .el-icon {
  font-size: 28px;
  color: #409eff;
  background: #fff;
  padding: 12px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.1);
}

.tool-info h3 {
  font-size: 16px;
  color: #303133;
  margin-bottom: 6px;
  font-weight: 500;
}

.tool-info p {
  font-size: 13px;
  color: #909399;
  line-height: 1.5;
}

.user-profile {
  margin-top: auto;
  padding: 16px;
  display: flex;
  justify-content: center;
}

/* 菜单样式优化 */
.menu-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  flex: 1;
  padding: 24px 12px;
}

.menu-item {
  height: 56px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.8);
  text-decoration: none;
  transition: all 0.3s;
  cursor: pointer;
  gap: 4px;
  border-radius: 8px;
  margin: 0 6px;
  padding: 8px 0;
}

.menu-item:hover {
  color: #fff;
  background: rgba(255, 255, 255, 0.1);
}

.menu-item.active {
  color: #fff;
  background: rgba(255, 255, 255, 0.15);
}

.menu-item .el-icon {
  font-size: 22px;
}

.menu-text {
  font-size: 13px;
  text-align: center;
  width: 90px;
  line-height: 1.2;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 全局字体优化 */
:deep(*) {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial,
    'Noto Sans', sans-serif;
}

/* 子菜单包装器 */
.sub-menu-wrapper {
  position: relative;
  width: 220px;
  height: calc(100vh - 2px);
  transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  flex-shrink: 0;
  background: transparent;
  overflow: hidden;
  margin: 0;
  padding: 0;
}

.sub-menu-wrapper.collapsed {
  width: 0;
}

/* 子菜单本体 */
.sub-menu {
  position: relative;
  width: 220px;
  min-width: 220px;
  height: 100%;
  background: #fff;
  border-radius: 12px 0 0 12px;
  display: flex;
  flex-direction: column;
  box-shadow: none;
  border: 1px solid #ebeef5;
  border-right: none;
  overflow: hidden;
}

/* 折叠按钮 */
.collapse-btn {
  position: absolute;
  right: -12px;
  top: 50%;
  transform: translateY(-50%);
  width: 24px;
  height: 40px;
  background: #fff;
  border-radius: 0 4px 4px 0;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #909399;
  transition: all 0.3s ease;
  z-index: 1000;
  border: 1px solid #ebeef5;
  border-left: none;
}

.sub-menu-wrapper.collapsed .collapse-btn {
  transform: translateY(-50%) rotate(180deg);
  right: -24px;
  border-radius: 8px 0 0 8px;
}

.collapse-btn:hover {
  color: #409eff;
  background: #f5f7fa;
}

/* 子菜单头部 */
.sub-menu-header {
  height: 48px;
  display: flex;
  align-items: center;
  padding: 0 20px;
  border-bottom: 1px solid #f0f0f0;
  border-radius: 12px 12px 0 0;
  background: #fafafa;
}

.sub-menu-title {
  font-size: 15px;
  font-weight: 500;
  color: #303133;
}

/* 子菜单列表 */
.sub-menu-list {
  flex: 1;
  padding: 12px;
  overflow-y: auto;
  overflow-x: hidden;
  position: relative;
}

.sub-menu-item {
  height: 40px;
  display: flex;
  align-items: center;
  padding: 0 16px;
  border-radius: 8px;
  color: #606266;
  text-decoration: none;
  margin-bottom: 4px;
  transition: all 0.3s ease;
}

.sub-menu-item:hover {
  color: #409eff;
  background: #f5f7fa;
}

.sub-menu-item.active {
  color: #409eff;
  background: #ecf5ff;
}

.sub-menu-item .el-icon {
  font-size: 16px;
  margin-right: 12px;
}

.sub-menu-text {
  font-size: 14px;
  white-space: nowrap;
}

/* 修改滚动条样式 */
.sub-menu-list::-webkit-scrollbar {
  width: 0; /* 将宽度设为0来隐藏滚动条 */
}

.sub-menu-list::-webkit-scrollbar-track {
  display: none; /* 隐藏轨道 */
}

.sub-menu-list::-webkit-scrollbar-thumb {
  display: none; /* 隐藏滑块 */
}

/* 添加一个更优雅的滚动效果 */
.sub-menu-list {
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE and Edge */
  overflow-y: auto;
}

/* 子菜单展开按钮 */
.expand-btn {
  position: fixed;
  left: 106px;
  top: 50%;
  transform: translateY(-50%);
  width: 24px;
  height: 40px;
  background: #fff;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #909399;
  transition: all 0.3s ease;
  z-index: 1000;
  border: 1px solid #ebeef5;
}

.expand-btn:hover {
  color: #409eff;
  background: #f5f7fa;
}

/* 当子菜单折叠时展开按钮的样式 */
.sub-menu-wrapper.collapsed .expand-btn {
  /* 删除 left: 0; */
}
</style>
