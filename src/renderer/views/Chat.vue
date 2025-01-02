<template>
  <div class="chat-page">
    <div
      :class="['sidebar', { collapsed: sidebarCollapsed }]"
      :style="{ width: sidebarWidth + 'px' }"
    >
      <div class="sidebar-resizer" @mousedown="startResize"></div>
      <div class="sidebar-toggle" @click="toggleSidebar">
        <el-icon><ArrowLeft /></el-icon>
        <span class="toggle-text" :class="{ collapsed: sidebarCollapsed }">
          {{ sidebarCollapsed ? '展开会话列表' : '收起会话列表' }}
        </span>
      </div>
      <ConversationList
        :current-id="currentConversationId"
        @select="handleConversationSelect"
        @delete="handleConversationDelete"
        @update="handleConversationsUpdate"
      />
    </div>
    <div :class="['chat-content', { centered: sidebarCollapsed }]">
      <AIChatBox ref="chatBoxRef" @messages-updated="handleMessagesUpdated" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick, watch, onBeforeUnmount } from 'vue';
import { ArrowLeft } from '@element-plus/icons-vue';
import AIChatBox from '../components/AIChatBox.vue';
import ConversationList from '../components/ConversationList.vue';

interface Message {
  role: string;
  content: string;
  timestamp: number;
}

interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
}

const currentConversationId = ref<string>();
const chatBoxRef = ref();
const sidebarCollapsed = ref(false);
const sidebarWidth = ref(260);
const minSidebarWidth = 200;
const maxSidebarWidth = 400;
let isResizing = false;

// 添加消息缓存
const messageCache = new Map<string, Message[]>();

function toggleSidebar() {
  sidebarCollapsed.value = !sidebarCollapsed.value;
}

function startResize(e: MouseEvent) {
  isResizing = true;
  document.addEventListener('mousemove', handleResize);
  document.addEventListener('mouseup', stopResize);
}

function handleResize(e: MouseEvent) {
  if (!isResizing) return;
  const newWidth = e.clientX;
  if (newWidth >= minSidebarWidth && newWidth <= maxSidebarWidth) {
    sidebarWidth.value = newWidth;
  }
}

function stopResize() {
  isResizing = false;
  document.removeEventListener('mousemove', handleResize);
  document.removeEventListener('mouseup', stopResize);
}

async function saveCurrentMessages() {
  if (!currentConversationId.value || !chatBoxRef.value) return;

  try {
    const messages = chatBoxRef.value.getMessages();
    const conversations: Conversation[] = JSON.parse(localStorage.getItem('conversations') || '[]');
    const currentConv = conversations.find(c => c.id === currentConversationId.value);

    if (currentConv) {
      // 更新缓存和存储
      messageCache.set(currentConv.id, [...messages]);
      currentConv.messages = [...messages];
      currentConv.updatedAt = Date.now();
      localStorage.setItem('conversations', JSON.stringify(conversations));
      console.log('保存会话消息成功:', { id: currentConv.id, messageCount: messages.length });
    }
  } catch (error) {
    console.error('保存会话消息失败:', error);
  }
}

async function loadConversationMessages(id: string) {
  console.log('开始加载会话消息:', id);
  try {
    // 先尝试从缓存加载
    let messages = messageCache.get(id);

    if (!messages) {
      // 如果缓存中没有，从存储加载
      const conversations: Conversation[] = JSON.parse(
        localStorage.getItem('conversations') || '[]'
      );
      const conversation = conversations.find(c => c.id === id);
      if (conversation) {
        messages = [...(conversation.messages || [])];
        // 更新缓存
        messageCache.set(id, messages);
      }
    }

    if (!chatBoxRef.value) {
      console.log('chatBoxRef 未就绪');
      return;
    }

    // 清空当前消息
    chatBoxRef.value.clearMessages();
    await nextTick();

    // 加载消息
    if (messages && messages.length > 0) {
      console.log('加载会话消息:', { id, messageCount: messages.length });
      chatBoxRef.value.loadMessages([...messages]);
    } else {
      console.log('会话没有消息:', id);
    }
  } catch (error) {
    console.error('加载会话消息失败:', error);
  }
}

async function handleConversationSelect(id: string) {
  if (id === currentConversationId.value) {
    console.log('选择了当前会话，跳过切换');
    return;
  }

  console.log('开始切换会话:', id);

  try {
    // 保存当前会话
    if (currentConversationId.value) {
      await saveCurrentMessages();
    }

    // 清空当前消息
    if (chatBoxRef.value) {
      chatBoxRef.value.clearMessages();
      await nextTick();
    }

    // 更新当前会话ID并加载消息
    currentConversationId.value = id;
    await loadConversationMessages(id);
  } catch (error) {
    console.error('切换会话失败:', error);
  }
}

async function handleMessagesUpdated(messages: Message[]) {
  if (!currentConversationId.value) return;

  try {
    // 更新缓存
    messageCache.set(currentConversationId.value, [...messages]);

    // 更新存储
    const conversations: Conversation[] = JSON.parse(localStorage.getItem('conversations') || '[]');
    const currentConv = conversations.find(c => c.id === currentConversationId.value);

    if (currentConv) {
      currentConv.messages = [...messages];
      currentConv.updatedAt = Date.now();
      localStorage.setItem('conversations', JSON.stringify(conversations));
      console.log('自动保存会话消息:', { id: currentConv.id, messageCount: messages.length });
    }
  } catch (error) {
    console.error('自动保存消息失败:', error);
  }
}

function handleConversationDelete(id: string) {
  console.log('删除会话:', id);
  if (id === currentConversationId.value) {
    currentConversationId.value = undefined;
    if (chatBoxRef.value) {
      chatBoxRef.value.clearMessages();
    }
  }
}

function handleConversationsUpdate(conversations: Conversation[]) {
  console.log('更新会话列表:', conversations);
  localStorage.setItem('conversations', JSON.stringify(conversations));
}

onUnmounted(async () => {
  await saveCurrentMessages();
  document.removeEventListener('mousemove', handleResize);
  document.removeEventListener('mouseup', stopResize);
});

// 组件卸载前清理
onBeforeUnmount(async () => {
  await saveCurrentMessages();
  messageCache.clear();
});

// 组件加载时初始化
onMounted(async () => {
  console.log('Chat 组件加载完成');
  const conversations: Conversation[] = JSON.parse(localStorage.getItem('conversations') || '[]');

  // 预加载所有会话消息到缓存
  conversations.forEach(conv => {
    messageCache.set(conv.id, [...(conv.messages || [])]);
  });

  // 如果有会话，加载第一个会话
  if (conversations.length > 0) {
    console.log('加载第一个会话:', conversations[0].id);
    currentConversationId.value = conversations[0].id;
    await nextTick();
    await loadConversationMessages(conversations[0].id);
  }
});
</script>

<style scoped>
.chat-page {
  height: 100vh;
  display: flex;
  position: relative;
  background-color: transparent;
  padding: 4px;
  padding-top: 0;
  font-family: -apple-system, 'PingFang SC', 'Microsoft YaHei', 'Hiragino Sans GB',
    'WenQuanYi Micro Hei', sans-serif;
  box-sizing: border-box;
  overflow: hidden;
}

.sidebar {
  width: 260px;
  position: relative;
  height: calc(100vh - 8px);
  margin-top: -8px;
  transition: all 0.3s;
  background: #fff;
  z-index: 10;
  flex-shrink: 0;
  border-radius: 8px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
}

.sidebar.collapsed {
  transform: translateX(-100%);
}

.sidebar-resizer {
  position: absolute;
  right: -5px;
  top: 0;
  width: 10px;
  height: 100%;
  cursor: col-resize;
  z-index: 1;
}

.sidebar-toggle {
  position: absolute;
  right: -24px;
  top: 50%;
  transform: translateY(-50%);
  width: 24px;
  height: 48px;
  background: #fff;
  border: 1px solid #dcdfe6;
  border-left: none;
  border-radius: 0 4px 4px 0;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 1;
  overflow: visible;
}

.toggle-text {
  position: absolute;
  white-space: nowrap;
  left: 40px;
  font-size: 14px;
  color: #606266;
  opacity: 0;
  transition: opacity 0.3s;
  pointer-events: none;
}

.toggle-text.collapsed {
  opacity: 1;
}

.sidebar-toggle:hover {
  background: #f5f7fa;
}

.sidebar-toggle:hover .toggle-text {
  opacity: 1;
}

.chat-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  transition: all 0.3s;
  background-color: #fff;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
  border-radius: 8px;
  height: calc(100vh - 8px);
  margin-left: 4px;
  margin-top: -8px;
  padding: 4px 8px;
  font-size: 15px;
  line-height: 1.6;
  color: #2c3e50;
  letter-spacing: 0.5px;
  box-sizing: border-box;
  overflow: hidden;
}

.chat-content.centered {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  max-width: 900px;
  width: calc(100% - 16px);
  height: calc(100vh - 8px);
  margin-top: -16px;
}

.sidebar.collapsed .sidebar-toggle .el-icon {
  transform: rotate(180deg);
}

@media (max-width: 768px) {
  .chat-page {
    padding: 2px;
  }

  .chat-content {
    margin-left: 2px;
    padding: 4px;
    height: calc(100vh - 4px);
  }

  .chat-content.centered {
    width: calc(100% - 4px);
    padding: 4px;
    height: calc(100vh - 4px);
  }
}

/* 全局字体样式（需要添加到 App.vue 或全局样式文件中） */
:global(*) {
  font-family: -apple-system, 'PingFang SC', 'Microsoft YaHei', 'Hiragino Sans GB',
    'WenQuanYi Micro Hei', sans-serif;
}

/* 添加全局盒模型设置 */
:global(*) {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

/* 添加全局滚动条样式 */
:global(::-webkit-scrollbar) {
  width: 8px;
  height: 8px;
}

:global(::-webkit-scrollbar-track) {
  background: #f1f1f1;
  border-radius: 4px;
}

:global(::-webkit-scrollbar-thumb) {
  background: #c1c1c1;
  border-radius: 4px;
}

:global(::-webkit-scrollbar-thumb:hover) {
  background: #a8a8a8;
}

.menu-text {
  font-size: 14px;
  text-align: center;
  width: 100%;
  line-height: 1.4;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  padding: 0 8px;
}

.menu-item {
  height: 48px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 6px 4px;
  gap: 4px;
  border-radius: 8px;
  margin: 0 4px;
  cursor: pointer;
}
</style>
