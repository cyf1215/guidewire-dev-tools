<template>
  <div class="app-container">
    <MainMenu />
    <div class="main-content">
      <router-view></router-view>
    </div>
  </div>
</template>

<script setup lang="ts">
import MainMenu from './components/MainMenu.vue';
</script>

<style>
body {
  margin: 0;
  font-family: -apple-system, 'PingFang SC', 'Microsoft YaHei', 'Hiragino Sans GB',
    'WenQuanYi Micro Hei', sans-serif;
  background-color: #f5f5f5;
}

.app-container {
  display: flex;
  min-height: 100vh;
}

.menu-wrapper {
  display: flex;
}

.main-content {
  flex: 1;
  overflow: auto;
  padding: 20px;
}

/* 重置一些基础样式 */
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

/* 美化滚动条 */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style>
