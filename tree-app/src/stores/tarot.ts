import { defineStore } from 'pinia'
import { computed } from 'vue'
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

  const allCards = computed(() => {
    return locale.value === 'zh' ? zhCards.cards : enCards.cards
  })

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

  return {
    allCards,
    getCardsByType,
    getCardById
  }
})
