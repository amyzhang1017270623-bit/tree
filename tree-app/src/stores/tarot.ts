import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import zhCards from '@/assets/images/cards.json'
import enCards from '@/assets/images/cards_en.json'

export interface TarotCard {
  id: number
  name: string
  group: string
  image: string
  upright_keywords: string
  upright_meaning: string
  reversed_keywords: string
  reversed_meaning: string
  symbolism: string
  archetype: string
}

export const useTarotStore = defineStore('tarot', () => {
  const { locale } = useI18n()

  const shuffledOrder = ref<number[]>([])

  const allCards = computed(() => {
    return locale.value === 'zh' ? zhCards.cards : enCards.cards
  })

  const shuffleCards = () => {
    const cardIds = allCards.value.map((c: TarotCard) => c.id)
    for (let i = cardIds.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[cardIds[i], cardIds[j]] = [cardIds[j], cardIds[i]]
    }
    shuffledOrder.value = cardIds
  }

  const getCardsByType = (type: string) => {
    if (type === 'all') return allCards.value
    if (type === 'MajorArcana') return allCards.value.filter((c: TarotCard) => c.group === 'MajorArcana' || c.group === 'Major Arcana')
    if (type === 'Wands') return allCards.value.filter((c: TarotCard) => c.group === 'Wands')
    if (type === 'Cups') return allCards.value.filter((c: TarotCard) => c.group === 'Cups')
    if (type === 'Swords') return allCards.value.filter((c: TarotCard) => c.group === 'Swords')
    if (type === 'Pentacles') return allCards.value.filter((c: TarotCard) => c.group === 'Pentacles')
    return allCards.value
  }

  const getCardById = (id: number) => {
    return allCards.value.find((c: TarotCard) => c.id === id)
  }

  const getCardByShuffledIndex = (index: number) => {
    if (shuffledOrder.value.length === 0) {
      return allCards.value.find((c: TarotCard) => c.id === index)
    }
    
    const actualId = shuffledOrder.value[index - 1]
    return allCards.value.find((c: TarotCard) => c.id === actualId)
  }

  return {
    allCards,
    shuffledOrder,
    shuffleCards,
    getCardsByType,
    getCardById,
    getCardByShuffledIndex
  }
})
