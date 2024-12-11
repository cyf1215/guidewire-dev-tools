<template>
  <div class="docs-page">
    <div class="page-header">
      <el-button @click="$router.push('/')" type="primary" plain>
        <el-icon><Back /></el-icon> 返回菜单
      </el-button>
      <h2>文档处理</h2>
    </div>

    <el-empty description="文档处理功能开发中..." />
  </div>
</template>

<script setup lang="ts">
import { Back } from '@element-plus/icons-vue'
</script>

<style scoped>
.docs-page {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.page-header {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 30px;
}

.page-header h2 {
  margin: 0;
}
</style>
