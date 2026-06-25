<template>
  <div class="main-layout">
    <aside class="layout-sidebar">
      <div class="brand-block">
        <div class="brand-mark">AI</div>
        <div>
          <strong>短视频助手</strong>
          <span>AIGC Creator</span>
        </div>
      </div>

      <el-menu :default-active="$route.path" router class="side-menu">
        <el-menu-item index="/dashboard">
          <span>工作台</span>
        </el-menu-item>
        <el-menu-item index="/create">
          <span>智能创作</span>
        </el-menu-item>
        <el-menu-item index="/history">
          <span>历史记录</span>
        </el-menu-item>
        <el-menu-item index="/profile">
          <span>个人中心</span>
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
          <span>{{ user?.username || '创作者' }}</span>
          <el-button type="primary" plain @click="$router.push('/create')">开始创作</el-button>
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

const route = useRoute();
const user = computed(() => {
  try {
    return JSON.parse(localStorage.getItem('user') || 'null');
  } catch (error) {
    return null;
  }
});

const titleMap = {
  '/dashboard': ['工作台', '查看系统能力与今日创作提示'],
  '/create': ['智能创作', '输入选题信息，生成完整短视频方案'],
  '/history': ['历史记录', '管理已生成的创作方案'],
  '/profile': ['个人中心', '查看账号信息与系统说明']
};

const pageInfo = computed(() => titleMap[route.path] || titleMap['/dashboard']);
const pageTitle = computed(() => pageInfo.value[0]);
const pageSubtitle = computed(() => pageInfo.value[1]);
</script>
