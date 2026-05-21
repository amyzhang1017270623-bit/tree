import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface Reminder {
  id: string
  date: string
  title: string
  description: string
  category: 'birthday' | 'anniversary' | 'personal' | 'daily'
  remindDayOf: boolean
  remind1DayBefore: boolean
  remind3DaysBefore: boolean
  createdAt: number
}

export const useReminderStore = defineStore('reminder', () => {
  const reminders = ref<Reminder[]>([])

  const remindDayOf = ref(true)
  const remind1DayBefore = ref(false)
  const remind3DaysBefore = ref(false)

  const categoryLabels: Record<string, string> = {
    birthday: '生日',
    anniversary: '纪念日',
    personal: '私事',
    daily: '日常'
  }

  const upcomingReminders = computed(() => {
    const now = new Date()
    return reminders.value
      .filter(r => new Date(r.date) >= now)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  })

  const addReminder = (reminder: Omit<Reminder, 'id' | 'createdAt'>) => {
    reminders.value.push({
      ...reminder,
      id: Date.now().toString(),
      createdAt: Date.now()
    })
  }

  const updateReminder = (id: string, updates: Partial<Reminder>) => {
    const index = reminders.value.findIndex(r => r.id === id)
    if (index !== -1) {
      reminders.value[index] = { ...reminders.value[index], ...updates }
    }
  }

  const removeReminder = (id: string) => {
    const index = reminders.value.findIndex(r => r.id === id)
    if (index !== -1) {
      reminders.value.splice(index, 1)
    }
  }

  const updateSettings = (settings: {
    remindDayOf?: boolean
    remind1DayBefore?: boolean
    remind3DaysBefore?: boolean
  }) => {
    if (settings.remindDayOf !== undefined) remindDayOf.value = settings.remindDayOf
    if (settings.remind1DayBefore !== undefined) remind1DayBefore.value = settings.remind1DayBefore
    if (settings.remind3DaysBefore !== undefined) remind3DaysBefore.value = settings.remind3DaysBefore
  }

  return {
    reminders,
    remindDayOf,
    remind1DayBefore,
    remind3DaysBefore,
    categoryLabels,
    upcomingReminders,
    addReminder,
    updateReminder,
    removeReminder,
    updateSettings
  }
})