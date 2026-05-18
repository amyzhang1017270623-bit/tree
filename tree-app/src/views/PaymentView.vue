<template>
  <div class="payment-container min-h-screen bg-white px-6 py-8">
    <div class="flex justify-between items-center mb-8">
      <button @click="goBack" class="flex items-center text-black">
        <svg class="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
        </svg>
      </button>
      <h1 class="text-xl font-bold">{{ t('payment.title') }}</h1>
      <div class="w-6"></div>
    </div>

    <div class="character text-center mb-8">
      <div class="text-6xl mb-4">{{ characterAvatar }}</div>
      <p class="text-gray-600">{{ characterText }}</p>
    </div>

    <!-- 塔罗次卡 -->
    <div class="mb-8">
      <h2 class="text-lg font-semibold mb-4">{{ t('payment.tarotCard') }}</h2>
      <div class="grid grid-cols-2 gap-4">
        <div 
          v-for="card in tarotCards" 
          :key="card.count"
          @click="selectTarotCard(card)"
          :class="[
            'p-5 border rounded-2xl cursor-pointer transition-all',
            selectedTarotCard?.count === card.count 
              ? 'border-black bg-gray-50' 
              : 'border-gray-200'
          ]"
        >
          <div class="text-2xl font-bold mb-1">¥{{ card.price }}</div>
          <div class="text-gray-500 text-sm mb-3">{{ card.count }}{{ t('payment.times') }}</div>
          <div v-if="card.saving" class="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full inline-block">
            {{ t('payment.save') }}{{ card.saving }}
          </div>
        </div>
      </div>
      
      <button 
        v-if="selectedTarotCard"
        @click="buyTarotCard"
        class="w-full mt-6 py-4 bg-black text-white rounded-full font-medium hover:bg-gray-800"
      >
        {{ t('payment.buyNow') }} ¥{{ selectedTarotCard.price }}
      </button>
    </div>

    <!-- 分割线 -->
    <div class="flex items-center gap-4 my-8">
      <div class="flex-1 h-px bg-gray-200"></div>
      <div class="text-gray-400 text-sm">{{ t('payment.or') }}</div>
      <div class="flex-1 h-px bg-gray-200"></div>
    </div>

    <!-- 会员套餐 -->
    <div class="membership-plans space-y-4 mb-8">
      <div class="plan-card p-5 border border-gray-200 rounded-2xl">
        <div class="flex justify-between items-center mb-3">
          <h3 class="font-semibold">{{ t('payment.freeVersion') }}</h3>
          <span class="text-sm text-gray-400">{{ t('payment.current') }}</span>
        </div>
        <p class="text-2xl font-bold mb-3">¥0/{{ t('payment.month') }}</p>
        <ul class="text-sm text-gray-600 space-y-2">
          <li>{{ t('payment.emotionCompanion') }} 50{{ t('payment.times') }}/{{ t('payment.day') }}</li>
          <li>{{ t('payment.treeHole') }} 50{{ t('payment.times') }}/{{ t('payment.day') }}</li>
          <li>{{ t('payment.tarot') }} 2{{ t('payment.times') }}/{{ t('payment.week') }}</li>
        </ul>
      </div>

      <div class="plan-card p-5 border border-black bg-gray-50 rounded-2xl">
        <div class="flex justify-between items-center mb-3">
          <h3 class="font-semibold">{{ t('payment.memberVersion') }}</h3>
          <span class="text-xs px-2 py-1 bg-black text-white rounded-full">{{ t('payment.recommended') }}</span>
        </div>
        <p class="text-2xl font-bold mb-3">¥29.9/{{ t('payment.month') }}</p>
        <ul class="text-sm text-gray-600 space-y-2">
          <li>{{ t('payment.emotionCompanion') }} 200{{ t('payment.times') }}/{{ t('payment.day') }}</li>
          <li>{{ t('payment.treeHole') }} 200{{ t('payment.times') }}/{{ t('payment.day') }}</li>
          <li>{{ t('payment.tarot') }} 2{{ t('payment.times') }}/{{ t('payment.week') }}</li>
        </ul>
      </div>
    </div>

    <button 
      @click="handlePayment"
      class="w-full py-4 bg-black text-white rounded-full font-medium hover:bg-gray-800"
    >
      {{ t('payment.subscribe') }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useUserStore } from '../stores/user'

const { t } = useI18n()
const router = useRouter()
const userStore = useUserStore()

interface TarotCard {
  count: number
  price: number
  saving?: string
}

const tarotCards: TarotCard[] = [
  { count: 1, price: 10 },
  { count: 3, price: 25, saving: '¥5' },
  { count: 5, price: 35, saving: '¥15' },
  { count: 10, price: 50, saving: '¥50' }
]

const selectedTarotCard = ref<TarotCard | null>(null)

const characterAvatar = computed(() => {
  return userStore.userInfo?.gender === '女' ? '👦' : '👧'
})

const characterText = computed(() => {
  return userStore.userInfo?.gender === '女' 
    ? t('payment.characterTextFemale') 
    : t('payment.characterTextMale')
})

const selectTarotCard = (card: TarotCard) => {
  selectedTarotCard.value = card
}

const buyTarotCard = () => {
  if (!selectedTarotCard.value) return
  
  // 模拟购买成功
  userStore.buyTarotCards(selectedTarotCard.value.count)
  alert(t('payment.buySuccess', { count: selectedTarotCard.value.count }))
  router.push('/tarot')
}

const handlePayment = () => {
  alert(t('payment.comingSoon'))
}

const goBack = () => router.push('/home')
</script>
