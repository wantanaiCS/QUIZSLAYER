import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'

const routes = [
  {
    path: '/',
    name: 'home',
    component: () => import('@/views/HomeView.vue'),
    meta: { title: 'QuizSlayer — Home' },
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/LoginView.vue'),
    meta: { title: 'QuizSlayer — Login', guestOnly: true },
  },
  {
    path: '/free',
    name: 'free',
    component: () => import('@/views/FreeView.vue'),
    meta: { title: 'QuizSlayer — Free Practice', requiresAuth: true },
  },
  {
    path: '/battle',
    name: 'battle',
    component: () => import('@/views/BattleView.vue'),
    meta: { title: 'QuizSlayer — Battle!', requiresAuth: true },
  },
  {
    path: '/generator',
    name: 'generator',
    component: () => import('@/views/QuizGeneratorView.vue'),
    meta: { title: 'QuizSlayer — Quiz Generator', requiresAuth: true },
  },
  {
    path: '/my-quizzes',
    name: 'quiz-manage',
    component: () => import('@/views/QuizManageView.vue'),
    meta: { title: 'QuizSlayer — ชุดข้อสอบของฉัน', requiresAuth: true },
  },
  {
    path: '/my-quizzes/:id/edit',
    name: 'quiz-edit',
    component: () => import('@/views/QuizEditView.vue'),
    meta: { title: 'QuizSlayer — แก้ไขชุดข้อสอบ', requiresAuth: true },
  },
  {
    path: '/history',
    name: 'history',
    component: () => import('@/views/HistoryView.vue'),
    meta: { title: 'QuizSlayer — Battle History', requiresAuth: true },
  },
  {
    path: '/profile',
    name: 'profile',
    component: () => import('@/views/ProfileView.vue'),
    meta: { title: 'QuizSlayer — Profile', requiresAuth: true },
  },
  {
    path: '/reset-password',
    name: 'reset-password',
    component: () => import('@/views/ResetPasswordView.vue'),
    meta: { title: 'QuizSlayer — Reset Password' },
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    redirect: '/',
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior: () => ({ top: 0 }),
})

// Navigation guards
router.beforeEach(async (to) => {
  // Update page title
  document.title = to.meta.title ?? 'QuizSlayer'

  const authStore = useAuthStore()

  // Initialize auth if not done yet
  if (!authStore.initialized) {
    await authStore.init()
  }

  if (to.meta.requiresAuth && !authStore.user) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }

  if (to.meta.guestOnly && authStore.user) {
    return { name: 'home' }
  }
})

export default router
