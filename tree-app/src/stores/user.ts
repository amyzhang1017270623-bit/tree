import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface UserInfo {
  name: string
  gender: '男' | '女' | '不愿透露'
  birthDate: string
  birthTime: string
  phone: string
}

export interface ChatMessage {
  id: string
  text: string
  isUser: boolean
  timestamp: number
  imageUrl?: string
}

export interface LoveAssistantConversation {
  id: string
  timestamp: number
  input: string
  analysis: {
    status: string
  }
  suggestions: {
    soft: string
    humorous: string
    serious: string
  }
}

export interface EmotionCompanionConversation {
  id: string
  characterId: number
  characterName: string
  characterAvatar: string
  surveyAnswers: Record<string, string>
  surveyCompleted: boolean
  messages: ChatMessage[]
  timestamp: number
}

export const useUserStore = defineStore('user', () => {
  const isRegistered = ref(false)
  const userInfo = ref<UserInfo | null>(null)
  const isFreeUser = ref(true)
  const usageStats = ref({
    emotionCompanion: 0,
    treeHole: 0,
    tarot: 0,
    loveAssistant: 0,
    assistant: 0,
    registerDate: Date.now()
  })

  // 塔罗相关
  const tarotFreeCount = ref(2) // 本周免费剩余次数
  const tarotWeekStartDate = ref<number>(Date.now()) // 本周开始日期
  const tarotPaidCount = ref(0) // 次卡剩余次数

  // 恋爱助手对话历史
  const loveAssistantHistory = ref<LoveAssistantConversation[]>([])
  
  // 情感陪伴对话历史
  const emotionCompanionHistory = ref<EmotionCompanionConversation[]>([])

  const register = (info: UserInfo) => {
    userInfo.value = info
    isRegistered.value = true
    usageStats.value.registerDate = Date.now()
  }

  const updateUserInfo = (info: Partial<UserInfo>) => {
    if (userInfo.value) {
      userInfo.value = { ...userInfo.value, ...info }
    }
  }

  const clearAllData = () => {
    userInfo.value = null
    isRegistered.value = false
    usageStats.value = {
      emotionCompanion: 0,
      treeHole: 0,
      tarot: 0,
      loveAssistant: 0,
      assistant: 0,
      registerDate: Date.now()
    }
    tarotFreeCount.value = 2
    tarotWeekStartDate.value = Date.now()
    tarotPaidCount.value = 0
    loveAssistantHistory.value = []
    emotionCompanionHistory.value = []
  }

  const incrementUsage = (type: 'emotionCompanion' | 'treeHole' | 'tarot' | 'loveAssistant' | 'assistant') => {
    usageStats.value[type]++
  }

  // 检查是否需要重置周数
  const checkTarotWeekReset = () => {
    const now = Date.now()
    const weekStart = tarotWeekStartDate.value
    const oneWeek = 7 * 24 * 60 * 60 * 1000 // 一周的毫秒数
    
    if (now - weekStart >= oneWeek) {
      tarotFreeCount.value = 2
      tarotWeekStartDate.value = now
    }
  }

  // 检查是否可以进行塔罗测算
  const canDoTarotReading = (): boolean => {
    checkTarotWeekReset()
    return tarotFreeCount.value > 0 || tarotPaidCount.value > 0
  }

  // 使用一次塔罗测算
  const useTarotReading = (): boolean => {
    checkTarotWeekReset()
    if (tarotFreeCount.value > 0) {
      tarotFreeCount.value--
      return true
    } else if (tarotPaidCount.value > 0) {
      tarotPaidCount.value--
      return true
    }
    return false
  }

  // 购买塔罗次卡
  const buyTarotCards = (count: number) => {
    tarotPaidCount.value += count
  }

  // 添加恋爱助手对话记录
  const addLoveAssistantConversation = (conversation: Omit<LoveAssistantConversation, 'id' | 'timestamp'>) => {
    loveAssistantHistory.value.unshift({
      ...conversation,
      id: Date.now().toString(),
      timestamp: Date.now()
    })
  }

  // 删除恋爱助手对话记录
  const removeLoveAssistantHistory = (id: string) => {
    loveAssistantHistory.value = loveAssistantHistory.value.filter(item => item.id !== id)
  }

  // 添加情感陪伴对话记录
  const addEmotionCompanionConversation = (conversation: Omit<EmotionCompanionConversation, 'id' | 'timestamp'>) => {
    const existingIndex = emotionCompanionHistory.value.findIndex(
      c => c.characterId === conversation.characterId
    )
    if (existingIndex !== -1) {
      emotionCompanionHistory.value[existingIndex] = {
        ...conversation,
        id: emotionCompanionHistory.value[existingIndex].id,
        timestamp: Date.now()
      }
    } else {
      emotionCompanionHistory.value.unshift({
        ...conversation,
        id: Date.now().toString(),
        timestamp: Date.now()
      })
    }
  }

  // 获取情感陪伴最近的对话
  const getEmotionCompanionConversation = (characterId: number) => {
    return emotionCompanionHistory.value.find(c => c.characterId === characterId)
  }

  return {
    isRegistered,
    userInfo,
    isFreeUser,
    usageStats,
    tarotFreeCount,
    tarotWeekStartDate,
    tarotPaidCount,
    loveAssistantHistory,
    emotionCompanionHistory,
    register,
    updateUserInfo,
    clearAllData,
    incrementUsage,
    checkTarotWeekReset,
    canDoTarotReading,
    useTarotReading,
    buyTarotCards,
    addLoveAssistantConversation,
    removeLoveAssistantHistory,
    addEmotionCompanionConversation,
    getEmotionCompanionConversation
  }
}, {
  persist: true
})
