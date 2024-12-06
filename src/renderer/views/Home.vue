<template>
  <div class="home">
    <h1>欢迎使用 Guidewire Dev Tools</h1>
    <el-row :gutter="20" class="mt-4">
      <el-col :span="8" v-for="feature in features" :key="feature.title">
        <FeatureCard
          :title="feature.title"
          :description="feature.description"
          :button-text="feature.buttonText"
          :button-type="feature.buttonType"
          :disabled="feature.disabled"
          @action="feature.action"
        />
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import FeatureCard from '../components/FeatureCard.vue';

interface Feature {
  title: string;
  description: string;
  buttonText: string;
  buttonType: 'primary' | 'success' | 'warning' | 'danger' | 'info';
  disabled?: boolean;
  action: () => void;
}

const isReactDevToolsInstalled = ref(false);

const checkReactDevToolsStatus = async () => {
  try {
    isReactDevToolsInstalled.value = await window.electronAPI.isReactDevToolsInstalled();
  } catch (error) {
    console.error('检查 React DevTools 状态失败:', error);
  }
};

const installReactDevTools = async () => {
  try {
    await window.electronAPI.installReactDevTools();
    ElMessage.success('React DevTools 安装成功');
    await checkReactDevToolsStatus();
  } catch (error) {
    ElMessage.error('安装 React DevTools 失败');
    console.error(error);
  }
};

const uninstallReactDevTools = async () => {
  try {
    await window.electronAPI.uninstallReactDevTools();
    ElMessage.success('React DevTools 卸载成功');
    await checkReactDevToolsStatus();
  } catch (error) {
    ElMessage.error('卸载 React DevTools 失败');
    console.error(error);
  }
};

const features = ref<Feature[]>([
  {
    title: 'React DevTools',
    description: isReactDevToolsInstalled.value ? 'React 开发者工具已安装' : 'React 开发者工具支持',
    buttonText: isReactDevToolsInstalled.value ? '卸载' : '安装',
    buttonType: isReactDevToolsInstalled.value ? 'danger' : 'primary',
    action: isReactDevToolsInstalled.value ? uninstallReactDevTools : installReactDevTools
  },
  {
    title: '热重载',
    description: '开发环境热重载支持',
    buttonText: '配置',
    buttonType: 'success',
    action: () => {
      console.log('配置热重载');
    }
  },
  {
    title: '更多功能',
    description: '敬请期待...',
    buttonText: '开发中',
    buttonType: 'info',
    disabled: true,
    action: () => {}
  }
]);

onMounted(async () => {
  await checkReactDevToolsStatus();
});
</script>

<style scoped>
.home {
  padding: 20px;
}

h1 {
  color: var(--text-color);
  text-align: center;
  margin-bottom: 2rem;
}
</style> 