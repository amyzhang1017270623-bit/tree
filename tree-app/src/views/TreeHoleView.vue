<template>
  <div class="tree-hole-container flex flex-col min-h-screen bg-white">
    <div class="header px-6 py-4 flex items-center justify-between border-b border-gray-100">
      <button @click="goBack" class="mr-4">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
        </svg>
      </button>
      <div class="text-center">
        <h1 class="text-lg font-semibold">{{ t('treeHole.title') }}</h1>
        <p class="text-xs text-gray-500">{{ t('treeHole.subtitle') }}</p>
      </div>
      <div class="w-10"></div>
    </div>

    <div class="messages flex-1 px-6 py-4 space-y-4 relative">
      <div v-if="messages.length === 0" class="empty-state absolute inset-0 flex flex-col items-center justify-center">
        <img 
          :src="guideIcon" 
          alt="Guide" 
          class="w-64 h-64 object-contain mb-6"
        />
        <p class="text-gray-400 text-sm">{{ t('treeHole.emptyPrompt') }}</p>
      </div>
      
      <div v-for="(msg, idx) in messages" :key="idx" :class="['message', msg.isUser ? 'user-message' : 'bot-message']">
        <div 
          class="message-bubble" 
          :class="msg.isUser ? 'user' : 'bot'"
          v-if="!msg.isVoice"
        >
          <img v-if="msg.imageUrl" :src="msg.imageUrl" class="max-w-[200px] max-h-[200px] object-contain rounded-lg mb-2" />
          {{ msg.text }}
        </div>
        
        <!-- 语音消息 -->
        <div 
          class="voice-message" 
          :class="msg.isUser ? 'user' : 'bot'"
          v-else
        >
          <div class="flex flex-col gap-2">
            <div class="flex items-center gap-3">
              <button 
                @click="playVoice(msg)"
                :class="['voice-icon flex items-center justify-center w-10 h-10 rounded-full transition-all hover:scale-105', msg.isUser ? 'bg-gray-700' : 'bg-gray-200']"
              >
                <svg :class="['w-5 h-5', msg.isUser ? 'text-white' : 'text-gray-700']" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </button>
              <div class="flex flex-col gap-1">
                <div :class="['text-sm', msg.isUser ? 'text-white' : 'text-gray-800']">语音消息</div>
                <div :class="['text-xs opacity-70', msg.isUser ? 'text-gray-300' : 'text-gray-600']">{{ msg.voiceDuration ? Math.round(msg.voiceDuration) + '秒' : '3秒' }}</div>
              </div>
            </div>
            <!-- 识别的文字 -->
            <div v-if="msg.recognizedText" :class="['text-sm italic pt-1 border-t', msg.isUser ? 'text-gray-300 border-gray-600' : 'text-gray-600 border-gray-300']">
              「{{ msg.recognizedText }}」
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="input-area px-6 py-4 border-t border-gray-100">
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
            :placeholder="t('treeHole.placeholder')"
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
            <span>{{ isRecording ? '点击结束录音' : '点击开始录音' }}</span>
          </button>
        </div>
        
        <!-- 传图片按钮 -->
        <input 
          ref="imageInputRef"
          type="file" 
          accept="image/*" 
          class="hidden" 
          @change="handleImageUpload" 
        />
        <button 
          @click="triggerImageUpload"
          class="w-12 h-12 bg-black text-white rounded-full flex items-center justify-center hover:bg-gray-800 transition-colors"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
          </svg>
        </button>
        
        <!-- 发布按钮 -->
        <button 
          @click="sendMessage"
          :disabled="isLoading || (!messageInput.trim() && !isVoiceMode)"
          class="w-12 h-12 bg-black text-white rounded-full flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-800 transition-colors"
        >
          <svg v-if="!isLoading" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path>
          </svg>
          <svg v-else class="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onUnmounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useUserStore } from '../stores/user'
import { getTreeHoleReply, analyzeImageContent, analyzeVoice, setRecognitionResult } from '../utils/api'

const { t } = useI18n()
const router = useRouter()
const userStore = useUserStore()

let hasTrackedUsage = false

const guideIcon = new URL('/src/assets/images/icon_tree2.png', import.meta.url).href
const messages = ref<{ isUser: boolean; text: string; imageUrl?: string; isVoice?: boolean; voiceUrl?: string; voiceDuration?: number; recognizedText?: string }[]>([])
const messageInput = ref('')
const isLoading = ref(false)
const imageInputRef = ref<HTMLInputElement | null>(null)

const isVoiceMode = ref(false)
const isRecording = ref(false)
const mediaRecorder = ref<MediaRecorder | null>(null)
const recognition = ref<any>(null)
const audioChunks = ref<Blob[]>([])
const recordingStartTime = ref<number>(0)
const recognizedText = ref('')
const isRecognizing = ref(false)
let audioStream: MediaStream | null = null

const triggerImageUpload = () => {
  imageInputRef.value?.click()
}

const toggleRecording = async () => {
  if (isRecording.value) {
    // 如果正在录音，停止录音并发送
    stopRecording()
  } else {
    // 如果没有录音，开始录音
    await startRecording()
  }
}

const startRecording = async () => {
  try {
    // 重置状态
    recognizedText.value = ''
    isRecognizing.value = false
    
    // 请求麦克风权限
    audioStream = await navigator.mediaDevices.getUserMedia({ audio: true })
    
    // 尝试使用 Web Speech API 进行识别
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      try {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
        recognition.value = new SpeechRecognition()
        
        // 设置识别参数
        recognition.value.continuous = true
        recognition.value.interimResults = true
        recognition.value.lang = 'zh-CN'
        
        // 处理识别结果
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
            console.log('[Web Speech API] Final transcript:', finalTranscript)
          }
        }
        
        recognition.value.onerror = (event: any) => {
          console.error('[Web Speech API] Error:', event.error)
          isRecognizing.value = false
        }
        
        recognition.value.onend = () => {
          console.log('[Web Speech API] Recognition ended, final text:', recognizedText.value)
          isRecognizing.value = false
        }
        
        // 开始识别
        recognition.value.start()
        console.log('[Web Speech API] Recognition started')
      } catch (e) {
        console.error('[Web Speech API] Failed to start recognition:', e)
      }
    } else {
      console.log('[Web Speech API] Not supported in this browser')
    }
    
    // 创建MediaRecorder
    mediaRecorder.value = new MediaRecorder(audioStream)
    audioChunks.value = []
    recordingStartTime.value = Date.now()
    isRecording.value = true
    
    // 收集音频数据
    mediaRecorder.value.ondataavailable = (event) => {
      if (event.data.size > 0) {
        audioChunks.value.push(event.data)
      }
    }
    
    // 录音结束
    mediaRecorder.value.onstop = async () => {
      // 停止语音识别
      if (recognition.value) {
        try {
          recognition.value.stop()
        } catch (e) {
          // 可能已经停止，忽略错误
        }
      }
      
      // 创建音频Blob
      const audioBlob = new Blob(audioChunks.value, { type: 'audio/webm' })
      const duration = (Date.now() - recordingStartTime.value) / 1000
      
      // 创建音频URL用于播放
      const voiceUrl = URL.createObjectURL(audioBlob)
      
      // 获取Web Speech API的识别结果
      const webSpeechResult = recognizedText.value
      console.log('[Voice Recording] Web Speech API result:', webSpeechResult)
      
      // 添加语音消息（如果有Web Speech结果就显示）
      messages.value.push({ 
        isUser: true, 
        text: '', 
        isVoice: true, 
        voiceUrl: voiceUrl,
        voiceDuration: duration,
        recognizedText: webSpeechResult || undefined
      })
      
      scrollToBottom()
      
      // 停止所有音轨
      if (audioStream) {
        audioStream.getTracks().forEach(track => track.stop())
        audioStream = null
      }
      
      // 识别语音并获取AI回复
      await handleVoiceReply(audioBlob, webSpeechResult)
    }
    
    // 开始录音
    mediaRecorder.value.start()
    console.log('[Recording] Started')
    
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
    } catch (e) {
      // 忽略停止错误
    }
  }
}

const playVoice = (msg: any) => {
  if (msg.voiceUrl) {
    const audio = new Audio(msg.voiceUrl)
    audio.play()
  } else if (msg.recognizedText) {
    console.log('[Voice Play] Showing recognized text:', msg.recognizedText)
  }
}

const handleVoiceReply = async (audioBlob?: Blob, webSpeechResult?: string) => {
  if (!hasTrackedUsage) {
    userStore.incrementUsage('treeHole')
    hasTrackedUsage = true
  }
  
  isLoading.value = true
  
  try {
    let finalRecognizedText = ''
    
    // 优先使用 Web Speech API 的结果
    if (webSpeechResult) {
      finalRecognizedText = webSpeechResult
      console.log('[Voice Reply] Using Web Speech API result:', finalRecognizedText)
    } else if (audioBlob) {
      // 如果没有 Web Speech 结果，尝试使用千问API
      const qwenResult = await analyzeVoice(audioBlob)
      if (qwenResult) {
        finalRecognizedText = qwenResult
        console.log('[Voice Reply] Using Qwen API result:', finalRecognizedText)
      }
    }
    
    // 更新语音消息的识别文字
    if (finalRecognizedText && messages.value.length > 0) {
      const lastMessage = messages.value[messages.value.length - 1]
      if (lastMessage.isUser && lastMessage.isVoice && !lastMessage.recognizedText) {
        lastMessage.recognizedText = finalRecognizedText
      }
    }
    
    // 根据识别的文字获取AI回复
    const prompt = finalRecognizedText || '用户发送了语音消息，请友好回复'
    const reply = await getTreeHoleReply(prompt)
    messages.value.push({ isUser: false, text: reply || t('treeHole.imListening') })
    
  } catch (error) {
    console.error('[Voice Reply] Failed to get AI reply:', error)
    const fallbackReply = generateFallbackReply('语音')
    messages.value.push({ isUser: false, text: fallbackReply })
  } finally {
    isLoading.value = false
    scrollToBottom()
  }
}

const scrollToBottom = () => {
  nextTick(() => {
    const messagesContainer = document.querySelector('.messages')
    if (messagesContainer) {
      messagesContainer.scrollTop = messagesContainer.scrollHeight
    }
  })
}

const generateFallbackReply = (input: string): string => {
  const lowerInput = input.toLowerCase()
  
  if (lowerInput.includes('难过') || lowerInput.includes('伤心') || lowerInput.includes('哭') || lowerInput.includes('难受') || lowerInput.includes('痛苦')) {
    const replies = [
      t('treeHole.feelingSad'),
      t('treeHole.dontBeSad'),
      t('treeHole.sadnessNormal'),
      t('treeHole.notAlone'),
      t('treeHole.talkItOut')
    ]
    return replies[Math.floor(Math.random() * replies.length)]
  }
  
  if (lowerInput.includes('开心') || lowerInput.includes('高兴') || lowerInput.includes('快乐') || lowerInput.includes('幸福')) {
    const replies = [
      t('treeHole.happyForYou'),
      t('treeHole.happyToo'),
      t('treeHole.wishHappiness'),
      t('treeHole.keepGoodMood')
    ]
    return replies[Math.floor(Math.random() * replies.length)]
  }
  
  if (lowerInput.includes('压力') || lowerInput.includes('累') || lowerInput.includes('疲惫') || lowerInput.includes('焦虑')) {
    const replies = [
      t('treeHole.takeBreakStress'),
      t('treeHole.takeTime'),
      t('treeHole.tiredRest'),
      t('treeHole.relaxAdjust')
    ]
    return replies[Math.floor(Math.random() * replies.length)]
  }
  
  if (lowerInput.includes('工作') || lowerInput.includes('学习') || lowerInput.includes('考试') || lowerInput.includes('作业')) {
    const replies = [
      t('treeHole.hardWorkStudy'),
      t('treeHole.effortWillPay'),
      t('treeHole.talkAnytime'),
      t('treeHole.cheerYouCanDoIt')
    ]
    return replies[Math.floor(Math.random() * replies.length)]
  }
  
  if (lowerInput.includes('分手') || lowerInput.includes('失恋') || lowerInput.includes('喜欢') || lowerInput.includes('爱')) {
    const replies = [
      t('treeHole.complicatedFeelings'),
      t('treeHole.timeHealsAll'),
      t('treeHole.growthExperience'),
      t('treeHole.loveYourselfFirst')
    ]
    return replies[Math.floor(Math.random() * replies.length)]
  }
  
  if (lowerInput.includes('朋友') || lowerInput.includes('家人') || lowerInput.includes('同事') || lowerInput.includes('吵架')) {
    const replies = [
      t('treeHole.relationshipsNeedCare'),
      t('treeHole.communicationFirst'),
      t('treeHole.differentOpinions'),
      t('treeHole.cherishPeople')
    ]
    return replies[Math.floor(Math.random() * replies.length)]
  }
  
  if (lowerInput.includes('怎么办') || lowerInput.includes('求助') || lowerInput.includes('帮帮我')) {
    const replies = [
      t('treeHole.dontWorryTogether'),
      t('treeHole.tellMeAnalysis'),
      t('treeHole.notAloneTogether'),
      t('treeHole.calmDownSolution')
    ]
    return replies[Math.floor(Math.random() * replies.length)]
  }
  
  if (lowerInput.includes('谢谢') || lowerInput.includes('感谢')) {
    const replies = [
      t('treeHole.youreWelcome'),
      t('treeHole.noNeedToThank'),
      t('treeHole.honorToListen')
    ]
    return replies[Math.floor(Math.random() * replies.length)]
  }
  
  const defaultReplies = [
    t('treeHole.imListening'),
    t('treeHole.thankYouForSharing'),
    t('treeHole.feelBetterToTalk'),
    t('treeHole.willKeepSecret'),
    t('treeHole.keepTalking'),
    t('treeHole.yourFeelingsImportant'),
    t('treeHole.sometimesTalkRelease')
  ]
  return defaultReplies[Math.floor(Math.random() * defaultReplies.length)]
}

const sendMessage = async () => {
  if (!messageInput.value.trim() || isLoading.value) return
  
  messages.value.push({ isUser: true, text: messageInput.value })
  messageInput.value = ''
  isLoading.value = true
  
  scrollToBottom()
  
  if (!hasTrackedUsage) {
    userStore.incrementUsage('treeHole')
    hasTrackedUsage = true
  }
  
  try {
    const reply = await getTreeHoleReply(messages.value[messages.value.length - 1].text)
    messages.value.push({ isUser: false, text: reply || t('treeHole.imListening') })
    scrollToBottom()
  } catch (error) {
    console.error('Failed to get AI reply, using fallback:', error)
    const fallbackReply = generateFallbackReply(messages.value[messages.value.length - 1].text)
    messages.value.push({ isUser: false, text: fallbackReply })
    scrollToBottom()
  } finally {
    isLoading.value = false
  }
}

const handleImageUpload = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  
  if (!file) return
  
  const reader = new FileReader()
  reader.onload = async (e) => {
    const result = e.target?.result as string
    
    messages.value.push({
      isUser: true,
      text: '',
      imageUrl: result
    })
    
    scrollToBottom()
    
    if (!hasTrackedUsage) {
      userStore.incrementUsage('treeHole')
      hasTrackedUsage = true
    }
    
    isLoading.value = true
    
    try {
      const imageText = await analyzeImageContent(result, '请描述这张图片的内容，分析图片中的场景、人物表情和可能的情绪')
      
      const prompt = imageText ? `图片内容：${imageText}\n请根据图片内容进行回复` : '请根据图片内容进行回复'
      
      const reply = await getTreeHoleReply(prompt)
      messages.value.push({ isUser: false, text: reply || t('treeHole.imListening') })
    } catch (error) {
      console.error('Error processing image:', error)
      const fallbackReply = generateFallbackReply('图片')
      messages.value.push({ isUser: false, text: fallbackReply })
    } finally {
      isLoading.value = false
      scrollToBottom()
    }
  }
  reader.readAsDataURL(file)
  
  target.value = ''
}

const goBack = () => {
  messages.value = []
  router.push('/home')
}

onUnmounted(() => {
  messages.value = []
  // 清理语音识别
  if (recognition.value) {
    try {
      recognition.value.stop()
    } catch (e) {
      // 忽略清理错误
    }
  }
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
  max-width: 60%;
  min-width: 150px;
  padding: 12px 16px;
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
  background-color: #333;
}

.voice-message.user .voice-icon svg {
  color: #fff;
}

.voice-message.bot {
  background-color: #f3f4f6;
  color: #000;
  border-bottom-left-radius: 6px;
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
