<template>
  <div class="main-layout">
    <aside class="layout-sidebar">
      <div class="brand-block">
        <div class="brand-mark">AI</div>
        <div>
          <strong>{{ t('brandTitle') }}</strong>
          <span>{{ t('brandSubTitle') }}</span>
        </div>
      </div>

      <el-menu :default-active="$route.path" router class="side-menu">
        <el-menu-item index="/dashboard" data-testid="nav-dashboard">
          <span>{{ t('navDashboard') }}</span>
        </el-menu-item>
        <el-menu-item index="/create" data-testid="nav-create">
          <span>{{ t('navCreate') }}</span>
        </el-menu-item>
        <el-menu-item index="/history" data-testid="nav-history">
          <span>{{ t('navHistory') }}</span>
        </el-menu-item>
        <el-menu-item index="/profile" data-testid="nav-profile">
          <span>{{ t('navProfile') }}</span>
        </el-menu-item>
      </el-menu>
    </aside>

    <section class="layout-main">
      <header class="layout-topbar">
        <div>
          <h1>{{ pageTitle }}</h1>
          <p>{{ pageSubtitle }}</p>
        </div>
        <div class="topbar-user">
          <LanguageSwitcher />
          <span>{{ user?.username || t('creator') }}</span>
          <el-button data-testid="topbar-create" type="primary" plain @click="$router.push('/create')">{{ t('startCreate') }}</el-button>
        </div>
      </header>

      <main class="layout-content">
        <router-view />
      </main>
    </section>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import LanguageSwitcher from '../components/LanguageSwitcher.vue';
import { useI18n } from '../i18n';

const route = useRoute();
const { t } = useI18n();
const user = computed(() => {
  try {
    return JSON.parse(localStorage.getItem('user') || 'null');
  } catch (error) {
    return null;
  }
});

const titleMap = {
  '/dashboard': ['pageDashboardTitle', 'pageDashboardSub'],
  '/create': ['pageCreateTitle', 'pageCreateSub'],
  '/history': ['pageHistoryTitle', 'pageHistorySub'],
  '/profile': ['pageProfileTitle', 'pageProfileSub']
};

const pageInfo = computed(() => titleMap[route.path] || titleMap['/dashboard']);
const pageTitle = computed(() => t(pageInfo.value[0]));
const pageSubtitle = computed(() => t(pageInfo.value[1]));
</script>
