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

const STORAGE_KEY_REMINDERS = 'tree-app-reminders'
const STORAGE_KEY_SETTINGS = 'tree-app-reminder-settings'

export const useReminderStore = defineStore('reminder', () => {
  const loadFromStorage = (): Reminder[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEY_REMINDERS)
      if (data) {
        const parsed = JSON.parse(data)
        if (Array.isArray(parsed)) {
          return parsed
        }
      }
    } catch (error) {
      console.error('Failed to load reminders from localStorage:', error)
    }
    return []
  }

  const loadSettingsFromStorage = () => {
    try {
      const data = localStorage.getItem(STORAGE_KEY_SETTINGS)
      if (data) {
        const parsed = JSON.parse(data)
        return {
          remindDayOf: parsed.remindDayOf ?? true,
          remind1DayBefore: parsed.remind1DayBefore ?? false,
          remind3DaysBefore: parsed.remind3DaysBefore ?? false
        }
      }
    } catch (error) {
      console.error('Failed to load reminder settings from localStorage:', error)
    }
    return { remindDayOf: true, remind1DayBefore: false, remind3DaysBefore: false }
  }

  const saveToStorage = (reminders: Reminder[]): boolean => {
    try {
      localStorage.setItem(STORAGE_KEY_REMINDERS, JSON.stringify(reminders))
      return true
    } catch (error) {
      console.error('Failed to save reminders to localStorage:', error)
      return false
    }
  }

  const saveSettingsToStorage = (settings: { remindDayOf: boolean; remind1DayBefore: boolean; remind3DaysBefore: boolean }) => {
    try {
      localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings))
    } catch (error) {
      console.error('Failed to save reminder settings to localStorage:', error)
    }
  }

  const storedSettings = loadSettingsFromStorage()

  const reminders = ref<Reminder[]>(loadFromStorage())

  const remindDayOf = ref(storedSettings.remindDayOf)
  const remind1DayBefore = ref(storedSettings.remind1DayBefore)
  const remind3DaysBefore = ref(storedSettings.remind3DaysBefore)

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

  const addReminder = async (reminder: Omit<Reminder, 'id' | 'createdAt'>, userId?: number): Promise<boolean> => {
    const newReminder: Reminder = {
      ...reminder,
      id: Date.now().toString(),
      createdAt: Date.now()
    }
    reminders.value.push(newReminder)
    
    let saved = saveToStorage(reminders.value)
    
    if (userId) {
      try {
        const response = await fetch('/.netlify/functions/api/reminders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId,
            date: reminder.date,
            title: reminder.title,
            description: reminder.description,
            category: reminder.category,
            remindDayOf: reminder.remindDayOf,
            remind1DayBefore: reminder.remind1DayBefore,
            remind3DaysBefore: reminder.remind3DaysBefore
          })
        })
        
        if (response.ok) {
          const data = await response.json()
          newReminder.id = data.id.toString()
          saveToStorage(reminders.value)
          console.log('[Reminder Store] Added reminder to database:', data.message)
        } else {
          console.warn('[Reminder Store] Failed to save to database, using localStorage')
        }
      } catch (error) {
        console.warn('[Reminder Store] Database save failed, using localStorage:', error)
      }
    }
    
    console.log('[Reminder Store] Added reminder, saved:', saved)
    return saved
  }

  const updateReminder = (id: string, updates: Partial<Reminder>) => {
    const index = reminders.value.findIndex(r => r.id === id)
    if (index !== -1) {
      reminders.value[index] = { ...reminders.value[index], ...updates }
      saveToStorage(reminders.value)
    }
  }

  const removeReminder = async (id: string, userId?: number) => {
    const index = reminders.value.findIndex(r => r.id === id)
    if (index !== -1) {
      reminders.value.splice(index, 1)
      saveToStorage(reminders.value)
      
      if (userId) {
        try {
          const response = await fetch('/.netlify/functions/api/reminders', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, userId })
          })
          
          if (response.ok) {
            console.log('[Reminder Store] Deleted reminder from database')
          } else {
            console.warn('[Reminder Store] Failed to delete from database')
          }
        } catch (error) {
          console.warn('[Reminder Store] Database delete failed:', error)
        }
      }
    }
  }

  const clearAllReminders = () => {
    reminders.value = []
    saveToStorage(reminders.value)
  }

  const loadRemindersFromDatabase = async (userId: number): Promise<boolean> => {
    try {
      const response = await fetch(`/.netlify/functions/api/reminders?userId=${userId}`)
      
      if (response.ok) {
        const data = await response.json()
        if (Array.isArray(data)) {
          const convertedReminders: Reminder[] = data.map(item => ({
            id: String(item.id),
            date: item.date,
            title: item.title,
            description: item.description || '',
            category: (item.category || 'daily') as 'birthday' | 'anniversary' | 'personal' | 'daily',
            remindDayOf: item.remind_day_of || item.remindDayOf || false,
            remind1DayBefore: item.remind_1day_before || item.remind1DayBefore || false,
            remind3DaysBefore: item.remind_3days_before || item.remind3DaysBefore || false,
            createdAt: item.created_at ? new Date(item.created_at).getTime() : Date.now()
          }))
          reminders.value = convertedReminders
          saveToStorage(reminders.value)
          console.log('[Reminder Store] Loaded', convertedReminders.length, 'reminders from database')
          return true
        }
      } else {
        console.warn('[Reminder Store] Failed to load from database, using localStorage')
      }
    } catch (error) {
      console.warn('[Reminder Store] Database load failed, using localStorage:', error)
    }
    return false
  }

  const updateSettings = (settings: {
    remindDayOf?: boolean
    remind1DayBefore?: boolean
    remind3DaysBefore?: boolean
  }) => {
    if (settings.remindDayOf !== undefined) remindDayOf.value = settings.remindDayOf
    if (settings.remind1DayBefore !== undefined) remind1DayBefore.value = settings.remind1DayBefore
    if (settings.remind3DaysBefore !== undefined) remind3DaysBefore.value = settings.remind3DaysBefore
    saveSettingsToStorage({
      remindDayOf: remindDayOf.value,
      remind1DayBefore: remind1DayBefore.value,
      remind3DaysBefore: remind3DaysBefore.value
    })
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
    clearAllReminders,
    loadRemindersFromDatabase,
    updateSettings
  }
})