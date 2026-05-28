import { createRouter, createWebHashHistory } from 'vue-router'
import { useUserStore } from '../stores/user'
import { useAdminStore } from '../stores/admin'

const routes = [
  {
    path: '/',
    name: 'Splash',
    component: () => import('../views/SplashView.vue')
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/LoginView.vue')
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('../views/RegisterView.vue')
  },
  {
    path: '/home',
    name: 'Home',
    component: () => import('../views/HomeView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/fortune',
    name: 'Fortune',
    component: () => import('../views/FortuneView.vue')
  },
  {
    path: '/love-assistant',
    name: 'LoveAssistant',
    component: () => import('../views/LoveAssistantView.vue')
  },
  {
    path: '/emotion-companion',
    name: 'EmotionCompanion',
    component: () => import('../views/EmotionCompanionView.vue')
  },
  {
    path: '/tree-hole',
    name: 'TreeHole',
    component: () => import('../views/TreeHoleView.vue')
  },
  {
    path: '/tarot',
    name: 'Tarot',
    component: () => import('../views/TarotView.vue')
  },
  {
    path: '/tarot-detail',
    name: 'TarotDetail',
    component: () => import('../views/TarotDetailView.vue')
  },
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('../views/ProfileView.vue')
  },
  {
    path: '/payment',
    name: 'Payment',
    component: () => import('../views/PaymentView.vue')
  },
  {
    path: '/assistant',
    name: 'Assistant',
    component: () => import('../views/AssistantView.vue')
  },
  {
    path: '/assistant/reminders',
    name: 'AssistantReminders',
    component: () => import('../views/ReminderView.vue')
  },
  {
    path: '/admin/login',
    name: 'AdminLogin',
    component: () => import('../views/admin/AdminLoginView.vue')
  },
  {
    path: '/admin/dashboard',
    name: 'AdminDashboard',
    component: () => import('../views/admin/DashboardView.vue'),
    meta: { requiresAdmin: true }
  },
  {
    path: '/admin/users',
    name: 'AdminUsers',
    component: () => import('../views/admin/UsersView.vue'),
    meta: { requiresAdmin: true }
  },
  {
    path: '/admin/users/:id',
    name: 'AdminUserDetail',
    component: () => import('../views/admin/UserDetailView.vue'),
    meta: { requiresAdmin: true }
  },
  {
    path: '/admin/statistics',
    name: 'AdminStatistics',
    component: () => import('../views/admin/StatisticsView.vue'),
    meta: { requiresAdmin: true }
  },
  {
    path: '/admin/settings',
    name: 'AdminSettings',
    component: () => import('../views/admin/SettingsView.vue'),
    meta: { requiresAdmin: true }
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

router.beforeEach((to, from) => {
  if (to.meta.requiresAdmin) {
    const adminStore = useAdminStore()
    const isAdminLoggedIn = adminStore.checkLoginStatus()
    
    if (!isAdminLoggedIn) {
      return '/admin/login'
    }
  }
  
  if (to.path === '/admin/login') {
    const adminStore = useAdminStore()
    const isAdminLoggedIn = adminStore.checkLoginStatus()
    
    if (isAdminLoggedIn) {
      return '/admin/dashboard'
    }
  }
  
  if (to.meta.requiresAuth) {
    const userStore = useUserStore()
    const isLoggedIn = userStore.checkLoginStatus()
    
    if (!isLoggedIn) {
      return '/login'
    }
  }
  
  if (to.path === '/login' || to.path === '/register') {
    const userStore = useUserStore()
    const isLoggedIn = userStore.checkLoginStatus()
    
    if (isLoggedIn) {
      return '/home'
    }
  }
  
  return true
})

export default router