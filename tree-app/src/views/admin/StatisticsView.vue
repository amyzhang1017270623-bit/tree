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
          <h1 class="text-lg sm:text-xl md:text-2xl font-bold text-gray-800">数据统计</h1>
          <p class="text-gray-500 mt-1 text-xs sm:text-sm">查看平台各项数据统计</p>
        </div>
      </div>

      <div class="grid grid-cols-2 gap-3 sm:gap-4">
          <div class="bg-white rounded-xl shadow-sm p-4 sm:p-6">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-xs sm:text-sm text-gray-500">总用户数</p>
                <p class="text-2xl sm:text-3xl font-bold text-gray-800 mt-2">{{ statistics.totalUsers }}</p>
              </div>
              <div class="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <svg class="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div class="bg-white rounded-xl shadow-sm p-4 sm:p-6">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-xs sm:text-sm text-gray-500">本周新增</p>
                <p class="text-2xl sm:text-3xl font-bold text-gray-800 mt-2">{{ statistics.weeklyNewUsers }}</p>
              </div>
              <div class="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <svg class="w-5 h-5 sm:w-6 sm:h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-3 sm:gap-4">
          <div class="bg-white rounded-xl shadow-sm p-4 sm:p-6">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-xs sm:text-sm text-gray-500">本月活跃</p>
                <p class="text-2xl sm:text-3xl font-bold text-gray-800 mt-2">{{ statistics.monthlyActiveUsers }}</p>
              </div>
              <div class="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <svg class="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                </svg>
              </div>
            </div>
          </div>

          <div class="bg-white rounded-xl shadow-sm p-4 sm:p-6">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-xs sm:text-sm text-gray-500">总使用次数</p>
                <p class="text-2xl sm:text-3xl font-bold text-gray-800 mt-2">{{ statistics.totalUsageCount }}</p>
              </div>
              <div class="w-10 h-10 sm:w-12 sm:h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                <svg class="w-5 h-5 sm:w-6 sm:h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-xl shadow-sm p-4 sm:p-6">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-base sm:text-lg font-semibold text-gray-800">用户增长趋势</h2>
            <div class="flex gap-2">
              <button 
                v-for="period in periods" 
                :key="period.value"
                @click="activePeriod = period.value"
                :class="[
                  'px-3 py-1 text-xs sm:text-sm rounded-lg transition-colors',
                  activePeriod === period.value 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                ]"
              >
                {{ period.label }}
              </button>
            </div>
          </div>
          <div class="h-40 sm:h-64 grid grid-cols-7 gap-1 sm:gap-2 pt-8">
            <div v-for="(value, index) in currentChartData" :key="index" 
                 class="flex flex-col items-center justify-end"
                 :style="{ height: '100%' }">
              <span 
                v-if="value > 0"
                class="text-xs font-bold text-gray-700 mb-1"
              >
                {{ value }}
              </span>
              <div 
                class="w-full bg-gradient-to-t from-blue-500 to-blue-300 rounded-t transition-all"
                :style="{ height: `${(value / maxChartValue) * 100}%` }">
              </div>
            </div>
          </div>
          <div class="grid grid-cols-7 gap-1 sm:gap-2 mt-2">
            <span v-for="(label, index) in currentChartLabels" :key="index" 
                  class="text-xs text-gray-500 text-center">{{ label }}</span>
          </div>
        </div>

        <div class="bg-white rounded-xl shadow-sm p-4 sm:p-6">
          <h2 class="text-base sm:text-lg font-semibold text-gray-800 mb-4">功能使用分布</h2>
          <div class="flex flex-col items-center">
            <div class="relative w-56 h-56 sm:w-64 sm:h-64">
              <svg class="w-full h-full" viewBox="0 0 100 100">
                <g v-for="(slice, index) in pieChartData" :key="index">
                  <path
                    :d="slice.path"
                    :fill="pieColors[index % pieColors.length]"
                    stroke="#ffffff"
                    stroke-width="2"
                    transform="translate(2, 2)"
                    class="transition-all duration-500"
                  />
                  <text
                    :x="slice.labelX + 2"
                    :y="slice.labelY + 2"
                    text-anchor="middle"
                    dominant-baseline="middle"
                    class="text-[6px] fill-white font-bold"
                  >
                    {{ slice.percentage }}%
                  </text>
                </g>
              </svg>
            </div>
            <div class="grid grid-cols-3 gap-x-4 gap-y-2 mt-4">
              <div 
                v-for="(item, index) in featureDistribution" 
                :key="index"
                class="flex items-center gap-2"
              >
                <div 
                  class="w-3 h-3 rounded-full"
                  :style="{ backgroundColor: pieColors[index] }"
                ></div>
                <span class="text-xs text-gray-600">{{ item.name }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-xl shadow-sm p-4 sm:p-6">
          <h2 class="text-base sm:text-lg font-semibold text-gray-800 mb-4">性别分布</h2>
          <div class="flex items-center justify-center gap-4 sm:gap-8 flex-wrap">
            <div class="text-center">
              <div class="w-16 h-16 sm:w-24 sm:h-24 rounded-full bg-blue-100 flex items-center justify-center mb-3">
                <svg class="w-8 h-8 sm:w-12 sm:h-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <p class="text-lg sm:text-2xl font-bold text-gray-800">{{ genderDistribution.male }}</p>
              <p class="text-xs sm:text-sm text-gray-500">男性</p>
            </div>
            <div class="text-center">
              <div class="w-16 h-16 sm:w-24 sm:h-24 rounded-full bg-pink-100 flex items-center justify-center mb-3">
                <svg class="w-8 h-8 sm:w-12 sm:h-12 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 101.414 1.414l2.414-2.414a1 1 0 00.293-.707H20zm-6-4h4m-6 4h4m-6-4h4m-6 4h4" />
                </svg>
              </div>
              <p class="text-lg sm:text-2xl font-bold text-gray-800">{{ genderDistribution.female }}</p>
              <p class="text-xs sm:text-sm text-gray-500">女性</p>
            </div>
            <div class="text-center">
              <div class="w-16 h-16 sm:w-24 sm:h-24 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                <svg class="w-8 h-8 sm:w-12 sm:h-12 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <p class="text-lg sm:text-2xl font-bold text-gray-800">{{ genderDistribution.unknown }}</p>
              <p class="text-xs sm:text-sm text-gray-500">未透露</p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-xl shadow-sm p-4 sm:p-6">
          <h2 class="text-base sm:text-lg font-semibold text-gray-800 mb-4">塔罗使用统计</h2>
          <div class="grid grid-cols-2 gap-3">
            <div class="bg-gray-50 rounded-lg p-3">
              <p class="text-xs sm:text-sm text-gray-500 mb-1">本周免费次数</p>
              <p class="text-lg sm:text-xl font-bold text-gray-800">{{ tarotStats.weeklyFreeCount }}</p>
            </div>
            <div class="bg-gray-50 rounded-lg p-3">
              <p class="text-xs sm:text-sm text-gray-500 mb-1">本周付费次数</p>
              <p class="text-lg sm:text-xl font-bold text-gray-800">{{ tarotStats.weeklyPaidCount }}</p>
            </div>
            <div class="bg-gray-50 rounded-lg p-3">
              <p class="text-xs sm:text-sm text-gray-500 mb-1">本月总次数</p>
              <p class="text-lg sm:text-xl font-bold text-gray-800">{{ tarotStats.monthlyTotal }}</p>
            </div>
            <div class="bg-gray-50 rounded-lg p-3">
              <p class="text-xs sm:text-sm text-gray-500 mb-1">累计付费次数</p>
              <p class="text-lg sm:text-xl font-bold text-gray-800">{{ tarotStats.totalPaidCount }}</p>
            </div>
          </div>
        </div>
    </div>
  </AdminLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import AdminLayout from './AdminLayout.vue'

const router = useRouter()

const goBack = () => {
  router.push('/admin/dashboard')
}

const statistics = ref({
  totalUsers: 0,
  weeklyNewUsers: 0,
  monthlyActiveUsers: 0,
  totalUsageCount: 0,
  todayRegistrations: 0,
  dailyRegistrations: [0, 0, 0, 0, 0, 0, 0],
  dayLabels: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
  weeklyRegistrations: [],
  weekLabels: [],
  monthlyRegistrations: [],
  monthLabels: []
})

const periods = [
  { label: '今天', value: 'today' },
  { label: '本周', value: 'week' },
  { label: '本月', value: 'month' },
  { label: '本年', value: 'year' }
]

const activePeriod = ref('week')

const featureDistribution = ref([
  { name: '今日运势', count: 0, percentage: 0 },
  { name: '恋爱助手', count: 0, percentage: 0 },
  { name: '情感陪伴', count: 0, percentage: 0 },
  { name: '情感树洞', count: 0, percentage: 0 },
  { name: '塔罗世界', count: 0, percentage: 0 },
  { name: '私人助理', count: 0, percentage: 0 }
])

const barColors = [
  'bg-blue-500',
  'bg-pink-500',
  'bg-purple-500',
  'bg-green-500',
  'bg-orange-500',
  'bg-teal-500'
]

const pieColors = [
  '#3B82F6',
  '#EC4899',
  '#8B5CF6',
  '#10B981',
  '#F97316',
  '#F59E0B'
]

const pieChartData = computed(() => {
  const cx = 50
  const cy = 50
  const r = 45
  let startAngle = -Math.PI / 2
  
  return featureDistribution.value.map(item => {
    if (item.percentage === 0) {
      return { ...item, path: '', labelX: 0, labelY: 0 }
    }
    
    const endAngle = startAngle + (item.percentage / 100) * 2 * Math.PI
    const midAngle = (startAngle + endAngle) / 2
    const x1 = cx + r * Math.cos(startAngle)
    const y1 = cy + r * Math.sin(startAngle)
    const x2 = cx + r * Math.cos(endAngle)
    const y2 = cy + r * Math.sin(endAngle)
    const largeArcFlag = item.percentage > 50 ? 1 : 0
    
    const labelR = r * 0.65
    const labelX = cx + labelR * Math.cos(midAngle)
    const labelY = cy + labelR * Math.sin(midAngle)
    
    const path = [
      `M ${cx} ${cy}`,
      `L ${x1} ${y1}`,
      `A ${r} ${r} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
      'Z'
    ].join(' ')
    
    startAngle = endAngle
    return { ...item, path, labelX, labelY }
  })
})

const genderDistribution = ref({
  male: 0,
  female: 0,
  unknown: 0
})

const tarotStats = ref({
  weeklyFreeCount: 0,
  weeklyPaidCount: 0,
  monthlyTotal: 0,
  totalPaidCount: 0
})

const currentChartData = computed(() => {
  switch (activePeriod.value) {
    case 'today':
      return [statistics.value.todayRegistrations]
    case 'week':
      return statistics.value.dailyRegistrations
    case 'month':
      return statistics.value.weeklyRegistrations.length > 0 ? statistics.value.weeklyRegistrations : [0]
    case 'year':
      return statistics.value.monthlyRegistrations.length > 0 ? statistics.value.monthlyRegistrations : [0]
    default:
      return statistics.value.dailyRegistrations
  }
})

const currentChartLabels = computed(() => {
  switch (activePeriod.value) {
    case 'today':
      return ['今天']
    case 'week':
      return statistics.value.dayLabels.length > 0 ? statistics.value.dayLabels : ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
    case 'month':
      return statistics.value.weekLabels.length > 0 ? statistics.value.weekLabels : ['第1周', '第2周', '第3周', '第4周']
    case 'year':
      return statistics.value.monthLabels.length > 0 ? statistics.value.monthLabels : ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']
    default:
      return statistics.value.dayLabels
  }
})

const maxChartValue = computed(() => Math.max(...currentChartData.value, 1))

const loadStatistics = async () => {
  try {
    const response = await fetch('/.netlify/functions/api-admin-statistics')
    const data = await response.json()
    if (response.ok) {
      statistics.value = {
        totalUsers: data.totalUsers || 0,
        weeklyNewUsers: data.weeklyNewUsers || 0,
        monthlyActiveUsers: data.monthlyActiveUsers || 0,
        totalUsageCount: data.totalUsageCount || 0,
        todayRegistrations: data.todayRegistrations || 0,
        dailyRegistrations: data.dailyRegistrations && Array.isArray(data.dailyRegistrations) ? data.dailyRegistrations : [0, 0, 0, 0, 0, 0, 0],
        dayLabels: data.dayLabels && Array.isArray(data.dayLabels) ? data.dayLabels : ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
        weeklyRegistrations: data.weeklyRegistrations && Array.isArray(data.weeklyRegistrations) ? data.weeklyRegistrations : [],
        weekLabels: data.weekLabels && Array.isArray(data.weekLabels) ? data.weekLabels : [],
        monthlyRegistrations: data.monthlyRegistrations && Array.isArray(data.monthlyRegistrations) ? data.monthlyRegistrations : [],
        monthLabels: data.monthLabels && Array.isArray(data.monthLabels) ? data.monthLabels : []
      }
      if (data.featureDistribution && Array.isArray(data.featureDistribution)) {
        featureDistribution.value = data.featureDistribution
      }
      if (data.genderDistribution) {
        genderDistribution.value = data.genderDistribution
      }
      if (data.tarotStats) {
        tarotStats.value = data.tarotStats
      }
    }
  } catch (error) {
    console.error('加载统计数据失败:', error)
  }
}

onMounted(() => {
  loadStatistics()
})
</script>