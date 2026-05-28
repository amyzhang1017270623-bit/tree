<template>
  <div class="home-container min-h-screen bg-gradient-to-b from-gray-50 to-white pb-6">
    <header class="sticky top-0 z-50 bg-gradient-to-b from-gray-50 to-gray-50/95 backdrop-blur-sm px-6 py-4 border-b border-gray-100">
      <div class="flex justify-between items-center">
        <h1 class="text-2xl font-bold text-gray-800">0号树洞</h1>
        <div class="flex items-center gap-3">
          <button @click="toggleLocale" class="px-3 py-1.5 text-sm border border-gray-300 rounded-full hover:border-gray-400 transition-colors">
            {{ currentLocale === 'zh' ? 'EN' : '中文' }}
          </button>
          <button @click="goToProfile" class="w-11 h-11 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors">
            <svg class="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
            </svg>
          </button>
        </div>
      </div>
    </header>

    <div class="px-6 py-6">

    <div class="fortune-section flex flex-col items-center mb-12">
      <div @click="goToFortune" class="fortune-wheel relative cursor-pointer">
        <div class="wheel-circle">
          <div class="wheel-quadrant wheel-nw">
            <div class="inner">
              <div class="content">
                <img src="/src/assets/images/icon_sun.png" alt="太阳" class="wheel-icon" />
                <p>{{ t('home.mood') }}</p>
              </div>
              <p class="text-xs">{{ fortune.mood }}</p>
            </div>
          </div>
          <div class="wheel-quadrant wheel-ne">
            <div class="inner">
              <div class="content">
                <img src="/src/assets/images/icon_moon.png" alt="月亮" class="wheel-icon" />
                <p>{{ t('home.relationship') }}</p>
              </div>
              <p class="text-xs">{{ fortune.relationship }}</p>
            </div>
          </div>
          <div class="wheel-quadrant wheel-sw">
            <div class="inner">
              <div class="content">
                <img src="/src/assets/images/icon_star.png" alt="星星" class="wheel-icon" />
                <p>{{ t('home.energy') }}</p>
              </div>
              <p class="text-xs">{{ fortune.energy }}</p>
            </div>
          </div>
          <div class="wheel-quadrant wheel-se">
            <div class="inner">
              <div class="content">
                <img src="/src/assets/images/icon_cloud.png" alt="云" class="wheel-icon" />
                <p>{{ t('home.overall') }}</p>
              </div>
              <p class="text-xs">{{ fortune.overall.score }}</p>
            </div>
          </div>
        </div>
      </div>
      
      <div class="lucky-info mt-4 text-center space-y-1 mb-4">
        <p class="text-gray-700 font-medium">
          <span class="text-yellow-500 text-lg">✦</span>
          {{ t('fortune.todayLuckyColor') }}：{{ fortune.luckyColor }}
          <span class="text-yellow-500 text-lg">✦</span>
        </p>
        <p class="text-gray-700 font-medium">
          <span class="text-yellow-500 text-lg">✦</span>
          {{ t('fortune.todayLuckyNumber') }}：{{ fortune.luckyNumber }}
          <span class="text-yellow-500 text-lg">✦</span>
        </p>
        <p class="text-gray-700 font-medium">
          <span class="text-yellow-500 text-lg">✦</span>
          <span class="mx-3">{{ t('fortune.good') }}：{{ fortune.goodThing }}</span>
          <span class="text-gray-300 mx-1">|</span>
          <span class="mx-3">{{ t('fortune.bad') }}：{{ fortune.badThing }}</span>
          <span class="text-yellow-500 text-lg">✦</span>
        </p>
      </div>
    </div>

    <div class="section-title text-center mb-6">
      <span class="text-cyan-400 text-base">✦</span>
      <span class="text-gray-700 mx-4 font-medium">{{ t('fortune.selectMode') }}</span>
      <span class="text-pink-400 text-base">✦</span>
    </div>

    <div class="functions-list space-y-4">
      <div
        v-for="func in functions"
        :key="func.id"
        @click="goToFunction(func.path)"
        class="function-card border border-gray-200 rounded-xl p-4 cursor-pointer hover:shadow-md hover:border-gray-300 transition-all duration-300 flex items-center gap-4"
      >
        <div class="w-12 h-12 flex items-center justify-center flex-shrink-0">
          <img :src="func.icon" :alt="func.name" :class="func.id === 5 ? 'w-10 h-10' : 'w-full h-full object-contain'" />
        </div>
        <div class="flex-1 min-w-0">
          <h3 class="text-base font-semibold text-gray-800 mb-0.5">{{ func.name }}</h3>
          <p class="text-gray-500 text-xs">{{ func.description }}</p>
        </div>
        <svg class="w-4 h-4 text-gray-300 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
        </svg>
      </div>
    </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useUserStore } from '../stores/user'
import { calculateFortune } from '../utils/fortune'
import iconAiqing from '@/assets/images/icon_aiqing.png'
import iconPeiban from '@/assets/images/icon_peiban.png'
import iconTree from '@/assets/images/icon_tree.png'
import iconTarot from '@/assets/images/icon_tarot.png'
import iconAssistant from '@/assets/images/icon_assistant.svg'

const router = useRouter()
const userStore = useUserStore()
const { locale, t } = useI18n()

const currentLocale = ref(locale.value)

const toggleLocale = () => {
  const newLocale = currentLocale.value === 'zh' ? 'en' : 'zh'
  locale.value = newLocale
  currentLocale.value = newLocale
  localStorage.setItem('locale', newLocale)
}

const fortune = computed(() => {
  if (userStore.userInfo?.birthDate) {
    return calculateFortune({
      birthDate: userStore.userInfo.birthDate,
      name: userStore.userInfo.name
    }, currentLocale.value)
  }
  return calculateFortune({ birthDate: '2000-01-01', name: 'Visitor' }, currentLocale.value)
})

const functions = computed(() => [
  { id: 1, name: t('homeFeatures.loveAssistant'), description: currentLocale.value === 'zh' ? '帮你回消息、哄人、推进关系' : 'Help reply messages, comfort, advance relationships', icon: iconAiqing, path: '/love-assistant' },
  { id: 2, name: t('homeFeatures.emotionCompanion'), description: currentLocale.value === 'zh' ? '当你孤单、想念时给你安慰' : 'Comfort when you are lonely or missing someone', icon: iconPeiban, path: '/emotion-companion' },
  { id: 3, name: t('homeFeatures.emotionTreeHole'), description: t('homeFeatures.keepSecret'), icon: iconTree, path: '/tree-hole' },
  { id: 4, name: t('homeFeatures.tarotWorld'), description: currentLocale.value === 'zh' ? '带你感受一下玄学世界' : 'Experience the mystical world', icon: iconTarot, path: '/tarot' },
  { id: 5, name: currentLocale.value === 'zh' ? '私人助理' : 'Personal Assistant', description: currentLocale.value === 'zh' ? '提醒事项、日程管理、帮你记录' : 'Reminders, schedule management, help you record', icon: iconAssistant, path: '/assistant' }
])

const goToProfile = () => router.push('/profile')
const goToFortune = () => router.push('/fortune')
const goToFunction = (path: string) => router.push(path)
</script>

<style scoped>
.wheel-circle {
  width: 260px;
  height: 260px;
  border-radius: 50%;
  position: relative;
  background: #fff;
  border: 1px solid #e5e7eb;
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.wheel-quadrant {
  position: absolute;
  width: 130px;
  height: 130px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  color: #4b5563;
}

.wheel-quadrant .inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 80px;
  height: 80px;
}

.wheel-quadrant .content {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 4px;
}

.wheel-quadrant .content p {
  font-weight: 600;
  font-size: 14px;
  color: #374151;
}

.wheel-quadrant span {
  font-size: 20px;
}

.wheel-icon {
  width: 36px;
  height: 36px;
  object-fit: contain;
  object-position: center;
  display: block;
  margin: 0 auto;
}

.wheel-quadrant p {
  margin: 2px 0;
  text-align: center;
  max-width: 100px;
}

.wheel-nw {
  top: 0;
  left: 0;
  border-radius: 130px 0 0 0;
  background: linear-gradient(135deg, #fefce8 0%, #fef9c3 100%);
  padding-top: 10px;
  padding-left: 10px;
}

.wheel-ne {
  top: 0;
  right: 0;
  border-radius: 0 130px 0 0;
  background: linear-gradient(225deg, #eff6ff 0%, #dbeafe 100%);
  padding-top: 10px;
  padding-right: 10px;
}

.wheel-sw {
  bottom: 0;
  left: 0;
  border-radius: 0 0 0 130px;
  background: linear-gradient(225deg, #e2f8ecff 0%, #cff5e3ff 100%);
  padding-bottom: 10px;
  padding-left: 10px;
}

.wheel-se {
  bottom: 0;
  right: 0;
  border-radius: 0 0 130px 0;
  background: linear-gradient(135deg, #fdf2f8 0%, #fce7f3 100%);
  padding-bottom: 10px;
  padding-right: 10px;
}

.lucky-number {
  display: flex;
  flex-direction: column;
}

.lucky-number p {
  writing-mode: vertical-lr;
}

</style>
