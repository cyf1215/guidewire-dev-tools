<template>
  <el-card class="feature-card">
    <template #header>
      <div class="card-header">
        <span>{{ title }}</span>
      </div>
    </template>
    <div class="card-content">
      <p>{{ description }}</p>
      <el-button
        :type="buttonType"
        :disabled="disabled"
        @click="$emit('action')"
      >
        {{ buttonText }}
      </el-button>
    </div>
  </el-card>
</template>

<script setup lang="ts">
defineProps<{
  title: string;
  description: string;
  buttonText: string;
  buttonType?: 'primary' | 'success' | 'warning' | 'danger' | 'info';
  disabled?: boolean;
}>();

defineEmits<{
  (e: 'action'): void;
}>();
</script>

<style scoped>
.feature-card {
  height: 100%;
  transition: transform 0.3s ease;
}

.feature-card:hover {
  transform: translateY(-5px);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-content {
  text-align: center;
}

.card-content p {
  margin-bottom: 1rem;
  color: var(--text-color-secondary);
}
</style> 