import { createRouter, createWebHashHistory } from 'vue-router';

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('./components/MainMenu.vue')
    },
    {
      path: '/chat',
      name: 'chat',
      component: () => import('./views/Chat.vue')
    },
    {
      path: '/docs',
      name: 'docs',
      component: () => import('./views/Docs.vue')
    },
    {
      path: '/settings',
      name: 'settings',
      component: () => import('./views/Settings.vue')
    }
  ]
});

export default router;
