<template>
  <div class="register-container min-h-screen bg-white">
    <header class="sticky top-0 z-50 bg-white border-b border-gray-100 px-6 py-4">
      <div class="flex items-center justify-between">
        <button @click="goBack" class="w-8 h-8 flex items-center justify-center">
          <svg class="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
          </svg>
        </button>
        <div class="text-center">
          <h1 class="text-xl font-bold">完善你的信息</h1>
          <p class="text-xs text-gray-400">Complete your info</p>
        </div>
        <div class="w-8"></div>
      </div>
    </header>

    <div class="register-form px-6 py-8">

      <div class="mb-6">
        <label class="block text-gray-700 mb-2">姓名 / Name</label>
        <input 
          v-model="form.name"
          type="text"
          autocomplete="name"
          inputmode="text"
          class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-black"
          placeholder="请输入你的姓名 / Enter your name"
        />
      </div>

      <div class="mb-6">
        <label class="block text-gray-700 mb-2">性别 / Gender</label>
        <div class="flex gap-4">
          <button 
            @click="form.gender = '男'"
            :class="[
              'flex-1 py-3 border rounded-lg transition-colors flex flex-col items-center',
              form.gender === '男' 
                ? 'bg-black text-white border-black' 
                : 'bg-white text-black border-gray-300'
            ]"
          >
            <span>男</span>
            <span class="text-xs opacity-70">Male</span>
          </button>
          <button 
            @click="form.gender = '女'"
            :class="[
              'flex-1 py-3 border rounded-lg transition-colors flex flex-col items-center',
              form.gender === '女' 
                ? 'bg-black text-white border-black' 
                : 'bg-white text-black border-gray-300'
            ]"
          >
            <span>女</span>
            <span class="text-xs opacity-70">Female</span>
          </button>
          <button 
            @click="form.gender = '不愿透露'"
            :class="[
              'flex-1 py-3 border rounded-lg transition-colors flex flex-col items-center',
              form.gender === '不愿透露' 
                ? 'bg-black text-white border-black' 
                : 'bg-white text-black border-gray-300'
            ]"
          >
            <span>不愿透露</span>
            <span class="text-xs opacity-70">Prefer not to say</span>
          </button>
        </div>
      </div>

      <div class="mb-6">
        <label class="block text-gray-700 mb-2">出生日期 / Birth Date</label>
        <input 
          v-model="form.birthDate"
          type="date"
          inputmode="none"
          class="w-full h-12 px-4 border border-gray-300 rounded-lg focus:outline-none focus:border-black"
        />
      </div>

      <div class="mb-6">
        <label class="block text-gray-700 mb-2">出生时辰 / Birth Time</label>
        <select 
          v-model="form.birthTime"
          class="w-full h-12 px-4 border border-gray-300 rounded-lg focus:outline-none focus:border-black"
        >
          <option value="">请选择 / Please select</option>
          <option value="00:00-02:00">00:00-02:00</option>
          <option value="02:00-04:00">02:00-04:00</option>
          <option value="04:00-06:00">04:00-06:00</option>
          <option value="06:00-08:00">06:00-08:00</option>
          <option value="08:00-10:00">08:00-10:00</option>
          <option value="10:00-12:00">10:00-12:00</option>
          <option value="12:00-14:00">12:00-14:00</option>
          <option value="14:00-16:00">14:00-16:00</option>
          <option value="16:00-18:00">16:00-18:00</option>
          <option value="18:00-20:00">18:00-20:00</option>
          <option value="20:00-22:00">20:00-22:00</option>
          <option value="22:00-24:00">22:00-24:00</option>
        </select>
      </div>

      <div class="mb-8">
        <label class="block text-gray-700 mb-2">手机号 / Phone</label>
        <input 
          v-model="form.phone"
          type="tel"
          autocomplete="tel"
          inputmode="tel"
          class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-black"
          placeholder="请输入手机号 / Enter phone number"
        />
      </div>

      <button 
        @click="handleRegister"
        :disabled="!canRegister"
        :class="[
          'w-full py-4 rounded-full font-medium transition-colors flex flex-col items-center',
          canRegister 
            ? 'bg-black text-white hover:bg-gray-800' 
            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
        ]"
      >
        <span class="text-lg">完成注册</span>
        <span class="text-sm opacity-80">Complete Registration</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore, type UserInfo } from '../stores/user'

const router = useRouter()
const userStore = useUserStore()

const form = reactive<UserInfo>({
  name: '',
  gender: '不愿透露',
  birthDate: '',
  birthTime: '',
  phone: ''
})

const canRegister = computed(() => {
  return form.name && form.gender && form.birthDate && form.birthTime && form.phone
})

const goBack = () => {
  router.push('/')
}

const handleRegister = () => {
  if (!canRegister.value) return
  userStore.register({ ...form })
  router.push('/home')
}
</script>

<style scoped>
input[type="date"] {
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  min-width: 100%;
  box-sizing: border-box;
}

input[type="date"]::-webkit-calendar-picker-indicator {
  opacity: 1;
  cursor: pointer;
}
</style>
