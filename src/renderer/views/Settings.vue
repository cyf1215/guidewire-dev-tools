<template>
  <div class="settings-page">
    <div class="page-header">
      <el-button @click="$router.push('/')" type="primary" plain>
        <el-icon><Back /></el-icon> 返回菜单
      </el-button>
      <h2>系统设置</h2>
    </div>

    <div class="settings-container">
      <!-- 左侧设置菜单 -->
      <div class="settings-menu">
        <el-menu
          :default-active="activeMenu"
          @select="handleMenuSelect"
          class="settings-menu-list">
          <el-menu-item index="openai">
            <el-icon><Key /></el-icon>
            <span>OpenAI 配置</span>
          </el-menu-item>
          <el-menu-item index="deepseek">
            <el-icon><Key /></el-icon>
            <span>DeepSeek 配置</span>
          </el-menu-item>
          <el-menu-item index="ollama">
            <el-icon><Connection /></el-icon>
            <span>Ollama 配置</span>
          </el-menu-item>
          <el-menu-item index="gemini">
            <el-icon><Key /></el-icon>
            <span>Gemini 配置</span>
          </el-menu-item>
        </el-menu>
      </div>

      <!-- 右侧设置内容 -->
      <div class="settings-content">
        <!-- OpenAI 配置 -->
        <div v-show="activeMenu === 'openai'" class="settings-section">
          <h3>OpenAI 配置</h3>
          <div class="settings-form">
            <el-form label-position="top">
              <el-form-item label="API Key">
                <el-input
                  v-model="form.openaiKey"
                  type="password"
                  show-password
                  placeholder="sk-..."
                  clearable
                />
                <div class="form-item-tip">
                  在 OpenAI 平台获取 API Key：
                  <el-link href="https://platform.openai.com/api-keys"
                          type="primary"
                          target="_blank">
                    获取 API Key
                  </el-link>
                </div>
              </el-form-item>
              <el-form-item label="模型">
                <el-select v-model="form.openaiModel" placeholder="选择模型">
                  <el-option label="gpt-4" value="gpt-4" />
                  <el-option label="gpt-3.5-turbo" value="gpt-3.5-turbo" />
                </el-select>
              </el-form-item>
            </el-form>
          </div>
        </div>

        <!-- DeepSeek 配置 -->
        <div v-show="activeMenu === 'deepseek'" class="settings-section">
          <h3>DeepSeek 配置</h3>
          <div class="settings-form">
            <el-form label-position="top">
              <el-form-item label="API Key">
                <el-input
                  v-model="form.deepseekKey"
                  type="password"
                  show-password
                  placeholder="sk-..."
                  clearable
                />
                <div class="form-item-tip">
                  在 DeepSeek 平台获取 API Key：
                  <el-link href="https://platform.deepseek.com/"
                          type="primary"
                          target="_blank">
                    获取 API Key
                  </el-link>
                </div>
              </el-form-item>
            </el-form>
          </div>
        </div>

        <!-- Ollama 配置 -->
        <div v-show="activeMenu === 'ollama'" class="settings-section">
          <h3>Ollama 配置</h3>
          <div class="settings-form">
            <el-form label-position="top">
              <el-form-item label="服务地址">
                <el-input
                  v-model="form.ollamaUrl"
                  placeholder="http://localhost:11434"
                  clearable
                  @change="handleOllamaUrlChange"
                />
                <div class="form-item-tip">
                  本地 Ollama 服务默认地址为：http://localhost:11434
                </div>
              </el-form-item>
              <el-form-item label="模型">
                <el-select
                  v-model="form.ollamaModel"
                  placeholder="选择模型"
                  :loading="isLoadingModels"
                >
                  <el-option
                    v-for="model in ollamaModels"
                    :key="model.name"
                    :label="`${model.name} (${model.size})`"
                    :value="model.name"
                  />
                </el-select>
                <div class="form-item-tip">
                  <template v-if="ollamaModels.length > 0">
                    已安装 {{ ollamaModels.length }} 个模型
                  </template>
                  <template v-else>
                    未检测到已安装的模型，请确保 Ollama 服务正常运行
                  </template>
                </div>
              </el-form-item>
              <el-form-item>
                <el-button
                  type="primary"
                  link
                  :loading="isLoadingModels"
                  @click="fetchOllamaModels"
                >
                  <el-icon><Loading /></el-icon>
                  刷新模型列表
                </el-button>
              </el-form-item>
            </el-form>
          </div>
        </div>

        <!-- Gemini 配置 -->
        <div v-show="activeMenu === 'gemini'" class="settings-section">
          <h3>Gemini 配置</h3>
          <div class="settings-form">
            <el-form label-position="top">
              <el-form-item label="API Key">
                <el-input
                  v-model="form.geminiKey"
                  type="password"
                  show-password
                  placeholder="sk-..."
                  clearable
                />
                <div class="form-item-tip">
                  在 Google AI Studio 获取 API Key：
                  <el-link href="https://makersuite.google.com/app/apikey"
                          type="primary"
                          target="_blank">
                    获取 API Key
                  </el-link>
                  <p>请先配置 API Key 才能使用 Gemini 模型</p>
                </div>
              </el-form-item>
              <el-form-item label="模型">
                <el-select v-model="form.geminiModel" placeholder="选择模型">
                  <el-option label="gemini-2.0-flash-exp" value="gemini-2.0-flash-exp" />
                  <el-option label="gemini-2.0-flash-attn" value="gemini-2.0-flash-attn" />
                  <el-option label="gemini-2.0-flash-qkv" value="gemini-2.0-flash-qkv" />
                  <el-option label="gemini-2.0-flash-attn-qkv" value="gemini-2.0-flash-attn-qkv" />
                </el-select>
                <div class="form-item-tip">
                  <template v-if="form.geminiModel === 'gemini-2.0-flash-exp'">
                    在各种任务中提供快速、多样化的性能
                  </template>
                  <template v-else-if="form.geminiModel === 'gemini-2.0-flash-attn'">
                    量大且智能程度较低的任务
                  </template>
                  <template v-else-if="form.geminiModel === 'gemini-2.0-flash-qkv'">
                    需要更多智能的复杂推理任务
                  </template>
                  <template v-else-if="form.geminiModel === 'gemini-2.0-flash-attn-qkv'">
                    自然语言任务、多轮文本和代码对话以及代码生成
                  </template>
                </div>
              </el-form-item>
              <el-form-item label="最大令牌数">
                <el-input-number v-model="form.geminiMaxTokens" :min="1" :max="16384" />
              </el-form-item>
              <el-form-item label="温度">
                <el-input-number v-model="form.geminiTemperature" :min="0" :max="2" :step="0.1" />
              </el-form-item>
              <el-form-item label="Top K">
                <el-input-number v-model="form.geminiTopK" :min="1" :max="100" />
              </el-form-item>
              <el-form-item label="Top P">
                <el-input-number v-model="form.geminiTopP" :min="0" :max="1" :step="0.05" />
              </el-form-item>
            </el-form>
          </div>
        </div>
      </div>
    </div>

    <!-- 底部保存按钮 -->
    <div class="settings-footer">
      <el-button type="primary" @click="saveSettings">保存设置</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Back, Key, Connection, Loading } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const activeMenu = ref('openai')
const ollamaModels = ref<Array<{ name: string, size: string }>>([])
const isLoadingModels = ref(false)

const form = ref({
  openaiKey: localStorage.getItem('OPENAI_API_KEY') || '',
  openaiModel: localStorage.getItem('OPENAI_MODEL') || 'gpt-3.5-turbo',
  deepseekKey: localStorage.getItem('DEEPSEEK_API_KEY') || '',
  ollamaUrl: localStorage.getItem('OLLAMA_BASE_URL') || 'http://localhost:11434',
  ollamaModel: localStorage.getItem('OLLAMA_MODEL') || 'llama2',
  geminiKey: localStorage.getItem('GEMINI_API_KEY') || '',
  geminiModel: localStorage.getItem('GEMINI_MODEL') || 'gemini-2.0-flash-exp',
  geminiMaxTokens: Number(localStorage.getItem('GEMINI_MAX_TOKENS')) || 8192,
  geminiTemperature: Number(localStorage.getItem('GEMINI_TEMPERATURE')) || 1.0,
  geminiTopK: Number(localStorage.getItem('GEMINI_TOP_K')) || 40,
  geminiTopP: Number(localStorage.getItem('GEMINI_TOP_P')) || 0.95,
})

// 获取 Ollama 已安装的模型列表
async function fetchOllamaModels() {
  isLoadingModels.value = true
  try {
    const response = await fetch(`${form.value.ollamaUrl}/api/tags`)
    if (!response.ok) {
      throw new Error('获取模型列表失败')
    }
    const data = await response.json()
    ollamaModels.value = data.models.map((model: any) => ({
      name: model.name,
      size: formatSize(model.size)
    }))
  } catch (error) {
    console.error('获取 Ollama 模型列表失败:', error)
    ElMessage.error('获取模型列表失败，请检查 Ollama 服务是否正常运行')
    ollamaModels.value = []
  } finally {
    isLoadingModels.value = false
  }
}

// 格式化文件大小
function formatSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// 当 Ollama 服务地址变化时重新获取模型列表
async function handleOllamaUrlChange() {
  if (form.value.ollamaUrl.trim()) {
    await fetchOllamaModels()
  }
}

// 保存设置
function saveSettings() {
  localStorage.setItem('OPENAI_API_KEY', form.value.openaiKey)
  localStorage.setItem('OPENAI_MODEL', form.value.openaiModel)
  localStorage.setItem('DEEPSEEK_API_KEY', form.value.deepseekKey)
  localStorage.setItem('OLLAMA_BASE_URL', form.value.ollamaUrl)
  localStorage.setItem('OLLAMA_MODEL', form.value.ollamaModel)
  localStorage.setItem('GEMINI_API_KEY', form.value.geminiKey)
  localStorage.setItem('GEMINI_MODEL', form.value.geminiModel)
  localStorage.setItem('GEMINI_MAX_TOKENS', form.value.geminiMaxTokens.toString())
  localStorage.setItem('GEMINI_TEMPERATURE', form.value.geminiTemperature.toString())
  localStorage.setItem('GEMINI_TOP_K', form.value.geminiTopK.toString())
  localStorage.setItem('GEMINI_TOP_P', form.value.geminiTopP.toString())
  ElMessage.success('设置已保存')
}

// 当切换到 Ollama 配置时自动获取模型列表
function handleMenuSelect(key: string) {
  activeMenu.value = key
  if (key === 'ollama' && form.value.ollamaUrl.trim()) {
    fetchOllamaModels()
  }
}

// 组件加载时，如果当前是 Ollama 配置，获取模型列表
onMounted(() => {
  if (activeMenu.value === 'ollama' && form.value.ollamaUrl.trim()) {
    fetchOllamaModels()
  }
})
</script>

<style scoped>
.settings-page {
  height: 100vh;
  display: flex;
  flex-direction: column;
  padding: 20px;
  background-color: #f5f7fa;
  box-sizing: border-box;
}

.page-header {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 20px;
}

.page-header h2 {
  margin: 0;
  font-weight: 600;
  color: #1a1a1a;
}

.settings-container {
  flex: 1;
  display: flex;
  gap: 20px;
  min-height: 0;
  background: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.settings-menu {
  width: 200px;
  border-right: 1px solid #dcdfe6;
}

.settings-menu-list {
  border-right: none;
}

.settings-content {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}

.settings-section {
  max-width: 600px;
}

.settings-section h3 {
  margin: 0 0 20px 0;
  font-weight: 600;
  color: #1a1a1a;
}

.settings-form {
  margin-bottom: 20px;
}

.form-item-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}

.settings-footer {
  margin-top: 20px;
  padding: 20px 0;
  text-align: center;
  background: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

:deep(.el-menu-item) {
  height: 50px;
  line-height: 50px;
}

:deep(.el-menu-item .el-icon) {
  margin-right: 10px;
}

.el-button.is-link {
  padding: 0;
  height: auto;
}

:deep(.el-select-dropdown__item) {
  white-space: normal;
  height: auto;
  padding: 8px 12px;
}
</style>
