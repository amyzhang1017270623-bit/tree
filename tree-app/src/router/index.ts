import { createRouter, createWebHashHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'Splash',
    component: () => import('../views/SplashView.vue')
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('../views/RegisterView.vue')
  },
  {
    path: '/home',
    name: 'Home',
    component: () => import('../views/HomeView.vue')
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
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
