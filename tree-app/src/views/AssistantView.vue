<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useReminderStore } from '@/stores/reminder'
import { useUserStore } from '@/stores/user'
import { callQwenAPI, analyzeVoice } from '@/utils/api'

const router = useRouter()
const { t } = useI18n()
const reminderStore = useReminderStore()
const userStore = useUserStore()

const getUserId = (): number | undefined => {
  return userStore.userId || undefined
}

const messages = ref<{ id: string; text: string; isUser: boolean; timestamp: number; isVoice?: boolean; voiceUrl?: string; voiceDuration?: number; recognizedText?: string }[]>([])
const messageInput = ref('')
const isVoiceMode = ref(false)
const isRecording = ref(false)
const showReminderModal = ref(false)
const isLoading = ref(false)
const showAddReminderConfirm = ref(false)
const pendingReminder = ref<{ date: string; title: string } | null>(null)
const editReminderTitle = ref('')


const mediaRecorder = ref<MediaRecorder | null>(null)
const recognition = ref<any>(null)
const audioChunks = ref<Blob[]>([])
const recordingStartTime = ref<number>(0)
const recognizedText = ref('')
const isRecognizing = ref(false)
let audioStream: MediaStream | null = null

const greetingMessages = [
  '你好，有什么我可以帮你的吗？',
  '我在这里，随时听你倾诉。',
  '今天感觉怎么样？',
  '需要什么帮助吗？'
]

const atmosphereMessages = [
  '时间会慢慢抚平一切。',
  '独处是最好的自我对话。',
  '黑白之间，自有天地。',
  '安静下来，听听自己的声音。',
  '生活简单就好。',
  '慢慢来，比较快。'
]

const scrollToBottom = () => {
  nextTick(() => {
    const chatContainer = document.querySelector('.messages')
    if (chatContainer) {
      chatContainer.scrollTop = chatContainer.scrollHeight
    }
  })
}

const parseDateInput = (input: string): { date: string; title: string } | null => {
  const datePatterns = [
    /(\d{1,2})月(\d{1,2})日(.+)/,
    /(\d{4})年(\d{1,2})月(\d{1,2})日(.+)/,
    /(\d{1,2})\/(\d{1,2})(.+)/,
    /(\d{1,2})-(\d{1,2})(.+)/
  ]

  for (const pattern of datePatterns) {
    const match = input.match(pattern)
    if (match) {
      let year: number, month: number, day: number, title: string
      
      if (match.length === 4) {
        year = new Date().getFullYear()
        month = parseInt(match[1])
        day = parseInt(match[2])
        title = match[3].trim()
      } else {
        year = parseInt(match[1])
        month = parseInt(match[2])
        day = parseInt(match[3])
        title = match[4].trim()
      }

      const date = new Date(year, month - 1, day)
      if (!isNaN(date.getTime())) {
        return {
          date: date.toISOString().split('T')[0],
          title: title || '提醒'
        }
      }
    }
  }
  return null
}

const chineseNumbers: Record<string, number> = {
  '零': 0, '一': 1, '二': 2, '三': 3, '四': 4, '五': 5, '六': 6, '七': 7, '八': 8, '九': 9,
  '十': 10, '十一': 11, '十二': 12, '十三': 13, '十四': 14, '十五': 15, '十六': 16, '十七': 17, '十八': 18, '十九': 19,
  '二十': 20, '二十一': 21, '二十二': 22, '二十三': 23, '二十四': 24, '二十五': 25, '二十六': 26, '二十七': 27, '二十八': 28, '二十九': 29,
  '三十': 30, '三十一': 31
}

const chineseMonths: Record<string, number> = {
  '一月': 1, '二月': 2, '三月': 3, '四月': 4, '五月': 5, '六月': 6,
  '七月': 7, '八月': 8, '九月': 9, '十月': 10, '十一月': 11, '十二月': 12,
  '正月': 1, '腊月': 12
}

const parseChineseNumber = (str: string): number | null => {
  if (chineseNumbers[str]) {
    return chineseNumbers[str]
  }
  return null
}

const parseChineseMonth = (str: string): number | null => {
  if (chineseMonths[str]) {
    return chineseMonths[str]
  }
  return null
}

const detectDateInText = (input: string): { date: string; title: string } | null => {
  const today = new Date()
  let date: Date | null = null
  let title = ''

  const cleanInput = input.replace(/[，,。]/g, '').replace(/\u00A0/g, ' ').replace(/\u3000/g, ' ')
  
  // 日程意图关键词：明确表示要添加提醒/日程
  const reminderIntents = [
    '提醒', '记得', '提醒我', '帮我记', '日程', '安排', '别忘了', '提醒我',
    '记一下', '记录', '待办', 'todo', 'to-do', '备忘', '设个提醒', '日程提醒',
    '提醒事项', '定个', '预约', '订', '约了', '会议', '约会', '有事',
    '要去', '要参加', '要见', '要买', '要吃', '要喝', '要做', '要做', '要开会'
  ]
  
  // 特殊日期相关词汇：生日、纪念日等，这些词本身就表示需要记录的日期
  const dateRelatedWords = [
    '生日', '纪念日', '周年', '诞辰', '忌日', '节日', '假期', '放假',
    '结婚', '订婚', '婚礼', '庆典', '聚会', '派对', '庆祝', '纪念'
  ]
  
  // 闲聊模式关键词：只是随口说说，不应该触发提醒
  const chatPatterns = [
    '天气', '心情', '不错', '很好', '真好', '还好', '好久', '什么', '怎么',
    '为什么', '怎么办', '为什么', '怎样', '感觉', '觉得', '今天想', '今天要',
    '今天去', '今天见', '今天买', '今天吃', '今天喝', '今天玩', '今天做'
  ]
  
  const hasReminderIntent = reminderIntents.some(keyword => cleanInput.includes(keyword))
  const hasDateRelatedWord = dateRelatedWords.some(keyword => cleanInput.includes(keyword))
  const hasChatPattern = chatPatterns.some(pattern => cleanInput.includes(pattern))
  
  // 如果输入超过3个字，且满足以下条件之一，才检测日期：
  // 1. 包含日程意图关键词
  // 2. 包含日期相关词汇（如生日、纪念日等）
  if (cleanInput.length <= 3 || (!hasReminderIntent && !hasDateRelatedWord)) {
    return null
  }
  
  // 如果有明确的日程意图或日期相关词汇，但同时有闲聊模式关键词，需要更严格的判断
  if ((hasReminderIntent || hasDateRelatedWord) && hasChatPattern) {
    // 只有当明确的日程意图关键词出现，或者日期相关词汇出现时才触发
    const hasStrongReminderIntent = reminderIntents.slice(0, 8).some(keyword => cleanInput.includes(keyword))
    if (!hasStrongReminderIntent && !hasDateRelatedWord) {
      return null
    }
  }
  
  const spaceChars = '[\\s\\u3000\\u00A0]*'
  
  const chineseMonthPattern = '(一月|二月|三月|四月|五月|六月|七月|八月|九月|十月|十一月|十二月|正月|腊月)'
  const chineseDayPattern = '(一|二|三|四|五|六|七|八|九|十|十一|十二|十三|十四|十五|十六|十七|十八|十九|二十|二十一|二十二|二十三|二十四|二十五|二十六|二十七|二十八|二十九|三十|三十一)'
  
  const patterns = [
    new RegExp(`(\\d{1,2})${spaceChars}月${spaceChars}(\\d{1,2})${spaceChars}日?`),
    new RegExp(`(\\d{1,2})月${spaceChars}(\\d{1,2})${spaceChars}日?`),
    new RegExp(`(\\d{1,2})${spaceChars}月(\\d{1,2})${spaceChars}日?`),
    new RegExp(`(\\d{1,2})月(\\d{1,2})${spaceChars}日?`),
    new RegExp(`(\\d{1,2})${spaceChars}月${spaceChars}(\\d{1,2})日?`),
    new RegExp(`(\\d{1,2})月${spaceChars}(\\d{1,2})日?`),
    new RegExp(`(\\d{1,2})${spaceChars}月(\\d{1,2})日?`),
    new RegExp(`(\\d{1,2})月(\\d{1,2})日?`),
    new RegExp(`${chineseMonthPattern}${spaceChars}${chineseDayPattern}${spaceChars}日?`),
    new RegExp(`${chineseMonthPattern}${spaceChars}(\\d{1,2})${spaceChars}日?`),
    new RegExp(`(\\d{1,2})月${spaceChars}${chineseDayPattern}${spaceChars}日?`)
  ]
  
  let matchedText = ''
  for (const pattern of patterns) {
    const monthDayMatch = cleanInput.match(pattern)
    if (monthDayMatch) {
      let month: number | null = null
      let day: number | null = null
      
      if (chineseMonths[monthDayMatch[1]]) {
        month = chineseMonths[monthDayMatch[1]]
        if (chineseNumbers[monthDayMatch[2]]) {
          day = chineseNumbers[monthDayMatch[2]]
        } else {
          day = parseInt(monthDayMatch[2]) || null
        }
      } else {
        month = parseInt(monthDayMatch[1]) || null
        if (chineseNumbers[monthDayMatch[2]]) {
          day = chineseNumbers[monthDayMatch[2]]
        } else {
          day = parseInt(monthDayMatch[2]) || null
        }
      }
      
      if (month !== null && day !== null && month >= 1 && month <= 12 && day >= 1 && day <= 31) {
        date = new Date(today.getFullYear(), month - 1, day)
        matchedText = monthDayMatch[0]
        title = cleanInput.replace(matchedText, '').trim() || '提醒'
        break
      }
    }
  }

  if (!date) {
    const yearPatterns = [
      new RegExp(`(\\d{4})${spaceChars}年${spaceChars}(\\d{1,2})${spaceChars}月${spaceChars}(\\d{1,2})${spaceChars}日`),
      new RegExp(`(\\d{4})年${spaceChars}(\\d{1,2})${spaceChars}月${spaceChars}(\\d{1,2})${spaceChars}日`),
      new RegExp(`(\\d{4})${spaceChars}年(\\d{1,2})${spaceChars}月${spaceChars}(\\d{1,2})${spaceChars}日`),
      new RegExp(`(\\d{4})年(\\d{1,2})${spaceChars}月${spaceChars}(\\d{1,2})${spaceChars}日`),
      new RegExp(`(\\d{4})${spaceChars}年${spaceChars}(\\d{1,2})月${spaceChars}(\\d{1,2})${spaceChars}日`),
      new RegExp(`(\\d{4})年${spaceChars}(\\d{1,2})月${spaceChars}(\\d{1,2})${spaceChars}日`),
      new RegExp(`(\\d{4})${spaceChars}年(\\d{1,2})月${spaceChars}(\\d{1,2})${spaceChars}日`),
      new RegExp(`(\\d{4})年(\\d{1,2})月${spaceChars}(\\d{1,2})${spaceChars}日`),
      new RegExp(`(\\d{4})${spaceChars}年${spaceChars}(\\d{1,2})${spaceChars}月(\\d{1,2})${spaceChars}日`),
      new RegExp(`(\\d{4})年${spaceChars}(\\d{1,2})${spaceChars}月(\\d{1,2})${spaceChars}日`),
      new RegExp(`(\\d{4})${spaceChars}年(\\d{1,2})月(\\d{1,2})${spaceChars}日`),
      new RegExp(`(\\d{4})年(\\d{1,2})月(\\d{1,2})${spaceChars}日`),
      new RegExp(`(\\d{4})${spaceChars}年${spaceChars}(\\d{1,2})${spaceChars}月${spaceChars}(\\d{1,2})日`),
      new RegExp(`(\\d{4})年${spaceChars}(\\d{1,2})${spaceChars}月${spaceChars}(\\d{1,2})日`),
      new RegExp(`(\\d{4})${spaceChars}年(\\d{1,2})月${spaceChars}(\\d{1,2})日`),
      new RegExp(`(\\d{4})年(\\d{1,2})月${spaceChars}(\\d{1,2})日`),
      new RegExp(`(\\d{4})${spaceChars}年${spaceChars}(\\d{1,2})月(\\d{1,2})日`),
      new RegExp(`(\\d{4})年${spaceChars}(\\d{1,2})月(\\d{1,2})日`),
      new RegExp(`(\\d{4})${spaceChars}年(\\d{1,2})月(\\d{1,2})日`),
      new RegExp(`(\\d{4})年(\\d{1,2})月(\\d{1,2})日`)
    ]
    
    for (const pattern of yearPatterns) {
      const yearMonthDayMatch = cleanInput.match(pattern)
      if (yearMonthDayMatch) {
        const year = parseInt(yearMonthDayMatch[1])
        const month = parseInt(yearMonthDayMatch[2])
        const day = parseInt(yearMonthDayMatch[3])
        if (year >= 2000 && year <= 2100 && month >= 1 && month <= 12 && day >= 1 && day <= 31) {
          date = new Date(year, month - 1, day)
          matchedText = yearMonthDayMatch[0]
          title = cleanInput.replace(matchedText, '').trim() || '提醒'
          break
        }
      }
    }
  }

  if (!date) {
    if (input.includes('明天')) {
      date = new Date(today)
      date.setDate(today.getDate() + 1)
      title = input.replace('明天', '').trim() || '提醒'
    } else if (input.includes('后天')) {
      date = new Date(today)
      date.setDate(today.getDate() + 2)
      title = input.replace('后天', '').trim() || '提醒'
    } else if (input.includes('昨天')) {
      date = new Date(today)
      date.setDate(today.getDate() - 1)
      title = input.replace('昨天', '').trim() || '提醒'
    } else if (input.includes('今天')) {
      date = new Date(today)
      title = input.replace('今天', '').trim() || '提醒'
    } else if (input.includes('本周') || input.includes('这周')) {
      date = new Date(today)
      title = input.replace('本周', '').replace('这周', '').trim() || '提醒'
    } else if (input.includes('下周')) {
      date = new Date(today)
      date.setDate(today.getDate() + 7)
      title = input.replace('下周', '').trim() || '提醒'
    } else if (input.includes('下周一')) {
      date = new Date(today)
      const dayOfWeek = date.getDay()
      const daysToAdd = (8 - dayOfWeek) % 7 || 7
      date.setDate(today.getDate() + daysToAdd)
      title = input.replace('下周一', '').trim() || '提醒'
    } else if (input.includes('下周二')) {
      date = new Date(today)
      const dayOfWeek = date.getDay()
      const daysToAdd = ((9 - dayOfWeek) % 7) || 7
      date.setDate(today.getDate() + daysToAdd)
      title = input.replace('下周二', '').trim() || '提醒'
    } else if (input.includes('下周三')) {
      date = new Date(today)
      const dayOfWeek = date.getDay()
      const daysToAdd = ((10 - dayOfWeek) % 7) || 7
      date.setDate(today.getDate() + daysToAdd)
      title = input.replace('下周三', '').trim() || '提醒'
    } else if (input.includes('下周四')) {
      date = new Date(today)
      const dayOfWeek = date.getDay()
      const daysToAdd = ((11 - dayOfWeek) % 7) || 7
      date.setDate(today.getDate() + daysToAdd)
      title = input.replace('下周四', '').trim() || '提醒'
    } else if (input.includes('下周五')) {
      date = new Date(today)
      const dayOfWeek = date.getDay()
      const daysToAdd = ((12 - dayOfWeek) % 7) || 7
      date.setDate(today.getDate() + daysToAdd)
      title = input.replace('下周五', '').trim() || '提醒'
    } else if (input.includes('下周六')) {
      date = new Date(today)
      const dayOfWeek = date.getDay()
      const daysToAdd = ((13 - dayOfWeek) % 7) || 7
      date.setDate(today.getDate() + daysToAdd)
      title = input.replace('下周六', '').trim() || '提醒'
    } else if (input.includes('下周日')) {
      date = new Date(today)
      const dayOfWeek = date.getDay()
      const daysToAdd = ((14 - dayOfWeek) % 7) || 7
      date.setDate(today.getDate() + daysToAdd)
      title = input.replace('下周日', '').trim() || '提醒'
    } else if (input.includes('周一')) {
      date = new Date(today)
      const dayOfWeek = date.getDay()
      let daysToAdd = (1 - dayOfWeek + 7) % 7
      if (daysToAdd === 0) daysToAdd = 7
      date.setDate(today.getDate() + daysToAdd)
      title = input.replace('周一', '').trim() || '提醒'
    } else if (input.includes('周二')) {
      date = new Date(today)
      const dayOfWeek = date.getDay()
      let daysToAdd = (2 - dayOfWeek + 7) % 7
      if (daysToAdd === 0) daysToAdd = 7
      date.setDate(today.getDate() + daysToAdd)
      title = input.replace('周二', '').trim() || '提醒'
    } else if (input.includes('周三')) {
      date = new Date(today)
      const dayOfWeek = date.getDay()
      let daysToAdd = (3 - dayOfWeek + 7) % 7
      if (daysToAdd === 0) daysToAdd = 7
      date.setDate(today.getDate() + daysToAdd)
      title = input.replace('周三', '').trim() || '提醒'
    } else if (input.includes('周四')) {
      date = new Date(today)
      const dayOfWeek = date.getDay()
      let daysToAdd = (4 - dayOfWeek + 7) % 7
      if (daysToAdd === 0) daysToAdd = 7
      date.setDate(today.getDate() + daysToAdd)
      title = input.replace('周四', '').trim() || '提醒'
    } else if (input.includes('周五')) {
      date = new Date(today)
      const dayOfWeek = date.getDay()
      let daysToAdd = (5 - dayOfWeek + 7) % 7
      if (daysToAdd === 0) daysToAdd = 7
      date.setDate(today.getDate() + daysToAdd)
      title = input.replace('周五', '').trim() || '提醒'
    } else if (input.includes('周六')) {
      date = new Date(today)
      const dayOfWeek = date.getDay()
      let daysToAdd = (6 - dayOfWeek + 7) % 7
      if (daysToAdd === 0) daysToAdd = 7
      date.setDate(today.getDate() + daysToAdd)
      title = input.replace('周六', '').trim() || '提醒'
    } else if (input.includes('周日')) {
      date = new Date(today)
      const dayOfWeek = date.getDay()
      let daysToAdd = (0 - dayOfWeek + 7) % 7
      if (daysToAdd === 0) daysToAdd = 7
      date.setDate(today.getDate() + daysToAdd)
      title = input.replace('周日', '').trim() || '提醒'
    }
  }

  if (date) {
    return {
      date: date.toISOString().split('T')[0],
      title: title || input
    }
  }

  return null
}

const sendMessage = async () => {
  const text = messageInput.value.trim()
  if (!text || isLoading.value) return

  messages.value.push({
    id: Date.now().toString(),
    text: text,
    isUser: true,
    timestamp: Date.now()
  })
  
  messageInput.value = ''
  isLoading.value = true
  scrollToBottom()

  const parsedDate = detectDateInText(text)
  console.log('[Date Detection] Input:', text)
  console.log('[Date Detection] Intent check passed:', parsedDate !== null)
  if (parsedDate) {
    console.log('[Date Detection] Detected date:', parsedDate.date, 'Title:', parsedDate.title)
    console.log('[Date Detection] Showing confirmation modal')
    pendingReminder.value = parsedDate
    editReminderTitle.value = parsedDate.title
    showAddReminderConfirm.value = true
    isLoading.value = false
    return
  }

  await getAIReply(text)
}

const getAIReply = async (text: string) => {
  try {
    const response = await callQwenAPI([
      {
        role: 'system',
        content: '你是一个极简风格的私人助理，说话简洁，带有冷淡风、治愈系的黑白调性。擅长情绪安抚、高冷文案、独处语录、相处话术、日常实用答疑。'
      },
      {
        role: 'user',
        content: text
      }
    ], undefined, 400)

    messages.value.push({
        id: (Date.now() + 1).toString(),
        text: response,
        isUser: false,
        timestamp: Date.now()
      })
      
      userStore.incrementUsage('assistant')
    } catch (error) {
    messages.value.push({
      id: (Date.now() + 1).toString(),
      text: atmosphereMessages[Math.floor(Math.random() * atmosphereMessages.length)],
      isUser: false,
      timestamp: Date.now()
    })
    
    userStore.incrementUsage('assistant')
  } finally {
    isLoading.value = false
  }
  
  scrollToBottom()
}

const toggleRecording = async () => {
  if (isRecording.value) {
    stopRecording()
  } else {
    await startRecording()
  }
}

const startRecording = async () => {
  try {
    recognizedText.value = ''
    isRecognizing.value = false
    
    audioStream = await navigator.mediaDevices.getUserMedia({ audio: true })
    
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      try {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
        recognition.value = new SpeechRecognition()
        
        recognition.value.continuous = true
        recognition.value.interimResults = true
        recognition.value.lang = 'zh-CN'
        
        recognition.value.onresult = (event: any) => {
          isRecognizing.value = true
          let finalTranscript = ''
          
          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript
            if (event.results[i].isFinal) {
              finalTranscript += transcript
            }
          }
          
          if (finalTranscript) {
            recognizedText.value = finalTranscript
          }
        }
        
        recognition.value.onerror = (event: any) => {
          isRecognizing.value = false
        }
        
        recognition.value.onend = () => {
          isRecognizing.value = false
        }
        
        recognition.value.start()
      } catch (e) {
        console.error('[Web Speech API] Failed to start recognition:', e)
      }
    }
    
    mediaRecorder.value = new MediaRecorder(audioStream)
    audioChunks.value = []
    recordingStartTime.value = Date.now()
    isRecording.value = true
    
    mediaRecorder.value.ondataavailable = (event) => {
      if (event.data.size > 0) {
        audioChunks.value.push(event.data)
      }
    }
    
    mediaRecorder.value.onstop = async () => {
      if (recognition.value) {
        try {
          recognition.value.stop()
        } catch (e) {}
      }
      
      const audioBlob = new Blob(audioChunks.value, { type: 'audio/webm' })
      const duration = (Date.now() - recordingStartTime.value) / 1000
      const voiceUrl = URL.createObjectURL(audioBlob)
      
      const webSpeechResult = recognizedText.value
      
      messages.value.push({ 
        id: Date.now().toString(),
        text: '', 
        isUser: true, 
        timestamp: Date.now(),
        isVoice: true, 
        voiceUrl: voiceUrl,
        voiceDuration: duration,
        recognizedText: undefined
      })
      console.log('[Voice Message] Added voice message, webSpeechResult:', webSpeechResult)
      
      scrollToBottom()
      
      if (audioStream) {
        audioStream.getTracks().forEach(track => track.stop())
        audioStream = null
      }
      
      await handleVoiceReply(audioBlob, webSpeechResult)
    }
    
    mediaRecorder.value.start()
    
  } catch (error) {
    console.error('[Recording] Failed to start recording:', error)
    isRecording.value = false
    alert('无法获取麦克风权限，请检查浏览器设置')
  }
}

const stopRecording = () => {
  if (mediaRecorder.value && mediaRecorder.value.state === 'recording') {
    mediaRecorder.value.stop()
    isRecording.value = false
  }
  if (recognition.value) {
    try {
      recognition.value.stop()
    } catch (e) {}
  }
}

const playVoice = (msg: any) => {
  if (msg.voiceUrl) {
    const audio = new Audio(msg.voiceUrl)
    audio.play().catch(e => console.error('Playback error:', e))
  } else if (msg.recognizedText) {
    console.log('[Voice Play] Showing recognized text:', msg.recognizedText)
  }
}

const handleVoiceReply = async (audioBlob?: Blob, webSpeechResult?: string) => {
  try {
    let finalRecognizedText = ''
    
    if (audioBlob) {
      const qwenResult = await analyzeVoice(audioBlob)
      if (qwenResult) {
        finalRecognizedText = qwenResult
        console.log('[Voice Reply] Using Qwen API result:', finalRecognizedText)
      }
    }
    
    if (!finalRecognizedText && webSpeechResult) {
      finalRecognizedText = webSpeechResult
      console.log('[Voice Reply] Using Web Speech API fallback:', finalRecognizedText)
    }
    
    if (!finalRecognizedText) {
      finalRecognizedText = '用户发送了语音消息'
    }
    
    if (finalRecognizedText && messages.value.length > 0) {
      const lastMessage = messages.value[messages.value.length - 1]
      if (lastMessage.isUser && lastMessage.isVoice && !lastMessage.recognizedText) {
        lastMessage.recognizedText = finalRecognizedText
      }
    }
    
    console.log('[Voice Date Detection] Input text:', finalRecognizedText)
    const parsedDate = detectDateInText(finalRecognizedText)
    console.log('[Voice Date Detection] Result:', parsedDate)
    if (parsedDate) {
      console.log('[Voice Date Detection] Showing reminder modal')
      pendingReminder.value = parsedDate
      editReminderTitle.value = parsedDate.title
      showAddReminderConfirm.value = true
      return
    }
    
    console.log('[Voice Date Detection] No date detected, getting AI reply')
    await getAIReply(finalRecognizedText)
  } catch (error) {
    console.error('[Voice Reply] Error:', error)
    messages.value.push({
      id: (Date.now() + 1).toString(),
      text: atmosphereMessages[Math.floor(Math.random() * atmosphereMessages.length)],
      isUser: false,
      timestamp: Date.now()
    })
    scrollToBottom()
  }
}

const confirmAddReminder = async () => {
  if (pendingReminder.value) {
    const title = editReminderTitle.value.trim() || '提醒'
    await reminderStore.addReminder({
      date: pendingReminder.value.date,
      title: title,
      description: '',
      category: 'daily',
      remindDayOf: reminderStore.remindDayOf,
      remind1DayBefore: reminderStore.remind1DayBefore,
      remind3DaysBefore: reminderStore.remind3DaysBefore
    }, getUserId())

    messages.value.push({
      id: Date.now().toString(),
      text: `已添加提醒：${pendingReminder.value.date} ${title}`,
      isUser: false,
      timestamp: Date.now()
    })
    scrollToBottom()
  }
  showAddReminderConfirm.value = false
  pendingReminder.value = null
}

const cancelAddReminder = () => {
  const lastMessage = messages.value[messages.value.length - 1]
  if (lastMessage && lastMessage.isUser) {
    const text = lastMessage.text
    getAIReply(text)
  }
  showAddReminderConfirm.value = false
  pendingReminder.value = null
}

const clearAllReminders = () => {
  if (confirm('确定要清空所有日程吗？')) {
    reminderStore.clearAllReminders()
  }
}

const handleKeyboardResize = () => {
  setTimeout(() => {
    scrollToBottom()
  }, 100)
}

onMounted(() => {
  messages.value.push({
    id: '1',
    text: greetingMessages[Math.floor(Math.random() * greetingMessages.length)],
    isUser: false,
    timestamp: Date.now()
  })
  window.addEventListener('resize', handleKeyboardResize)
  window.addEventListener('orientationchange', handleKeyboardResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleKeyboardResize)
  window.removeEventListener('orientationchange', handleKeyboardResize)
})
</script>

<template>
  <div class="assistant-container h-screen bg-white flex flex-col overflow-hidden">
    <!-- Header -->
    <header class="fixed top-0 left-0 right-0 z-50 bg-white px-6 pt-6 pb-4 flex items-center justify-between border-b border-gray-100">
      <button @click="router.back()" class="mr-4">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
        </svg>
      </button>
      <div class="text-center">
        <h1 class="text-lg font-semibold">{{ t('assistant.title') }}</h1>
        <p class="text-xs text-gray-500">{{ t('assistant.subtitle') }}</p>
      </div>
      <button 
        @click="showReminderModal = true"
        class="text-xs text-gray-500 hover:text-gray-700 transition-colors"
      >
        {{ t('assistant.allReminders') }}
      </button>
    </header>

    <!-- Messages -->
    <div class="messages flex-1 px-6 pt-24 pb-4 space-y-4 relative overflow-y-auto">
      <div 
        v-for="(msg, idx) in messages" 
        :key="idx" 
        :class="['message', msg.isUser ? 'user-message' : 'bot-message']"
      >
        <!-- 文字消息 -->
        <div 
          class="message-bubble" 
          :class="msg.isUser ? 'user' : 'bot'"
          v-if="!msg.isVoice"
        >
          {{ msg.text }}
        </div>
        
        <!-- 语音消息 -->
        <div 
          class="voice-message" 
          :class="msg.isUser ? 'user' : 'bot'"
          v-else
        >
          <div class="flex items-center gap-3">
            <button 
              @click="playVoice(msg)"
              class="voice-icon flex items-center justify-center w-12 h-12 rounded-full transition-all hover:scale-105"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </button>
            <div class="flex flex-col gap-1 flex-1">
              <div :class="['text-base font-medium', msg.isUser ? 'text-white' : 'text-gray-800']">语音消息</div>
              <div :class="['text-sm opacity-70', msg.isUser ? 'text-gray-300' : 'text-gray-600']">{{ msg.voiceDuration ? Math.round(msg.voiceDuration) + '秒' : '3秒' }}</div>
            </div>
          </div>
          <!-- 识别的文字 -->
          <div v-if="msg.recognizedText" :class="['recognized-text mt-3 pt-3', msg.isUser ? 'text-gray-300 border-gray-600' : 'text-gray-600 border-gray-300']">
            「{{ msg.recognizedText }}」
          </div>
        </div>
      </div>
      
      <!-- Loading indicator -->
      <div v-if="isLoading" class="flex items-center gap-2 text-gray-400 text-sm">
        <svg class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span>{{ t('assistant.thinking') }}</span>
      </div>
    </div>

    <!-- Input Area -->
    <div class="input-area flex-shrink-0 px-6 py-4 border-t border-gray-100 bg-white">
      <div class="flex items-center gap-3">
        <!-- 左侧：语音和输入框的切换按钮 -->
        <button 
          @click="isVoiceMode = !isVoiceMode"
          class="w-12 h-12 flex items-center justify-center rounded-full transition-all"
          :class="isVoiceMode ? 'bg-black text-white' : 'bg-gray-100 text-gray-600'"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path v-if="!isVoiceMode" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"></path>
            <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"></path>
          </svg>
        </button>
        
        <!-- 中间：输入框/开始说话按钮 -->
        <div class="flex-1 relative">
          <input 
            v-if="!isVoiceMode"
            v-model="messageInput"
            @keyup.enter="sendMessage"
            type="text"
            class="w-full px-4 py-3 bg-gray-100 rounded-full focus:outline-none"
            :placeholder="t('assistant.placeholder')"
          />
          <button 
            v-else
            @click="toggleRecording"
            :class="[
              'w-full py-3 rounded-full flex items-center justify-center gap-3 transition-all relative overflow-hidden',
              isRecording ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-600'
            ]"
          >
            <!-- 录音波动动画 -->
            <div v-if="isRecording" class="recording-wave">
              <span class="wave-bar"></span>
              <span class="wave-bar"></span>
              <span class="wave-bar"></span>
              <span class="wave-bar"></span>
              <span class="wave-bar"></span>
            </div>
            <span>{{ isRecording ? t('assistant.stopRecording') : t('assistant.startRecording') }}</span>
          </button>
        </div>
        
        <!-- 右侧：发送按钮 -->
        <button 
          v-if="!isVoiceMode"
          @click="sendMessage"
          :disabled="!messageInput.trim()"
          :class="[
            'w-10 h-10 flex items-center justify-center rounded-full transition-all',
            messageInput.trim() ? 'bg-black text-white' : 'bg-gray-100 text-gray-400'
          ]"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path>
          </svg>
        </button>
      </div>
    </div>

    <!-- Reminder Modal -->
    <div v-if="showReminderModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-2xl w-full max-w-sm max-h-[70vh] overflow-hidden">
        <div class="border-b border-gray-200 px-4 py-4 flex items-center justify-between">
          <h2 class="text-lg font-semibold text-gray-800">{{ t('assistant.allReminders') }}</h2>
          <button 
            @click="showReminderModal = false"
            class="text-gray-400 hover:text-gray-800 transition-colors"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div class="p-4 overflow-y-auto max-h-[50vh]">
          <div v-if="reminderStore.upcomingReminders.length === 0" class="text-center text-gray-400 py-8">
            {{ t('assistant.noReminders') }}
          </div>
          <div v-else class="space-y-3">
            <div 
              v-for="reminder in reminderStore.upcomingReminders" 
              :key="reminder.id"
              class="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <div class="flex-1">
                <div class="flex items-center gap-2">
                  <span class="text-xs px-2 py-0.5 bg-gray-200 text-gray-600 rounded">{{ reminderStore.categoryLabels[reminder.category] }}</span>
                  <span class="text-sm text-gray-800">{{ reminder.title }}</span>
                </div>
                <div class="text-xs text-gray-400 mt-1">{{ reminder.date }}</div>
              </div>
              <button 
                @click="reminderStore.removeReminder(reminder.id, getUserId())"
                class="text-gray-400 hover:text-red-500 transition-colors"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        <div v-if="reminderStore.upcomingReminders.length > 0" class="border-t border-gray-200 px-4 py-3">
          <button 
            @click="clearAllReminders"
            class="w-full py-2 text-sm text-red-500 hover:bg-red-50 rounded-lg transition-colors"
          >
            一键清空所有日程
          </button>
        </div>
      </div>
    </div>

    <!-- 添加日程确认对话框 -->
    <div 
      v-if="showAddReminderConfirm" 
      class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      @click.self="cancelAddReminder"
    >
      <div class="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-xl">
        <div class="px-6 py-5 text-center border-b border-gray-100">
          <div class="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <svg class="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 class="text-lg font-semibold text-gray-800">添加日程提醒</h3>
          <p class="text-sm text-gray-500 mt-1">检测到时间相关内容，是否添加提醒？</p>
        </div>
        
        <div class="px-6 py-4">
          <div class="bg-gray-50 rounded-xl p-4 mb-4">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 bg-black rounded-lg flex items-center justify-center">
                <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <div class="text-sm text-gray-500">日期</div>
                <div class="text-lg font-medium text-gray-800">{{ pendingReminder?.date }}</div>
              </div>
            </div>
            <div class="mt-3 pt-3 border-t border-gray-200">
              <div class="text-sm text-gray-500 mb-2">标题</div>
              <input 
                v-model="editReminderTitle" 
                type="text" 
                class="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-lg font-medium text-gray-800 focus:outline-none focus:border-black focus:ring-1 focus:ring-black"
                placeholder="输入标题"
              />
            </div>
          </div>
          
          <div class="flex gap-3">
            <button 
              @click="cancelAddReminder"
              class="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
            >
              取消
            </button>
            <button 
              @click="confirmAddReminder"
              class="flex-1 py-3 bg-black text-white rounded-xl font-medium hover:bg-gray-800 transition-colors"
            >
              添加提醒
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

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
  max-width: 80%;
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

/* 语音消息样式 */
.voice-message {
  max-width: 70%;
  min-width: 200px;
  padding: 14px 16px;
  border-radius: 18px;
  cursor: pointer;
  transition: opacity 0.2s;
}

.voice-message:hover {
  opacity: 0.9;
}

.voice-message.user {
  background-color: #000;
  color: #fff;
  border-bottom-right-radius: 6px;
}

.voice-message.user .voice-icon {
  background-color: #404040;
}

.voice-message.user .voice-icon svg {
  color: #fff;
}

.voice-message.bot {
  background-color: #f3f4f6;
  color: #000;
  border-bottom-left-radius: 6px;
}

.voice-message.bot .voice-icon {
  background-color: #e5e7eb;
}

.voice-message.bot .voice-icon svg {
  color: #374151;
}

.recognized-text {
  border-top: 1px solid;
  font-style: italic;
  font-size: 14px;
}

/* 录音波动动画 */
.recording-wave {
  display: flex;
  align-items: center;
  gap: 3px;
  height: 20px;
}

.wave-bar {
  width: 3px;
  height: 100%;
  background-color: currentColor;
  border-radius: 2px;
  animation: wave-animation 0.8s ease-in-out infinite;
}

.wave-bar:nth-child(1) { animation-delay: 0s; }
.wave-bar:nth-child(2) { animation-delay: 0.1s; }
.wave-bar:nth-child(3) { animation-delay: 0.2s; }
.wave-bar:nth-child(4) { animation-delay: 0.3s; }
.wave-bar:nth-child(5) { animation-delay: 0.4s; }

@keyframes wave-animation {
  0%, 100% {
    height: 40%;
  }
  50% {
    height: 100%;
  }
}
</style>