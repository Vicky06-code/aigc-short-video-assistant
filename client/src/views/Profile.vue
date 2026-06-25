<template>
  <div class="profile-grid">
    <section class="panel-card profile-user">
      <div class="profile-avatar">{{ initials }}</div>
      <h2>{{ user?.username || '未命名用户' }}</h2>
      <span class="muted">{{ user?.email || '暂无邮箱信息' }}</span>
      <el-button type="danger" plain @click="logout">退出登录</el-button>
    </section>

    <section class="panel-card">
      <div class="section-title">
        <h2>创作统计</h2>
        <p>统计数据来自历史记录接口，反映当前登录用户的持久化创作结果。</p>
      </div>

      <div class="stats-grid" v-loading="loading">
        <div class="stat-card">
          <strong>{{ stats.total }}</strong>
          <span>累计生成次数</span>
        </div>
        <div class="stat-card">
          <strong>{{ stats.total }}</strong>
          <span>历史记录数量</span>
        </div>
        <div class="stat-card">
          <strong>{{ stats.latestTime }}</strong>
          <span>最近生成时间</span>
        </div>
      </div>

      <el-divider />

      <div class="section-title">
        <h2>系统说明</h2>
        <p>
          本系统用于辅助短视频内容策划，已实现用户认证、AIGC 模板生成、历史记录持久化和后台式导航。
          生成逻辑集中在后端 service 与 templateGenerator 中，后续可平滑替换为真实 AI API。
        </p>
      </div>

      <el-descriptions :column="1" border>
        <el-descriptions-item label="前端技术">Vue3 + Vite + Element Plus + Axios</el-descriptions-item>
        <el-descriptions-item label="后端技术">Node.js + Express + JWT</el-descriptions-item>
        <el-descriptions-item label="数据库">MySQL</el-descriptions-item>
        <el-descriptions-item label="当前生成方式">规则模板 + 参数组合</el-descriptions-item>
      </el-descriptions>
    </section>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue';
import { ElMessage } from 'element-plus';
import request from '../utils/request';

const loading = ref(false);
const stats = reactive({
  total: 0,
  latestTime: '-'
});

const user = computed(() => {
  try {
    return JSON.parse(localStorage.getItem('user') || 'null');
  } catch (error) {
    return null;
  }
});

const initials = computed(() => (user.value?.username || 'AI').slice(0, 2).toUpperCase());

function formatTime(value) {
  if (!value) return '-';
  return new Date(value).toLocaleString();
}

async function loadStats() {
  loading.value = true;
  try {
    const res = await request.get('/creation/history');
    const records = res.data || [];
    stats.total = records.length;
    stats.latestTime = records[0]?.created_at ? formatTime(records[0].created_at) : '-';
  } catch (error) {
    ElMessage.warning(error.message);
  } finally {
    loading.value = false;
  }
}

function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  location.href = '/login';
}

onMounted(loadStats);
</script>
