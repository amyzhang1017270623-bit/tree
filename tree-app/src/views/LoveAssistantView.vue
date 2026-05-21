<template>
  <div class="love-assistant-container min-h-screen bg-white flex flex-col pt-10">
    <div class="header px-6 py-4 flex items-center justify-between border-b border-gray-100">
      <button @click="goBack" class="mr-4">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
        </svg>
      </button>
      <h1 class="text-xl font-bold">{{ t('loveAssistant.title') }}</h1>
      <div class="w-10"></div>
    </div>

    <div class="content flex-1 overflow-auto px-6 py-6 space-y-6">
      <!-- 输入区域 -->
      <div class="input-section">
        <p class="text-gray-600 mb-4">{{ t('loveAssistant.inputPrompt') }}</p>
        
        <!-- 整合的输入框区域 -->
        <div class="border border-gray-300 rounded-xl focus-within:border-black transition-colors overflow-hidden">
          <!-- 预览区域（横向排版） -->
          <div v-if="imagePreview || filePreview" class="p-3 pb-1 flex gap-3 flex-wrap">
            <!-- 图片预览 -->
            <div v-if="imagePreview" class="relative">
              <!-- 正方形图片容器 -->
              <div 
                class="w-24 h-24 rounded-lg border border-gray-200 cursor-pointer overflow-hidden relative"
                @click="openImagePreview"
              >
                <img 
                  :src="imagePreview" 
                  alt="Preview" 
                  class="w-full h-full object-cover"
                />
                
                <!-- 圆环进度条 -->
                <div v-if="imageUploadProgress > 0 && imageUploadProgress < 100" class="absolute inset-0 flex items-center justify-center bg-black/30">
                  <div class="relative">
                    <svg class="w-12 h-12 transform -rotate-90">
                      <!-- 背景圆环 -->
                      <circle
                        cx="24"
                        cy="24"
                        r="20"
                        stroke="rgba(255, 255, 255, 0.3)"
                        stroke-width="4"
                        fill="transparent"
                      />
                      <!-- 进度圆环 -->
                      <circle
                        cx="24"
                        cy="24"
                        r="20"
                        stroke="white"
                        stroke-width="4"
                        fill="transparent"
                        stroke-linecap="round"
                        :stroke-dasharray="`${125.66} 125.66`"
                        :stroke-dashoffset="125.66 * (1 - imageUploadProgress / 100)"
                        class="transition-all duration-300"
                      />
                    </svg>
                    <div class="absolute inset-0 flex items-center justify-center">
                      <span class="text-white text-xs font-medium">{{ Math.round(imageUploadProgress) }}%</span>
                    </div>
                  </div>
                </div>
                
                <!-- 点击预览提示 -->
                <div class="absolute inset-0 flex items-center justify-center bg-black/0 hover:bg-black/20 transition-colors">
                  <span class="opacity-0 hover:opacity-100 text-white text-xs transition-opacity">点击放大</span>
                </div>
              </div>
              
              <button 
                @click.stop="clearImagePreview"
                class="absolute top-1 right-1 w-6 h-6 bg-gray-400 text-white rounded-full flex items-center justify-center hover:bg-gray-500 transition-colors z-10"
              >
                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
            
            <!-- 文件预览 -->
            <div v-if="filePreview" class="relative">
              <!-- 文件图标容器 -->
              <div 
                class="w-24 h-24 rounded-lg border border-gray-200 cursor-pointer overflow-hidden relative flex flex-col items-center justify-center bg-gray-50"
              >
                <svg class="w-10 h-10 text-gray-400 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
                <span class="text-xs text-gray-500 text-center px-2 truncate w-full">{{ uploadedFileName }}</span>
                
                <!-- 圆环进度条 -->
                <div v-if="fileUploadProgress > 0 && fileUploadProgress < 100" class="absolute inset-0 flex items-center justify-center bg-black/30">
                  <div class="relative">
                    <svg class="w-12 h-12 transform -rotate-90">
                      <!-- 背景圆环 -->
                      <circle
                        cx="24"
                        cy="24"
                        r="20"
                        stroke="rgba(255, 255, 255, 0.3)"
                        stroke-width="4"
                        fill="transparent"
                      />
                      <!-- 进度圆环 -->
                      <circle
                        cx="24"
                        cy="24"
                        r="20"
                        stroke="white"
                        stroke-width="4"
                        fill="transparent"
                        stroke-linecap="round"
                        :stroke-dasharray="`${125.66} 125.66`"
                        :stroke-dashoffset="125.66 * (1 - fileUploadProgress / 100)"
                        class="transition-all duration-300"
                      />
                    </svg>
                    <div class="absolute inset-0 flex items-center justify-center">
                      <span class="text-white text-xs font-medium">{{ Math.round(fileUploadProgress) }}%</span>
                    </div>
                  </div>
                </div>
                
                <!-- 删除按钮 -->
                <button 
                  @click.stop="removeFile"
                  class="absolute top-1 right-1 w-6 h-6 bg-gray-400 text-white rounded-full flex items-center justify-center hover:bg-gray-500 transition-colors z-10"
                >
                  <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              </div>
            </div>
          </div>
          
          <!-- 文件上传进度（只在没有图片和文件预览时显示） -->
          <div v-if="!imagePreview && !filePreview && uploadProgress > 0 && uploadProgress < 100" class="p-3">
            <div class="flex items-center justify-between mb-1">
              <span class="text-sm text-gray-600">{{ uploadingFileName }}</span>
              <span class="text-sm text-gray-600">{{ uploadProgress }}%</span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-2">
              <div 
                class="bg-black h-2 rounded-full transition-all duration-300"
                :style="{ width: uploadProgress + '%' }"
              ></div>
            </div>
          </div>
          
          <!-- 文本输入框 -->
          <textarea 
            v-model="chatInput"
            :class="[
              'w-full resize-none focus:outline-none min-h-[120px]',
              imagePreview ? 'px-4 pb-4 pt-2' : 'p-4'
            ]"
            :placeholder="t('loveAssistant.pasteHere')"
          ></textarea>
          
          <!-- 底部操作区域 -->
          <div class="flex items-center justify-between p-2">
            <!-- 上传按钮 -->
            <div class="flex gap-1">
              <label class="w-9 h-9 flex items-center justify-center rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                </svg>
                <input type="file" accept="image/*" class="hidden" @change="handleImageUpload" />
              </label>
              
              <label class="w-9 h-9 flex items-center justify-center rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
                <input type="file" accept="text/*,.txt,.log,.docx,.doc,.pdf" class="hidden" @change="handleFileUpload" />
              </label>
            </div>
            
            <!-- 分析按钮 -->
            <button 
              @click="handleSubmit"
              :disabled="!chatInput || isLoading"
              :class="[
                'px-6 py-2 rounded-full font-medium text-sm transition-all duration-300 flex items-center justify-center',
                chatInput && !isLoading
                  ? 'bg-black text-white hover:bg-gray-800' 
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              ]"
            >
              <svg v-if="isLoading" class="w-4 h-4 animate-spin mr-1" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {{ isLoading ? t('loveAssistant.noContent') : t('loveAssistant.analyze') }}
            </button>
          </div>
        </div>
      </div>

      <!-- 结果区域 -->
      <div class="result-section" v-if="hasSubmitted">
        <button @click="resetToNew" class="text-sm text-gray-500 mb-4 hover:text-gray-700">
          ← {{ t('loveAssistant.newAnalysis') }}
        </button>
        <div class="status-card bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl p-5 mb-6">
          <p class="text-sm text-gray-500 mb-2">{{ t('loveAssistant.statusAssessment') }}</p>
          <p class="text-lg font-medium text-gray-800">{{ analysis.status }}</p>
        </div>

        <div class="suggestions-section">
          <h2 class="text-lg font-semibold mb-4">{{ t('loveAssistant.suggestions') }}</h2>
          
          <div class="suggestion-card mb-4 bg-gradient-to-r from-pink-50 to-pink-100 rounded-xl p-5 border border-pink-100">
            <div class="flex justify-between items-center mb-3">
              <span class="text-pink-600 font-medium">{{ t('loveAssistant.softWay') }}</span>
              <button @click="copyText(suggestions.soft)" class="text-sm text-gray-500 hover:text-pink-600 transition-colors">
                {{ t('general.copy') }}
              </button>
            </div>
            <p class="text-gray-700">{{ suggestions.soft }}</p>
          </div>

          <div class="suggestion-card mb-4 bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-xl p-5 border border-yellow-100">
            <div class="flex justify-between items-center mb-3">
              <span class="text-yellow-600 font-medium">{{ t('loveAssistant.humorousWay') }}</span>
              <button @click="copyText(suggestions.humorous)" class="text-sm text-gray-500 hover:text-yellow-600 transition-colors">
                {{ t('general.copy') }}
              </button>
            </div>
            <p class="text-gray-700">{{ suggestions.humorous }}</p>
          </div>

          <div class="suggestion-card bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-5 border border-blue-100">
            <div class="flex justify-between items-center mb-3">
              <span class="text-blue-600 font-medium">{{ t('loveAssistant.seriousWay') }}</span>
              <button @click="copyText(suggestions.serious)" class="text-sm text-gray-500 hover:text-blue-600 transition-colors">
                {{ t('general.copy') }}
              </button>
            </div>
            <p class="text-gray-700">{{ suggestions.serious }}</p>
          </div>
        </div>
      </div>

      <!-- 解析记录 -->
      <div class="history-section" v-if="!hasSubmitted && history.length > 0">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-semibold text-gray-800">{{ t('loveAssistant.history') }}</h2>
          <button 
            @click="showClearConfirm = true"
            class="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            title="清空全部记录"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
            </svg>
            <span>清空</span>
          </button>
        </div>
        <div class="space-y-3">
          <div 
            v-for="item in history" 
            :key="item.id"
            class="relative overflow-hidden rounded-2xl shadow-md"
          >
            <!-- 删除按钮区域 -->
            <div class="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-r from-red-400 to-red-500 flex items-center justify-center">
              <button 
                @click="deleteHistory(item.id)" 
                class="text-white flex flex-col items-center gap-1 px-4 py-2 hover:bg-white/10 rounded-xl transition-colors"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                </svg>
                <span class="text-xs">删除</span>
              </button>
            </div>
            
            <!-- 记录内容（可滑动） -->
            <div 
              @click="loadHistory(item)"
              class="relative p-4 bg-white rounded-2xl cursor-pointer transition-all duration-200 hover:shadow-md"
              @touchstart="startSwipe($event, item.id)"
              @touchmove="onSwipe($event, item.id)"
              @touchend="endSwipe(item.id)"
              @mousedown="startSwipe($event, item.id)"
              @mousemove="onSwipe($event, item.id)"
              @mouseup="endSwipe(item.id)"
              @mouseleave="endSwipe(item.id)"
              :style="{ transform: swipeOffsets[item.id] ? `translateX(${swipeOffsets[item.id]}px)` : 'translateX(0)', transition: isSwiping ? 'none' : 'transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)' }"
            >
              <div class="flex items-start justify-between">
                <div class="flex-1">
                  <p class="text-xs text-gray-400 mb-1.5">{{ formatDate(item.timestamp) }}</p>
                  <p class="text-gray-700 text-sm leading-relaxed line-clamp-2">{{ item.input }}</p>
                </div>
                <svg class="w-4 h-4 text-gray-300 flex-shrink-0 ml-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 空状态提示 -->
      <div v-else-if="!hasSubmitted" class="empty-state text-center py-12">
        <div class="text-5xl mb-4">💬</div>
        <p class="text-gray-400">{{ t('loveAssistant.inputHint') }}</p>
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
      :src="imagePreview" 
      alt="Preview" 
      class="max-w-[90vw] max-h-[90vh] object-contain"
      @click.stop
    />
  </div>
  
  <!-- 清空确认弹窗 -->
  <div v-if="showClearConfirm" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50" @click.self="showClearConfirm = false">
    <div class="bg-white rounded-2xl p-6 w-[90%] max-w-sm mx-4 shadow-xl">
      <div class="text-center">
        <h3 class="text-lg font-semibold text-gray-800 mb-2">确认清空</h3>
        <p class="text-gray-500 text-sm mb-6">确定要清空所有解析记录吗？此操作不可恢复。</p>
        <div class="flex gap-3">
          <button 
            @click="showClearConfirm = false"
            class="flex-1 py-2.5 px-4 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
          >
            取消
          </button>
          <button 
            @click="clearAllHistory"
            class="flex-1 py-2.5 px-4 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 transition-colors"
          >
            确定清空
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useUserStore, type LoveAssistantConversation } from '../stores/user'
import { analyzeLoveChat, analyzeImageContent } from '../utils/api'

const { t } = useI18n()
const router = useRouter()
const userStore = useUserStore()

// ESC键关闭模态框
const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Escape' && showImageModal.value) {
    closeImageModal()
  }
}

const resetAllSwipeOffsets = () => {
  Object.keys(swipeOffsets.value).forEach(key => {
    swipeOffsets.value[key] = 0
  })
}

const handleGlobalClick = (event: MouseEvent) => {
  const target = event.target as HTMLElement
  const historyItem = target.closest('.history-section > div > div')
  if (!historyItem) {
    resetAllSwipeOffsets()
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
  document.addEventListener('click', handleGlobalClick)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
  document.removeEventListener('click', handleGlobalClick)
})

const chatInput = ref('')
const hasSubmitted = ref(false)
const isLoading = ref(false)
let hasTrackedUsage = false

// 上传相关
const imagePreview = ref('')
const imageUploadProgress = ref(0)
const uploadProgress = ref(0)
const uploadingFileName = ref('')
const showImageModal = ref(false)
const filePreview = ref('')
const fileUploadProgress = ref(0)
const uploadedFileName = ref('')

// 滑动删除相关
const swipeOffsets = ref<Record<string, number>>({})
const swipeStartX = ref(0)
const isSwiping = ref(false)

// 清空确认弹窗
const showClearConfirm = ref(false)

const analysis = ref({
  status: t('loveAssistant.statusDefault')
})

const suggestions = ref({
  soft: t('loveAssistant.softDefault'),
  humorous: t('loveAssistant.humorousDefault'),
  serious: t('loveAssistant.seriousDefault')
})

const history = computed(() => userStore.loveAssistantHistory)

const loadHistory = (item: LoveAssistantConversation) => {
  chatInput.value = item.input
  analysis.value = { ...item.analysis }
  suggestions.value = { ...item.suggestions }
  hasSubmitted.value = true
}

const generateResponse = (input: string) => {
  const lowerInput = input.toLowerCase()
  
  // 检测关键词
  const hasMissing = lowerInput.includes('想') || lowerInput.includes('miss')
  const hasAngry = lowerInput.includes('生气') || lowerInput.includes('烦') || lowerInput.includes('气')
  const hasHappy = lowerInput.includes('开心') || lowerInput.includes('高兴') || lowerInput.includes('快乐')
  const hasBusy = lowerInput.includes('忙') || lowerInput.includes('累')
  const hasDate = lowerInput.includes('明天') || lowerInput.includes('见') || lowerInput.includes('约')
  const hasLove = lowerInput.includes('爱') || lowerInput.includes('喜欢')

  // 生成状态分析
  if (hasAngry) {
    analysis.value.status = t('loveAssistant.statusAngry')
  } else if (hasHappy) {
    analysis.value.status = t('loveAssistant.statusHappy')
  } else if (hasBusy) {
    analysis.value.status = t('loveAssistant.statusBusy')
  } else if (hasDate) {
    analysis.value.status = t('loveAssistant.statusDate')
  } else if (hasMissing) {
    analysis.value.status = t('loveAssistant.statusMissing')
  } else if (hasLove) {
    analysis.value.status = t('loveAssistant.statusLove')
  } else {
    analysis.value.status = t('loveAssistant.statusDefault')
  }

  // 生成温柔回应
  if (hasAngry) {
    suggestions.value.soft = t('loveAssistant.softAngry')
  } else if (hasMissing) {
    suggestions.value.soft = t('loveAssistant.softMissing')
  } else if (hasBusy) {
    suggestions.value.soft = t('loveAssistant.softBusy')
  } else if (hasHappy) {
    suggestions.value.soft = t('loveAssistant.softHappy')
  } else {
    suggestions.value.soft = t('loveAssistant.softDefault')
  }

  // 生成幽默回应
  if (hasAngry) {
    suggestions.value.humorous = t('loveAssistant.humorousAngry')
  } else if (hasMissing) {
    suggestions.value.humorous = t('loveAssistant.humorousMissing')
  } else if (hasBusy) {
    suggestions.value.humorous = t('loveAssistant.humorousBusy')
  } else if (hasDate) {
    suggestions.value.humorous = t('loveAssistant.humorousDate')
  } else {
    suggestions.value.humorous = t('loveAssistant.humorousDefault')
  }

  // 生成稳重回应
  if (hasAngry) {
    suggestions.value.serious = t('loveAssistant.seriousAngry')
  } else if (hasMissing) {
    suggestions.value.serious = t('loveAssistant.seriousMissing')
  } else if (hasBusy) {
    suggestions.value.serious = t('loveAssistant.seriousBusy')
  } else if (hasDate) {
    suggestions.value.serious = t('loveAssistant.seriousDate')
  } else if (hasLove) {
    suggestions.value.serious = t('loveAssistant.seriousLove')
  } else {
    suggestions.value.serious = t('loveAssistant.seriousDefault')
  }
}

const handleSubmit = async () => {
  if (!chatInput.value || isLoading.value) return
  
  isLoading.value = true
  
  try {
    const result = await analyzeLoveChat(chatInput.value)
    
    analysis.value = { status: result.status }
    suggestions.value = {
      soft: result.suggestions.soft,
      humorous: result.suggestions.humorous,
      serious: result.suggestions.serious
    }
    
    hasSubmitted.value = true
    
    // 统计使用次数（每次分析只统计一次）
    if (!hasTrackedUsage) {
      userStore.incrementUsage('loveAssistant')
      hasTrackedUsage = true
    }
    
    // 保存到历史记录
    userStore.addLoveAssistantConversation({
      input: chatInput.value,
      analysis: { ...analysis.value },
      suggestions: { ...suggestions.value }
    })
  } catch (error) {
    console.error('Error analyzing chat:', error)
    // 使用降级方案
    generateResponse(chatInput.value)
    hasSubmitted.value = true
    
    if (!hasTrackedUsage) {
      userStore.incrementUsage('loveAssistant')
      hasTrackedUsage = true
    }
    
    userStore.addLoveAssistantConversation({
      input: chatInput.value,
      analysis: { ...analysis.value },
      suggestions: { ...suggestions.value }
    })
  } finally {
    isLoading.value = false
  }
}

const copyText = (text: string) => {
  navigator.clipboard.writeText(text)
  alert(t('general.copied'))
}

const resetToNew = () => {
  chatInput.value = ''
  hasSubmitted.value = false
  hasTrackedUsage = false
  imagePreview.value = ''
  imageUploadProgress.value = 0
  uploadProgress.value = 0
  filePreview.value = ''
  fileUploadProgress.value = 0
  uploadedFileName.value = ''
}

const startSwipe = (event: MouseEvent | TouchEvent, id: string) => {
  const clientX = 'touches' in event ? event.touches[0].clientX : event.clientX
  swipeStartX.value = clientX
  isSwiping.value = true
}

const onSwipe = (event: MouseEvent | TouchEvent, id: string) => {
  if (!isSwiping.value) return
  
  const clientX = 'touches' in event ? event.touches[0].clientX : event.clientX
  const diff = clientX - swipeStartX.value
  
  if (diff < 0) {
    const maxOffset = -96
    swipeOffsets.value[id] = Math.max(diff, maxOffset)
  }
}

const endSwipe = (id: string) => {
  isSwiping.value = false
  
  if (swipeOffsets.value[id] && swipeOffsets.value[id] < -48) {
    swipeOffsets.value[id] = -96
  } else {
    swipeOffsets.value[id] = 0
  }
}

const deleteHistory = (id: string) => {
  userStore.removeLoveAssistantHistory(id)
  delete swipeOffsets.value[id]
}

const clearAllHistory = () => {
  history.value.forEach(item => {
    userStore.removeLoveAssistantHistory(item.id)
  })
  swipeOffsets.value = {}
  showClearConfirm.value = false
}

const clearImagePreview = () => {
  imagePreview.value = ''
  uploadProgress.value = 0
}

const openImagePreview = () => {
  console.log('Opening image preview')
  console.log('Image preview exists:', !!imagePreview.value)
  if (!imagePreview.value) {
    console.warn('No image preview available')
    return
  }
  showImageModal.value = true
  console.log('Image modal opened')
}

const closeImageModal = () => {
  showImageModal.value = false
}

const simulateUploadProgress = (fileName: string) => {
  uploadingFileName.value = fileName
  uploadProgress.value = 0
  
  const interval = setInterval(() => {
    if (uploadProgress.value < 90) {
      uploadProgress.value += Math.random() * 15
    } else {
      clearInterval(interval)
    }
  }, 200)
  
  return interval
}

const formatDate = (timestamp: number) => {
  const date = new Date(timestamp)
  return date.toLocaleString('zh-CN', {
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const handleImageUpload = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  
  if (!file) return
  
  console.log('Starting image upload:', file.name)
  
  // 开始显示上传进度
  const progressInterval = simulateUploadProgress(file.name)
  
  const reader = new FileReader()
  reader.onload = async (e) => {
    const result = e.target?.result as string
    
    console.log('File read complete, setting image preview')
    // 显示图片预览
    imagePreview.value = result
    
    try {
      console.log('Starting image text extraction...')
      console.log('Image data length:', result.length)
      console.log('Image data preview:', result.substring(0, 50) + '...')
      
      // 使用多模态API提取图片中的文字内容
      const imageText = await analyzeImageContent(result, '请识别并提取图片中的所有文字内容，包括聊天记录、对话内容等，以文本形式输出')
      console.log('Image text extraction result:', imageText)
      
      if (imageText && imageText.trim()) {
        chatInput.value += `${imageText}\n`
      } else {
        // 如果识别结果为空，添加提示信息
        console.warn('Image text extraction returned empty result')
        chatInput.value += `[无法识别图片中的文字，请尝试重新上传或手动输入]\n`
      }
      imageUploadProgress.value = 100
      console.log('Image analysis complete, imageUploadProgress set to 100')
    } catch (error) {
      const err = error as any
      console.error('Failed to analyze image:', err)
      console.error('Error details:', err.message)
      // 降级：只添加图片标记
      chatInput.value += `[图片分析失败: ${err.message || '未知错误'}，请手动输入聊天内容]\n`
      imageUploadProgress.value = 100
    }
    
    clearInterval(progressInterval)
    // 不立即重置进度，保持为100
    console.log('Image upload process complete')
  }
  reader.readAsDataURL(file)
  
  // 重置input以便再次选择同一文件
  target.value = ''
}

const handleFileUpload = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  
  if (!file) return
  
  // 设置文件名
  uploadedFileName.value = file.name
  
  // 开始显示上传进度
  const progressInterval = simulateUploadProgress(file.name)
  
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
      // 文本文件
      const result = await readFileAsText(file)
      textContent = result
    }
    
    // 设置文件预览（使用文件图标作为预览）
    filePreview.value = 'file-preview'
    
    // 添加内容到输入框，不添加标题，不添加多余换行
    if (chatInput.value) {
      // 如果输入框已有内容，添加一个换行分隔
      chatInput.value += `\n${textContent}`
    } else {
      // 如果输入框为空，直接添加内容
      chatInput.value = textContent
    }
    
    fileUploadProgress.value = 100
    
  } catch (error) {
    console.error('File read error:', error)
    // 设置文件预览
    filePreview.value = 'file-preview'
    
    if (chatInput.value) {
      chatInput.value += '\n[无法解析此文件格式，请尝试其他文件]'
    } else {
      chatInput.value = '[无法解析此文件格式，请尝试其他文件]'
    }
    fileUploadProgress.value = 100
  }
  
  clearInterval(progressInterval)
}

const removeFile = () => {
  filePreview.value = ''
  uploadedFileName.value = ''
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
            resolve('[无法提取文档内容]')
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
          
          console.log('[DOCX] Parsed text:', text)
          resolve(text || '[文档内容为空]')
        } catch (error) {
          console.error('DOCX parse error:', error)
          resolve('[DOCX解析失败，请尝试其他文件]')
        }
      }
      
      reader.onerror = () => {
        resolve('[无法读取DOCX文件]')
      }
      
      reader.readAsArrayBuffer(file)
    } catch (error) {
      console.error('JSZip load error:', error)
      resolve('[无法加载解析库，请检查网络连接]')
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
        text = '[无法解析DOC文件，请尝试使用DOCX格式]'
      }
      
      resolve(text)
    }
    reader.onerror = () => {
      resolve('[无法读取DOC文件]')
    }
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
        resolve('[无法解析PDF文件，请确保文件格式正确]')
        return
      }
      
      const textContent = extractTextFromPdfText(text)
      resolve(textContent || '[PDF内容提取失败]')
    }
    reader.onerror = () => {
      resolve('[无法读取PDF文件]')
    }
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
</script>
