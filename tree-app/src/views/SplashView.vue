<template>
  <div class="splash-container flex flex-col items-center justify-center min-h-screen px-6 py-12">
    <div class="logo-section mb-16 max-w-xs w-full">
      <img 
        :src="logoSrc" 
        alt="Logo" 
        class="w-full object-contain"
      />
    </div>

    <div v-if="!isLoggedIn" class="unregistered-section text-center w-full max-w-xs">
      <p class="text-gray-500 text-sm leading-relaxed mb-3">有些话，你不是不会说，只是没人懂你......</p>
      <p class="text-gray-400 text-xs leading-relaxed mb-10">Some words, you know how to say them, but no one understands you...</p>
      
      <button 
        @click="goToLogin"
        class="w-full bg-black text-white py-3.5 px-8 rounded-2xl font-medium hover:bg-gray-800 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] flex flex-col items-center"
      >
        <span class="text-base">去聊聊</span>
        <span class="text-sm opacity-80">Let's Talk</span>
      </button>
    </div>

    <div v-else class="registered-section text-center w-full">
      <p class="text-gray-500 text-base">欢迎回来</p>
      <p class="text-gray-400 text-sm mt-1">Welcome back</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/user'

const logoSrc = new URL('/src/assets/images/icon_guide.png', import.meta.url).href

const router = useRouter()
const userStore = useUserStore()
const isLoggedIn = ref(false)

const goToLogin = () => {
  router.push('/login')
}

onMounted(() => {
  isLoggedIn.value = userStore.checkLoginStatus()
  
  if (isLoggedIn.value) {
    setTimeout(() => {
      router.push('/home')
    }, 1000)
  }
})
</script>

<style scoped>
.splash-container {
  background: linear-gradient(to bottom, #ffffff, #fafafa);
}
</style>
