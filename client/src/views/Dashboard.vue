<template>
  <div class="page-grid">
    <section class="dashboard-hero">
      <div>
        <h2>基于 AIGC 的智能短视频内容创作辅助系统</h2>
        <p>
          面向课程答辩展示的短视频创作工具，支持从主题输入到标题推荐、口播文案、分镜脚本、
          热门标签和发布建议的一站式生成。
        </p>
        <div class="demo-actions">
          <el-button type="primary" size="large" @click="startDemo">课程演示</el-button>
          <el-button size="large" @click="go('/create')">进入智能创作</el-button>
        </div>
      </div>
      <div class="hero-panel">
        <strong>今日创作提示</strong>
        <span>{{ todayTip }}</span>
      </div>
    </section>

    <section class="stats-grid" v-loading="loading">
      <div class="stat-card">
        <strong>{{ stats.total }}</strong>
        <span>累计生成次数</span>
      </div>
      <div class="stat-card">
        <strong>{{ stats.total }}</strong>
        <span>历史记录数量</span>
      </div>
      <div class="stat-card">
        <strong>{{ stats.ai }}</strong>
        <span>AI 模式生成</span>
      </div>
      <div class="stat-card">
        <strong>{{ stats.template }}</strong>
        <span>模板模式生成</span>
      </div>
      <div class="stat-card stat-wide">
        <strong>{{ stats.latestTime }}</strong>
        <span>最近生成时间</span>
      </div>
    </section>

    <section class="feature-grid">
      <article v-for="item in features" :key="item.title" class="feature-card" @click="go(item.path)">
        <h3>{{ item.title }}</h3>
        <p>{{ item.description }}</p>
      </article>
    </section>

    <section class="panel-card">
      <div class="section-title">
        <h2>系统简介</h2>
        <p>
          当前系统同时支持模板模式和真实 AI 模式。模板模式适合无网络或答辩兜底演示，
          AI 模式可通过服务端 .env 配置 DeepSeek API，实现更自然的创作内容生成。
        </p>
      </div>
    </section>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import request from '../utils/request';

const router = useRouter();
const loading = ref(false);
const todayTip = '先用一个具体问题切入主题，再把解决方法拆成 3 个步骤，生成内容会更像真实短视频方案。';

const stats = reactive({
  total: 0,
  ai: 0,
  template: 0,
  latestTime: '-'
});

const features = [
  { title: '智能创作', description: '输入主题、平台、风格、时长和受众，生成完整创作方案。', path: '/create' },
  { title: '历史记录', description: '查看、筛选、分页、删除已保存的创作方案。', path: '/history' },
  { title: '结果导出', description: '创作页支持一键复制全部内容，便于整理为文档。', path: '/create' },
  { title: 'AIGC 说明', description: '展示模板模式、AI 模式、系统版本和开发信息。', path: '/profile' }
];

function formatTime(value) {
  if (!value) return '-';
  return new Date(value).toLocaleString();
}

function go(path) {
  router.push(path);
}

function startDemo() {
  router.push('/create?demo=1');
}

async function loadStats() {
  loading.value = true;
  try {
    const res = await request.get('/creation/history');
    const records = res.data || [];
    stats.total = records.length;
    stats.ai = records.filter((item) => item.generationMode === 'ai').length;
    stats.template = records.filter((item) => item.generationMode !== 'ai').length;
    stats.latestTime = records[0]?.created_at ? formatTime(records[0].created_at) : '-';
  } catch (error) {
    ElMessage.warning(error.message);
  } finally {
    loading.value = false;
  }
}

onMounted(loadStats);
</script>
