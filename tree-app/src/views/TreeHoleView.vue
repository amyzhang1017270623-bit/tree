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
        <div class="message-bubble" :class="msg.isUser ? 'user' : 'bot'">
          {{ msg.text }}
        </div>
      </div>
    </div>

    <div class="input-area px-6 py-4 border-t border-gray-100">
      <div class="flex items-center gap-3 mb-3">
        <button class="w-10 h-10 flex items-center justify-center text-gray-500 hover:text-black">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
          </svg>
        </button>
        <button class="w-10 h-10 flex items-center justify-center text-gray-500 hover:text-black">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"></path>
          </svg>
        </button>
      </div>
      <div class="flex gap-3">
        <input 
          v-model="messageInput"
          @keyup.enter="sendMessage"
          type="text"
          class="flex-1 px-4 py-3 bg-gray-100 rounded-full focus:outline-none"
          :placeholder="t('treeHole.placeholder')"
        />
        <button 
          @click="sendMessage"
          class="w-12 h-12 bg-black text-white rounded-full flex items-center justify-center"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path>
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useUserStore } from '../stores/user'

const { t } = useI18n()
const router = useRouter()
const userStore = useUserStore()

let hasTrackedUsage = false

const guideIcon = new URL('/src/assets/images/icon_tree2.png', import.meta.url).href
const messages = ref<{ isUser: boolean; text: string }[]>([])
const messageInput = ref('')

const generateReply = (input: string): string => {
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

const sendMessage = () => {
  if (!messageInput.value.trim()) return
  
  messages.value.push({ isUser: true, text: messageInput.value })
  messageInput.value = ''
  
  // 统计使用次数（每个会话只统计一次）
  if (!hasTrackedUsage) {
    userStore.incrementUsage('treeHole')
    hasTrackedUsage = true
  }
  
  setTimeout(() => {
    const reply = generateReply(messages.value[messages.value.length - 1].text)
    messages.value.push({ isUser: false, text: reply })
  }, 800)
}

const goBack = () => {
  messages.value = []
  router.push('/home')
}

onUnmounted(() => {
  messages.value = []
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
</style>
