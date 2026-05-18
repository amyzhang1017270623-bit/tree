<template>
  <div class="love-assistant-container min-h-screen bg-white flex flex-col">
    <div class="header px-6 py-6 flex items-center justify-between border-b border-gray-100">
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
        <textarea 
          v-model="chatInput"
          class="w-full h-36 p-4 border border-gray-300 rounded-xl resize-none focus:outline-none focus:border-black mb-4"
          :placeholder="t('loveAssistant.pasteHere')"
        ></textarea>
        <button 
          @click="handleSubmit"
          :disabled="!chatInput"
          :class="[
            'w-full py-4 rounded-full font-medium transition-all duration-300',
            chatInput 
              ? 'bg-black text-white hover:bg-gray-800' 
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          ]"
        >
          {{ t('loveAssistant.analyze') }}
        </button>
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

      <!-- 历史记录 -->
      <div class="history-section" v-if="!hasSubmitted && history.length > 0">
        <h2 class="text-lg font-semibold mb-4">{{ t('loveAssistant.history') }}</h2>
        <div class="space-y-3">
          <div 
            v-for="item in history" 
            :key="item.id"
            @click="loadHistory(item)"
            class="history-item p-4 border border-gray-200 rounded-xl cursor-pointer hover:border-black transition-colors"
          >
            <p class="text-sm text-gray-500 mb-1">{{ formatDate(item.timestamp) }}</p>
            <p class="text-gray-700 truncate">{{ item.input }}</p>
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
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useUserStore, type LoveAssistantConversation } from '../stores/user'

const { t } = useI18n()
const router = useRouter()
const userStore = useUserStore()

const chatInput = ref('')
const hasSubmitted = ref(false)
let hasTrackedUsage = false

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

const handleSubmit = () => {
  if (!chatInput.value) return
  generateResponse(chatInput.value)
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
}

const copyText = (text: string) => {
  navigator.clipboard.writeText(text)
  alert(t('general.copied'))
}

const resetToNew = () => {
  chatInput.value = ''
  hasSubmitted.value = false
  hasTrackedUsage = false
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

const goBack = () => router.push('/home')
</script>
