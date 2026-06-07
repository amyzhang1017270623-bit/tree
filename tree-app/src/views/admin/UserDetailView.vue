<template>
  <AdminLayout>
    <div class="space-y-4">
      <div class="flex items-center gap-3">
        <button
          @click="goBack"
          class="flex items-center gap-1 text-gray-600 hover:text-gray-800"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span class="hidden sm:inline">返回</span>
        </button>
        <h1 class="text-lg sm:text-xl md:text-2xl font-bold text-gray-800">用户详情</h1>
      </div>

        <div v-if="user" class="space-y-4">
          <div class="bg-white rounded-xl shadow-sm p-4 sm:p-6">
            <h2 class="text-base sm:text-lg font-semibold text-gray-800 mb-4">基本信息</h2>
            <div class="space-y-3">
              <div class="flex items-center justify-between py-2 border-b border-gray-100">
                <span class="text-sm text-gray-500">用户ID</span>
                <span class="text-sm text-gray-800 font-medium">{{ user.id }}</span>
              </div>
              <div class="flex items-center justify-between py-2 border-b border-gray-100">
                <span class="text-sm text-gray-500">姓名</span>
                <span class="text-sm text-gray-800 font-medium">{{ user.name }}</span>
              </div>
              <div class="flex items-center justify-between py-2 border-b border-gray-100">
                <span class="text-sm text-gray-500">手机号</span>
                <span class="text-sm text-gray-800 font-medium">{{ user.phone }}</span>
              </div>
              <div class="flex items-center justify-between py-2 border-b border-gray-100">
                <span class="text-sm text-gray-500">性别</span>
                <span class="text-sm text-gray-800 font-medium">{{ user.gender }}</span>
              </div>
              <div class="flex items-center justify-between py-2 border-b border-gray-100">
                <span class="text-sm text-gray-500">生日</span>
                <span class="text-sm text-gray-800 font-medium">{{ formatDate(user.birth_date) }}</span>
              </div>
              <div class="flex items-center justify-between py-2 border-b border-gray-100">
                <span class="text-sm text-gray-500">出生时间</span>
                <span class="text-sm text-gray-800 font-medium">{{ user.birth_time || '-' }}</span>
              </div>
              <div class="flex items-center justify-between py-2">
                <span class="text-sm text-gray-500">注册时间</span>
                <span class="text-sm text-gray-800 font-medium">{{ formatDateTime(user.created_at) }}</span>
              </div>
            </div>
          </div>

          <div class="bg-white rounded-xl shadow-sm p-4 sm:p-6">
            <h2 class="text-base sm:text-lg font-semibold text-gray-800 mb-4">使用统计</h2>
            <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div class="bg-gray-50 rounded-lg p-3">
                <p class="text-xs sm:text-sm text-gray-500 mb-1">今日运势</p>
                <p class="text-lg sm:text-xl font-bold text-gray-800">{{ usageStats.fortune }}</p>
              </div>
              <div class="bg-gray-50 rounded-lg p-3">
                <p class="text-xs sm:text-sm text-gray-500 mb-1">恋爱助手</p>
                <p class="text-lg sm:text-xl font-bold text-gray-800">{{ usageStats.loveAssistant }}</p>
              </div>
              <div class="bg-gray-50 rounded-lg p-3">
                <p class="text-xs sm:text-sm text-gray-500 mb-1">情感陪伴</p>
                <p class="text-lg sm:text-xl font-bold text-gray-800">{{ usageStats.emotionCompanion }}</p>
              </div>
              <div class="bg-gray-50 rounded-lg p-3">
                <p class="text-xs sm:text-sm text-gray-500 mb-1">情感树洞</p>
                <p class="text-lg sm:text-xl font-bold text-gray-800">{{ usageStats.treeHole }}</p>
              </div>
              <div class="bg-gray-50 rounded-lg p-3">
                <p class="text-xs sm:text-sm text-gray-500 mb-1">塔罗世界</p>
                <p class="text-lg sm:text-xl font-bold text-gray-800">{{ usageStats.tarot }}</p>
              </div>
              <div class="bg-gray-50 rounded-lg p-3">
                <p class="text-xs sm:text-sm text-gray-500 mb-1">私人助理</p>
                <p class="text-lg sm:text-xl font-bold text-gray-800">{{ usageStats.assistant }}</p>
              </div>
            </div>
          </div>

          <div class="bg-white rounded-xl shadow-sm p-4 sm:p-6">
            <h2 class="text-base sm:text-lg font-semibold text-gray-800 mb-4">角色偏好</h2>
            <div v-if="characterPreferences" class="space-y-2">
              <div v-for="(value, key) in characterPreferences" :key="key" class="flex items-center justify-between py-2 border-b border-gray-100">
                <span class="text-sm text-gray-500">{{ formatKey(key) }}</span>
                <span class="text-sm text-gray-800">{{ value }}</span>
              </div>
            </div>
            <p v-else class="text-gray-500 text-sm">暂无角色偏好设置</p>
          </div>

          <div class="bg-white rounded-xl shadow-sm p-4 sm:p-6">
            <h2 class="text-base sm:text-lg font-semibold text-gray-800 mb-4">操作</h2>
            <div class="space-y-2">
              <button
                @click="toggleEditMode"
                class="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-all text-sm"
              >
                {{ isEditing ? '取消编辑' : '编辑用户信息' }}
              </button>
              <button
                @click="resetPassword"
                class="w-full px-4 py-2.5 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-all text-sm"
              >
                重置密码
              </button>
              <button
                @click="showDeleteConfirm = true"
                class="w-full px-4 py-2.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all text-sm"
              >
                删除用户
              </button>
            </div>
          </div>
        </div>

        <div v-if="isEditing && user" class="bg-white rounded-xl shadow-sm p-4 sm:p-6">
          <h2 class="text-base sm:text-lg font-semibold text-gray-800 mb-4">编辑用户信息</h2>
          <form @submit.prevent="saveUser" class="space-y-4">
            <div class="space-y-3">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1.5">姓名</label>
                <input
                  v-model="editForm.name"
                  type="text"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-sm"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1.5">性别</label>
                <select
                  v-model="editForm.gender"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-sm"
                >
                  <option value="男">男</option>
                  <option value="女">女</option>
                  <option value="不愿透露">不愿透露</option>
                </select>
              </div>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1.5">生日</label>
                  <input
                    v-model="editForm.birthDate"
                    type="date"
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-sm"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1.5">出生时间</label>
                  <input
                    v-model="editForm.birthTime"
                    type="time"
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-sm"
                  />
                </div>
              </div>
            </div>
            <div class="flex gap-3">
              <button
                type="button"
                @click="toggleEditMode"
                class="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 text-sm"
              >
                取消
              </button>
              <button
                type="submit"
                class="flex-1 px-4 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm"
              >
                保存修改
              </button>
            </div>
          </form>
        </div>

        <div v-if="showDeleteConfirm" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div class="bg-white rounded-xl p-4 sm:p-6 w-full max-w-sm">
            <h3 class="text-base sm:text-lg font-semibold text-gray-800 mb-2">确认删除</h3>
            <p class="text-gray-600 text-sm mb-4">确定要删除用户「{{ user?.name }}」吗？此操作无法撤销。</p>
            <div class="flex gap-3">
              <button
                @click="showDeleteConfirm = false"
                class="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 text-sm"
              >
                取消
              </button>
              <button
                @click="deleteUser"
                class="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
              >
                确认删除
              </button>
            </div>
          </div>
        </div>
    </div>
  </AdminLayout>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AdminLayout from './AdminLayout.vue'

const route = useRoute()
const router = useRouter()

const user = ref<any>(null)
const isEditing = ref(false)
const showDeleteConfirm = ref(false)
const usageStats = ref({
  fortune: 0,
  emotionCompanion: 0,
  tarot: 0,
  loveAssistant: 0,
  treeHole: 0,
  assistant: 0
})
const characterPreferences = ref<any>(null)

const editForm = ref({
  name: '',
  gender: '男',
  birthDate: '',
  birthTime: ''
})

const formatKey = (key: string) => {
  const keyMap: Record<string, string> = {
    avatar: '头像',
    personality: '性格',
    voice: '声音',
    language: '语言',
    gender: '性别',
    style: '风格',
    age: '年龄',
    tone: '语气'
  }
  return keyMap[key] || key
}

const formatDateTime = (dateString: string) => {
  if (!dateString) return '-'
  try {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return dateString
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    const seconds = String(date.getSeconds()).padStart(2, '0')
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
  } catch {
    return dateString
  }
}

const formatDate = (dateString: string) => {
  if (!dateString) return '-'
  try {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return dateString
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  } catch {
    return dateString
  }
}

const goBack = () => {
  router.push('/admin/users')
}

const toggleEditMode = () => {
  isEditing.value = !isEditing.value
  if (isEditing.value && user.value) {
    editForm.value = {
      name: user.value.name,
      gender: user.value.gender,
      birthDate: user.value.birth_date || '',
      birthTime: user.value.birth_time || ''
    }
  }
}

const saveUser = async () => {
  try {
    const response = await fetch(`/.netlify/functions/api-admin-users/${user.value.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editForm.value)
    })
    if (response.ok) {
      isEditing.value = false
      loadUser()
    }
  } catch (error) {
    console.error('更新用户失败:', error)
  }
}

const resetPassword = async () => {
  try {
    const response = await fetch(`/.netlify/functions/api-admin-users/${user.value.id}/reset-password`, {
      method: 'POST'
    })
    if (response.ok) {
      alert('密码已重置为默认密码：123456')
    }
  } catch (error) {
    console.error('重置密码失败:', error)
  }
}

const deleteUser = async () => {
  try {
    const response = await fetch(`/.netlify/functions/api-admin-users/${user.value.id}`, {
      method: 'DELETE'
    })
    if (response.ok) {
      router.push('/admin/users')
    }
  } catch (error) {
    console.error('删除用户失败:', error)
  }
}

const loadUser = async () => {
  try {
    const userId = route.params.id
    const response = await fetch(`/.netlify/functions/api-admin-users/${userId}`)
    const data = await response.json()
    if (response.ok) {
      user.value = data.user
      if (data.user?.character_preferences) {
        try {
          characterPreferences.value = typeof data.user.character_preferences === 'string' 
            ? JSON.parse(data.user.character_preferences) 
            : data.user.character_preferences
        } catch {
          characterPreferences.value = null
        }
      }
      
      // 加载用户使用统计数据
      await loadUserUsageStats(userId)
    }
  } catch (error) {
    console.error('加载用户详情失败:', error)
  }
}

const loadUserUsageStats = async (userId: any) => {
  try {
    const response = await fetch(`/.netlify/functions/api-admin-users/${userId}/stats`)
    if (response.ok) {
      const data = await response.json()
      usageStats.value = {
        fortune: data.fortune || 0,
        emotionCompanion: data.emotion || 0,
        tarot: data.tarot || 0,
        loveAssistant: data.loveAssistant || 0,
        treeHole: data.treeHole || 0,
        assistant: data.assistant || 0
      }
    }
  } catch (error) {
    console.error('加载用户使用统计失败:', error)
  }
}

onMounted(() => {
  loadUser()
})

watch(() => route.params.id, () => {
  loadUser()
})
</script>