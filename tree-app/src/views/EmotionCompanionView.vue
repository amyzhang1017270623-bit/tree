<template>
  <div class="emotion-companion-container h-screen bg-white flex flex-col">
    <!-- 顶部导航 -->
    <header class="sticky top-0 z-50 bg-white border-b border-gray-100 px-6 py-4 flex-shrink-0">
      <div class="flex items-center justify-between">
        <button @click="goBack" class="w-8 h-8 flex items-center justify-center">
          <svg class="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
          </svg>
        </button>
        <h1 class="text-xl font-bold">{{ t('emotionCompanion.title') }}</h1>
        <div class="w-8"></div>
      </div>
    </header>

    <!-- 角色选择和介绍区域（固定不动） -->
    <div class="sticky top-[60px] z-40 bg-white border-b border-gray-100 flex-shrink-0">
      <!-- 角色选择列表 -->
      <div class="px-6 py-3">
        <div class="grid grid-cols-3 gap-3">
          <div 
            v-for="char in characters" 
            :key="char.id"
            @click="selectCharacter(char)"
            class="py-2 px-3 border rounded-xl cursor-pointer transition-all text-center"
            :class="[
              selectedCharacter?.id === char.id
                ? 'border-black bg-black text-white'
                : 'border-gray-200 hover:border-gray-400'
            ]"
          >
            <div class="flex items-center justify-center">
              <span class="text-xl mr-2">{{ char.avatar }}</span>
              <span class="text-sm" :class="selectedCharacter?.id === char.id ? 'text-white' : 'text-gray-700'">{{ t(char.nameKey) }}</span>
            </div>
          </div>
        </div>
      </div>
      <!-- 角色介绍 -->
      <div class="bg-white px-6 py-3 flex items-center border-t border-gray-100">
        <template v-if="selectedCharacter">
          <span class="text-xl mr-3">{{ selectedCharacter.avatar }}</span>
          <div>
            <span class="text-base font-semibold">{{ t(selectedCharacter.nameKey) }}</span>
            <p class="text-xs text-gray-500">{{ t(selectedCharacter.descriptionKey) }}</p>
          </div>
        </template>
        <template v-else>
          <span class="text-gray-400">{{ t('emotionCompanion.pleaseSelectCharacter') }}</span>
        </template>
      </div>
    </div>

    <!-- 问卷区域 -->
    <div v-if="showSurvey" class="flex-1 px-6 py-6 overflow-auto">
      <h2 class="text-lg font-bold mb-2">{{ t('emotionCompanion.tellPreferences') }}</h2>
      <p class="text-sm text-gray-500 mb-4">{{ t('emotionCompanion.questionNumber', { current: currentQuestion + 1, total: surveyQuestions.length }) }}</p>

      <div class="mb-6">
        <p class="font-medium mb-3">{{ t(surveyQuestions[currentQuestion].questionKey) }}</p>
        <div class="options space-y-2">
          <button 
            v-for="(opt, idx) in surveyQuestions[currentQuestion].options" 
            :key="idx"
            @click="selectOption(opt)"
            class="w-full text-left p-4 border rounded-lg transition-all"
          :class="[
            surveyAnswers[surveyQuestions[currentQuestion].id] === opt.value
              ? 'border-black bg-black text-white'
              : 'border-gray-200 hover:border-black'
          ]"
          >
            {{ t(opt.key) }}
          </button>
        </div>
      </div>

      <div class="flex gap-4">
        <button 
          v-if="currentQuestion > 0"
          @click="currentQuestion--"
          class="flex-1 py-3 border border-gray-300 rounded-full text-gray-700"
        >
          {{ t('emotionCompanion.previous') }}
        </button>
        <button 
          @click="handleSurveyNext"
          class="flex-1 py-3 bg-black text-white rounded-full hover:bg-gray-800"
        >
          {{ currentQuestion === surveyQuestions.length - 1 ? t('emotionCompanion.finish') : t('emotionCompanion.next') }}
        </button>
      </div>
    </div>

    <!-- 聊天区域 -->
    <div v-else class="chat-container flex-1 flex flex-col overflow-hidden">
      <!-- 消息列表（滚动区域） -->
      <div class="chat-messages flex-1 overflow-auto px-6 py-4 space-y-4">
        <div v-for="(msg, idx) in messages" :key="idx" :class="['message', msg.isUser ? 'user-message' : 'bot-message']">
          <div class="message-bubble" :class="msg.isUser ? 'user' : 'bot'">
            {{ msg.text }}
          </div>
        </div>
      </div>

      <!-- 输入框（固定在底部） -->
      <div class="chat-input px-6 py-4 border-t border-gray-100 flex-shrink-0">
        <div class="flex gap-3">
          <input 
            v-model="messageInput"
            @focus="handleInputFocus"
            @keyup.enter="sendMessage"
            type="text"
            class="flex-1 px-4 py-3 bg-gray-100 rounded-full focus:outline-none"
            :placeholder="t('emotionCompanion.placeholder')"
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

    <!-- 提示弹窗 -->
    <div v-if="showAlertModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50" @click="closeAlertModal">
      <div class="bg-white rounded-2xl p-6 mx-4 max-w-sm w-full text-center" @click.stop>
        <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg class="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
        </div>
        <h3 class="text-lg font-semibold mb-2">{{ t('emotionCompanion.pleaseSelectCharacter') }}</h3>
        <p class="text-gray-500 mb-4">{{ t('emotionCompanion.selectCharacterFirst') }}</p>
        <button 
          @click="closeAlertModal"
          class="w-full py-3 bg-black text-white rounded-full hover:bg-gray-800"
        >
          {{ t('general.confirm') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch, nextTick, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useUserStore, type ChatMessage } from '../stores/user'
import { getEmotionCompanionReply } from '../utils/api'

const { t } = useI18n()
const router = useRouter()
const userStore = useUserStore()



const characters = [
  { id: 1, nameKey: 'characters.xiaoWei', avatar: '👧', descriptionKey: 'characters.virtualLove', needsSurvey: true },
  { id: 2, nameKey: 'characters.xiaoXi', avatar: '💔', descriptionKey: 'characters.helpMoveOn', needsSurvey: false },
  { id: 3, nameKey: 'characters.xiaoYao', avatar: '💘', descriptionKey: 'characters.dreamLove', needsSurvey: false }
]

const selectedCharacter = ref<typeof characters[0] | null>(null)
const showSurvey = ref(false)
const currentQuestion = ref(0)
const surveyAnswers = reactive<Record<string, string>>({})
const surveyCompleted = ref(false)

const surveyQuestions = [
  { id: 'gender', questionKey: 'emotionCompanion.questionGender', options: [
    { key: 'general.male', value: '男' },
    { key: 'general.female', value: '女' },
    { key: 'general.both', value: '都可' }
  ]},
  { id: 'style', questionKey: 'emotionCompanion.preferenceStyle', options: [
    { key: 'emotionCompanion.gentleHealing', value: '温柔治愈' },
    { key: 'emotionCompanion.domineeringStrong', value: '霸道强势' },
    { key: 'emotionCompanion.coldAustere', value: '清冷禁欲' },
    { key: 'emotionCompanion.sweetCute', value: '奶狗甜系' }
  ]},
  { id: 'age', questionKey: 'emotionCompanion.agePreference', options: [
    { key: 'emotionCompanion.teenager', value: '18+少年' },
    { key: 'emotionCompanion.youngAdult', value: '20+青年' },
    { key: 'emotionCompanion.mature', value: '25+成熟' },
    { key: 'emotionCompanion.lightMature', value: '轻熟' }
  ]},
  { id: 'personality', questionKey: 'emotionCompanion.personalityPreference', options: [
    { key: 'emotionCompanion.clingy', value: '黏人粘人' },
    { key: 'emotionCompanion.independent', value: '独立克制' },
    { key: 'emotionCompanion.slowToWarm', value: '慢热内敛' },
    { key: 'emotionCompanion.outgoingTalkative', value: '外向话多' }
  ]},
  { id: 'tone', questionKey: 'emotionCompanion.tonePreference', options: [
    { key: 'emotionCompanion.gentleWhisper', value: '温柔轻声' },
    { key: 'emotionCompanion.straightforward', value: '直球直白' },
    { key: 'emotionCompanion.humorousFunny', value: '幽默搞笑' },
    { key: 'emotionCompanion.literaryDelicate', value: '文艺细腻' }
  ]}
]

const messages = ref<ChatMessage[]>([
  { id: 'init', text: `${t('emotionCompanion.greeting')}${t('characters.xiaoWei')}，${t('emotionCompanion.niceToMeetYou')}`, isUser: false, timestamp: Date.now() }
])
const messageInput = ref('')
const showAlertModal = ref(false)

const scrollToBottom = () => {
  nextTick(() => {
    const chatContainer = document.querySelector('.chat-messages')
    if (chatContainer) {
      chatContainer.scrollTop = chatContainer.scrollHeight
    }
  })
}

// 自动保存对话
watch(messages, () => {
  if (selectedCharacter.value) {
    saveConversation()
  }
}, { deep: true })

const saveConversation = () => {
  if (selectedCharacter.value) {
    userStore.addEmotionCompanionConversation({
      characterId: selectedCharacter.value.id,
      characterName: t(selectedCharacter.value.nameKey),
      characterAvatar: selectedCharacter.value.avatar,
      surveyAnswers: { ...surveyAnswers },
      surveyCompleted: surveyCompleted.value,
      messages: [...messages.value]
    })
  }
}

const getExistingConversation = (characterId: number) => {
  return userStore.getEmotionCompanionConversation(characterId)
}

const selectCharacter = async (char: typeof characters[0]) => {
  const existingConv = getExistingConversation(char.id)
  
  if (existingConv && existingConv.surveyCompleted) {
    // 已完成问卷，直接进入聊天
    selectedCharacter.value = char
    surveyCompleted.value = true
    showSurvey.value = false
    Object.assign(surveyAnswers, existingConv.surveyAnswers)
    messages.value = [...existingConv.messages]
    nextTick(() => saveConversation())
  } else if (existingConv) {
    // 有对话但未完成问卷，继续完成问卷
    selectedCharacter.value = char
    surveyCompleted.value = false
    Object.assign(surveyAnswers, existingConv.surveyAnswers)
    if (char.needsSurvey) {
      showSurvey.value = true
      // 恢复当前问题进度
      const answeredQuestions = Object.keys(surveyAnswers).length
      currentQuestion.value = Math.min(answeredQuestions, surveyQuestions.length - 1)
    } else {
      showSurvey.value = false
      messages.value = [...existingConv.messages]
      nextTick(() => saveConversation())
    }
  } else {
    // 新对话 - 清空之前的聊天记录
    selectedCharacter.value = char
    surveyCompleted.value = false
    Object.keys(surveyAnswers).forEach(key => delete surveyAnswers[key])
    
    // 如果是小薇，先尝试从数据库读取偏好
    if (char.id === 1) {
      const savedPreferences = await userStore.loadCharacterPreferences()
      if (savedPreferences && Object.keys(savedPreferences).length > 0) {
        console.log('从数据库读取到角色偏好:', savedPreferences)
        Object.assign(surveyAnswers, savedPreferences)
        surveyCompleted.value = true
        showSurvey.value = false
        // 生成性格特点介绍
        const personalityIntro = generatePersonalityIntro()
        // 设置欢迎语
        messages.value = [{
          id: Date.now().toString(),
          text: `${t('emotionCompanion.greeting')}${t('characters.xiaoWei')}！${personalityIntro}`,
          isUser: false,
          timestamp: Date.now()
        }]
        nextTick(() => saveConversation())
        return
      }
    }
    
    if (char.needsSurvey) {
      showSurvey.value = true
      currentQuestion.value = 0
      messages.value = []
    } else {
      // 不需要问卷的角色，设置默认欢迎语
      showSurvey.value = false
      messages.value = [{
        id: Date.now().toString(),
        text: t('emotionCompanion.defaultWelcome', { name: t(char.nameKey) }),
        isUser: false,
        timestamp: Date.now()
      }]
      nextTick(() => saveConversation())
    }
  }
}

const selectOption = (opt: { key: string; value: string }) => {
  surveyAnswers[surveyQuestions[currentQuestion.value].id] = opt.value
}

const generatePersonalityIntro = () => {
  return `${t('emotionCompanion.niceToMeet')}${t('emotionCompanion.loverPersonality')}${t('emotionCompanion.speak')}${t('emotionCompanion.willAccompany')}`
}

const handleSurveyNext = async () => {
  if (!surveyAnswers[surveyQuestions[currentQuestion.value].id]) return
  
  if (currentQuestion.value < surveyQuestions.length - 1) {
    currentQuestion.value++
  } else {
    // 完成问卷
    showSurvey.value = false
    surveyCompleted.value = true
    
    // 如果是小薇，保存偏好到数据库
    if (selectedCharacter.value?.id === 1) {
      try {
        await userStore.saveCharacterPreferences(surveyAnswers)
        console.log('角色偏好已保存到数据库')
      } catch (error) {
        console.error('保存角色偏好失败:', error)
      }
    }
    
    // 生成性格特点介绍
    const personalityIntro = generatePersonalityIntro()
    
    // 设置欢迎语
    messages.value = [{
      id: Date.now().toString(),
      text: `${t('emotionCompanion.greeting')}${t('characters.xiaoWei')}！${personalityIntro}`,
      isUser: false,
      timestamp: Date.now()
    }]
    
    // 立即保存带有 surveyCompleted 的对话
    saveConversation()
  }
}

const handleInputFocus = () => {
  if (!selectedCharacter.value) {
    showAlertModal.value = true
  }
}

const closeAlertModal = () => {
  showAlertModal.value = false
}

const sendMessage = async () => {
  if (!selectedCharacter.value) {
    showAlertModal.value = true
    return
  }
  if (!messageInput.value.trim()) return
  
  const userText = messageInput.value
  messages.value.push({
    id: Date.now().toString(),
    text: userText,
    isUser: true,
    timestamp: Date.now()
  })
  messageInput.value = ''
  
  scrollToBottom()
  
  try {
    if (selectedCharacter.value) {
      const reply = await getEmotionCompanionReply(
        userText,
        {
          characterName: t(selectedCharacter.value.nameKey),
          characterAvatar: selectedCharacter.value.avatar,
          characterId: selectedCharacter.value.id,
          surveyAnswers: { ...surveyAnswers }
        },
        messages.value.slice(0, -1) // 传递历史对话（排除当前刚添加的用户消息）
      )
      
      messages.value.push({
        id: (Date.now() + 1).toString(),
        text: reply || t('emotionCompanion.listening'),
        isUser: false,
        timestamp: Date.now()
      })
      
      userStore.incrementUsage('emotionCompanion')
      scrollToBottom()
    }
  } catch (error) {
    console.error('Error getting emotion companion reply:', error)
    // 降级到硬编码回复
    const replies = [
      t('emotionCompanion.listening'),
      t('emotionCompanion.understandFeelings'),
      t('emotionCompanion.wantToTalk'),
      t('emotionCompanion.willAlwaysAccompany')
    ]
    const randomReply = replies[Math.floor(Math.random() * replies.length)]
    messages.value.push({
      id: (Date.now() + 1).toString(),
      text: randomReply,
      isUser: false,
      timestamp: Date.now()
    })
    
    userStore.incrementUsage('emotionCompanion')
    scrollToBottom()
  }
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
