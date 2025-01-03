<template>
  <div class="chat-container">
    <div class="chat-header">
      <el-select v-model="currentModel" class="model-select" @change="handleModelChange">
        <el-option label="OpenAI" value="openai" />
        <el-option label="DeepSeek" value="deepseek" />
        <el-option label="Ollama" value="ollama" />
        <el-option label="Gemini" value="gemini" />
      </el-select>
      <el-button type="primary" link @click="goToSettings">
        <el-icon><Setting /></el-icon>
        配置 API
      </el-button>
    </div>

    <div class="chat-messages" ref="messagesRef" @scroll="handleScroll">
      <div
        v-for="(message, index) in messages"
        :key="index"
        :class="[
          'message',
          message.role === 'human' ? 'human' : 'assistant',
          { error: message.error },
        ]"
      >
        <template v-if="message.role === 'assistant'">
          <div class="message-header">
            <span class="model">{{ message.model || currentModel }}</span>
            <span class="time">{{ formatTime(message.timestamp) }}</span>
          </div>
          <template v-if="message.streaming">
            <div class="markdown-body" v-html="renderMarkdown(message.content)"></div>
            <span class="cursor"></span>
          </template>
          <template v-else>
            <div class="markdown-body" v-html="renderMarkdown(message.content)"></div>
            <div v-if="message.error" class="error-actions">
              <el-button type="danger" link size="small" @click="retryMessage(index)">
                <el-icon><RefreshRight /></el-icon>
                重试
              </el-button>
            </div>
          </template>
        </template>
        <template v-else>
          <div class="markdown-body" v-html="renderMarkdown(message.content)"></div>
        </template>
      </div>
    </div>

    <div class="chat-input">
      <el-input
        v-model="userInput"
        type="textarea"
        :rows="inputRows"
        placeholder="输入消息... (Shift + Enter 换行，Enter 发送)"
        resize="none"
        @keydown.enter="handleKeyDown"
      >
        <template #append>
          <el-button @click="sendMessage" :loading="loading">发送</el-button>
        </template>
      </el-input>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, nextTick, watch, onUnmounted } from 'vue';
import { Back, Setting, RefreshRight } from '@element-plus/icons-vue';
import { ChatOpenAI } from '@langchain/openai';
import { ChatOllama } from '@langchain/ollama';
import { BaseChatModel } from '@langchain/core/language_models/chat_models';
import { HumanMessage, AIMessage, SystemMessage } from '@langchain/core/messages';
import { ElMessage } from 'element-plus';
import { useRouter } from 'vue-router';
import MarkdownIt from 'markdown-it';
import hljs from 'highlight.js';
import 'highlight.js/styles/github.css';
import 'github-markdown-css/github-markdown.css';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { RunnableSequence } from '@langchain/core/runnables';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';

// 自定义内存接口
interface CustomMemory {
  chatHistory: Array<{ input: string; output: string }>;
  memoryKeys: string[];
  loadMemoryVariables(): Promise<{ chat_history: string }>;
  saveContext(inputValues: Record<string, any>, outputValues: Record<string, any>): Promise<void>;
  clear(): void;
}

const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
  highlight: function (str, lang) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return hljs.highlight(str, { language: lang }).value;
      } catch (__) {}
    }
    return ''; // 使用默认的转义
  },
});

const router = useRouter();
const currentModel = ref('ollama'); // 修改默认模型为 ollama
const loading = ref(false);
const messages = ref<
  Array<{
    role: string;
    content: string;
    model?: string;
    streaming?: boolean;
    error?: boolean;
    timestamp?: number;
  }>
>([]);
const userInput = ref('');
const messagesRef = ref<HTMLElement>();

// 计算属性
const inputRows = computed(() => {
  const lines = userInput.value.split('\n').length;
  const minRows = 2;
  const maxRows = 8; // 增加最大行数
  // 根据内容长度自动调整
  const contentLength = userInput.value.length;
  const additionalRows = Math.floor(contentLength / 50); // 每50个字符增加一行
  return Math.min(Math.max(minRows, lines + additionalRows), maxRows);
});

// Markdown 渲染函数
function renderMarkdown(text: string) {
  try {
    const rendered = md.render(text || '');
    // 为每个代码块添加复制按钮，注意去掉多余的空格和换行
    return rendered.replace(
      /<pre><code class="language-([^"]+)">([\s\S]+?)<\/code><\/pre>/g,
      (match, lang, code) => {
        const uniqueId = `code-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        // 移除多余的空格和换行，使用单行模板
        return `<pre><div class="copy-button" onclick="copyCode('${uniqueId}')"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg><span>复制</span></div><code class="language-${lang}" id="${uniqueId}">${code}</code></pre>`;
      }
    );
  } catch (e) {
    console.error('Markdown 渲染错误:', e);
    return text || '';
  }
}

// 键盘事件处理
function handleKeyDown(e: Event) {
  const event = e as KeyboardEvent;
  if (event.shiftKey && event.key === 'Enter') {
    // Shift+Enter 换行，不阻止默认行为
    return;
  }
  if (event.key === 'Enter' && !event.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
}

// 内存管理实现
const memory: CustomMemory = {
  chatHistory: [],
  memoryKeys: ['chat_history'],
  async loadMemoryVariables() {
    return {
      chat_history: this.chatHistory
        .map(msg => `Human: ${msg.input}\nAssistant: ${msg.output}`)
        .join('\n\n'),
    };
  },
  async saveContext(inputValues: Record<string, any>, outputValues: Record<string, any>) {
    this.chatHistory.push({
      input: inputValues.input,
      output: outputValues.output,
    });
    // 只留最近的 5 轮对话
    if (this.chatHistory.length > 5) {
      this.chatHistory = this.chatHistory.slice(-5);
    }
  },
  clear() {
    this.chatHistory = [];
  },
};

// 创建统一的聊天模型工厂
function createChatModel(): BaseChatModel {
  switch (currentModel.value) {
    case 'openai':
      return new ChatOpenAI({
        temperature: 0.9,
        openAIApiKey: localStorage.getItem('OPENAI_API_KEY') || '',
        streaming: true,
        callbacks: [
          {
            handleLLMNewToken(token: string) {
              handleStreamResponse(token);
            },
          },
        ],
      });
    case 'ollama':
      return new ChatOllama({
        baseUrl: localStorage.getItem('OLLAMA_BASE_URL') || 'http://localhost:11434',
        model: localStorage.getItem('OLLAMA_MODEL') || 'llama2',
        temperature: 0.7,
        callbacks: [
          {
            handleLLMNewToken(token: string) {
              handleStreamResponse(token);
            },
          },
        ],
      });
    case 'deepseek':
      return new ChatOpenAI({
        modelName: 'deepseek-chat',
        openAIApiKey: localStorage.getItem('DEEPSEEK_API_KEY') || '',
        streaming: true,
        temperature: 0.9,
        configuration: {
          baseURL: 'https://api.deepseek.com/v1',
        },
        callbacks: [
          {
            handleLLMNewToken(token: string) {
              handleStreamResponse(token);
            },
          },
        ],
      });
    case 'gemini':
      return new ChatGoogleGenerativeAI({
        modelName: localStorage.getItem('GEMINI_MODEL') || 'gemini-2.0-flash-exp',
        apiKey: localStorage.getItem('GEMINI_API_KEY') || '',
        streaming: true,
        maxOutputTokens: Number(localStorage.getItem('GEMINI_MAX_TOKENS')) || 8192,
        temperature: Number(localStorage.getItem('GEMINI_TEMPERATURE')) || 1.0,
        topK: Number(localStorage.getItem('GEMINI_TOP_K')) || 40,
        topP: Number(localStorage.getItem('GEMINI_TOP_P')) || 0.95,
        callbacks: [
          {
            handleLLMNewToken(token: string) {
              handleStreamResponse(token);
            },
          },
        ],
      });
    default:
      throw new Error(`未知的模型类型: ${currentModel.value}`);
  }
}

// 将chatModel改为ref
const chatModel = ref(createChatModel());

// 修改消息处理函数
async function sendMessage() {
  if (!userInput.value.trim() || loading.value) return;

  loading.value = true;
  const inputContent = userInput.value.trim();
  console.log('发送消息:', inputContent, '使用模型:', currentModel.value);

  try {
    messages.value.push({
      role: 'human',
      content: inputContent,
      timestamp: Date.now(),
    });

    userInput.value = '';
    userScrolling.value = false;
    await nextTick();
    scrollToBottom();

    messages.value.push({
      role: 'assistant',
      model: currentModel.value,
      content: '',
      streaming: true,
      timestamp: Date.now(),
    });

    const response = await chatModel.value.invoke([new HumanMessage(inputContent)]);

    console.log('AI 响应:', response);

    const lastMessage = messages.value[messages.value.length - 1];
    if (lastMessage && lastMessage.streaming) {
      lastMessage.streaming = false;
      lastMessage.content = response.content.toString();
    }
  } catch (error) {
    console.error('发送消息时出错:', error);
    const lastMessage = messages.value[messages.value.length - 1];
    if (lastMessage && lastMessage.streaming) {
      lastMessage.streaming = false;
      lastMessage.error = true;
      lastMessage.content = `错误: ${error instanceof Error ? error.message : '未知错误'}`;
    }
  } finally {
    loading.value = false;
  }
}

// 添加一个变量来跟踪用户是否正在查看历史消息
const userScrolling = ref(false);
const lastScrollTop = ref(0);

// 修改滚动到底的函数
function scrollToBottom(force = false) {
  if (messagesRef.value) {
    // 如果用户正在查看历史消息且不是强制滚动，则不自动滚动
    if (userScrolling.value && !force) {
      return;
    }
    // 使用 scrollIntoView 实现平滑滚动
    const lastMessage = messagesRef.value.lastElementChild;
    if (lastMessage) {
      lastMessage.scrollIntoView({
        behavior: 'smooth',
        block: 'end',
      });
    } else {
      messagesRef.value.scrollTo({
        top: messagesRef.value.scrollHeight,
        behavior: 'smooth',
      });
    }
  }
}

// 添加滚动事件处理
function handleScroll(e: Event) {
  const target = e.target as HTMLElement;
  const isNearBottom = target.scrollHeight - target.scrollTop - target.clientHeight < 50;

  // 更新最后滚动位置
  lastScrollTop.value = target.scrollTop;

  // 果接近底部，允许自动滚动
  userScrolling.value = !isNearBottom;
}

// 修改流式输出处理
function handleStreamResponse(chunk: string) {
  const lastMessage = messages.value[messages.value.length - 1];
  if (lastMessage && lastMessage.streaming) {
    lastMessage.content += chunk;
    // 如果内容是错误提示，移除 streaming 状态
    if (chunk.includes('Failed to') || chunk.includes('Error:')) {
      lastMessage.streaming = false;
      lastMessage.error = true;
    }
    // 只有用户没有滚动查看历史消息时才自动滚动
    scrollToBottom();
  }
}

// 加载会话消息
function loadMessages(
  conversationMessages: Array<{
    role: string;
    content: string;
    timestamp: number;
  }>
) {
  console.log('AIChatBox 加载消息:', { count: conversationMessages.length });
  if (!Array.isArray(conversationMessages)) {
    console.error('无效的消息数组:', conversationMessages);
    return;
  }

  messages.value = conversationMessages.map(msg => ({
    ...msg,
    streaming: false,
    error: false,
  }));

  nextTick(() => {
    scrollToBottom();
  });
}

// 清空消息
function clearMessages() {
  console.log('AIChatBox 清消息');
  messages.value = [];
}

// 获取当前消息
function getMessages() {
  const validMessages = messages.value
    .filter(msg => !msg.streaming && !msg.error && msg.content.trim() !== '') // 只返回有效消息
    .map(msg => ({
      role: msg.role,
      content: msg.content,
      timestamp: msg.timestamp || Date.now(),
    }));
  console.log('AIChatBox 获取消息:', { count: validMessages.length });
  return validMessages;
}

// 导出方法供父组件使用
defineExpose({
  loadMessages,
  clearMessages,
  getMessages,
});

// 定义事件
const emit = defineEmits<{
  (
    e: 'messagesUpdated',
    messages: Array<{
      role: string;
      content: string;
      timestamp: number;
    }>
  ): void;
}>();

// 在发送消息成功后触发更新事件
watch(
  () => messages.value,
  newMessages => {
    const validMessages = getMessages();
    if (validMessages.length > 0) {
      emit('messagesUpdated', validMessages);
    }
  },
  { deep: true }
);

// 添加配置消息函数
function showConfigMessage(type: 'warning' | 'error', message: string) {
  ElMessage({
    message,
    type,
    duration: 5000,
    showClose: true,
    grouping: true,
    onClose: () => router.push('/settings'),
  });
}

// 添加模型切换处理函数
function handleModelChange(value: string) {
  console.log('切换模型:', value);
  const apiKey =
    value === 'deepseek'
      ? localStorage.getItem('DEEPSEEK_API_KEY')
      : value === 'openai'
        ? localStorage.getItem('OPENAI_API_KEY')
        : value === 'gemini'
          ? localStorage.getItem('GEMINI_API_KEY')
          : null;

  if ((value === 'deepseek' || value === 'openai' || value === 'gemini') && !apiKey) {
    showConfigMessage('warning', '请先配置 API Key');
  }

  // 检查 Gemini 的其他必要配置
  if (value === 'gemini') {
    const model = localStorage.getItem('GEMINI_MODEL');
    if (!model) {
      showConfigMessage('warning', '请先在设置中选择 Gemini 模型');
      return;
    }
  }

  // 重新创建聊天模型实例
  chatModel.value = createChatModel();
}

// 添加设置页面跳转函数
function goToSettings() {
  router.push('/settings');
}

// 添加时间格式化函数
function formatTime(timestamp?: number) {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  return date
    .toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    })
    .replace(/\//g, '-');
}

// 修改重试逻辑
async function retryMessage(index: number) {
  const message = messages.value[index];
  if (!message || !message.error) return;

  try {
    message.error = false;
    message.streaming = true;
    message.content = '';
    message.model = currentModel.value;

    const response = await chatModel.value.invoke([new HumanMessage(message.content)]);

    message.content = response.content.toString();
    message.streaming = false;
  } catch (error) {
    message.error = true;
    message.streaming = false;
    message.content = error instanceof Error ? error.message : '重试失败';
  }
}

onMounted(() => {
  console.log('组件加载完成');
  console.log('当前选择模型:', currentModel.value);

  // 检查 API Key
  const deepseekKey = localStorage.getItem('DEEPSEEK_API_KEY');
  if (!deepseekKey) {
    showConfigMessage('warning', '请先在设置页配置 DeepSeek API Key');
  }

  scrollToBottom();

  // 添加滚动事件监听
  if (messagesRef.value) {
    messagesRef.value.addEventListener('scroll', handleScroll);
  }

  // 添加复制函数到 window 对象
  (window as any).copyCode = async (id: string) => {
    const codeElement = document.getElementById(id);
    if (codeElement) {
      const code = codeElement.textContent || '';
      try {
        await navigator.clipboard.writeText(code);

        // 获取复制按钮
        const button = codeElement.parentElement?.querySelector('.copy-button');
        if (button) {
          const span = button.querySelector('span');
          if (span) {
            // 更新按钮文本
            const originalText = span.textContent;
            span.textContent = '已复制！';
            button.classList.add('copied');

            // 2秒后恢复
            setTimeout(() => {
              span.textContent = originalText;
              button.classList.remove('copied');
            }, 2000);
          }
        }
      } catch (err) {
        console.error('复制失败:', err);
        ElMessage.error('复制失败');
      }
    }
  };
});

onUnmounted(() => {
  // 移除滚动事件监听
  if (messagesRef.value) {
    messagesRef.value.removeEventListener('scroll', handleScroll);
  }
});
</script>

<style scoped>
.chat-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  font-family: -apple-system, 'PingFang SC', 'Microsoft YaHei', 'Hiragino Sans GB',
    'WenQuanYi Micro Hei', sans-serif;
  height: 100%;
  position: relative;
}

.chat-header {
  padding: 12px 20px;
  border-bottom: 1px solid #dcdfe6;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
}

.model-select {
  width: 120px;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  font-size: 15px;
  line-height: 1.6;
  color: #2c3e50;
  scroll-behavior: smooth;
  overflow-anchor: auto;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.message {
  margin-bottom: 20px;
  padding: 12px 16px;
  border-radius: 8px;
  max-width: 85%;
  word-wrap: break-word;
  letter-spacing: 0.5px;
  display: block;
  width: fit-content;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.message.human {
  margin-left: auto;
  background-color: #e3f2fd;
  color: #1a1a1a;
}

.message.assistant {
  margin-right: auto;
  background-color: #ffffff;
  color: #1a1a1a;
  border: 1px solid #ebeef5;
}

.message-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 12px;
  color: #666;
}

.message-header .model {
  font-weight: bold;
  text-transform: capitalize;
}

.message-header .time {
  opacity: 0.8;
}

.error-actions {
  margin-top: 8px;
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.cursor {
  display: inline-block;
  width: 5px;
  height: 15px;
  background: #666;
  margin-left: 2px;
  animation: blink 1s infinite;
}

@keyframes blink {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0;
  }
}

.chat-input {
  padding: 20px;
  background-color: #fff;
  border-top: 1px solid #ebeef5;
}

:deep(.el-textarea) {
  transition: all 0.3s ease;
}

:deep(.el-input-group__append) {
  padding: 0 16px;
  background-color: #fff;
  border: 1px solid #dcdfe6;
  border-left: none;
}

:deep(.el-textarea__inner:hover) {
  border-color: #c0c4cc !important;
}

:deep(.el-textarea__inner) {
  resize: none;
  min-height: unset !important;
  font-family: monospace;
  padding: 8px 12px !important;
  line-height: 1.6 !important;
  text-indent: 0 !important;
  border: 1px solid #dcdfe6 !important;
  transition: all 0.3s;
}

:deep(.el-textarea__inner:focus) {
  border-color: #409eff !important;
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.1);
}

:deep(.markdown-body) {
  background: transparent;
  font-size: 14px;
  color: #2c3e50;
  width: 100%;
  overflow-wrap: break-word;
}

:deep(.markdown-body pre) {
  background: #f6f8fa !important;
  border-radius: 6px;
  padding: 16px;
  margin: 8px 0;
  border: 1px solid #e1e4e8;
  position: relative;
}

:deep(.copy-button) {
  background: rgba(255, 255, 255, 0.7);
  position: absolute;
  top: 8px;
  right: 8px;
  padding: 4px 8px;
  border: 1px solid #d1d5da;
  border-radius: 4px;
  font-size: 12px;
  color: #586069;
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.2s;
  z-index: 2;
  display: flex;
  align-items: center;
  gap: 4px;
}

:deep(.markdown-body pre:hover .copy-button) {
  opacity: 1;
}

:deep(.copy-button:hover) {
  background: #f3f4f6;
  border-color: #b1b5ba;
  color: #24292f;
}

:deep(.copy-button.copied) {
  background: #28a745;
  color: white;
  border-color: #28a745;
}

:deep(.markdown-body code) {
  background-color: transparent !important;
  padding: 0.2em 0.4em;
  border-radius: 6px;
  font-family:
    ui-monospace,
    SFMono-Regular,
    SF Mono,
    Menlo,
    Consolas,
    Liberation Mono,
    monospace;
  font-size: 85%;
  color: #24292f;
}

:deep(.markdown-body p code) {
  background-color: transparent !important;
  color: #24292f;
  padding: 0.2em 0.4em;
  border-radius: 3px;
}

:deep(.hljs) {
  background: transparent !important;
  color: #24292f;
}

:deep(.hljs-keyword),
:deep(.hljs-function) {
  color: #cf222e;
}

:deep(.hljs-string) {
  color: #0a3069;
}

:deep(.hljs-number) {
  color: #0550ae;
}

:deep(.hljs-comment) {
  color: #6e7781;
}

.message.error {
  border: 1px solid #f56c6c;
}

.message.streaming {
  border: 1px solid #e6a23c;
}
</style>
