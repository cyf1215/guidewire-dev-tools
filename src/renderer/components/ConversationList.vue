<template>
  <div class="conversation-list">
    <div class="list-header">
      <el-button type="primary" @click="createConversation">
        <el-icon><Plus /></el-icon>
        新建会话
      </el-button>
    </div>

    <div class="list-content">
      <div v-for="conv in conversations"
           :key="conv.id"
           :class="['conversation-item', { active: currentId === conv.id }]"
           @click="selectConversation(conv.id)">
        <div class="item-content">
          <el-icon v-if="conv.id === currentId"><ChatRound /></el-icon>
          <span v-if="!conv.isEditing"
                class="title"
                @dblclick="(e) => startEditing(conv, e)">{{ conv.title }}</span>
          <el-input
            v-else
            v-model="conv.title"
            size="small"
            @blur="(e) => finishEditing(conv, e)"
            @keyup.enter="(e) => finishEditing(conv, e)"
            @keyup.esc="(e) => cancelEditing(conv, e)"
            v-focus
          />
        </div>

        <div class="item-actions">
          <el-dropdown trigger="hover" @command="(cmd) => handleCommand(cmd, conv)">
            <el-button link>
              <el-icon><More /></el-icon>
            </el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="rename">
                  <el-icon><Edit /></el-icon>重命名
                </el-dropdown-item>
                <el-dropdown-item command="export-text">
                  <el-icon><Download /></el-icon>导出文本
                </el-dropdown-item>
                <el-dropdown-item command="export-markdown">
                  <el-icon><Download /></el-icon>导出 Markdown
                </el-dropdown-item>
                <el-dropdown-item command="delete" divided>
                  <el-icon><Delete /></el-icon>删除
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, nextTick } from 'vue'
import { Plus, ChatRound, More, Edit, Download, Delete } from '@element-plus/icons-vue'
import { ElMessageBox } from 'element-plus'
import { nanoid } from 'nanoid'

interface Conversation {
  id: string
  title: string
  messages: Array<{
    role: string
    content: string
    timestamp: number
  }>
  isEditing?: boolean
  _originalTitle?: string
  createdAt: number
  updatedAt: number
}

const props = defineProps<{
  currentId?: string
}>()

const emit = defineEmits<{
  (e: 'select', id: string): void
  (e: 'delete', id: string): void
  (e: 'update', conversations: Conversation[]): void
}>()

const conversations = ref<Conversation[]>([])

// 自定义指令：自动聚焦
const vFocus = {
  mounted: (el: HTMLElement) => el.querySelector('input')?.focus()
}

// 创建新会话
function createConversation() {
  const newConv: Conversation = {
    id: nanoid(),
    title: `新会话 ${conversations.value.length + 1}`,
    messages: [],
    createdAt: Date.now(),
    updatedAt: Date.now()
  }
  conversations.value.unshift(newConv)
  saveConversations()
  emit('select', newConv.id)
}

// 选择会话
function selectConversation(id: string) {
  // 如果正在编辑，不触发选择
  if (conversations.value.some(conv => conv.isEditing)) {
    return
  }
  emit('select', id)
}

// 处理下拉菜单命令
async function handleCommand(command: string, conv: Conversation) {
  switch (command) {
    case 'rename':
      conv.isEditing = true
      break
    case 'export-text':
      exportConversation(conv, 'text')
      break
    case 'export-markdown':
      exportConversation(conv, 'markdown')
      break
    case 'delete':
      await deleteConversation(conv)
      break
  }
}

// 开始编辑
function startEditing(conv: Conversation, e: MouseEvent) {
  e.stopPropagation()
  conv._originalTitle = conv.title
  conv.isEditing = true
}

// 取消编辑
function cancelEditing(conv: Conversation, e: KeyboardEvent) {
  e.stopPropagation()
  if (conv._originalTitle) {
    conv.title = conv._originalTitle
  }
  conv.isEditing = false
  delete conv._originalTitle
}

// 完成编辑
function finishEditing(conv: Conversation, e: Event) {
  e.stopPropagation()
  if (!conv.title.trim()) {
    conv.title = `新会话 ${conversations.value.length}`
  }
  conv.isEditing = false
  delete conv._originalTitle
  saveConversations()
}

// 导出会话
function exportConversation(conv: Conversation, format: 'text' | 'markdown') {
  let content = ''

  if (format === 'text') {
    content = conv.messages.map(msg => {
      const role = msg.role === 'human' ? '我' : 'AI'
      return `${role}: ${msg.content}\n`
    }).join('\n')
  } else {
    content = `# ${conv.title}\n\n` + conv.messages.map(msg => {
      const role = msg.role === 'human' ? '我' : 'AI'
      return `### ${role}\n\n${msg.content}\n`
    }).join('\n')
  }

  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${conv.title}.${format === 'markdown' ? 'md' : 'txt'}`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

// 删除会话
async function deleteConversation(conv: Conversation) {
  try {
    await ElMessageBox.confirm(
      `确定要删除会话"${conv.title}"吗？`,
      '删除会话',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    const index = conversations.value.findIndex(c => c.id === conv.id)
    if (index > -1) {
      conversations.value.splice(index, 1)
      saveConversations()
      emit('delete', conv.id)
    }
  } catch {
    // 用户取消删除
  }
}

// 保存会话到本地存储
function saveConversations() {
  console.log('保存会话列表:', conversations.value)
  localStorage.setItem('conversations', JSON.stringify(conversations.value))
  emit('update', conversations.value)
}

// 加载会话
function loadConversations() {
  const saved = localStorage.getItem('conversations')
  if (saved) {
    try {
      conversations.value = JSON.parse(saved)
      console.log('加载会话列表:', conversations.value)
      // 如果有会话，选择第一个
      if (conversations.value.length > 0) {
        emit('select', conversations.value[0].id)
      }
    } catch (e) {
      console.error('加载会话失败:', e)
      conversations.value = []
      createConversation()
    }
  } else {
    createConversation()
  }
}

onMounted(() => {
  loadConversations()
})
</script>

<style scoped>
.conversation-list {
  width: 260px;
  height: 100%;
  display: flex;
  flex-direction: column;
  border-right: 1px solid #dcdfe6;
}

.list-header {
  padding: 12px;
  border-bottom: 1px solid #dcdfe6;
}

.list-header .el-button {
  width: 100%;
}

.list-content {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
}

.conversation-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  margin-bottom: 4px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
}

.conversation-item:hover {
  background-color: #f5f7fa;
}

.conversation-item.active {
  background-color: #ecf5ff;
}

.item-content {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 8px;
  overflow: hidden;
}

.title {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.item-actions {
  opacity: 0;
  transition: opacity 0.3s;
}

.conversation-item:hover .item-actions {
  opacity: 1;
}

.el-input {
  margin: -4px 0;
}
</style>
