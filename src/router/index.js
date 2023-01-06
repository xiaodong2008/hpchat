import {createRouter, createWebHistory} from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'default',
    component: () => import('@/views/home')
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/login')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes: routes
})

export default router