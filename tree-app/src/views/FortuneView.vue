<template>
  <div class="fortune-container min-h-screen bg-white">
    <header class="sticky top-0 z-50 bg-white border-b border-gray-100 px-6 py-4">
      <div class="flex items-center justify-between">
        <button @click="goBack" class="w-8 h-8 flex items-center justify-center">
          <svg class="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
          </svg>
        </button>
        <h1 class="text-xl font-bold">{{ t('fortune.title') }}</h1>
        <div class="w-8"></div>
      </div>
    </header>

    <div class="px-6 py-8">

    <div class="fortune-header text-center mb-10">
      <div class="zodiac-icon w-20 h-20 mx-auto mb-4">
        <img :src="`/src/assets/images/star/icon_${getZodiacFileName(fortune.zodiac)}.svg`" :alt="fortune.zodiac" class="w-full h-full" />
      </div>
      <h1 class="text-3xl font-bold mb-2">{{ locale === 'zh' ? fortune.zodiac + '座' : fortune.zodiacEn }}</h1>
      <p class="text-gray-500">{{ today }}</p>
    </div>

    <div class="core-zodiac mb-10">
      <h2 class="text-lg font-semibold mb-4">{{ t('fortune.coreSign') }}</h2>
      <div class="grid grid-cols-3 gap-4">
        <div class="text-center p-4 bg-gray-50 rounded-xl">
          <p class="text-sm text-gray-500 mb-1">{{ t('fortune.sunSign') }}</p>
          <p class="text-lg font-medium">{{ locale === 'zh' ? fortune.zodiac : fortune.zodiacEn }}</p>
        </div>
        <div class="text-center p-4 bg-gray-50 rounded-xl">
          <p class="text-sm text-gray-500 mb-1">{{ t('fortune.moonSign') }}</p>
          <p class="text-lg font-medium">{{ locale === 'zh' ? moonZodiac : getZodiacEnglish(moonZodiac) }}</p>
        </div>
        <div class="text-center p-4 bg-gray-50 rounded-xl">
          <p class="text-sm text-gray-500 mb-1">{{ t('fortune.risingSign') }}</p>
          <p class="text-lg font-medium">{{ locale === 'zh' ? risingZodiac : getZodiacEnglish(risingZodiac) }}</p>
        </div>
      </div>
    </div>

    <div class="fortune-details mb-10">
      <h2 class="text-lg font-semibold mb-4">{{ t('fortune.todayFortune') }}</h2>
      <div class="space-y-4">
        <div class="fortune-item p-4 bg-gray-50 rounded-xl">
          <div class="flex justify-between items-center mb-2">
            <span class="font-medium">{{ t('fortune.overallFortune') }}</span>
            <span class="text-sm star-rating">{{ fortune.overall.score }}</span>
          </div>
          <p class="text-sm text-gray-600">{{ fortune.overall.desc }}</p>
        </div>
        <div class="fortune-item p-4 bg-gray-50 rounded-xl">
          <div class="flex justify-between items-center mb-2">
            <span class="font-medium">{{ t('fortune.loveFortune') }}</span>
            <span class="text-sm star-rating">{{ fortune.love.score }}</span>
          </div>
          <p class="text-sm text-gray-600">{{ fortune.love.desc }}</p>
        </div>
        <div class="fortune-item p-4 bg-gray-50 rounded-xl">
          <div class="flex justify-between items-center mb-2">
            <span class="font-medium">{{ t('fortune.careerFortune') }}</span>
            <span class="text-sm star-rating">{{ fortune.career.score }}</span>
          </div>
          <p class="text-sm text-gray-600">{{ fortune.career.desc }}</p>
        </div>
        <div class="fortune-item p-4 bg-gray-50 rounded-xl">
          <div class="flex justify-between items-center mb-2">
            <span class="font-medium">{{ t('fortune.wealthFortune') }}</span>
            <span class="text-sm star-rating">{{ fortune.wealth.score }}</span>
          </div>
          <p class="text-sm text-gray-600">{{ fortune.wealth.desc }}</p>
        </div>
        <div class="fortune-item p-4 bg-gray-50 rounded-xl">
          <div class="flex justify-between items-center mb-2">
            <span class="font-medium">{{ t('fortune.healthFortune') }}</span>
            <span class="text-sm star-rating">{{ fortune.health.score }}</span>
          </div>
          <p class="text-sm text-gray-600">{{ fortune.health.desc }}</p>
        </div>
      </div>
    </div>

    <div class="lucky-info">
      <h2 class="text-lg font-semibold mb-4">{{ t('fortune.luckyInfo') }}</h2>
      <div class="grid grid-cols-2 gap-4">
        <div class="p-4 bg-gray-50 rounded-xl text-center">
          <p class="text-sm text-gray-500 mb-2">{{ t('fortune.todayLuckyColor') }}</p>
          <p class="font-medium">{{ fortune.luckyColor }}</p>
        </div>
        <div class="p-4 bg-gray-50 rounded-xl text-center">
          <p class="text-sm text-gray-500 mb-2">{{ t('fortune.todayLuckyNumber') }}</p>
          <p class="font-medium">{{ fortune.luckyNumber }}</p>
        </div>
        <div class="p-4 bg-gray-50 rounded-xl text-center">
          <p class="text-sm text-gray-500 mb-2">{{ t('fortune.suitable') }}</p>
          <p class="font-medium">{{ fortune.goodThing }}</p>
        </div>
        <div class="p-4 bg-gray-50 rounded-xl text-center">
          <p class="text-sm text-gray-500 mb-2">{{ t('fortune.avoid') }}</p>
          <p class="font-medium">{{ fortune.badThing }}</p>
        </div>
      </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useUserStore } from '../stores/user'
import { calculateFortune, ZODIAC_ENGLISH } from '../utils/fortune'

const { t, locale } = useI18n()
const router = useRouter()
const userStore = useUserStore()

const today = computed(() => {
  const d = new Date()
  if (locale.value === 'zh') {
    return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`
  }
  return `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()}`
})

const fortune = computed(() => {
  if (userStore.userInfo?.birthDate) {
    return calculateFortune({
      birthDate: userStore.userInfo.birthDate,
      name: userStore.userInfo.name
    }, locale.value)
  }
  return calculateFortune({ birthDate: '2000-01-01', name: 'Visitor' }, locale.value)
})

const zodiacOrder = ['白羊', '金牛', '双子', '巨蟹', '狮子', '处女', '天秤', '天蝎', '射手', '摩羯', '水瓶', '双鱼']

const zodiacFileNameMap: Record<string, string> = {
  '白羊': 'muyangzuo',
  '金牛': 'jinniuzuo',
  '双子': 'shuangzizuo',
  '巨蟹': 'juxiezuo',
  '狮子': 'shizizuo',
  '处女': 'chunvzuo',
  '天秤': 'tianchengzuo',
  '天蝎': 'tianxiezuo',
  '射手': 'sheshouzuo',
  '摩羯': 'mojiezuo',
  '水瓶': 'shuipingzuo',
  '双鱼': 'shuangyuzuo'
}

function getZodiacFileName(zodiac: string): string {
  return zodiacFileNameMap[zodiac] || 'muyangzuo'
}

function getZodiacEnglish(zodiac: string): string {
  return ZODIAC_ENGLISH[zodiac as keyof typeof ZODIAC_ENGLISH] || zodiac
}



function getZodiacByOffset(birthDate: string, offset: number): string {
  const date = new Date(birthDate)
  const day = date.getDate()
  const baseIndex = (day % 12 + offset) % 12
  return zodiacOrder[baseIndex >= 0 ? baseIndex : baseIndex + 12]
}

const moonZodiac = computed(() => {
  if (userStore.userInfo?.birthDate) {
    return getZodiacByOffset(userStore.userInfo.birthDate, 2)
  }
  return '金牛'
})

const risingZodiac = computed(() => {
  if (userStore.userInfo?.birthDate) {
    const birthTime = userStore.userInfo.birthTime
    let hour = 0
    if (birthTime) {
      const timePart = birthTime.split(':')[0]
      hour = parseInt(timePart)
    }
    return getZodiacByOffset(userStore.userInfo.birthDate, Math.floor(hour / 2))
  }
  return '狮子'
})

const goBack = () => router.push('/home')
</script>

<style scoped>
.star-rating {
  color: #540294;
}
</style>
