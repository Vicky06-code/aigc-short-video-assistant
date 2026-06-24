import { createRouter, createWebHistory } from 'vue-router';
import Login from '../views/Login.vue';
import Register from '../views/Register.vue';
import DashboardView from '../views/DashboardView.vue';
import HistoryView from '../views/HistoryView.vue';
import DetailView from '../views/DetailView.vue';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', redirect: '/dashboard' },
    { path: '/login', component: Login },
    { path: '/register', component: Register },
    { path: '/dashboard', component: DashboardView, meta: { requiresAuth: true } },
    { path: '/history', component: HistoryView, meta: { requiresAuth: true } },
    { path: '/history/:id', component: DetailView, meta: { requiresAuth: true } }
  ]
});

router.beforeEach((to) => {
  const token = localStorage.getItem('token');
  if (to.meta.requiresAuth && !token) {
    return { path: '/login', query: { redirect: to.fullPath } };
  }
  if ((to.path === '/login' || to.path === '/register') && token) {
    return '/dashboard';
  }
  return true;
});

export default router;
