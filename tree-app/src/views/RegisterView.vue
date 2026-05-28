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
        <label class="block text-gray-700 mb-2">手机号 / Phone</label>
        <input 
          v-model="form.phone"
          type="tel"
          autocomplete="tel"
          inputmode="tel"
          maxlength="11"
          class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-black"
          placeholder="请输入手机号 / Enter phone number"
        />
      </div>

      <div class="mb-8">
        <label class="block text-gray-700 mb-2">密码 / Password</label>
        <input 
          v-model="form.password"
          type="password"
          autocomplete="new-password"
          inputmode="text"
          class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-black"
          placeholder="请设置密码 / Set password"
        />
      </div>

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
        <button 
          @click="openDatePicker"
          class="w-full h-12 px-4 border border-gray-300 rounded-lg focus:outline-none focus:border-black text-left flex items-center justify-between"
        >
          <span v-if="form.birthDate">{{ formatDate(form.birthDate) }}</span>
          <span v-else class="text-gray-400">请选择日期 / Select date</span>
          <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
          </svg>
        </button>
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

    <!-- 日期选择器弹窗 -->
    <div v-if="showDatePicker" class="fixed inset-0 bg-black/50 flex items-end justify-center z-50" @click="showDatePicker = false">
      <div class="bg-white w-full rounded-t-2xl p-6" @click.stop>
        <div class="flex justify-between items-center mb-6">
          <h3 class="text-lg font-semibold">选择日期</h3>
          <button @click="showDatePicker = false" class="w-8 h-8 flex items-center justify-center">
            <svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        
        <!-- 年月日选择器 -->
        <div class="flex justify-around items-center mb-8">
          <!-- 年份 -->
          <div 
            class="text-center select-region" 
            @wheel.prevent="handleYearWheel"
            @touchstart="handleTouchStart"
            @touchend="handleYearTouchEnd"
          >
            <button @click="adjustYear(-1)" class="w-10 h-10 flex items-center justify-center hover:bg-gray-100 rounded-full transition-colors">
              <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12l7-7 7 7"></path>
              </svg>
            </button>
            <div class="my-2 select-value">
              <span class="text-2xl font-bold">{{ selectedYear }}</span>
              <span class="text-sm text-gray-500 ml-1">年</span>
            </div>
            <button @click="adjustYear(1)" class="w-10 h-10 flex items-center justify-center hover:bg-gray-100 rounded-full transition-colors">
              <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12l7-7 7 7"></path>
              </svg>
            </button>
          </div>
          
          <!-- 月份 -->
          <div 
            class="text-center select-region" 
            @wheel.prevent="handleMonthWheel"
            @touchstart="handleTouchStart"
            @touchend="handleMonthTouchEnd"
          >
            <button @click="adjustMonth(-1)" class="w-10 h-10 flex items-center justify-center hover:bg-gray-100 rounded-full transition-colors">
              <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12l7-7 7 7"></path>
              </svg>
            </button>
            <div class="my-2 select-value">
              <span class="text-2xl font-bold">{{ String(selectedMonth).padStart(2, '0') }}</span>
              <span class="text-sm text-gray-500 ml-1">月</span>
            </div>
            <button @click="adjustMonth(1)" class="w-10 h-10 flex items-center justify-center hover:bg-gray-100 rounded-full transition-colors">
              <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12l7-7 7 7"></path>
              </svg>
            </button>
          </div>
          
          <!-- 日期 -->
          <div 
            class="text-center select-region" 
            @wheel.prevent="handleDayWheel"
            @touchstart="handleTouchStart"
            @touchend="handleDayTouchEnd"
          >
            <button @click="adjustDay(-1)" class="w-10 h-10 flex items-center justify-center hover:bg-gray-100 rounded-full transition-colors">
              <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12l7-7 7 7"></path>
              </svg>
            </button>
            <div class="my-2 select-value">
              <span class="text-2xl font-bold">{{ String(selectedDay).padStart(2, '0') }}</span>
              <span class="text-sm text-gray-500 ml-1">日</span>
            </div>
            <button @click="adjustDay(1)" class="w-10 h-10 flex items-center justify-center hover:bg-gray-100 rounded-full transition-colors">
              <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12l7-7 7 7"></path>
              </svg>
            </button>
          </div>
        </div>
        
        <!-- 确认按钮 -->
        <button 
          @click="confirmDate"
          class="w-full py-4 bg-black text-white rounded-full font-medium hover:bg-gray-800 transition-colors"
        >
          确认选择
        </button>
      </div>
    </div>
  </div>
</template><script setup lang="ts">
import { reactive, computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore, type UserInfo } from '../stores/user'
import { useReminderStore } from '../stores/reminder'

const router = useRouter()
const userStore = useUserStore()
const reminderStore = useReminderStore()

const form = reactive<UserInfo>({
  name: '',
  gender: '不愿透露',
  birthDate: '',
  birthTime: '',
  phone: '',
  password: ''
})

// 日期选择器状态
const showDatePicker = ref(false)
const today = new Date()
const selectedYear = ref(today.getFullYear())
const selectedMonth = ref(today.getMonth() + 1)
const selectedDay = ref(today.getDate())

// 触摸滑动状态
const touchStartY = ref(0)
const touchStartTime = ref(0)

// 初始化日期选择器值
const initDatePicker = () => {
  if (form.birthDate) {
    const date = new Date(form.birthDate)
    selectedYear.value = date.getFullYear()
    selectedMonth.value = date.getMonth() + 1
    selectedDay.value = date.getDate()
  } else {
    selectedYear.value = today.getFullYear()
    selectedMonth.value = today.getMonth() + 1
    selectedDay.value = today.getDate()
  }
}

// 格式化日期显示
const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr)
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`
}

// 获取当月天数
const getDaysInMonth = (year: number, month: number): number => {
  return new Date(year, month, 0).getDate()
}

// 调整年份
const adjustYear = (delta: number) => {
  const newYear = selectedYear.value + delta
  const currentYear = today.getFullYear()
  
  // 限制年份不超过当前年份
  if (newYear > currentYear) {
    selectedYear.value = currentYear
    // 同时限制月份和日期不超过当前
    if (selectedMonth.value > today.getMonth() + 1) {
      selectedMonth.value = today.getMonth() + 1
      if (selectedDay.value > today.getDate()) {
        selectedDay.value = today.getDate()
      }
    } else if (selectedMonth.value === today.getMonth() + 1 && selectedDay.value > today.getDate()) {
      selectedDay.value = today.getDate()
    }
  } else if (newYear < 1900) {
    // 限制最小年份为1900年
    selectedYear.value = 1900
  } else {
    selectedYear.value = newYear
  }
  
  // 调整日期，确保有效
  const maxDay = getDaysInMonth(selectedYear.value, selectedMonth.value)
  if (selectedDay.value > maxDay) {
    selectedDay.value = maxDay
  }
}

// 调整月份
const adjustMonth = (delta: number) => {
  let newMonth = selectedMonth.value + delta
  let newYear = selectedYear.value
  const currentYear = today.getFullYear()
  const currentMonth = today.getMonth() + 1
  
  if (newMonth < 1) {
    newMonth = 12
    newYear--
  } else if (newMonth > 12) {
    newMonth = 1
    newYear++
  }
  
  // 限制年份不超过当前年份
  if (newYear > currentYear) {
    newYear = currentYear
    newMonth = currentMonth
  }
  
  // 如果是当前年份，限制月份不超过当前月份
  if (newYear === currentYear && newMonth > currentMonth) {
    newMonth = currentMonth
    // 同时限制日期不超过当前日期
    if (selectedDay.value > today.getDate()) {
      selectedDay.value = today.getDate()
    }
  }
  
  selectedYear.value = newYear
  selectedMonth.value = newMonth
  
  // 调整日期，确保有效
  const maxDay = getDaysInMonth(selectedYear.value, selectedMonth.value)
  if (selectedDay.value > maxDay) {
    selectedDay.value = maxDay
  }
}

// 调整日期
const adjustDay = (delta: number) => {
  const maxDay = getDaysInMonth(selectedYear.value, selectedMonth.value)
  let newDay = selectedDay.value + delta
  const currentYear = today.getFullYear()
  const currentMonth = today.getMonth() + 1
  const currentDay = today.getDate()
  
  if (newDay < 1) {
    newDay = getDaysInMonth(selectedYear.value, selectedMonth.value - 1 || 12)
    adjustMonth(-1)
  } else if (newDay > maxDay) {
    newDay = 1
    adjustMonth(1)
  }
  
  // 如果是当前年和当前月，限制日期不超过当前日期
  if (selectedYear.value === currentYear && selectedMonth.value === currentMonth && newDay > currentDay) {
    newDay = currentDay
  }
  
  selectedDay.value = newDay
}

// 确认日期选择
const confirmDate = () => {
  const dateStr = `${selectedYear.value}-${String(selectedMonth.value).padStart(2, '0')}-${String(selectedDay.value).padStart(2, '0')}`
  form.birthDate = dateStr
  showDatePicker.value = false
}

// 点击日期选择按钮时初始化
const openDatePicker = () => {
  initDatePicker()
  showDatePicker.value = true
}

// 年份滚动处理
const handleYearWheel = (e: WheelEvent) => {
  if (e.deltaY > 0) {
    adjustYear(-1)
  } else {
    adjustYear(1)
  }
}

// 月份滚动处理
const handleMonthWheel = (e: WheelEvent) => {
  if (e.deltaY > 0) {
    adjustMonth(-1)
  } else {
    adjustMonth(1)
  }
}

// 日期滚动处理
const handleDayWheel = (e: WheelEvent) => {
  if (e.deltaY > 0) {
    adjustDay(-1)
  } else {
    adjustDay(1)
  }
}

// 触摸开始处理
const handleTouchStart = (e: TouchEvent) => {
  touchStartY.value = e.touches[0].clientY
  touchStartTime.value = Date.now()
}

// 触摸结束处理 - 年份
const handleYearTouchEnd = (e: TouchEvent) => {
  const touchEndY = e.changedTouches[0].clientY
  const touchEndTime = Date.now()
  const deltaY = touchStartY.value - touchEndY
  const deltaTime = touchEndTime - touchStartTime.value
  
  // 根据滑动距离和速度决定调整多少
  if (Math.abs(deltaY) > 20 || deltaTime < 200) {
    if (deltaY > 0) {
      // 向上滑动，年份增加
      adjustYear(1)
    } else {
      // 向下滑动，年份减少
      adjustYear(-1)
    }
  }
}

// 触摸结束处理 - 月份
const handleMonthTouchEnd = (e: TouchEvent) => {
  const touchEndY = e.changedTouches[0].clientY
  const touchEndTime = Date.now()
  const deltaY = touchStartY.value - touchEndY
  const deltaTime = touchEndTime - touchStartTime.value
  
  if (Math.abs(deltaY) > 20 || deltaTime < 200) {
    if (deltaY > 0) {
      adjustMonth(1)
    } else {
      adjustMonth(-1)
    }
  }
}

// 触摸结束处理 - 日期
const handleDayTouchEnd = (e: TouchEvent) => {
  const touchEndY = e.changedTouches[0].clientY
  const touchEndTime = Date.now()
  const deltaY = touchStartY.value - touchEndY
  const deltaTime = touchEndTime - touchStartTime.value
  
  if (Math.abs(deltaY) > 20 || deltaTime < 200) {
    if (deltaY > 0) {
      adjustDay(1)
    } else {
      adjustDay(-1)
    }
  }
}

const canRegister = computed(() => {
  return form.name && form.gender && form.birthDate && form.birthTime && form.phone && form.password
})

const goBack = () => {
  router.push('/')
}

const handleRegister = async () => {
  if (!canRegister.value) return
  const success = await userStore.register({ ...form })
  if (success && userStore.userId) {
    await reminderStore.loadRemindersFromDatabase(userStore.userId)
    router.push('/home')
  }
}
</script>
