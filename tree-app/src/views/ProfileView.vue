<template>
  <div class="profile-container min-h-screen bg-white px-6 py-8">
    <div class="header flex justify-between items-center mb-10">
      <button @click="goBack">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
        </svg>
      </button>
      <h1 class="text-xl font-bold">{{ t('profile.title') }}</h1>
      <div class="w-6"></div>
    </div>

    <div class="profile-info mb-10">
      <div class="user-avatar w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg class="w-10 h-10 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
        </svg>
      </div>
      <p class="text-center font-semibold text-lg">{{ userStore.userInfo?.name || t('profile.user') }}</p>
      <p class="text-center text-sm text-gray-500">{{ userStore.isFreeUser ? t('profile.free') : t('profile.member') }}</p>
    </div>

    <div class="menu-section space-y-3">
      <div @click="showEditInfo = true" class="menu-item flex items-center justify-between p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100">
        <div class="flex items-center">
          <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
          </svg>
          <span>{{ t('profile.myInfo') }}</span>
        </div>
        <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
        </svg>
      </div>

      <div @click="goToMembership" class="menu-item flex items-center justify-between p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100">
        <div class="flex items-center">
          <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"></path>
          </svg>
          <span>{{ t('profile.membership') }}</span>
        </div>
        <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
        </svg>
      </div>

      <div @click="confirmClearData" class="menu-item flex items-center justify-between p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100">
        <div class="flex items-center">
          <svg class="w-5 h-5 mr-3 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
          </svg>
          <span class="text-red-500">{{ t('profile.clearData') }}</span>
        </div>
        <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
        </svg>
      </div>
    </div>

    <div class="reminder-settings mt-10 p-5 bg-gray-50 rounded-xl">
      <h3 class="font-semibold mb-4">提醒设置</h3>
      <div class="space-y-4">
        <div class="flex items-center justify-between">
          <span class="text-gray-600">当天提醒</span>
          <button 
            @click="reminderStore.updateSettings({ remindDayOf: !reminderStore.remindDayOf })"
            :class="[
              'w-12 h-6 rounded-full transition-colors relative',
              reminderStore.remindDayOf ? 'bg-gray-800' : 'bg-gray-300'
            ]"
          >
            <span 
              :class="[
                'absolute top-1 w-4 h-4 bg-white rounded-full transition-transform',
                reminderStore.remindDayOf ? 'left-7' : 'left-1'
              ]"
            ></span>
          </button>
        </div>
        <div class="flex items-center justify-between">
          <span class="text-gray-600">提前1天提醒</span>
          <button 
            @click="reminderStore.updateSettings({ remind1DayBefore: !reminderStore.remind1DayBefore })"
            :class="[
              'w-12 h-6 rounded-full transition-colors relative',
              reminderStore.remind1DayBefore ? 'bg-gray-800' : 'bg-gray-300'
            ]"
          >
            <span 
              :class="[
                'absolute top-1 w-4 h-4 bg-white rounded-full transition-transform',
                reminderStore.remind1DayBefore ? 'left-7' : 'left-1'
              ]"
            ></span>
          </button>
        </div>
        <div class="flex items-center justify-between">
          <span class="text-gray-600">提前3天提醒</span>
          <button 
            @click="reminderStore.updateSettings({ remind3DaysBefore: !reminderStore.remind3DaysBefore })"
            :class="[
              'w-12 h-6 rounded-full transition-colors relative',
              reminderStore.remind3DaysBefore ? 'bg-gray-800' : 'bg-gray-300'
            ]"
          >
            <span 
              :class="[
                'absolute top-1 w-4 h-4 bg-white rounded-full transition-transform',
                reminderStore.remind3DaysBefore ? 'left-7' : 'left-1'
              ]"
            ></span>
          </button>
        </div>
      </div>
    </div>

    <div class="usage-stats mt-10 p-5 bg-gray-50 rounded-xl">
      <h3 class="font-semibold mb-4">{{ t('profile.usageStats') }}</h3>
      <div class="space-y-3">
        <div class="flex justify-between">
          <span class="text-gray-600">{{ t('profile.emotionCompanion') }}</span>
          <span class="text-gray-800">{{ userStore.usageStats.emotionCompanion }} {{ t('profile.times') }}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-gray-600">{{ t('profile.loveAssistant') }}</span>
          <span class="text-gray-800">{{ userStore.usageStats.loveAssistant }} {{ t('profile.times') }}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-gray-600">{{ t('profile.treeHole') }}</span>
          <span class="text-gray-800">{{ userStore.usageStats.treeHole }} {{ t('profile.times') }}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-gray-600">{{ t('profile.tarot') }}</span>
          <span class="text-gray-800">{{ userStore.usageStats.tarot }} {{ t('profile.times') }}</span>
        </div>
      </div>
    </div>

    <div v-if="showEditInfo" class="edit-modal fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-6">
      <div class="bg-white rounded-2xl w-full max-w-sm p-6">
        <h2 class="text-xl font-bold mb-6">{{ t('profile.editInfo') }}</h2>
        <div class="space-y-4 mb-6">
          <div>
            <label class="block text-sm text-gray-600 mb-2">{{ t('profile.name') }}</label>
            <input v-model="editForm.name" type="text" class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-black" />
          </div>
          <div>
            <label class="block text-sm text-gray-600 mb-2">{{ t('profile.gender') }}</label>
            <div class="flex gap-2">
              <button 
                v-for="g in genderOptions" 
                :key="g.key"
                @click="editForm.gender = g.value"
                :class="[
                  'flex-1 py-2 border rounded-lg text-sm',
                  editForm.gender === g.value 
                    ? 'bg-black text-white border-black' 
                    : 'border-gray-300'
                ]"
              >
                {{ g.label }}
              </button>
            </div>
          </div>
        </div>
        <div class="flex gap-3">
          <button @click="showEditInfo = false" class="flex-1 py-3 border border-gray-300 rounded-full text-gray-700">{{ t('general.cancel') }}</button>
          <button @click="saveEditInfo" class="flex-1 py-3 bg-black text-white rounded-full">{{ t('general.save') }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useUserStore } from '../stores/user'
import { useReminderStore } from '../stores/reminder'

const { t } = useI18n()
const router = useRouter()
const userStore = useUserStore()
const reminderStore = useReminderStore()

const showEditInfo = ref(false)

const genderOptions = computed(() => [
  { key: 'male', value: '男' as const, label: t('profile.male') },
  { key: 'female', value: '女' as const, label: t('profile.female') },
  { key: 'preferNotToSay', value: '不愿透露' as const, label: t('profile.preferNotToSay') }
])

const editForm = reactive({
  name: userStore.userInfo?.name || '',
  gender: userStore.userInfo?.gender || '不愿透露' as const
})

const confirmClearData = () => {
  if (confirm(t('profile.confirmClear'))) {
    userStore.clearAllData()
    router.push('/')
  }
}

const saveEditInfo = () => {
  userStore.updateUserInfo(editForm)
  showEditInfo.value = false
}

const goToMembership = () => {
  router.push('/payment')
}

const goBack = () => router.push('/home')
</script>
