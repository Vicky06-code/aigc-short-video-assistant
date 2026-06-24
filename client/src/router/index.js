import { createRouter, createWebHistory } from 'vue-router';
import LoginView from '../views/LoginView.vue';
import RegisterView from '../views/RegisterView.vue';
import DashboardView from '../views/DashboardView.vue';
import HistoryView from '../views/HistoryView.vue';
import DetailView from '../views/DetailView.vue';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', redirect: '/dashboard' },
    { path: '/login', component: LoginView },
    { path: '/register', component: RegisterView },
    { path: '/dashboard', component: DashboardView, meta: { requiresAuth: true } },
    { path: '/history', component: HistoryView, meta: { requiresAuth: true } },
    { path: '/history/:id', component: DetailView, meta: { requiresAuth: true } }
  ]
});

router.beforeEach((to) => {
  const token = localStorage.getItem('token');
  if (to.meta.requiresAuth && !token) {
    return '/login';
  }
  if ((to.path === '/login' || to.path === '/register') && token) {
    return '/dashboard';
  }
  return true;
});

export default router;
