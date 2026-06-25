import { createRouter, createWebHistory } from 'vue-router';
import MainLayout from '../layouts/MainLayout.vue';
import Login from '../views/Login.vue';
import Register from '../views/Register.vue';
import Dashboard from '../views/Dashboard.vue';
import Create from '../views/Create.vue';
import History from '../views/History.vue';
import Profile from '../views/Profile.vue';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/login', component: Login },
    { path: '/register', component: Register },
    {
      path: '/',
      component: MainLayout,
      meta: { requiresAuth: true },
      redirect: '/dashboard',
      children: [
        { path: 'dashboard', component: Dashboard },
        { path: 'create', component: Create },
        { path: 'history', component: History },
        { path: 'profile', component: Profile }
      ]
    }
  ]
});

router.beforeEach((to) => {
  const token = localStorage.getItem('token');
  const isAuthPage = to.path === '/login' || to.path === '/register';

  if (to.meta.requiresAuth && !token) {
    return { path: '/login', query: { redirect: to.fullPath } };
  }

  if (isAuthPage && token) {
    return '/dashboard';
  }

  return true;
});

export default router;
