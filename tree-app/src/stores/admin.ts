import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface AdminInfo {
  id: number
  username: string
  name: string
}

export const useAdminStore = defineStore('admin', () => {
  const isLoggedIn = ref(false)
  const adminInfo = ref<AdminInfo | null>(null)

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch('/.netlify/functions/api-admin-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      })
      const data = await response.json()

      if (response.ok) {
        adminInfo.value = {
          id: data.id,
          username: data.username,
          name: data.name
        }
        isLoggedIn.value = true
        return true
      } else {
        return false
      }
    } catch (error) {
      console.error('管理员登录失败:', error)
      return false
    }
  }

  const logout = () => {
    isLoggedIn.value = false
    adminInfo.value = null
  }

  const checkLoginStatus = (): boolean => {
    return isLoggedIn.value && adminInfo.value !== null
  }

  return {
    isLoggedIn,
    adminInfo,
    login,
    logout,
    checkLoginStatus
  }
}, {
  persist: true
})