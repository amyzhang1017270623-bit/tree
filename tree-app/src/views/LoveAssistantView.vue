<template>
  <div class="love-assistant-container h-screen bg-white flex flex-col">
    <!-- 顶部导航 -->
    <header class="sticky top-0 z-50 bg-white border-b border-gray-100 px-6 py-4 flex-shrink-0">
      <div class="flex items-center justify-between">
        <button @click="goBack" class="w-8 h-8 flex items-center justify-center">
          <svg class="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
          </svg>
        </button>
        <h1 class="text-xl font-bold">{{ t('loveAssistant.title') }}</h1>
        <div class="w-8"></div>
      </div>
    </header>

    <!-- 聊天区域 -->
    <div class="chat-container flex-1 flex flex-col overflow-hidden">
      <!-- 消息列表（滚动区域） -->
      <div class="chat-messages flex-1 overflow-auto px-6 py-4 space-y-4">
        <div v-for="(msg, idx) in messages" :key="idx" :class="['message', msg.isUser ? 'user-message' : 'bot-message']">
          <div class="message-bubble" :class="msg.isUser ? 'user' : 'bot'">
            <!-- 用户消息 -->
            <template v-if="msg.isUser">
              <div v-if="msg.image" class="image-container mb-2">
                <img :src="msg.image" class="max-w-[200px] max-h-[150px] rounded-lg object-contain cursor-pointer" @click="openImageModal(msg.image)" />
              </div>
              <div v-if="msg.fileName" class="mb-2 text-xs text-white flex items-center gap-1.5">
                <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
                <span class="truncate">{{ msg.fileName }}</span>
              </div>
              <p v-if="msg.text && !msg.image && !msg.fileName">{{ msg.text }}</p>
            </template>
            <!-- AI 回复 -->
            <template v-else>
              <div v-if="msg.status" class="status-card bg-gray-50 rounded-xl p-4 mb-3">
                <p class="text-xs text-gray-500 mb-1">{{ t('loveAssistant.statusAssessment') }}</p>
                <p class="text-base font-medium text-gray-800">{{ msg.status }}</p>
              </div>
              <div v-if="msg.suggestions" class="suggestions-section space-y-3">
                <div class="suggestion-card bg-gray-50 rounded-xl p-4">
                  <div class="flex justify-between items-center mb-2">
                    <span class="text-gray-700 font-medium text-sm">{{ t('loveAssistant.softWay') }}</span>
                    <button @click="copyText(msg.suggestions.soft)" class="text-xs text-gray-400 hover:text-gray-600 transition-colors">
                      {{ t('general.copy') }}
                    </button>
                  </div>
                  <p class="text-gray-700 text-sm">{{ msg.suggestions.soft }}</p>
                </div>
                <div class="suggestion-card bg-gray-50 rounded-xl p-4">
                  <div class="flex justify-between items-center mb-2">
                    <span class="text-gray-700 font-medium text-sm">{{ t('loveAssistant.humorousWay') }}</span>
                    <button @click="copyText(msg.suggestions.humorous)" class="text-xs text-gray-400 hover:text-gray-600 transition-colors">
                      {{ t('general.copy') }}
                    </button>
                  </div>
                  <p class="text-gray-700 text-sm">{{ msg.suggestions.humorous }}</p>
                </div>
                <div class="suggestion-card bg-gray-50 rounded-xl p-4">
                  <div class="flex justify-between items-center mb-2">
                    <span class="text-gray-700 font-medium text-sm">{{ t('loveAssistant.seriousWay') }}</span>
                    <button @click="copyText(msg.suggestions.serious)" class="text-xs text-gray-400 hover:text-gray-600 transition-colors">
                      {{ t('general.copy') }}
                    </button>
                  </div>
                  <p class="text-gray-700 text-sm">{{ msg.suggestions.serious }}</p>
                </div>
              </div>
              <p v-else class="text-gray-700">{{ msg.text }}</p>
            </template>
          </div>
        </div>
        <!-- 加载状态 -->
        <div v-if="isLoading" class="message bot-message">
          <div class="message-bubble bot">
            <div class="flex items-center gap-2">
              <svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span class="text-gray-500 text-sm">{{ t('loveAssistant.thinking') }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 输入框（固定在底部） -->
      <div class="chat-input px-6 py-4 border-t border-gray-100 flex-shrink-0">
        <!-- 预览区域 -->
        <div v-if="imagePreview || filePreview" class="mb-3 flex gap-3">
          <div v-if="imagePreview" class="relative">
            <div class="w-16 h-16 rounded-lg border border-gray-200 overflow-hidden relative">
              <img :src="imagePreview" class="w-full h-full object-cover" />
              <!-- 加载遮罩 -->
              <div 
                v-if="isLoading && imagePreview" 
                class="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg"
              >
                <svg class="w-6 h-6 text-white animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
            </div>
            <button 
              @click="clearImagePreview"
              class="absolute -top-1 -right-1 w-5 h-5 bg-gray-400 text-white rounded-full flex items-center justify-center hover:bg-gray-500 z-10"
            >
              <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
          <div v-if="filePreview" class="relative">
            <div class="w-16 h-16 rounded-lg border border-gray-200 bg-gray-50 flex flex-col items-center justify-center relative">
              <svg class="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
              <span class="text-xs text-gray-500 truncate w-full text-center px-1">{{ uploadedFileName }}</span>
              <!-- 加载遮罩 -->
              <div 
                v-if="isLoading && filePreview" 
                class="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg"
              >
                <svg class="w-6 h-6 text-white animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
            </div>
            <button 
              @click="removeFile"
              class="absolute -top-1 -right-1 w-5 h-5 bg-gray-400 text-white rounded-full flex items-center justify-center hover:bg-gray-500 z-10"
            >
              <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
        </div>
        <div class="flex items-end gap-3">
          <!-- "+"号按钮 -->
          <button 
            @click="showUploadModal = true"
            class="w-12 h-12 bg-black text-white rounded-full flex items-center justify-center hover:bg-gray-800 transition-colors flex-shrink-0 mt-auto"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
            </svg>
          </button>
          <!-- 输入框 -->
          <div class="flex-1 max-h-40">
            <textarea 
              ref="messageInputRef"
              v-model="messageInput"
              @input="autoResize"
              @keyup.enter.ctrl="sendMessage"
              @keyup.enter.meta="sendMessage"
              class="w-full px-4 py-3 bg-gray-100 rounded-2xl focus:outline-none resize-none max-h-40 min-h-[44px]"
              :placeholder="t('loveAssistant.placeholder')"
              rows="1"
            ></textarea>
          </div>
          <!-- 发送按钮 -->
          <button 
            @click="sendMessage"
            :disabled="!messageInput.trim() && !imagePreview && !filePreview || isLoading"
            class="w-12 h-12 bg-black text-white rounded-full flex items-center justify-center disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-gray-800 transition-colors flex-shrink-0 mt-auto"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path>
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- 图片预览模态框 -->
    <div v-if="showImageModal" class="fixed inset-0 bg-black/90 flex items-center justify-center z-50" @click="closeImageModal">
      <button 
        @click="closeImageModal"
        class="absolute top-4 right-4 w-10 h-10 text-white flex items-center justify-center hover:bg-white/20 rounded-full transition-colors"
      >
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
        </svg>
      </button>
      <img 
        :src="currentPreviewImage" 
        alt="Preview" 
        class="max-w-[90vw] max-h-[90vh] object-contain"
        @click.stop
      />
    </div>

    <!-- 上传选项悬浮菜单 -->
    <div v-if="showUploadModal" class="fixed inset-0 z-50" @click="showUploadModal = false">
      <div class="absolute bottom-20 left-4 w-40 bg-white rounded-xl shadow-lg border border-gray-100 py-1" @click.stop>
        <div class="absolute -bottom-2 left-10 w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-white"></div>
        <!-- 上传图片选项 -->
        <label class="flex items-center gap-3 px-4 py-2.5 cursor-pointer hover:bg-gray-50 transition-colors w-full">
          <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
          </svg>
          <span class="text-sm font-medium text-gray-800">{{ t('loveAssistant.uploadImage') }}</span>
          <input type="file" accept="image/*" class="hidden" @change="selectImage" />
        </label>
        
        <!-- 上传文件选项 -->
        <label class="flex items-center gap-3 px-4 py-2.5 cursor-pointer hover:bg-gray-50 transition-colors w-full">
          <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
          </svg>
          <span class="text-sm font-medium text-gray-800">{{ t('loveAssistant.uploadFile') }}</span>
          <input type="file" accept="text/*,.txt,.log,.docx,.doc,.pdf" class="hidden" @change="selectFile" />
        </label>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, onMounted, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useUserStore } from '../stores/user'
import { analyzeLoveChat, analyzeImageContent } from '../utils/api'

const { t } = useI18n()
const router = useRouter()
const userStore = useUserStore()



interface LoveMessage {
  id: string
  text: string
  isUser: boolean
  timestamp: number
  image?: string
  fileName?: string
  status?: string
  suggestions?: {
    soft: string
    humorous: string
    serious: string
  }
}

const messages = ref<LoveMessage[]>([
  {
    id: 'init',
    text: t('loveAssistant.welcome'),
    isUser: false,
    timestamp: Date.now()
  }
])
const messageInput = ref('')
const isLoading = ref(false)

// 输入框引用
const messageInputRef = ref<HTMLTextAreaElement | null>(null)

// 上传相关
const imagePreview = ref('')
const filePreview = ref('')
const uploadedFileName = ref('')
const extractedFileContent = ref('')

// 图片预览模态框
const showImageModal = ref(false)
const currentPreviewImage = ref('')

// 上传选项弹框
const showUploadModal = ref(false)

const selectImage = (event: Event) => {
  showUploadModal.value = false
  handleImageUpload(event)
}

const selectFile = (event: Event) => {
  showUploadModal.value = false
  handleFileUpload(event)
}

const autoResize = () => {
  const textarea = messageInputRef.value
  if (!textarea) return
  
  textarea.style.height = 'auto'
  const scrollHeight = textarea.scrollHeight
  const maxHeight = 200
  
  textarea.style.height = Math.min(scrollHeight, maxHeight) + 'px'
}

watch(messageInput, () => {
  nextTick(() => {
    autoResize()
  })
})

const scrollToBottom = () => {
  nextTick(() => {
    const chatContainer = document.querySelector('.chat-messages')
    if (chatContainer) {
      chatContainer.scrollTop = chatContainer.scrollHeight
    }
  })
}

const copyText = (text: string) => {
  navigator.clipboard.writeText(text)
  alert(t('general.copied'))
}

const sendMessage = async () => {
  if ((!messageInput.value.trim() && !imagePreview.value && !filePreview.value) || isLoading.value) return
  
  // 添加用户消息
  const userMessage: LoveMessage = {
    id: Date.now().toString(),
    text: messageInput.value,
    isUser: true,
    timestamp: Date.now(),
    image: imagePreview.value || undefined,
    fileName: uploadedFileName.value || undefined
  }
  messages.value.push(userMessage)
  
  // 保存上传内容
  const currentImage = imagePreview.value
  const currentFileName = uploadedFileName.value
  const currentFileContent = extractedFileContent.value
  
  // 清空输入
  messageInput.value = ''
  imagePreview.value = ''
  filePreview.value = ''
  uploadedFileName.value = ''
  extractedFileContent.value = ''
  
  // 重置输入框高度
  nextTick(() => {
    const textarea = messageInputRef.value
    if (textarea) {
      textarea.style.height = 'auto'
    }
  })
  
  scrollToBottom()
  
  isLoading.value = true
  scrollToBottom()
  
  try {
    // 构建完整输入
    let fullInput = userMessage.text
    console.log('[Send Message] userMessage.text:', userMessage.text ? `(${userMessage.text.length} chars)` : 'empty')
    console.log('[Send Message] currentFileContent:', currentFileContent ? `(${currentFileContent.length} chars)` : 'empty')
    
    if (currentFileContent) {
      fullInput = fullInput ? `${fullInput}\n${currentFileContent}` : currentFileContent
    }
    
    console.log('[Send Message] fullInput:', fullInput ? `(${fullInput.length} chars)` : 'empty')
    console.log('[Send Message] fullInput preview:', fullInput?.substring(0, 100) + '...')
    
    const result = await analyzeLoveChat(fullInput)
    
    // 添加 AI 回复
      messages.value.push({
        id: (Date.now() + 1).toString(),
        text: '',
        isUser: false,
        timestamp: Date.now(),
        status: result.status,
        suggestions: {
          soft: result.suggestions.soft,
          humorous: result.suggestions.humorous,
          serious: result.suggestions.serious
        }
      })
      
      userStore.incrementUsage('loveAssistant')
    } catch (error) {
    console.error('Error analyzing chat:', error)
    // 降级方案
    const lowerInput = userMessage.text.toLowerCase()
    let status = t('loveAssistant.statusDefault')
    let suggestions = {
      soft: t('loveAssistant.softDefault'),
      humorous: t('loveAssistant.humorousDefault'),
      serious: t('loveAssistant.seriousDefault')
    }
    
    // 检测关键词
    const hasMissing = lowerInput.includes('想') || lowerInput.includes('miss')
    const hasAngry = lowerInput.includes('生气') || lowerInput.includes('烦') || lowerInput.includes('气')
    const hasHappy = lowerInput.includes('开心') || lowerInput.includes('高兴') || lowerInput.includes('快乐')
    const hasBusy = lowerInput.includes('忙') || lowerInput.includes('累')
    const hasDate = lowerInput.includes('明天') || lowerInput.includes('见') || lowerInput.includes('约')
    const hasLove = lowerInput.includes('爱') || lowerInput.includes('喜欢')
    
    // 生成状态分析
    if (hasAngry) {
      status = t('loveAssistant.statusAngry')
    } else if (hasHappy) {
      status = t('loveAssistant.statusHappy')
    } else if (hasBusy) {
      status = t('loveAssistant.statusBusy')
    } else if (hasDate) {
      status = t('loveAssistant.statusDate')
    } else if (hasMissing) {
      status = t('loveAssistant.statusMissing')
    } else if (hasLove) {
      status = t('loveAssistant.statusLove')
    }
    
    // 生成温柔回应
    if (hasAngry) {
      suggestions.soft = t('loveAssistant.softAngry')
    } else if (hasMissing) {
      suggestions.soft = t('loveAssistant.softMissing')
    } else if (hasBusy) {
      suggestions.soft = t('loveAssistant.softBusy')
    } else if (hasHappy) {
      suggestions.soft = t('loveAssistant.softHappy')
    }
    
    // 生成幽默回应
    if (hasAngry) {
      suggestions.humorous = t('loveAssistant.humorousAngry')
    } else if (hasMissing) {
      suggestions.humorous = t('loveAssistant.humorousMissing')
    } else if (hasBusy) {
      suggestions.humorous = t('loveAssistant.humorousBusy')
    } else if (hasDate) {
      suggestions.humorous = t('loveAssistant.humorousDate')
    }
    
    // 生成稳重回应
    if (hasAngry) {
      suggestions.serious = t('loveAssistant.seriousAngry')
    } else if (hasMissing) {
      suggestions.serious = t('loveAssistant.seriousMissing')
    } else if (hasBusy) {
      suggestions.serious = t('loveAssistant.seriousBusy')
    } else if (hasDate) {
      suggestions.serious = t('loveAssistant.seriousDate')
    } else if (hasLove) {
      suggestions.serious = t('loveAssistant.seriousLove')
    }
    
    messages.value.push({
      id: (Date.now() + 1).toString(),
      text: '',
      isUser: false,
      timestamp: Date.now(),
      status,
      suggestions
    })
    
    userStore.incrementUsage('loveAssistant')
  } finally {
    isLoading.value = false
    scrollToBottom()
  }
}

const clearImagePreview = () => {
  imagePreview.value = ''
}

const openImageModal = (imageSrc: string) => {
  currentPreviewImage.value = imageSrc
  showImageModal.value = true
}

const closeImageModal = () => {
  showImageModal.value = false
  currentPreviewImage.value = ''
}

const handleImageUpload = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  
  if (!file) return
  
  isLoading.value = true
  
  const reader = new FileReader()
  reader.onload = async (e) => {
    const result = e.target?.result as string
    imagePreview.value = result
    
    try {
      console.log('[Image Upload] Starting image analysis...')
      const imageText = await analyzeImageContent(result, '请识别并提取图片中的所有文字内容，包括聊天记录、对话内容等，以文本形式输出')
      console.log('[Image Upload] Image analysis result:', imageText ? `(${imageText.length} characters)` : 'empty')
      if (imageText && imageText.trim()) {
        extractedFileContent.value = imageText
        console.log('[Image Upload] Extracted content saved:', extractedFileContent.value.substring(0, 50) + '...')
      } else {
        console.warn('[Image Upload] No text extracted from image')
      }
    } catch (error) {
      console.error('Failed to analyze image:', error)
    } finally {
      isLoading.value = false
    }
  }
  reader.readAsDataURL(file)
  
  target.value = ''
}

const handleFileUpload = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  
  if (!file) return
  
  isLoading.value = true
  
  uploadedFileName.value = file.name
  filePreview.value = 'file-preview'
  
  const fileName = file.name.toLowerCase()
  
  try {
    let textContent = ''
    
    if (fileName.endsWith('.docx')) {
      textContent = await readDocxFile(file)
    } else if (fileName.endsWith('.doc')) {
      textContent = await readDocFile(file)
    } else if (fileName.endsWith('.pdf')) {
      textContent = await readPdfFile(file)
    } else {
      textContent = await readFileAsText(file)
    }
    
    extractedFileContent.value = textContent
  } catch (error) {
    console.error('File read error:', error)
    extractedFileContent.value = ''
  } finally {
    isLoading.value = false
  }
  
  target.value = ''
}

const removeFile = () => {
  filePreview.value = ''
  uploadedFileName.value = ''
  extractedFileContent.value = ''
}

const readFileAsText = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => resolve(e.target?.result as string)
    reader.onerror = reject
    reader.readAsText(file, 'utf-8')
  })
}

const loadJSZip = async (): Promise<any> => {
  if ((window as any).JSZip) {
    return (window as any).JSZip
  }
  
  return new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js'
    script.onload = () => resolve((window as any).JSZip)
    script.onerror = () => reject(new Error('无法加载JSZip库'))
    document.head.appendChild(script)
  })
}

const readDocxFile = async (file: File): Promise<string> => {
  return new Promise(async (resolve) => {
    try {
      const JSZip = await loadJSZip()
      const reader = new FileReader()
      
      reader.onload = async (e) => {
        try {
          const arrayBuffer = e.target?.result as ArrayBuffer
          const zip = new JSZip()
          const content = await zip.loadAsync(arrayBuffer)
          const xmlContent = await content.file('word/document.xml')?.async('text')
          
          if (!xmlContent) {
            resolve('')
            return
          }
          
          let text = xmlContent
            .replace(/<w:p[^>]*>/g, '\n')
            .replace(/<\/w:p>/g, '')
            .replace(/<[^>]*>/g, '')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&amp;/g, '&')
            .replace(/\u00A0/g, ' ')
            .replace(/\r\n/g, '\n')
            .replace(/\r/g, '\n')
            .replace(/\n+/g, '\n')
            .trim()
          
          resolve(text || '')
        } catch (error) {
          console.error('DOCX parse error:', error)
          resolve('')
        }
      }
      
      reader.onerror = () => resolve('')
      reader.readAsArrayBuffer(file)
    } catch (error) {
      console.error('JSZip load error:', error)
      resolve('')
    }
  })
}

const readDocFile = async (file: File): Promise<string> => {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const arrayBuffer = e.target?.result as ArrayBuffer
      const uint8Array = new Uint8Array(arrayBuffer)
      const textDecoder = new TextDecoder('utf-8', { ignoreBOM: true })
      let text = textDecoder.decode(uint8Array)
      
      text = text.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
                 .replace(/\r\n/g, '\n')
                 .replace(/\r/g, '\n')
                 .trim()
      
      if (!text || text.length < 10) {
        text = ''
      }
      
      resolve(text)
    }
    reader.onerror = () => resolve('')
    reader.readAsArrayBuffer(file)
  })
}

const readPdfFile = async (file: File): Promise<string> => {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const arrayBuffer = e.target?.result as ArrayBuffer
      const uint8Array = new Uint8Array(arrayBuffer)
      
      let text = ''
      for (let i = 0; i < uint8Array.length; i++) {
        const byte = uint8Array[i]
        if (byte >= 32 && byte <= 126) {
          text += String.fromCharCode(byte)
        } else if (byte === 10 || byte === 13) {
          text += '\n'
        }
      }
      
      const pdfHeader = text.substring(0, 5)
      if (pdfHeader !== '%PDF-') {
        resolve('')
        return
      }
      
      const textContent = extractTextFromPdfText(text)
      resolve(textContent || '')
    }
    reader.onerror = () => resolve('')
    reader.readAsArrayBuffer(file)
  })
}

const extractTextFromPdfText = (pdfText: string): string => {
  const textSections: string[] = []
  const lines = pdfText.split('\n')
  
  let inTextSection = false
  
  for (const line of lines) {
    if (line.startsWith('BT')) {
      inTextSection = true
      continue
    }
    if (line.startsWith('ET')) {
      inTextSection = false
      continue
    }
    
    if (inTextSection) {
      let cleanLine = line.trim()
      if (cleanLine) {
        const parts = cleanLine.split(' ')
        for (const part of parts) {
          if (/^[\x20-\x7E]+$/.test(part) && part.length > 1 && !/^[0-9.]+$/.test(part)) {
            textSections.push(part)
          }
        }
      }
    }
  }
  
  return textSections.join(' ')
}

const goBack = () => router.push('/home')

// 键盘弹出适配
const handleKeyboardResize = () => {
  setTimeout(() => {
    scrollToBottom()
  }, 100)
}

onMounted(() => {
  window.addEventListener('resize', handleKeyboardResize)
  window.addEventListener('orientationchange', handleKeyboardResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleKeyboardResize)
  window.removeEventListener('orientationchange', handleKeyboardResize)
})
</script>

<style scoped>
.message {
  display: flex;
}

.user-message {
  justify-content: flex-end;
}

.bot-message {
  justify-content: flex-start;
}

.message-bubble {
  max-width: 85%;
  min-width: 80px;
  padding: 12px 16px;
  border-radius: 18px;
  word-break: break-word;
}

.message-bubble.user {
  background-color: #000;
  color: #fff;
  border-bottom-right-radius: 6px;
}

.message-bubble.bot {
  background-color: #f3f4f6;
  color: #000;
  border-bottom-left-radius: 6px;
}
</style>
