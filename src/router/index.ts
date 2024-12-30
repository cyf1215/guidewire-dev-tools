import { createRouter, createWebHashHistory } from 'vue-router';
import { h } from 'vue';
import Chat from '@/views/Chat.vue';
import UnderDevelopment from '@/components/UnderDevelopment.vue';

// 创建一个带有视图的布局组件
const RouteView = {
  name: 'RouteView',
  render() {
    return h('div', { class: 'route-view' }, [h('router-view')]);
  },
};

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      redirect: '/chat/ai',
    },
    {
      path: '/chat',
      component: RouteView, // 添加组件
      redirect: '/chat/ai', // 添加重定向
      children: [
        {
          path: 'ai',
          name: 'ai-chat',
          component: Chat,
        },
        {
          path: 'voice',
          name: 'voice-chat',
          component: UnderDevelopment,
        },
      ],
    },
    // 效率相关路由
    {
      path: '/efficiency',
      component: RouteView,
      redirect: '/efficiency/record',
      children: [
        {
          path: 'record',
          name: 'efficiency-record',
          component: UnderDevelopment,
        },
        {
          path: 'reader',
          name: 'efficiency-reader',
          component: UnderDevelopment,
        },
        {
          path: 'ppt',
          name: 'efficiency-ppt',
          component: UnderDevelopment,
        },
      ],
    },
    // 笔记库相关路由
    {
      path: '/notes',
      component: RouteView,
      redirect: '/notes/media',
      children: [
        {
          path: 'media',
          name: 'notes-media',
          component: UnderDevelopment,
        },
        {
          path: 'links',
          name: 'notes-links',
          component: UnderDevelopment,
        },
        {
          path: 'convert',
          name: 'notes-convert',
          component: UnderDevelopment,
        },
      ],
    },
    // 设置相关路由
    {
      path: '/settings',
      component: RouteView,
      redirect: '/settings/system',
      children: [
        {
          path: 'system',
          name: 'settings-system',
          component: () => import('@/views/Settings.vue'),
        },
        {
          path: 'api',
          name: 'settings-api',
          component: () => import('@/views/Settings.vue'),
        },
      ],
    },
    // 捕获所有未匹配的路由
    {
      path: '/:pathMatch(.*)*',
      redirect: '/chat/ai',
    },
  ],
});

export default router;
