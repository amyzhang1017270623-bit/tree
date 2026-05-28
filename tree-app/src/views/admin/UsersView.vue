<template>
  <AdminLayout>
    <div class="space-y-4">
      <div class="flex items-center gap-3">
        <button
          @click="goBack"
          class="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
        >
          <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </button>
        <div>
          <h1 class="text-lg sm:text-xl md:text-2xl font-bold text-gray-800">用户管理</h1>
          <p class="text-gray-500 mt-1 text-xs sm:text-sm">管理平台所有用户</p>
        </div>
      </div>

        <div class="flex gap-3">
          <div class="relative flex-1">
            <svg class="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              v-model="searchQuery"
              type="text"
              placeholder="搜索手机号或姓名"
              class="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-sm"
              @input="handleSearch"
            />
          </div>
          <select
            v-model="filterGender"
            class="min-w-[100px] px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-sm"
            @change="handleSearch"
          >
            <option value="">全部性别</option>
            <option value="男">男</option>
            <option value="女">女</option>
            <option value="不愿透露">不愿透露</option>
          </select>
        </div>

        <div class="bg-white rounded-xl shadow-sm overflow-hidden">
          <div class="hidden md:block overflow-x-auto">
            <table class="w-full">
              <thead>
                <tr class="bg-gray-50 border-b border-gray-200">
                  <th class="text-left py-3 px-4 text-xs sm:text-sm font-semibold text-gray-600">姓名</th>
                  <th class="text-left py-3 px-4 text-xs sm:text-sm font-semibold text-gray-600">手机号</th>
                  <th class="text-left py-3 px-4 text-xs sm:text-sm font-semibold text-gray-600">性别</th>
                  <th class="text-left py-3 px-4 text-xs sm:text-sm font-semibold text-gray-600">地区</th>
                  <th class="text-left py-3 px-4 text-xs sm:text-sm font-semibold text-gray-600">注册时间</th>
                  <th class="text-right py-3 px-4 text-xs sm:text-sm font-semibold text-gray-600">操作</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="user in users" :key="user.id" class="border-b border-gray-100 hover:bg-gray-50">
                  <td class="py-3 px-4 text-xs sm:text-sm text-gray-800">{{ user.name }}</td>
                  <td class="py-3 px-4 text-xs sm:text-sm text-gray-800">{{ user.phone }}</td>
                  <td class="py-3 px-4 text-xs sm:text-sm text-gray-800">{{ user.gender }}</td>
                  <td class="py-3 px-4 text-xs sm:text-sm text-gray-800">{{ user.location || '国内' }}</td>
                  <td class="py-3 px-4 text-xs sm:text-sm text-gray-500">{{ formatDate(user.created_at) }}</td>
                  <td class="py-3 px-4">
                    <div class="flex items-center justify-end gap-2">
                      <button
                        @click="viewUser(user.id)"
                        class="px-2 py-1 bg-indigo-500 text-white text-xs rounded"
                      >
                        查看
                      </button>
                      <button
                        @click="deleteUser(user.id, user.name)"
                        class="px-2 py-1 bg-red-500 text-white text-xs rounded"
                      >
                        删除
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="md:hidden space-y-3 p-2">
            <div
              v-for="user in users"
              :key="user.id"
              class="bg-gray-50 rounded-lg p-4"
            >
              <div class="flex items-start justify-between mb-2">
                <div>
                  <p class="font-medium text-gray-800 text-sm">{{ user.name }}</p>
                </div>
                <span class="text-xs px-2 py-1 bg-gray-200 rounded-full text-gray-600">{{ user.gender }}</span>
              </div>
              <div class="space-y-1 text-xs text-gray-600 mb-2">
                <p>手机号: {{ user.phone }}</p>
                <p>地区: {{ user.location || '国内' }}</p>
              </div>
              <div class="flex items-center justify-between">
                <p class="text-xs text-gray-600">注册时间: {{ formatDate(user.created_at) }}</p>
                <div class="flex gap-1.5">
                  <button
                    @click="viewUser(user.id)"
                    class="px-2.5 py-1 bg-indigo-500 text-white text-xs rounded"
                  >
                    查看
                  </button>
                  <button
                    @click="deleteUser(user.id, user.name)"
                    class="px-2.5 py-1 bg-red-500 text-white text-xs rounded"
                  >
                    删除
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div v-if="users.length === 0" class="py-12 text-center">
            <svg class="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <p class="text-gray-500 text-sm">暂无用户数据</p>
          </div>

          <div v-if="users.length > 0" class="px-4 py-3 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p class="text-sm text-gray-500">共 {{ total }} 条记录</p>
            <div class="flex items-center gap-2">
              <button
                @click="prevPage"
                :disabled="currentPage === 1"
                class="px-3 py-1.5 text-xs sm:text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                上一页
              </button>
              <span class="text-xs sm:text-sm text-gray-600">{{ currentPage }} / {{ totalPages }}</span>
              <button
                @click="nextPage"
                :disabled="currentPage === totalPages"
                class="px-3 py-1.5 text-xs sm:text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                下一页
              </button>
            </div>
          </div>
        </div>

        <div v-if="showDeleteModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div class="bg-white rounded-xl p-4 sm:p-6 w-full max-w-sm">
            <h3 class="text-base sm:text-lg font-semibold text-gray-800 mb-2">确认删除</h3>
            <p class="text-gray-600 text-sm mb-4">确定要删除用户「{{ deletingUserName }}」吗？此操作无法撤销。</p>
            <div class="flex gap-3">
              <button
                @click="cancelDelete"
                class="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 text-sm"
              >
                取消
              </button>
              <button
                @click="confirmDelete"
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
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import AdminLayout from './AdminLayout.vue'

const router = useRouter()

const goBack = () => {
  router.push('/admin/dashboard')
}

const users = ref<any[]>([])
const searchQuery = ref('')
const filterGender = ref('')
const currentPage = ref(1)
const total = ref(0)
const totalPages = ref(1)

const showDeleteModal = ref(false)
const deletingUserId = ref(0)
const deletingUserName = ref('')

const formatDate = (dateStr: string) => {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const viewUser = (userId: number) => {
  router.push(`/admin/users/${userId}`)
}

const editUser = (userId: number) => {
  router.push(`/admin/users/${userId}`)
}

const deleteUser = (userId: number, userName: string) => {
  deletingUserId.value = userId
  deletingUserName.value = userName
  showDeleteModal.value = true
}

const cancelDelete = () => {
  showDeleteModal.value = false
  deletingUserId.value = 0
  deletingUserName.value = ''
}

const confirmDelete = async () => {
  try {
    const response = await fetch(`/.netlify/functions/api-admin-users/${deletingUserId.value}`, {
      method: 'DELETE'
    })
    if (response.ok) {
      loadUsers()
    }
  } catch (error) {
    console.error('删除用户失败:', error)
  } finally {
    cancelDelete()
  }
}

const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--
    loadUsers()
  }
}

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
    loadUsers()
  }
}

const handleSearch = () => {
  currentPage.value = 1
  loadUsers()
}

const loadUsers = async () => {
  try {
    const params = new URLSearchParams()
    params.set('page', currentPage.value.toString())
    params.set('limit', '10')
    if (searchQuery.value) {
      params.set('search', searchQuery.value)
    }
    if (filterGender.value) {
      params.set('gender', filterGender.value)
    }

    const response = await fetch(`/.netlify/functions/api-admin-users?${params.toString()}`)
    const data = await response.json()
    if (response.ok) {
      users.value = data.users
      total.value = data.total
      totalPages.value = Math.ceil(data.total / 10)
    }
  } catch (error) {
    console.error('加载用户列表失败:', error)
  }
}

onMounted(() => {
  loadUsers()
})
</script>