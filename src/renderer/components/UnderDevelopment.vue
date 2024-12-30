<template>
  <div class="under-development">
    <el-empty description="功能开发中...">
      <template #image>
        <el-icon :size="60" class="development-icon"><Tools /></el-icon>
      </template>
    </el-empty>
  </div>
</template>

<script setup lang="ts">
import { Tools } from '@element-plus/icons-vue';
</script>

<style scoped>
.under-development {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.development-icon {
  color: var(--el-color-primary);
}
</style>
