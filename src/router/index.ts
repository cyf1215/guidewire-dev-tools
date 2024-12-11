import { createRouter, createWebHistory } from 'vue-router'
import MainMenu from '../components/MainMenu.vue'
import Chat from '../views/Chat.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: MainMenu
    },
    {
      path: '/chat',
      name: 'chat',
      component: Chat
    },
    {
      path: '/docs',
      name: 'docs',
      component: () => import('../views/Docs.vue')
    },
    {
      path: '/settings',
      name: 'settings',
      component: () => import('../views/Settings.vue')
    }
  ]
})

export default router
