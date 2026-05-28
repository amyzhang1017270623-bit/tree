<template>
  <AdminLayout>
    <div class="pb-6">
      <div class="text-center py-6 sm:py-8">
        <div class="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl mx-auto flex items-center justify-center shadow-md">
          <svg class="w-7 h-7 sm:w-8 sm:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <h1 class="text-lg sm:text-xl md:text-2xl font-bold text-gray-800 mt-3">管理后台</h1>
        <p class="text-gray-500 mt-1 text-xs sm:text-sm">欢迎回来，{{ adminStore.adminInfo?.name }}</p>
      </div>

      <div class="px-4 sm:px-6 mb-6">
        <div class="grid grid-cols-3 gap-3 sm:gap-4">
          <div class="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl p-4 sm:p-5 text-white shadow-md">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-white/80 text-xs sm:text-sm">总用户数</p>
                <p class="text-2xl sm:text-3xl font-bold mt-2">{{ statistics.totalUsers }}</p>
              </div>
              <div class="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div class="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl p-4 sm:p-5 text-white shadow-md">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-white/80 text-xs sm:text-sm">今日注册</p>
                <p class="text-2xl sm:text-3xl font-bold mt-2">{{ statistics.todayRegistrations }}</p>
              </div>
              <div class="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
              </div>
            </div>
          </div>

          <div class="bg-gradient-to-br from-pink-500 to-rose-600 rounded-xl p-4 sm:p-5 text-white shadow-md">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-white/80 text-xs sm:text-sm">功能使用</p>
                <p class="text-2xl sm:text-3xl font-bold mt-2">{{ totalUsage }}</p>
              </div>
              <div class="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="px-4 sm:px-6 space-y-3 sm:space-y-4">
        <button
          @click="navigateTo('/admin/users')"
          class="group w-full bg-white rounded-xl shadow-sm p-4 sm:p-5 border border-gray-100 hover:shadow-md hover:border-indigo-200 transition-all duration-300 text-left flex items-center gap-4"
        >
          <div class="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <div class="flex-1">
            <h3 class="text-base sm:text-lg font-semibold text-gray-800 group-hover:text-indigo-600 transition-colors">用户管理</h3>
            <p class="text-xs sm:text-sm text-gray-500">管理平台所有用户</p>
          </div>
          <svg class="w-5 h-5 text-gray-400 group-hover:text-indigo-500 transition-colors shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>

        <button
          @click="navigateTo('/admin/statistics')"
          class="group w-full bg-white rounded-xl shadow-sm p-4 sm:p-5 border border-gray-100 hover:shadow-md hover:border-purple-200 transition-all duration-300 text-left flex items-center gap-4"
        >
          <div class="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <div class="flex-1">
            <h3 class="text-base sm:text-lg font-semibold text-gray-800 group-hover:text-purple-600 transition-colors">数据统计</h3>
            <p class="text-xs sm:text-sm text-gray-500">查看平台数据统计</p>
          </div>
          <svg class="w-5 h-5 text-gray-400 group-hover:text-purple-500 transition-colors shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>

        <button
          @click="navigateTo('/admin/settings')"
          class="group w-full bg-white rounded-xl shadow-sm p-4 sm:p-5 border border-gray-100 hover:shadow-md hover:border-orange-200 transition-all duration-300 text-left flex items-center gap-4"
        >
          <div class="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <div class="flex-1">
            <h3 class="text-base sm:text-lg font-semibold text-gray-800 group-hover:text-orange-600 transition-colors">系统设置</h3>
            <p class="text-xs sm:text-sm text-gray-500">管理系统参数配置</p>
          </div>
          <svg class="w-5 h-5 text-gray-400 group-hover:text-orange-500 transition-colors shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>

        <button
          @click="handleLogout"
          class="w-full bg-gray-100 hover:bg-red-50 rounded-xl shadow-sm p-4 sm:p-5 border border-gray-200 hover:border-red-200 transition-all duration-300 text-left flex items-center gap-4"
        >
          <div class="w-12 h-12 bg-gray-200 hover:bg-red-100 rounded-xl flex items-center justify-center shrink-0">
            <svg class="w-6 h-6 text-gray-600 hover:text-red-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </div>
          <div class="flex-1">
            <h3 class="text-base sm:text-lg font-semibold text-gray-700">退出登录</h3>
            <p class="text-xs sm:text-sm text-gray-500">安全退出管理后台</p>
          </div>
        </button>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAdminStore } from '../../stores/admin'
import AdminLayout from './AdminLayout.vue'

const router = useRouter()
const adminStore = useAdminStore()

const statistics = ref({
  totalUsers: 0,
  todayRegistrations: 0,
  totalUsageCount: 0
})

const totalUsage = computed(() => {
  return statistics.value.totalUsageCount || 0
})

const navigateTo = (path: string) => {
  router.push(path)
}

const handleLogout = () => {
  adminStore.logout()
  router.push('/admin/login')
}

const loadStatistics = async () => {
  try {
    const response = await fetch('/.netlify/functions/api-admin-statistics')
    const data = await response.json()
    if (response.ok) {
      statistics.value = data
    }
  } catch (error) {
    console.error('加载统计数据失败:', error)
  }
}

onMounted(() => {
  loadStatistics()
})
</script>