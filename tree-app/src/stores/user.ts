import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface UserInfo {
  name: string
  gender: '男' | '女' | '不愿透露'
  birthDate: string
  birthTime: string
  phone: string
  password?: string
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
  const userId = ref<number | null>(null)
  const userInfo = ref<UserInfo | null>(null)
  const isFreeUser = ref(true)
  const usageStats = ref({
    emotionCompanion: 0,
    treeHole: 0,
    tarot: 0,
    loveAssistant: 0,
    assistant: 0,
    fortune: 0,
    registerDate: Date.now()
  })
  
  // 登录状态管理
  const lastLoginTime = ref<number | null>(null)
  const LOGIN_TIMEOUT = 20 * 60 * 1000 // 20分钟超时

  // 塔罗相关
  const tarotFreeCount = ref(2) // 本周免费剩余次数
  const tarotWeekStartDate = ref<number>(Date.now()) // 本周开始日期
  const tarotPaidCount = ref(0) // 次卡剩余次数

  // 恋爱助手对话历史
  const loveAssistantHistory = ref<LoveAssistantConversation[]>([])
  
  // 情感陪伴对话历史
  const emotionCompanionHistory = ref<EmotionCompanionConversation[]>([])
  
  // 角色偏好设置
  const characterPreferences = ref<Record<string, string> | null>(null)

  const register = async (info: UserInfo) => {
    try {
      const response = await fetch('/.netlify/functions/api-users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(info)
      })
      
      if (!response.ok) {
        console.error('❌ 注册失败，HTTP状态:', response.status)
        try {
          const data = await response.json()
          console.error('❌ 注册失败:', data.error)
        } catch {
          console.error('❌ 注册失败，无法解析错误信息')
        }
        return false
      }
      
      const text = await response.text()
      if (!text) {
        console.error('❌ 注册失败，响应为空')
        return false
      }
      
      try {
        const data = JSON.parse(text)
        userId.value = data.id
        userInfo.value = info
        isRegistered.value = true
        usageStats.value.registerDate = Date.now()
        lastLoginTime.value = Date.now()
        console.log('✅ 注册成功，用户ID:', data.id, data.message)
        return true
      } catch (parseError) {
        console.error('❌ 注册失败，响应不是有效的JSON:', parseError)
        return false
      }
    } catch (error) {
      console.error('❌ 注册请求失败:', error)
      return false
    }
  }
  
  // 登录函数
  const login = async (phone: string, password: string) => {
    try {
      const response = await fetch('/.netlify/functions/api-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, password })
      })
      
      if (!response.ok) {
        const text = await response.text()
        console.error('❌ 登录请求失败，HTTP状态:', response.status, '响应内容:', text)
        return false
      }
      
      const text = await response.text()
      if (!text) {
        console.error('❌ 登录失败，响应为空')
        return false
      }
      
      let data
      try {
        data = JSON.parse(text)
      } catch (parseError) {
        console.error('❌ 登录失败，响应不是有效的JSON:', parseError, '响应内容:', text)
        return false
      }
      
      if (response.ok) {
        userId.value = data.id
        userInfo.value = {
          name: data.name,
          gender: data.gender,
          birthDate: data.birthDate,
          birthTime: data.birthTime,
          phone: data.phone
        }
        isRegistered.value = true
        usageStats.value.registerDate = Date.now()
        lastLoginTime.value = Date.now()
        
        if (data.characterPreferences) {
          characterPreferences.value = data.characterPreferences
        }
        
        console.log('✅ 登录成功，用户ID:', data.id, data.message)
        return true
      } else {
        throw new Error(data.error || '登录失败')
      }
    } catch (error) {
      console.error('❌ 登录请求失败:', error)
      throw error
    }
  }
  
  // 检查登录状态是否过期
  const checkLoginStatus = (): boolean => {
    if (!lastLoginTime.value || !isRegistered.value) {
      return false
    }
    
    const now = Date.now()
    const elapsed = now - lastLoginTime.value
    
    if (elapsed >= LOGIN_TIMEOUT) {
      console.log('登录状态已过期')
      return false
    }
    
    return true
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
      fortune: 0,
      registerDate: Date.now()
    }
    tarotFreeCount.value = 2
    tarotWeekStartDate.value = Date.now()
    tarotPaidCount.value = 0
    loveAssistantHistory.value = []
    emotionCompanionHistory.value = []
  }

  const checkDailyLimit = async (): Promise<{ canUse: boolean; currentUsage: number; dailyLimit: number; remainingUsage: number }> => {
    if (!userId.value) {
      return { canUse: true, currentUsage: 0, dailyLimit: 100, remainingUsage: 100 };
    }
    
    try {
      const response = await fetch(`/.netlify/functions/api-update-stats?userId=${userId.value}`);
      const data = await response.json();
      return {
        canUse: data.canUse ?? true,
        currentUsage: data.currentUsage ?? 0,
        dailyLimit: data.dailyLimit ?? 100,
        remainingUsage: data.remainingUsage ?? 100
      };
    } catch (error) {
      console.error('[Usage Limit Check] Failed to check daily limit:', error);
      return { canUse: true, currentUsage: 0, dailyLimit: 100, remainingUsage: 100 };
    }
  }

  const incrementUsage = async (type: 'emotionCompanion' | 'treeHole' | 'tarot' | 'loveAssistant' | 'assistant' | 'fortune') => {
    usageStats.value[type]++
    console.log(`[Usage Stats] Incrementing ${type}, current value: ${usageStats.value[type]}`)
    
    if (userId.value) {
      console.log(`[Usage Stats] User ID exists: ${userId.value}, sending to API`)
      try {
        const response = await fetch('/.netlify/functions/api-update-stats', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: userId.value, type })
        })
        console.log(`[Usage Stats] API response status: ${response.status}`)
        
        if (response.status === 403) {
          usageStats.value[type]--
          const data = await response.json()
          throw new Error(data.message || '今日使用次数已用完，请明天再试')
        }
        
        if (!response.ok) {
          const errorText = await response.text()
          console.error(`[Usage Stats] API error: ${errorText}`)
        }
      } catch (error) {
        console.error('[Usage Stats] Failed to update stats:', error)
      }
    } else {
      console.log('[Usage Stats] User ID not set, skipping API call')
    }
    return true
  }

  // 保存角色偏好到数据库
  const saveCharacterPreferences = async (preferences: Record<string, string>) => {
    if (!userId.value) return false
    try {
      const response = await fetch(`/.netlify/functions/api-user-details/${userId.value}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ characterPreferences: preferences })
      })
      if (response.ok) {
        characterPreferences.value = preferences
        console.log('✅ 角色偏好保存成功')
        return true
      }
      return false
    } catch (error) {
      console.error('❌ 角色偏好保存失败:', error)
      return false
    }
  }

  // 从数据库读取角色偏好
  const loadCharacterPreferences = async (): Promise<Record<string, string> | null> => {
    if (!userId.value) return null
    try {
      const response = await fetch(`/.netlify/functions/api-user-details/${userId.value}`)
      const data = await response.json()
      if (data.user?.character_preferences) {
        characterPreferences.value = data.user.character_preferences
        console.log('✅ 角色偏好读取成功:', characterPreferences.value)
        return characterPreferences.value
      }
      return null
    } catch (error) {
      console.error('❌ 角色偏好读取失败:', error)
      return null
    }
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
    userId,
    userInfo,
    isFreeUser,
    usageStats,
    tarotFreeCount,
    tarotWeekStartDate,
    tarotPaidCount,
    loveAssistantHistory,
    emotionCompanionHistory,
    characterPreferences,
    lastLoginTime,
    register,
    login,
    checkLoginStatus,
    updateUserInfo,
    clearAllData,
    incrementUsage,
    checkDailyLimit,
    checkTarotWeekReset,
    canDoTarotReading,
    useTarotReading,
    buyTarotCards,
    addLoveAssistantConversation,
    removeLoveAssistantHistory,
    addEmotionCompanionConversation,
    getEmotionCompanionConversation,
    saveCharacterPreferences,
    loadCharacterPreferences
  }
}, {
  persist: true
})
