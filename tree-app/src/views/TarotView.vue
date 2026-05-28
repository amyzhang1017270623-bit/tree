<template>
  <div class="tarot-container min-h-screen bg-white">
    <header v-if="!showCardsList && !showResult" class="sticky top-0 z-50 bg-white border-b border-gray-100 px-6 py-4">
      <div class="flex items-center justify-between">
        <button @click="goBack" class="w-8 h-8 flex items-center justify-center">
          <svg class="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
          </svg>
        </button>
        <div class="text-center">
          <h1 class="text-xl font-bold">{{ t('tarot.title') }}</h1>
          <p class="text-xs text-gray-500 mt-1">{{ t('tarot.subtitle') }}</p>
        </div>
        <button @click="showCardsList = true" class="text-xs text-gray-600 hover:text-black whitespace-nowrap">
          {{ t('tarot.tarotCardGuide') }}
        </button>
      </div>
    </header>

    <div v-if="!showCardsList && !showResult" class="main-section px-6 py-6">

      <div class="text-center mb-4">
        <div class="inline-flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-full">
          <span class="text-sm text-gray-500">{{ t('tarot.freeTimes') }}</span>
          <span class="text-lg font-bold" :class="userStore.tarotFreeCount > 0 ? 'text-black' : 'text-red-500'">{{ userStore.tarotFreeCount }}</span>
          <span class="text-sm text-gray-500">{{ t('tarot.times') }}</span>
          <span v-if="userStore.tarotPaidCount > 0" class="text-sm text-gray-400">· {{ t('payment.timesCard') }} {{ userStore.tarotPaidCount }} {{ t('tarot.times') }}</span>
        </div>
      </div>

      <div class="question-types mb-8">
        <p class="text-sm text-gray-500 mb-3">{{ t('tarot.selectQuestionType') }}</p>
        <div class="grid grid-cols-5 gap-2">
          <button 
            v-for="type in questionTypes" 
            :key="type"
            @click="selectedQuestionType = type"
            :class="[
              'py-2 rounded-full text-sm transition-colors',
              selectedQuestionType === type 
                ? 'bg-black text-white' 
                : 'bg-gray-100 text-gray-700'
            ]"
          >
            {{ t(`tarot.${type.toLowerCase()}`) }}
          </button>
        </div>
      </div>

      <div class="spread-selection mb-10">
        <p class="text-sm text-gray-500 mb-3">{{ t('tarot.selectSpread') }}</p>
        <div class="grid grid-cols-2 gap-4">
          <div 
            @click="selectSpread('single')"
            :class="[
              'p-5 border rounded-xl cursor-pointer transition-all',
              selectedSpread === 'single' 
                ? 'border-black bg-gray-50' 
                : 'border-gray-200'
            ]"
          >
            <div class="flex items-center gap-3 mb-2">
              <img :src="iconDanpai" :alt="t('tarot.singleCard')" class="w-10 h-10 object-contain" />
              <h3 class="font-semibold text-lg">{{ t('tarot.singleCard') }}</h3>
            </div>
            <p class="text-xs text-gray-500 leading-relaxed">{{ t('tarot.simpleReading') }}</p>
          </div>
          <div 
            @click="selectSpread('three')"
            :class="[
              'p-5 border rounded-xl cursor-pointer transition-all',
              selectedSpread === 'three' 
                ? 'border-black bg-gray-50' 
                : 'border-gray-200'
            ]"
          >
            <div class="flex items-center gap-3 mb-2">
              <img :src="iconSanpai" :alt="t('tarot.threeCards')" class="w-10 h-10 object-contain" />
              <h3 class="font-semibold text-lg">{{ t('tarot.threeCards') }}</h3>
            </div>
            <p class="text-xs text-gray-500 leading-relaxed">{{ t('tarot.pastPresentFuture') }}</p>
          </div>
        </div>
      </div>

      <div class="space-y-2">
        <button 
          v-if="selectedSpread"
          @click="shuffleCards"
          class="w-full py-4 bg-black text-white rounded-full font-medium hover:bg-gray-800"
        >
          {{ selectedSpread === 'three' && resultMainCard ? t('tarot.continueShuffle') : t('tarot.shuffle') }}
        </button>

        <div v-if="selectedSpread === 'three' && resultMainCard && !shuffling && !shuffled" class="p-4 bg-gray-50 rounded-xl text-center">
          <p class="text-xs text-gray-500 mb-2">{{ t('tarot.coreCard') }}</p>
          <p class="font-medium">{{ resultMainCard?.name }}</p>
        </div>

        <div v-if="shuffling" class="shuffle-animation">
          <div class="shuffle-container">
            <div class="top-left-mask"></div>
            <div class="top-right-mask"></div>
            <img
              v-for="i in 54"
              :key="i"
              :src="shuffleCardBack"
              :alt="t('tarot.shuffle')"
              class="shuffle-card"
              :class="`shuffle-card-${i}`"
            />
          </div>
        </div>

        <div v-if="shuffled && !showResult" class="select-number-section mt-6">
          <div v-if="selectedSpread === 'single'" class="mb-4">
            <p class="text-sm text-gray-500 mb-2 text-center">{{ t('tarot.enterNumberBetween') }}</p>
            <input 
              v-model.number="selectedSingleNumber"
              type="number"
              min="1"
              max="22"
              placeholder="1-22"
              class="w-full px-4 py-3 border border-gray-300 rounded-xl text-center text-lg focus:outline-none focus:border-black"
            />
          </div>

          <div v-else class="space-y-4">
            <div v-if="threeCardStep === 1" class="mb-4">
              <p class="text-sm text-gray-500 mb-2">{{ t('tarot.coreCardRange') }}</p>
              <input
                v-model.number="selectedMainNumber"
                type="number"
                min="1"
                max="22"
                placeholder="1-22"
                class="w-full px-4 py-3 border border-gray-300 rounded-xl text-center text-lg focus:outline-none focus:border-black"
              />
            </div>
            <div v-else class="mb-4">
              <p class="text-sm text-gray-500 mb-2">{{ t('tarot.situationDevelopmentRange') }}</p>
              <div class="flex gap-2">
                <input
                  v-for="(_, idx) in [0, 1, 2]"
                  :key="idx"
                  v-model.number="selectedThreeNumbers[idx]"
                  type="number"
                  min="1"
                  max="78"
                  class="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-center focus:outline-none focus:border-black"
                />
              </div>
            </div>
          </div>

          <div v-if="selectedSpread === 'three' && resultMainCard" class="mb-4 p-4 bg-gray-50 rounded-xl text-center">
            <p class="text-xs text-gray-500 mb-2">{{ t('tarot.coreCard') }}</p>
            <p class="font-medium">{{ resultMainCard?.name }}</p>
          </div>

          <button 
            @click="confirmSelection"
            :disabled="!canConfirm || isReading"
            :class="[
              'w-full py-4 rounded-full font-medium transition-colors flex items-center justify-center',
              canConfirm && !isReading
                ? 'bg-black text-white hover:bg-gray-800' 
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            ]"
          >
            <svg v-if="isReading" class="w-5 h-5 animate-spin mr-2" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            {{ isReading ? t('tarot.interpreting') : (selectedSpread === 'single' ? t('tarot.interpretCards') : (threeCardStep === 2 ? t('tarot.interpretCards') : t('tarot.confirmSelection'))) }}
          </button>
        </div>
      </div>
    </div>

    <div v-else-if="showCardsList" class="cards-list-section h-screen flex flex-col bg-white">
      <header class="sticky top-0 z-50 bg-white border-b border-gray-100 px-6 py-4 flex-shrink-0">
        <div class="flex justify-between items-center">
          <button @click="showCardsList = false" class="w-8 h-8 flex items-center justify-center">
            <svg class="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
            </svg>
          </button>
          <h1 class="text-xl font-bold">{{ t('tarot.tarotCardGuide') }}</h1>
          <div class="w-8"></div>
        </div>
      </header>

      <div class="sticky top-[60px] z-40 bg-white border-b border-gray-100 px-6 py-3 flex-shrink-0">
        <div class="category-select flex gap-2 overflow-x-auto pb-1">
          <button 
            v-for="cat in categories" 
            :key="cat.value"
            @click="selectedCategory = cat.value"
            :class="[
              'px-4 py-2 rounded-full text-sm flex-shrink-0 transition-colors',
              selectedCategory === cat.value 
                ? 'bg-black text-white' 
                : 'bg-white text-black border border-gray-300'
            ]"
          >
            {{ t(`tarot.${cat.label}`) }}
          </button>
        </div>
      </div>

      <div class="flex-1 overflow-auto px-6 py-4">
        <div class="cards-grid grid grid-cols-3 gap-4">
          <div 
            v-for="card in filteredCards" 
            :key="card.id"
            @click="viewCardDetail(card)"
            class="card-item bg-gray-50 rounded-xl p-3 text-center cursor-pointer hover:bg-gray-100"
          >
            <img :src="getCardImage(card.image)" :alt="card.name" class="w-full aspect-[3/4] object-contain mb-2" />
            <p class="font-medium text-xs">{{ card.name }}</p>
          </div>
        </div>
      </div>
    </div>

    <div v-else-if="showResult" class="result-section h-screen flex flex-col bg-white">
      <header class="sticky top-0 z-50 bg-white border-b border-gray-100 px-6 py-4 flex-shrink-0">
        <div class="flex items-center justify-between">
          <button @click="resetReading" class="w-8 h-8 flex items-center justify-center">
            <svg class="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
            </svg>
          </button>
          <h1 class="text-xl font-bold">{{ t('tarot.readingResult') }}</h1>
          <div class="w-8"></div>
        </div>
      </header>

      <div class="flex-1 overflow-y-auto">
        <div v-if="selectedSpread === 'single'" class="single-result">
          <div class="card-display bg-gray-50 rounded-2xl p-5 text-center mb-3">
            <img 
              :src="getCardImage(resultCard?.image)" 
              :alt="resultCard?.name" 
              class="w-40 mx-auto mb-3"
              :class="{ 'rotate-180': isReversed }"
            />
            <h2 class="text-lg font-semibold mb-2">{{ resultCard?.name }}</h2>
            <p class="text-sm text-gray-500">{{ resultCard?.group }} · {{ isReversed ? t('tarot.reversed') : t('tarot.upright') }}</p>
          </div>
          
          <h3 class="font-semibold mt-6 mb-3">{{ t('tarot.reading') }}</h3>
          <div class="reading-content bg-gray-50 rounded-2xl p-6">
            <p class="text-gray-700 leading-relaxed mb-4">
              {{ resultReading }}
            </p>
            <p class="text-sm text-gray-400 mt-4">{{ t('tarot.referenceOnly') }}</p>
          </div>
        </div>

        <div v-else class="three-result flex flex-col h-full">
          <div class="all-cards flex gap-3 mb-6 sticky top-0 bg-white py-2">
            <div class="core-card-item flex-1 text-center p-3 bg-yellow-50 border-2 border-yellow-300 rounded-xl">
              <p class="text-xs text-yellow-600 font-bold mb-2">{{ t('tarot.coreCard') }}</p>
              <img 
                :src="getCardImage(resultMainCard?.image)" 
                :alt="resultMainCard?.name" 
                class="w-full mb-2"
                :class="{ 'rotate-180': isMainReversed }"
              />
              <p class="text-sm font-medium">{{ resultMainCard?.name }}</p>
              <p class="text-xs text-yellow-600">{{ isMainReversed ? t('tarot.reversed') : t('tarot.upright') }}</p>
            </div>
            <div v-for="(card, idx) in resultThreeCards" :key="idx" class="other-card-item flex-1 text-center p-3 bg-gray-50 rounded-xl">
              <p class="text-xs text-gray-500 mb-2">{{ t(`tarot.${['past', 'present', 'future'][idx]}`) }}</p>
              <img 
                :src="getCardImage(card?.image)" 
                :alt="card?.name" 
                class="w-full mb-2"
                :class="{ 'rotate-180': threeCardReversed[idx] }"
              />
              <p class="text-sm font-medium">{{ card?.name }}</p>
              <p class="text-xs text-gray-500">{{ threeCardReversed[idx] ? t('tarot.reversed') : t('tarot.upright') }}</p>
            </div>
          </div>

          <h3 class="font-semibold mb-3 sticky top-24 bg-white">{{ t('tarot.reading') }}</h3>
          <div class="reading-content bg-gray-50 rounded-2xl p-6 overflow-y-auto flex-1">
            <div class="text-gray-700 leading-relaxed whitespace-pre-line">
              {{ resultReading }}
            </div>
            <p class="text-sm text-gray-400 mt-4">{{ t('tarot.psychologicalReference') }}</p>
          </div>
        </div>
      </div>
    </div>

    <div v-if="showLimitModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
      <div class="bg-white rounded-2xl p-6 w-full max-w-sm">
        <div class="text-center mb-6">
          <div class="text-4xl mb-3">🔮</div>
          <h2 class="text-xl font-bold mb-2">{{ t('tarot.cannotReveal') }}</h2>
          <p class="text-gray-500">{{ t('tarot.freeTimesUsed') }}</p>
        </div>
        <div class="space-y-3">
          <button @click="goToBuyCard" class="w-full py-3 bg-black text-white rounded-full font-medium">
            {{ t('tarot.buyTimesCard') }}
          </button>
          <button @click="showLimitModal = false" class="w-full py-3 text-gray-500 rounded-full">
            {{ t('general.cancel') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useTarotStore } from '../stores/tarot'
import { useUserStore } from '../stores/user'
import { getTarotReading } from '../utils/api'
import iconDanpai from '@/assets/images/icon_danpai.png'
import iconSanpai from '@/assets/images/icon_sanpai.png'

const { t } = useI18n()
const router = useRouter()
const tarotStore = useTarotStore()
const userStore = useUserStore()



if (typeof tarotStore.shuffleCards !== 'function') {
  console.warn('shuffleCards not found in tarotStore, using fallback')
  tarotStore.shuffleCards = () => {
    const cards = tarotStore.allCards
    const cardIds = cards.map((c: any) => c.id)
    for (let i = cardIds.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[cardIds[i], cardIds[j]] = [cardIds[j], cardIds[i]]
    }
    tarotStore.shuffledOrder = cardIds
  }
}

const getCardByShuffledIndex = (index: number) => {
  const cards = tarotStore.allCards
  if (!tarotStore.shuffledOrder || tarotStore.shuffledOrder.length === 0) {
    return cards.find((c: any) => c.id === index)
  }
  const actualId = tarotStore.shuffledOrder[index - 1]
  return cards.find((c: any) => c.id === actualId)
}

const shuffleCardBack = new URL('/src/assets/images/icon_paimian.png', import.meta.url).href

const getCardImage = (imageName: string) => {
  try {
    return new URL(`/src/assets/images/tarot/${imageName}`, import.meta.url).href
  } catch {
    return ''
  }
}

const questionTypes = ['Love', 'Career', 'Study', 'Finance', 'Health']
const categories = [
  { label: 'all', value: 'all' },
  { label: 'majorArcana', value: 'MajorArcana' },
  { label: 'wands', value: 'Wands' },
  { label: 'cups', value: 'Cups' },
  { label: 'swords', value: 'Swords' },
  { label: 'pentacles', value: 'Pentacles' }
]

const selectedQuestionType = ref('Love')
const selectedSpread = ref<string | null>(null)
const shuffling = ref(false)
const shuffled = ref(false)
const showCardsList = ref(false)
const showResult = ref(false)

const selectedSingleNumber = ref<number | null>(null)
const selectedMainNumber = ref<number | null>(null)
const selectedThreeNumbers = ref<[number, number, number]>([0, 0, 0])
const threeCardStep = ref(1)

const resultCard = ref<any>(null)
const isReversed = ref(false)
const resultMainCard = ref<any>(null)
const isMainReversed = ref(false)
const resultThreeCards = ref<any[]>([])
const threeCardReversed = ref<boolean[]>([false, false, false])
const resultReading = ref('')

const selectedCategory = ref('all')
const showLimitModal = ref(false)
const isReading = ref(false)

const filteredCards = computed(() => {
  const type = selectedCategory.value
  if (type === 'all') return tarotStore.allCards
  if (type === 'MajorArcana') return tarotStore.allCards.filter((c: { group: string }) => c.group === 'MajorArcana')
  if (type === 'Wands') return tarotStore.allCards.filter((c: { group: string }) => c.group === 'Wands')
  if (type === 'Cups') return tarotStore.allCards.filter((c: { group: string }) => c.group === 'Cups')
  if (type === 'Swords') return tarotStore.allCards.filter((c: { group: string }) => c.group === 'Swords')
  if (type === 'Pentacles') return tarotStore.allCards.filter((c: { group: string }) => c.group === 'Pentacles')
  return tarotStore.allCards
})

const canConfirm = computed(() => {
  if (selectedSpread.value === 'single') {
    return selectedSingleNumber.value !== null && selectedSingleNumber.value >= 1 && selectedSingleNumber.value <= 22
  } else {
    if (threeCardStep.value === 1) {
      return selectedMainNumber.value !== null && selectedMainNumber.value >= 1 && selectedMainNumber.value <= 22
    } else {
      const [a, b, c] = selectedThreeNumbers.value
      return a >= 1 && a <= 78 && b >= 1 && b <= 78 && c >= 1 && c <= 78 && (a !== b && b !== c && a !== c)
    }
  }
})

const selectSpread = (type: string) => {
  if (!userStore.canDoTarotReading()) {
    showLimitModal.value = true
    return
  }
  
  selectedSpread.value = type
  resetState()
  tarotStore.shuffleCards()
}

const shuffleCards = () => {
  if (!userStore.canDoTarotReading()) {
    showLimitModal.value = true
    return
  }
  
  shuffling.value = true
  shuffled.value = false
  
  tarotStore.shuffleCards()
  
  setTimeout(() => {
    shuffling.value = false
    shuffled.value = true
  }, 3000)
}

const confirmSelection = async () => {
  if (!canConfirm.value) return
  
  if (selectedSpread.value === 'single') {
    resultCard.value = getCardByShuffledIndex(selectedSingleNumber.value!)
    isReversed.value = Math.random() > 0.5
    
    isReading.value = true
      
      try {
        const loveChatContent = userStore.loveAssistantHistory.length > 0 
          ? userStore.loveAssistantHistory[userStore.loveAssistantHistory.length - 1].input 
          : ''
        
        const reading = await getTarotReading(
          [{ card: resultCard.value, isReversed: isReversed.value }],
          'single',
          selectedQuestionType.value,
          undefined,
          loveChatContent
        )
        resultReading.value = reading
        
        userStore.incrementUsage('tarot')
        userStore.useTarotReading()
      } catch (error) {
        console.error('Error getting tarot reading:', error)
        const keywords = isReversed.value ? resultCard.value?.reversed_keywords : resultCard.value?.upright_keywords
        const meaning = isReversed.value ? resultCard.value?.reversed_meaning : resultCard.value?.upright_meaning
        resultReading.value = `${t('tarot.drewCard')}${resultCard.value?.name} (${isReversed.value ? t('tarot.reversed') : t('tarot.upright')}). ${meaning}${keywords ? t('tarot.keywords') + keywords : ''}`
      } finally {
        isReading.value = false
      }
      
      showResult.value = true
  } else {
    if (threeCardStep.value === 1) {
      resultMainCard.value = getCardByShuffledIndex(selectedMainNumber.value!)
      isMainReversed.value = Math.random() > 0.5
      threeCardStep.value = 2
      shuffled.value = false
    } else {
      resultThreeCards.value = selectedThreeNumbers.value.map(n => {
        const card = getCardByShuffledIndex(n)
        return card
      })
      threeCardReversed.value = selectedThreeNumbers.value.map(() => Math.random() > 0.5)
      
      isReading.value = true
      
      try {
        const loveChatContent = userStore.loveAssistantHistory.length > 0 
          ? userStore.loveAssistantHistory[userStore.loveAssistantHistory.length - 1].input 
          : ''
        
        const reading = await getTarotReading(
          resultThreeCards.value.map((card, idx) => ({
            card,
            isReversed: threeCardReversed.value[idx]
          })),
          'three',
          selectedQuestionType.value,
          { card: resultMainCard.value, isReversed: isMainReversed.value },
          loveChatContent
        )
        resultReading.value = reading
        
        userStore.incrementUsage('tarot')
        userStore.useTarotReading()
      } catch (error) {
        console.error('Error getting tarot reading:', error)
        const mainMeaning = isMainReversed.value ? resultMainCard.value?.reversed_meaning : resultMainCard.value?.upright_meaning
        
        const pastCard = resultThreeCards.value[0]
        const pastReversed = threeCardReversed.value[0]
        const pastMeaning = pastReversed ? pastCard?.reversed_meaning : pastCard?.upright_meaning
        
        const presentCard = resultThreeCards.value[1]
        const presentReversed = threeCardReversed.value[1]
        const presentMeaning = presentReversed ? presentCard?.reversed_meaning : presentCard?.upright_meaning
        
        const futureCard = resultThreeCards.value[2]
        const futureReversed = threeCardReversed.value[2]
        const futureMeaning = futureReversed ? futureCard?.reversed_meaning : futureCard?.upright_meaning
        
        resultReading.value = `${t('tarot.coreCard')}${resultMainCard.value?.name} (${isMainReversed.value ? t('tarot.reversed') : t('tarot.upright')}) ${t('tarot.setsTone')}. ${mainMeaning}\n\n${t('tarot.past')}: ${pastCard?.name} (${pastReversed ? t('tarot.reversed') : t('tarot.upright')}) ${pastMeaning}\n\n${t('tarot.present')}: ${presentCard?.name} (${presentReversed ? t('tarot.reversed') : t('tarot.upright')}) ${presentMeaning}\n\n${t('tarot.future')}: ${futureCard?.name} (${futureReversed ? t('tarot.reversed') : t('tarot.upright')}) ${futureMeaning}`
      } finally {
        isReading.value = false
      }
      
      showResult.value = true
    }
  }
}

const viewCardDetail = (card: any) => {
  router.push({
    path: '/tarot-detail',
    query: { cardId: card.id }
  })
}

const resetReading = () => {
  showResult.value = false
  resetState()
}

const resetState = () => {
  shuffling.value = false
  shuffled.value = false
  selectedSingleNumber.value = null
  selectedMainNumber.value = null
  selectedThreeNumbers.value = [0, 0, 0]
  threeCardStep.value = 1
  resultCard.value = null
  resultMainCard.value = null
  resultThreeCards.value = []
  resultReading.value = ''
  hasTrackedUsage = false
}

const goBack = () => router.push('/home')

const goToBuyCard = () => {
  showLimitModal.value = false
  router.push('/payment')
}
</script>

<style scoped>
.shuffle-animation {
  width: 100%;
  max-width: 400px;
  margin: 0 auto;
  display: flex;
  justify-content: center;
}

.shuffle-container {
  position: relative;
  width: 100%;
  height: 280px;
  overflow: hidden;
  border-radius: 8px;
  background: #ffffff;
}

.shuffle-card {
  position: absolute;
  width: 44px;
  height: 62px;
  object-contain: cover;
}

.top-left-mask {
  position: absolute;
  top: 0;
  left: 0;
  width: 50px;
  height: 70px;
  background: #ffffff;
  z-index: 100;
}

.top-right-mask {
  position: absolute;
  top: 0;
  right: 0;
  width: 50px;
  height: 70px;
  background: #ffffff;
  z-index: 100;
}

@keyframes shuffle-1 {
  0%, 100% { left: 25%; top: 30%; transform: rotate(-8deg); opacity: 1; }
  25% { left: 70%; top: 50%; transform: rotate(12deg); opacity: 1; }
  50% { left: 40%; top: 70%; transform: rotate(-5deg); opacity: 1; }
  75% { left: 65%; top: 25%; transform: rotate(8deg); opacity: 1; }
}

@keyframes shuffle-2 {
  0%, 100% { left: 55%; top: 40%; transform: rotate(6deg); opacity: 1; }
  25% { left: 25%; top: 65%; transform: rotate(-10deg); opacity: 1; }
  50% { left: 70%; top: 30%; transform: rotate(15deg); opacity: 1; }
  75% { left: 35%; top: 70%; transform: rotate(-3deg); opacity: 1; }
}

@keyframes shuffle-3 {
  0%, 100% { left: 40%; top: 55%; transform: rotate(-12deg); opacity: 1; }
  25% { left: 70%; top: 40%; transform: rotate(4deg); opacity: 1; }
  50% { left: 25%; top: 30%; transform: rotate(-8deg); opacity: 1; }
  75% { left: 55%; top: 65%; transform: rotate(10deg); opacity: 1; }
}

@keyframes shuffle-4 {
  0%, 100% { left: 60%; top: 45%; transform: rotate(8deg); opacity: 1; }
  25% { left: 30%; top: 40%; transform: rotate(-6deg); opacity: 1; }
  50% { left: 70%; top: 60%; transform: rotate(14deg); opacity: 1; }
  75% { left: 35%; top: 50%; transform: rotate(-10deg); opacity: 1; }
}

@keyframes shuffle-5 {
  0%, 100% { left: 45%; top: 25%; transform: rotate(-4deg); opacity: 1; }
  25% { left: 65%; top: 65%; transform: rotate(11deg); opacity: 1; }
  50% { left: 30%; top: 45%; transform: rotate(-7deg); opacity: 1; }
  75% { left: 70%; top: 35%; transform: rotate(3deg); opacity: 1; }
}

@keyframes shuffle-6 {
  0%, 100% { left: 35%; top: 60%; transform: rotate(10deg); opacity: 1; }
  25% { left: 55%; top: 35%; transform: rotate(-9deg); opacity: 1; }
  50% { left: 65%; top: 55%; transform: rotate(5deg); opacity: 1; }
  75% { left: 40%; top: 40%; transform: rotate(-13deg); opacity: 1; }
}

@keyframes shuffle-7 {
  0%, 100% { left: 55%; top: 35%; transform: rotate(-7deg); opacity: 1; }
  25% { left: 40%; top: 65%; transform: rotate(8deg); opacity: 1; }
  50% { left: 30%; top: 50%; transform: rotate(-4deg); opacity: 1; }
  75% { left: 60%; top: 30%; transform: rotate(12deg); opacity: 1; }
}

@keyframes shuffle-8 {
  0%, 100% { left: 50%; top: 50%; transform: rotate(13deg); opacity: 1; }
  25% { left: 70%; top: 40%; transform: rotate(-5deg); opacity: 1; }
  50% { left: 25%; top: 60%; transform: rotate(9deg); opacity: 1; }
  75% { left: 60%; top: 55%; transform: rotate(-11deg); opacity: 1; }
}

@keyframes shuffle-9 {
  0%, 100% { left: 55%; top: 60%; transform: rotate(-6deg); opacity: 1; }
  25% { left: 35%; top: 45%; transform: rotate(7deg); opacity: 1; }
  50% { left: 70%; top: 30%; transform: rotate(-3deg); opacity: 1; }
  75% { left: 40%; top: 70%; transform: rotate(10deg); opacity: 1; }
}

@keyframes shuffle-10 {
  0%, 100% { left: 30%; top: 50%; transform: rotate(5deg); opacity: 1; }
  25% { left: 55%; top: 55%; transform: rotate(-12deg); opacity: 1; }
  50% { left: 70%; top: 45%; transform: rotate(6deg); opacity: 1; }
  75% { left: 40%; top: 35%; transform: rotate(-8deg); opacity: 1; }
}

@keyframes shuffle-11 {
  0%, 100% { left: 60%; top: 60%; transform: rotate(-9deg); opacity: 1; }
  25% { left: 35%; top: 35%; transform: rotate(4deg); opacity: 1; }
  50% { left: 30%; top: 55%; transform: rotate(11deg); opacity: 1; }
  75% { left: 65%; top: 40%; transform: rotate(-7deg); opacity: 1; }
}

@keyframes shuffle-12 {
  0%, 100% { left: 45%; top: 35%; transform: rotate(12deg); opacity: 1; }
  25% { left: 65%; top: 55%; transform: rotate(-6deg); opacity: 1; }
  50% { left: 35%; top: 65%; transform: rotate(8deg); opacity: 1; }
  75% { left: 60%; top: 45%; transform: rotate(-10deg); opacity: 1; }
}

@keyframes shuffle-13 {
  0%, 100% { left: 55%; top: 45%; transform: rotate(-3deg); opacity: 1; }
  25% { left: 35%; top: 50%; transform: rotate(9deg); opacity: 1; }
  50% { left: 70%; top: 60%; transform: rotate(-5deg); opacity: 1; }
  75% { left: 40%; top: 30%; transform: rotate(7deg); opacity: 1; }
}

@keyframes shuffle-14 {
  0%, 100% { left: 40%; top: 45%; transform: rotate(7deg); opacity: 1; }
  25% { left: 60%; top: 40%; transform: rotate(-8deg); opacity: 1; }
  50% { left: 70%; top: 30%; transform: rotate(13deg); opacity: 1; }
  75% { left: 35%; top: 60%; transform: rotate(-4deg); opacity: 1; }
}

@keyframes shuffle-15 {
  0%, 100% { left: 55%; top: 55%; transform: rotate(-10deg); opacity: 1; }
  25% { left: 40%; top: 65%; transform: rotate(5deg); opacity: 1; }
  50% { left: 30%; top: 45%; transform: rotate(-6deg); opacity: 1; }
  75% { left: 65%; top: 50%; transform: rotate(8deg); opacity: 1; }
}

@keyframes shuffle-16 {
  0%, 100% { left: 45%; top: 55%; transform: rotate(4deg); opacity: 1; }
  25% { left: 70%; top: 45%; transform: rotate(-11deg); opacity: 1; }
  50% { left: 55%; top: 35%; transform: rotate(6deg); opacity: 1; }
  75% { left: 40%; top: 65%; transform: rotate(-5deg); opacity: 1; }
}

@keyframes shuffle-17 {
  0%, 100% { left: 50%; top: 30%; transform: rotate(-7deg); opacity: 1; }
  25% { left: 35%; top: 60%; transform: rotate(10deg); opacity: 1; }
  50% { left: 65%; top: 50%; transform: rotate(-3deg); opacity: 1; }
  75% { left: 40%; top: 40%; transform: rotate(9deg); opacity: 1; }
}

@keyframes shuffle-18 {
  0%, 100% { left: 35%; top: 60%; transform: rotate(11deg); opacity: 1; }
  25% { left: 60%; top: 30%; transform: rotate(-9deg); opacity: 1; }
  50% { left: 70%; top: 55%; transform: rotate(4deg); opacity: 1; }
  75% { left: 40%; top: 45%; transform: rotate(-12deg); opacity: 1; }
}

@keyframes shuffle-19 {
  0%, 100% { left: 60%; top: 45%; transform: rotate(-5deg); opacity: 1; }
  25% { left: 35%; top: 50%; transform: rotate(8deg); opacity: 1; }
  50% { left: 30%; top: 55%; transform: rotate(-6deg); opacity: 1; }
  75% { left: 65%; top: 60%; transform: rotate(7deg); opacity: 1; }
}

@keyframes shuffle-20 {
  0%, 100% { left: 50%; top: 40%; transform: rotate(6deg); opacity: 1; }
  25% { left: 65%; top: 65%; transform: rotate(-7deg); opacity: 1; }
  50% { left: 40%; top: 30%; transform: rotate(12deg); opacity: 1; }
  75% { left: 55%; top: 55%; transform: rotate(-4deg); opacity: 1; }
}

@keyframes shuffle-21 {
  0%, 100% { left: 55%; top: 30%; transform: rotate(-8deg); opacity: 1; }
  25% { left: 35%; top: 50%; transform: rotate(5deg); opacity: 1; }
  50% { left: 70%; top: 55%; transform: rotate(-10deg); opacity: 1; }
  75% { left: 40%; top: 65%; transform: rotate(9deg); opacity: 1; }
}

@keyframes shuffle-22 {
  0%, 100% { left: 40%; top: 55%; transform: rotate(9deg); opacity: 1; }
  25% { left: 60%; top: 45%; transform: rotate(-6deg); opacity: 1; }
  50% { left: 70%; top: 40%; transform: rotate(7deg); opacity: 1; }
  75% { left: 35%; top: 35%; transform: rotate(-11deg); opacity: 1; }
}

@keyframes shuffle-23 {
  0%, 100% { left: 60%; top: 60%; transform: rotate(-4deg); opacity: 1; }
  25% { left: 45%; top: 40%; transform: rotate(11deg); opacity: 1; }
  50% { left: 30%; top: 65%; transform: rotate(-5deg); opacity: 1; }
  75% { left: 65%; top: 50%; transform: rotate(8deg); opacity: 1; }
}

@keyframes shuffle-24 {
  0%, 100% { left: 40%; top: 30%; transform: rotate(10deg); opacity: 1; }
  25% { left: 70%; top: 55%; transform: rotate(-8deg); opacity: 1; }
  50% { left: 55%; top: 50%; transform: rotate(6deg); opacity: 1; }
  75% { left: 65%; top: 65%; transform: rotate(-9deg); opacity: 1; }
}

@keyframes shuffle-25 {
  0%, 100% { left: 55%; top: 50%; transform: rotate(-12deg); opacity: 1; }
  25% { left: 30%; top: 45%; transform: rotate(7deg); opacity: 1; }
  50% { left: 70%; top: 35%; transform: rotate(-3deg); opacity: 1; }
  75% { left: 40%; top: 60%; transform: rotate(13deg); opacity: 1; }
}

@keyframes shuffle-26 {
  0%, 100% { left: 45%; top: 50%; transform: rotate(3deg); opacity: 1; }
  25% { left: 60%; top: 60%; transform: rotate(-10deg); opacity: 1; }
  50% { left: 70%; top: 50%; transform: rotate(5deg); opacity: 1; }
  75% { left: 35%; top: 40%; transform: rotate(-7deg); opacity: 1; }
}

@keyframes shuffle-27 {
  0%, 100% { left: 60%; top: 50%; transform: rotate(-6deg); opacity: 1; }
  25% { left: 35%; top: 55%; transform: rotate(9deg); opacity: 1; }
  50% { left: 30%; top: 35%; transform: rotate(-8deg); opacity: 1; }
  75% { left: 65%; top: 55%; transform: rotate(4deg); opacity: 1; }
}

@keyframes shuffle-28 {
  0%, 100% { left: 55%; top: 55%; transform: rotate(8deg); opacity: 1; }
  25% { left: 70%; top: 40%; transform: rotate(-5deg); opacity: 1; }
  50% { left: 40%; top: 65%; transform: rotate(10deg); opacity: 1; }
  75% { left: 60%; top: 45%; transform: rotate(-11deg); opacity: 1; }
}

@keyframes shuffle-29 {
  0%, 100% { left: 35%; top: 45%; transform: rotate(-12deg); opacity: 1; }
  25% { left: 70%; top: 50%; transform: rotate(5deg); opacity: 1; }
  50% { left: 40%; top: 70%; transform: rotate(-8deg); opacity: 1; }
  75% { left: 65%; top: 30%; transform: rotate(10deg); opacity: 1; }
}

@keyframes shuffle-30 {
  0%, 100% { left: 55%; top: 55%; transform: rotate(7deg); opacity: 1; }
  25% { left: 40%; top: 35%; transform: rotate(-9deg); opacity: 1; }
  50% { left: 70%; top: 50%; transform: rotate(6deg); opacity: 1; }
  75% { left: 35%; top: 60%; transform: rotate(-4deg); opacity: 1; }
}

@keyframes shuffle-31 {
  0%, 100% { left: 50%; top: 45%; transform: rotate(-5deg); opacity: 1; }
  25% { left: 30%; top: 55%; transform: rotate(12deg); opacity: 1; }
  50% { left: 65%; top: 55%; transform: rotate(-7deg); opacity: 1; }
  75% { left: 40%; top: 40%; transform: rotate(8deg); opacity: 1; }
}

@keyframes shuffle-32 {
  0%, 100% { left: 45%; top: 60%; transform: rotate(11deg); opacity: 1; }
  25% { left: 60%; top: 50%; transform: rotate(-6deg); opacity: 1; }
  50% { left: 35%; top: 35%; transform: rotate(9deg); opacity: 1; }
  75% { left: 65%; top: 55%; transform: rotate(-10deg); opacity: 1; }
}

@keyframes shuffle-33 {
  0%, 100% { left: 60%; top: 45%; transform: rotate(-8deg); opacity: 1; }
  25% { left: 40%; top: 55%; transform: rotate(4deg); opacity: 1; }
  50% { left: 30%; top: 50%; transform: rotate(13deg); opacity: 1; }
  75% { left: 65%; top: 65%; transform: rotate(-3deg); opacity: 1; }
}

@keyframes shuffle-34 {
  0%, 100% { left: 50%; top: 50%; transform: rotate(6deg); opacity: 1; }
  25% { left: 65%; top: 60%; transform: rotate(-11deg); opacity: 1; }
  50% { left: 55%; top: 45%; transform: rotate(9deg); opacity: 1; }
  75% { left: 60%; top: 55%; transform: rotate(-5deg); opacity: 1; }
}

@keyframes shuffle-35 {
  0%, 100% { left: 55%; top: 60%; transform: rotate(-9deg); opacity: 1; }
  25% { left: 40%; top: 45%; transform: rotate(8deg); opacity: 1; }
  50% { left: 70%; top: 35%; transform: rotate(-6deg); opacity: 1; }
  75% { left: 45%; top: 55%; transform: rotate(10deg); opacity: 1; }
}

@keyframes shuffle-36 {
  0%, 100% { left: 40%; top: 50%; transform: rotate(5deg); opacity: 1; }
  25% { left: 60%; top: 55%; transform: rotate(-7deg); opacity: 1; }
  50% { left: 70%; top: 45%; transform: rotate(11deg); opacity: 1; }
  75% { left: 35%; top: 60%; transform: rotate(-4deg); opacity: 1; }
}

@keyframes shuffle-37 {
  0%, 100% { left: 55%; top: 45%; transform: rotate(-10deg); opacity: 1; }
  25% { left: 35%; top: 65%; transform: rotate(6deg); opacity: 1; }
  50% { left: 30%; top: 55%; transform: rotate(-8deg); opacity: 1; }
  75% { left: 60%; top: 40%; transform: rotate(9deg); opacity: 1; }
}

@keyframes shuffle-38 {
  0%, 100% { left: 50%; top: 35%; transform: rotate(7deg); opacity: 1; }
  25% { left: 70%; top: 55%; transform: rotate(-5deg); opacity: 1; }
  50% { left: 45%; top: 60%; transform: rotate(12deg); opacity: 1; }
  75% { left: 65%; top: 60%; transform: rotate(-6deg); opacity: 1; }
}

@keyframes shuffle-39 {
  0%, 100% { left: 45%; top: 50%; transform: rotate(-4deg); opacity: 1; }
  25% { left: 30%; top: 40%; transform: rotate(10deg); opacity: 1; }
  50% { left: 70%; top: 60%; transform: rotate(-9deg); opacity: 1; }
  75% { left: 35%; top: 45%; transform: rotate(5deg); opacity: 1; }
}

@keyframes shuffle-40 {
  0%, 100% { left: 60%; top: 55%; transform: rotate(9deg); opacity: 1; }
  25% { left: 35%; top: 55%; transform: rotate(-12deg); opacity: 1; }
  50% { left: 70%; top: 35%; transform: rotate(8deg); opacity: 1; }
  75% { left: 65%; top: 65%; transform: rotate(-3deg); opacity: 1; }
}

@keyframes shuffle-41 {
  0%, 100% { left: 35%; top: 40%; transform: rotate(-6deg); opacity: 1; }
  25% { left: 60%; top: 50%; transform: rotate(7deg); opacity: 1; }
  50% { left: 40%; top: 65%; transform: rotate(-5deg); opacity: 1; }
  75% { left: 65%; top: 40%; transform: rotate(11deg); opacity: 1; }
}

@keyframes shuffle-42 {
  0%, 100% { left: 60%; top: 55%; transform: rotate(8deg); opacity: 1; }
  25% { left: 35%; top: 45%; transform: rotate(-8deg); opacity: 1; }
  50% { left: 30%; top: 50%; transform: rotate(6deg); opacity: 1; }
  75% { left: 65%; top: 40%; transform: rotate(-10deg); opacity: 1; }
}

@keyframes shuffle-43 {
  0%, 100% { left: 50%; top: 55%; transform: rotate(-7deg); opacity: 1; }
  25% { left: 65%; top: 60%; transform: rotate(5deg); opacity: 1; }
  50% { left: 70%; top: 40%; transform: rotate(-4deg); opacity: 1; }
  75% { left: 45%; top: 50%; transform: rotate(9deg); opacity: 1; }
}

@keyframes shuffle-44 {
  0%, 100% { left: 50%; top: 45%; transform: rotate(4deg); opacity: 1; }
  25% { left: 30%; top: 50%; transform: rotate(-9deg); opacity: 1; }
  50% { left: 70%; top: 55%; transform: rotate(13deg); opacity: 1; }
  75% { left: 40%; top: 35%; transform: rotate(-6deg); opacity: 1; }
}

@keyframes shuffle-45 {
  0%, 100% { left: 40%; top: 60%; transform: rotate(-11deg); opacity: 1; }
  25% { left: 70%; top: 50%; transform: rotate(6deg); opacity: 1; }
  50% { left: 65%; top: 40%; transform: rotate(-7deg); opacity: 1; }
  75% { left: 45%; top: 55%; transform: rotate(8deg); opacity: 1; }
}

@keyframes shuffle-46 {
  0%, 100% { left: 55%; top: 40%; transform: rotate(5deg); opacity: 1; }
  25% { left: 35%; top: 55%; transform: rotate(-10deg); opacity: 1; }
  50% { left: 30%; top: 45%; transform: rotate(7deg); opacity: 1; }
  75% { left: 70%; top: 60%; transform: rotate(-5deg); opacity: 1; }
}

@keyframes shuffle-47 {
  0%, 100% { left: 40%; top: 45%; transform: rotate(-8deg); opacity: 1; }
  25% { left: 60%; top: 35%; transform: rotate(9deg); opacity: 1; }
  50% { left: 70%; top: 50%; transform: rotate(-6deg); opacity: 1; }
  75% { left: 35%; top: 60%; transform: rotate(10deg); opacity: 1; }
}

@keyframes shuffle-48 {
  0%, 100% { left: 60%; top: 60%; transform: rotate(10deg); opacity: 1; }
  25% { left: 35%; top: 50%; transform: rotate(-7deg); opacity: 1; }
  50% { left: 55%; top: 55%; transform: rotate(6deg); opacity: 1; }
  75% { left: 65%; top: 45%; transform: rotate(-12deg); opacity: 1; }
}

@keyframes shuffle-49 {
  0%, 100% { left: 40%; top: 50%; transform: rotate(-3deg); opacity: 1; }
  25% { left: 65%; top: 55%; transform: rotate(8deg); opacity: 1; }
  50% { left: 35%; top: 35%; transform: rotate(-9deg); opacity: 1; }
  75% { left: 60%; top: 55%; transform: rotate(7deg); opacity: 1; }
}

@keyframes shuffle-50 {
  0%, 100% { left: 60%; top: 50%; transform: rotate(7deg); opacity: 1; }
  25% { left: 35%; top: 60%; transform: rotate(-5deg); opacity: 1; }
  50% { left: 30%; top: 55%; transform: rotate(11deg); opacity: 1; }
  75% { left: 65%; top: 40%; transform: rotate(-8deg); opacity: 1; }
}

@keyframes shuffle-51 {
  0%, 100% { left: 50%; top: 50%; transform: rotate(-6deg); opacity: 1; }
  25% { left: 60%; top: 40%; transform: rotate(10deg); opacity: 1; }
  50% { left: 70%; top: 60%; transform: rotate(-4deg); opacity: 1; }
  75% { left: 40%; top: 55%; transform: rotate(9deg); opacity: 1; }
}

@keyframes shuffle-52 {
  0%, 100% { left: 40%; top: 55%; transform: rotate(9deg); opacity: 1; }
  25% { left: 60%; top: 50%; transform: rotate(-11deg); opacity: 1; }
  50% { left: 35%; top: 60%; transform: rotate(6deg); opacity: 1; }
  75% { left: 65%; top: 45%; transform: rotate(-7deg); opacity: 1; }
}

@keyframes shuffle-53 {
  0%, 100% { left: 60%; top: 35%; transform: rotate(-8deg); opacity: 1; }
  25% { left: 35%; top: 55%; transform: rotate(7deg); opacity: 1; }
  50% { left: 30%; top: 60%; transform: rotate(-5deg); opacity: 1; }
  75% { left: 65%; top: 60%; transform: rotate(12deg); opacity: 1; }
}

@keyframes shuffle-54 {
  0%, 100% { left: 50%; top: 50%; transform: rotate(8deg); opacity: 1; }
  25% { left: 70%; top: 55%; transform: rotate(-6deg); opacity: 1; }
  50% { left: 40%; top: 40%; transform: rotate(13deg); opacity: 1; }
  75% { left: 60%; top: 35%; transform: rotate(-9deg); opacity: 1; }
}

.shuffle-card-1 { animation: shuffle-1 3s ease-in-out infinite; }
.shuffle-card-2 { animation: shuffle-2 3.2s ease-in-out infinite; }
.shuffle-card-3 { animation: shuffle-3 2.8s ease-in-out infinite; }
.shuffle-card-4 { animation: shuffle-4 3.1s ease-in-out infinite; }
.shuffle-card-5 { animation: shuffle-5 2.9s ease-in-out infinite; }
.shuffle-card-6 { animation: shuffle-6 3.3s ease-in-out infinite; }
.shuffle-card-7 { animation: shuffle-7 2.7s ease-in-out infinite; }
.shuffle-card-8 { animation: shuffle-8 3s ease-in-out infinite; }
.shuffle-card-9 { animation: shuffle-9 3.4s ease-in-out infinite; }
.shuffle-card-10 { animation: shuffle-10 2.6s ease-in-out infinite; }
.shuffle-card-11 { animation: shuffle-11 3.2s ease-in-out infinite; }
.shuffle-card-12 { animation: shuffle-12 2.8s ease-in-out infinite; }
.shuffle-card-13 { animation: shuffle-13 3s ease-in-out infinite; }
.shuffle-card-14 { animation: shuffle-14 3.1s ease-in-out infinite; }
.shuffle-card-15 { animation: shuffle-15 2.9s ease-in-out infinite; }
.shuffle-card-16 { animation: shuffle-16 3.3s ease-in-out infinite; }
.shuffle-card-17 { animation: shuffle-17 2.7s ease-in-out infinite; }
.shuffle-card-18 { animation: shuffle-18 3s ease-in-out infinite; }
.shuffle-card-19 { animation: shuffle-19 3.4s ease-in-out infinite; }
.shuffle-card-20 { animation: shuffle-20 2.6s ease-in-out infinite; }
.shuffle-card-21 { animation: shuffle-21 3.2s ease-in-out infinite; }
.shuffle-card-22 { animation: shuffle-22 2.8s ease-in-out infinite; }
.shuffle-card-23 { animation: shuffle-23 3s ease-in-out infinite; }
.shuffle-card-24 { animation: shuffle-24 3.1s ease-in-out infinite; }
.shuffle-card-25 { animation: shuffle-25 2.9s ease-in-out infinite; }
.shuffle-card-26 { animation: shuffle-26 3.3s ease-in-out infinite; }
.shuffle-card-27 { animation: shuffle-27 2.7s ease-in-out infinite; }
.shuffle-card-28 { animation: shuffle-28 3s ease-in-out infinite; }
.shuffle-card-29 { animation: shuffle-29 3.4s ease-in-out infinite; }
.shuffle-card-30 { animation: shuffle-30 2.6s ease-in-out infinite; }
.shuffle-card-31 { animation: shuffle-31 3.2s ease-in-out infinite; }
.shuffle-card-32 { animation: shuffle-32 2.8s ease-in-out infinite; }
.shuffle-card-33 { animation: shuffle-33 3s ease-in-out infinite; }
.shuffle-card-34 { animation: shuffle-34 3.1s ease-in-out infinite; }
.shuffle-card-35 { animation: shuffle-35 2.9s ease-in-out infinite; }
.shuffle-card-36 { animation: shuffle-36 3.3s ease-in-out infinite; }
.shuffle-card-37 { animation: shuffle-37 2.7s ease-in-out infinite; }
.shuffle-card-38 { animation: shuffle-38 3s ease-in-out infinite; }
.shuffle-card-39 { animation: shuffle-39 3.4s ease-in-out infinite; }
.shuffle-card-40 { animation: shuffle-40 2.6s ease-in-out infinite; }
.shuffle-card-41 { animation: shuffle-41 3.2s ease-in-out infinite; }
.shuffle-card-42 { animation: shuffle-42 2.8s ease-in-out infinite; }
.shuffle-card-43 { animation: shuffle-43 3s ease-in-out infinite; }
.shuffle-card-44 { animation: shuffle-44 3.1s ease-in-out infinite; }
.shuffle-card-45 { animation: shuffle-45 2.9s ease-in-out infinite; }
.shuffle-card-46 { animation: shuffle-46 3.3s ease-in-out infinite; }
.shuffle-card-47 { animation: shuffle-47 2.7s ease-in-out infinite; }
.shuffle-card-48 { animation: shuffle-48 3s ease-in-out infinite; }
.shuffle-card-49 { animation: shuffle-49 3.4s ease-in-out infinite; }
.shuffle-card-50 { animation: shuffle-50 2.6s ease-in-out infinite; }
.shuffle-card-51 { animation: shuffle-51 3.2s ease-in-out infinite; }
.shuffle-card-52 { animation: shuffle-52 2.8s ease-in-out infinite; }
.shuffle-card-53 { animation: shuffle-53 3s ease-in-out infinite; }
.shuffle-card-54 { animation: shuffle-54 3.1s ease-in-out infinite; }

.rotate-180 {
  transform: rotate(180deg);
}
</style>
