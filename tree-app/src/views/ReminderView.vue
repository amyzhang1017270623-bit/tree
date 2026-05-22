<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useReminderStore, type Reminder } from '@/stores/reminder'

const router = useRouter()
const reminderStore = useReminderStore()

const editingReminder = ref<Reminder | null>(null)
const editingDate = ref('')
const editingTitle = ref('')
const editingCategory = ref('')

const categories = [
  { value: 'birthday', label: '生日' },
  { value: 'anniversary', label: '纪念日' },
  { value: 'personal', label: '私事' },
  { value: 'daily', label: '日常' }
]

const editReminder = (reminder: Reminder) => {
  editingReminder.value = reminder
  editingDate.value = reminder.date
  editingTitle.value = reminder.title
  editingCategory.value = reminder.category
}

const saveEdit = () => {
  if (editingReminder.value) {
    reminderStore.updateReminder(editingReminder.value.id, {
      date: editingDate.value,
      title: editingTitle.value,
      category: editingCategory.value as 'birthday' | 'anniversary' | 'personal' | 'daily'
    })
    cancelEdit()
  }
}

const cancelEdit = () => {
  editingReminder.value = null
  editingDate.value = ''
  editingTitle.value = ''
  editingCategory.value = ''
}

const getDaysUntil = (dateString: string): number => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const target = new Date(dateString)
  target.setHours(0, 0, 0, 0)
  const diff = target.getTime() - today.getTime()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}
</script>

<template>
  <div class="min-h-screen bg-white">
    <!-- Header -->
    <header class="sticky top-0 z-50 bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between">
      <button @click="router.back()" class="w-8 h-8 flex items-center justify-center">
        <svg class="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <h1 class="text-lg font-semibold text-gray-800">日程列表</h1>
      <div class="w-8"></div>
    </header>

    <!-- Empty State -->
    <div v-if="reminderStore.reminders.length === 0" class="flex flex-col items-center justify-center h-[calc(100vh-60px)]">
      <svg class="w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
      <p class="text-gray-400 text-sm">暂无日程</p>
    </div>

    <!-- Reminder List -->
    <div v-else class="divide-y divide-gray-100">
      <div 
        v-for="reminder in reminderStore.upcomingReminders" 
        :key="reminder.id"
        class="px-4 py-4 hover:bg-gray-50 transition-colors"
      >
        <!-- Edit Mode -->
        <div v-if="editingReminder?.id === reminder.id" class="space-y-3">
          <input 
            v-model="editingDate"
            type="date"
            class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-gray-400"
          />
          <input 
            v-model="editingTitle"
            type="text"
            placeholder="输入标题"
            class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-gray-400"
          />
          <div class="flex gap-2">
            <button
              v-for="cat in categories"
              :key="cat.value"
              @click="editingCategory = cat.value"
              :class="[
                'flex-1 px-3 py-2 text-sm rounded-lg transition-colors',
                editingCategory === cat.value ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-600'
              ]"
            >
              {{ cat.label }}
            </button>
          </div>
          <div class="flex gap-2">
            <button 
              @click="saveEdit"
              class="flex-1 px-4 py-2 bg-gray-800 text-white text-sm rounded-lg"
            >
              保存
            </button>
            <button 
              @click="cancelEdit"
              class="flex-1 px-4 py-2 bg-gray-100 text-gray-600 text-sm rounded-lg"
            >
              取消
            </button>
          </div>
        </div>

        <!-- Display Mode -->
        <div v-else class="flex items-start justify-between">
          <div class="flex-1">
            <div class="flex items-center gap-2 mb-1">
              <span class="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded">{{ reminderStore.categoryLabels[reminder.category] }}</span>
              <span class="text-sm text-gray-400">
                {{ getDaysUntil(reminder.date) === 0 ? '今天' : getDaysUntil(reminder.date) === 1 ? '明天' : `${getDaysUntil(reminder.date)}天后` }}
              </span>
            </div>
            <div class="text-gray-800 font-medium">{{ reminder.title }}</div>
            <div class="text-sm text-gray-400 mt-1">{{ reminder.date }}</div>
          </div>
          <div class="flex items-center gap-3">
            <button 
              @click="editReminder(reminder)"
              class="text-gray-400 hover:text-gray-800 transition-colors"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            <button 
              @click="reminderStore.removeReminder(reminder.id)"
              class="text-gray-400 hover:text-red-500 transition-colors"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>