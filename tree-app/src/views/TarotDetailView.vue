<template>
  <div class="tarot-detail-container min-h-screen bg-white">
    <header class="sticky top-0 z-50 bg-white border-b border-gray-100 px-6 py-4">
      <div class="flex items-center justify-between">
        <button @click="goBack" class="w-8 h-8 flex items-center justify-center">
          <svg class="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
          </svg>
        </button>
        <h1 class="text-lg font-semibold text-gray-800">塔罗牌详情</h1>
        <div class="w-8"></div>
      </div>
    </header>

    <div class="px-6 py-8">

    <div v-if="card" class="card-detail">
      <div class="card-display bg-gray-50 rounded-2xl p-8 text-center mb-8">
        <img :src="getCardImage(card.image)" :alt="card.name" class="w-48 mx-auto mb-4" />
        <h1 class="text-2xl font-bold mb-2">{{ card.name }}</h1>
        <p class="text-sm text-gray-500">{{ getGroupLabel(card.group) }}</p>
      </div>

      <div class="card-meaning mb-8">
        <div class="meaning-section bg-gray-50 rounded-xl p-5 mb-4">
          <h3 class="text-sm font-medium mb-3 text-gray-700">{{ t('tarot.uprightKeywords') }}</h3>
          <p class="text-gray-600">{{ card.upright_keywords }}</p>
        </div>
        <div class="meaning-section bg-gray-50 rounded-xl p-5 mb-4">
          <h3 class="text-sm font-medium mb-3 text-gray-700">{{ t('tarot.uprightMeaning') }}</h3>
          <p class="text-gray-600">{{ card.upright_meaning }}</p>
        </div>
        <div class="meaning-section bg-gray-50 rounded-xl p-5 mb-4">
          <h3 class="text-sm font-medium mb-3 text-gray-700">{{ t('tarot.reversedKeywords') }}</h3>
          <p class="text-gray-600">{{ card.reversed_keywords }}</p>
        </div>
        <div class="meaning-section bg-gray-50 rounded-xl p-5 mb-4">
          <h3 class="text-sm font-medium mb-3 text-gray-700">{{ t('tarot.reversedMeaning') }}</h3>
          <p class="text-gray-600">{{ card.reversed_meaning }}</p>
        </div>
        <div class="meaning-section bg-gray-50 rounded-xl p-5 mb-4">
          <h3 class="text-sm font-medium mb-3 text-gray-700">{{ t('tarot.symbolism') }}</h3>
          <p class="text-gray-600">{{ card.symbolism }}</p>
        </div>
        <div class="meaning-section bg-gray-50 rounded-xl p-5">
          <h3 class="text-sm font-medium mb-3 text-gray-700">{{ t('tarot.archetype') }}</h3>
          <p class="text-gray-600">{{ card.archetype }}</p>
        </div>
      </div>
    </div>

    <div v-else class="text-center py-20">
      <p class="text-gray-400">{{ t('tarot.cardNotFound') }}</p>
    </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useTarotStore } from '../stores/tarot'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const tarotStore = useTarotStore()

const card = ref<any>(null)

const getCardImage = (imageName: string) => {
  try {
    return new URL(`/src/assets/images/tarot/${imageName}`, import.meta.url).href
  } catch {
    return ''
  }
}

const getGroupLabel = (group: string) => {
  const groupMap: Record<string, string> = {
    'MajorArcana': t('tarot.majorArcana'),
    'Major Arcana': t('tarot.majorArcana'),
    'Wands': t('tarot.wands'),
    'Cups': t('tarot.cups'),
    'Swords': t('tarot.swords'),
    'Pentacles': t('tarot.pentacles')
  }
  return groupMap[group] || group
}

onMounted(() => {
  const cardId = Number(route.query.cardId)
  if (cardId) {
    card.value = tarotStore.getCardById(cardId)
  }
})

const goBack = () => router.back()
</script>
