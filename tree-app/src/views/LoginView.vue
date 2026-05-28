<template>
  <div class="login-container min-h-screen bg-white">
    <header class="sticky top-0 z-50 bg-white border-b border-gray-100 px-6 py-4">
      <div class="flex items-center justify-between">
        <button @click="goBack" class="w-8 h-8 flex items-center justify-center">
          <svg class="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
          </svg>
        </button>
        <div class="text-center">
          <h1 class="text-xl font-bold">欢迎使用</h1>
          <p class="text-xs text-gray-400">Welcome</p>
        </div>
        <div class="w-8"></div>
      </div>
    </header>

    <div class="login-form px-6 py-8">


      <div class="mb-6">
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

      <div class="mb-8">
        <label class="block text-gray-700 mb-2">密码 / Password</label>
        <input 
          v-model="form.password"
          type="password"
          autocomplete="current-password"
          inputmode="text"
          class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-black"
          placeholder="请输入密码 / Enter password"
        />
      </div>

      <button 
        @click="handleLogin"
        :disabled="!canLogin || loading"
        :class="[
          'w-full py-4 rounded-full font-medium transition-colors flex flex-col items-center',
          canLogin && !loading
            ? 'bg-black text-white hover:bg-gray-800' 
            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
        ]"
      >
        <span v-if="loading" class="flex items-center">
          <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          登录中...
        </span>
        <span v-else class="text-lg">登录</span>
        <span v-if="!loading" class="text-sm opacity-80">Login</span>
      </button>

      <div class="mt-6 text-center">
        <p class="text-gray-500">
          还没有账号？
          <button @click="goToRegister" class="text-black font-medium hover:underline">立即注册</button>
        </p>
      </div>

      <!-- 错误提示 -->
      <div v-if="errorMessage" class="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
        <p class="text-red-600 text-sm text-center">{{ errorMessage }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, computed, ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '../stores/user'
import { useReminderStore } from '../stores/reminder'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const reminderStore = useReminderStore()

const form = reactive({
  phone: '',
  password: ''
})

const loading = ref(false)
const errorMessage = ref('')

const canLogin = computed(() => {
  return form.phone && form.password
})

const goBack = () => {
  router.back()
}

const goToRegister = () => {
  router.push('/register')
}

const handleLogin = async () => {
  if (!canLogin.value || loading.value) return
  
  loading.value = true
  errorMessage.value = ''
  
  try {
    const success = await userStore.login(form.phone, form.password)
    if (success && userStore.userId) {
      await reminderStore.loadRemindersFromDatabase(userStore.userId)
      router.push('/home')
    }
  } catch (error: any) {
    errorMessage.value = error.message || '登录失败，请重试'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  // 从 URL 参数中获取手机号并自动填充
  const phone = route.query.phone as string
  if (phone) {
    form.phone = phone
  }
})
</script>

<style scoped>
.login-container {
  min-height: 100vh;
}
</style>
