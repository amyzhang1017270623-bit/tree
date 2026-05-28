<template>
  <AdminLayout>
    <div class="p-4 sm:p-6">
      <div class="flex items-center gap-3 mb-4 sm:mb-6">
        <button
          @click="goBack"
          class="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
        >
          <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </button>
        <div>
          <h1 class="text-lg sm:text-xl md:text-2xl font-bold text-gray-800">系统设置</h1>
          <p class="text-sm sm:text-base text-gray-500 mt-1">管理系统参数和配置</p>
        </div>
      </div>

      <div class="space-y-4 sm:space-y-6">
          <div class="bg-white rounded-xl shadow-sm p-4 sm:p-6">
            <h2 class="text-base sm:text-lg font-semibold text-gray-800 mb-4">应用设置</h2>
            <form @submit.prevent="saveSettings" class="space-y-4 sm:space-y-6">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">应用名称</label>
                <input
                  v-model="settings.appName"
                  type="text"
                  class="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-sm sm:text-base"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">塔罗免费次数/周</label>
                <input
                  v-model.number="settings.tarotFreeCount"
                  type="number"
                  min="0"
                  class="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-sm sm:text-base"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">登录超时时间（分钟）</label>
                <input
                  v-model.number="settings.loginTimeout"
                  type="number"
                  min="1"
                  class="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-sm sm:text-base"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">每日最大使用次数</label>
                <input
                  v-model.number="settings.dailyLimit"
                  type="number"
                  min="0"
                  class="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-sm sm:text-base"
                />
              </div>
              <button
                type="submit"
                :disabled="isSaving"
                class="w-full px-4 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base font-medium"
              >
                {{ isSaving ? '保存中...' : '保存设置' }}
              </button>
            </form>
          </div>

          <div class="bg-white rounded-xl shadow-sm p-4 sm:p-6">
            <h2 class="text-base sm:text-lg font-semibold text-gray-800 mb-4">管理员管理</h2>
            
            <div class="mb-4 sm:mb-6">
              <h3 class="text-sm font-medium text-gray-700 mb-3">当前管理员</h3>
              <div class="bg-gray-50 rounded-lg p-3 sm:p-4">
                <div class="flex items-center justify-between flex-wrap gap-3">
                  <div class="flex items-center gap-3">
                    <div class="w-8 h-8 sm:w-10 sm:h-10 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <svg class="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <div>
                      <p class="font-medium text-gray-800 text-sm sm:text-base">{{ currentAdmin?.name }}</p>
                      <p class="text-xs sm:text-sm text-gray-500">{{ currentAdmin?.username }}</p>
                    </div>
                  </div>
                  <button
                    @click="showChangePassword = true"
                    class="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                  >
                    修改密码
                  </button>
                </div>
              </div>
            </div>

            <div>
              <h3 class="text-sm font-medium text-gray-700 mb-3">添加管理员</h3>
              <form @submit.prevent="addAdmin" class="space-y-3 sm:space-y-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">用户名</label>
                  <input
                    v-model="newAdmin.username"
                    type="text"
                    placeholder="请输入用户名"
                    class="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-sm sm:text-base"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">姓名</label>
                  <input
                    v-model="newAdmin.name"
                    type="text"
                    placeholder="请输入姓名"
                    class="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-sm sm:text-base"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">密码</label>
                  <input
                    v-model="newAdmin.password"
                    type="password"
                    placeholder="请输入密码"
                    class="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-sm sm:text-base"
                  />
                </div>
                <button
                  type="submit"
                  :disabled="isAdding"
                  class="w-full px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base font-medium"
                >
                  {{ isAdding ? '添加中...' : '添加管理员' }}
                </button>
              </form>
            </div>
          </div>

          <div class="bg-white rounded-xl shadow-sm p-4 sm:p-6">
            <h2 class="text-base sm:text-lg font-semibold text-gray-800 mb-4">数据管理</h2>
            <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
              <button
                @click="exportData"
                :disabled="isExporting"
                class="p-3 sm:p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-all disabled:opacity-50 flex flex-col items-center text-center"
              >
                <svg class="w-6 h-6 sm:w-8 sm:h-8 text-blue-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                <p class="text-sm font-medium text-gray-700">导出数据</p>
                <p class="text-xs text-gray-500 mt-1">导出用户数据为CSV</p>
              </button>
              <button
                @click="showClearCacheConfirm = true"
                class="p-3 sm:p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-all flex flex-col items-center text-center"
              >
                <svg class="w-6 h-6 sm:w-8 sm:h-8 text-yellow-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
                <p class="text-sm font-medium text-gray-700">清除缓存</p>
                <p class="text-xs text-gray-500 mt-1">清除应用缓存数据</p>
              </button>
              <button
                @click="showBackupConfirm = true"
                class="p-3 sm:p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-all flex flex-col items-center text-center"
              >
                <svg class="w-6 h-6 sm:w-8 sm:h-8 text-green-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                <p class="text-sm font-medium text-gray-700">备份数据</p>
                <p class="text-xs text-gray-500 mt-1">创建数据库备份</p>
              </button>
            </div>
          </div>
        </div>

      <div v-if="showChangePassword" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div class="bg-white rounded-xl p-6 w-full max-w-md mx-4">
          <h3 class="text-lg font-semibold text-gray-800 mb-4">修改密码</h3>
          <form @submit.prevent="changePassword" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">原密码</label>
              <input
                v-model="passwordForm.oldPassword"
                type="password"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">新密码</label>
              <input
                v-model="passwordForm.newPassword"
                type="password"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">确认密码</label>
              <input
                v-model="passwordForm.confirmPassword"
                type="password"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
              />
            </div>
            <div class="flex gap-4">
              <button
                type="button"
                @click="showChangePassword = false"
                class="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                取消
              </button>
              <button
                type="submit"
                class="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                确认修改
              </button>
            </div>
          </form>
        </div>
      </div>

      <div v-if="showClearCacheConfirm" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div class="bg-white rounded-xl p-6 w-full max-w-md mx-4">
          <h3 class="text-lg font-semibold text-gray-800 mb-2">确认清除缓存</h3>
          <p class="text-gray-600 mb-6">确定要清除应用缓存吗？此操作不会影响数据库数据。</p>
          <div class="flex gap-4">
            <button
              @click="showClearCacheConfirm = false"
              class="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              取消
            </button>
            <button
              @click="clearCache"
              class="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              确认清除
            </button>
          </div>
        </div>
      </div>

      <div v-if="showBackupConfirm" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div class="bg-white rounded-xl p-6 w-full max-w-md mx-4">
          <h3 class="text-lg font-semibold text-gray-800 mb-2">确认备份数据</h3>
          <p class="text-gray-600 mb-6">确定要创建数据库备份吗？</p>
          <div class="flex gap-4">
            <button
              @click="showBackupConfirm = false"
              class="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              取消
            </button>
            <button
              @click="backupData"
              class="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              确认备份
            </button>
          </div>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAdminStore } from '../../stores/admin'
import AdminLayout from './AdminLayout.vue'

const router = useRouter()
const adminStore = useAdminStore()

const goBack = () => {
  router.push('/admin/dashboard')
}

const settings = ref({
  appName: '0号树洞',
  tarotFreeCount: 2,
  loginTimeout: 20,
  dailyLimit: 100
})

const newAdmin = ref({
  username: '',
  name: '',
  password: ''
})

const passwordForm = ref({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const currentAdmin = ref(null)

const isSaving = ref(false)
const isAdding = ref(false)
const isExporting = ref(false)

const showChangePassword = ref(false)
const showClearCacheConfirm = ref(false)
const showBackupConfirm = ref(false)

const saveSettings = async () => {
  isSaving.value = true
  try {
    const response = await fetch('/.netlify/functions/api-admin-settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings.value)
    })
    if (response.ok) {
      alert('设置保存成功')
    }
  } catch (error) {
    console.error('保存设置失败:', error)
  } finally {
    isSaving.value = false
  }
}

const addAdmin = async () => {
  isAdding.value = true
  try {
    const response = await fetch('/.netlify/functions/api-admin-users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newAdmin.value)
    })
    if (response.ok) {
      alert('管理员添加成功')
      newAdmin.value = { username: '', name: '', password: '' }
    }
  } catch (error) {
    console.error('添加管理员失败:', error)
  } finally {
    isAdding.value = false
  }
}

const changePassword = async () => {
  if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
    alert('两次输入的密码不一致')
    return
  }

  try {
    const response = await fetch('/.netlify/functions/api-admin-change-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(passwordForm.value)
    })
    if (response.ok) {
      alert('密码修改成功')
      showChangePassword.value = false
      passwordForm.value = { oldPassword: '', newPassword: '', confirmPassword: '' }
    }
  } catch (error) {
    console.error('修改密码失败:', error)
  }
}

const exportData = async () => {
  isExporting.value = true
  try {
    const response = await fetch('/.netlify/functions/api-admin-export')
    if (response.ok) {
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `users_${Date.now()}.csv`
      a.click()
      URL.revokeObjectURL(url)
    }
  } catch (error) {
    console.error('导出数据失败:', error)
  } finally {
    isExporting.value = false
  }
}

const clearCache = async () => {
  try {
    const response = await fetch('/.netlify/functions/api-admin-clear-cache', {
      method: 'POST'
    })
    if (response.ok) {
      alert('缓存清除成功')
    }
  } catch (error) {
    console.error('清除缓存失败:', error)
  } finally {
    showClearCacheConfirm.value = false
  }
}

const backupData = async () => {
  try {
    const response = await fetch('/.netlify/functions/api-admin-backup')
    if (response.ok) {
      alert('备份成功')
    }
  } catch (error) {
    console.error('备份失败:', error)
  } finally {
    showBackupConfirm.value = false
  }
}

const loadSettings = async () => {
  try {
    const response = await fetch('/.netlify/functions/api-admin-settings')
    if (response.ok) {
      const data = await response.json()
      settings.value = data
    }
  } catch (error) {
    console.error('加载设置失败:', error)
  }
}

onMounted(() => {
  currentAdmin.value = adminStore.adminInfo
  loadSettings()
})
</script>