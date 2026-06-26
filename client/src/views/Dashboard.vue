<template>
  <div class="page-grid">
    <section class="dashboard-hero">
      <div>
        <h2>{{ t('dashboardHero') }}</h2>
        <p>{{ t('dashboardIntro') }}</p>
        <div class="demo-actions">
          <el-button type="primary" size="large" @click="startDemo">{{ t('demoCourse') }}</el-button>
          <el-button size="large" @click="go('/create')">{{ t('startCreate') }}</el-button>
        </div>
      </div>
      <div class="hero-panel">
        <strong>{{ t('todayTipTitle') }}</strong>
        <span>{{ t('todayTip') }}</span>
      </div>
    </section>

    <section class="stats-grid" v-loading="loading">
      <div class="stat-card">
        <strong>{{ stats.total }}</strong>
        <span>{{ t('totalGenerations') }}</span>
      </div>
      <div class="stat-card">
        <strong>{{ stats.total }}</strong>
        <span>{{ t('historyCount') }}</span>
      </div>
      <div class="stat-card">
        <strong>{{ stats.ai }}</strong>
        <span>{{ t('aiCount') }}</span>
      </div>
      <div class="stat-card">
        <strong>{{ stats.template }}</strong>
        <span>{{ t('templateCount') }}</span>
      </div>
      <div class="stat-card stat-wide">
        <strong>{{ stats.latestTime }}</strong>
        <span>{{ t('latestTime') }}</span>
      </div>
    </section>

    <section class="panel-card">
      <div class="section-title trend-title-row">
        <div>
          <h2>{{ t('hotTopicsTitle') }}</h2>
          <p>{{ t('hotTopicsDesc') }}</p>
        </div>
        <el-tag type="primary">{{ todayText }}</el-tag>
      </div>

      <div class="trend-grid">
        <article v-for="item in hotTopics" :key="item.topic" class="trend-card">
          <div class="trend-card-header">
            <el-tag :type="item.tagType">{{ item.platformLabel }}</el-tag>
            <span>{{ t('trendHeat') }} {{ item.heat }}</span>
          </div>
          <h3>{{ item.topic }}</h3>
          <p>{{ item.reason }}</p>
          <div class="trend-meta">
            <span>{{ t('trendStyle') }}：{{ item.styleLabel }}</span>
            <span>{{ t('trendAudience') }}：{{ item.audience }}</span>
          </div>
          <el-button type="primary" plain @click="useTopic(item)">{{ t('trendUse') }}</el-button>
        </article>
      </div>
    </section>

    <section class="feature-grid">
      <article v-for="item in features" :key="item.titleKey" class="feature-card" @click="go(item.path)">
        <h3>{{ t(item.titleKey) }}</h3>
        <p>{{ t(item.descriptionKey) }}</p>
      </article>
    </section>

    <section class="panel-card">
      <div class="section-title">
        <h2>{{ t('systemIntro') }}</h2>
        <p>{{ t('systemIntroText') }}</p>
      </div>
    </section>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { useI18n } from '../i18n';
import request from '../utils/request';

const router = useRouter();
const { t, locale } = useI18n();
const loading = ref(false);

const stats = reactive({
  total: 0,
  ai: 0,
  template: 0,
  latestTime: '-'
});

const features = [
  { titleKey: 'featureCreate', descriptionKey: 'featureCreateDesc', path: '/create' },
  { titleKey: 'featureHistory', descriptionKey: 'featureHistoryDesc', path: '/history' },
  { titleKey: 'featureExport', descriptionKey: 'featureExportDesc', path: '/create' },
  { titleKey: 'featureAigc', descriptionKey: 'featureAigcDesc', path: '/profile' }
];

const topicPresets = {
  'zh-CN': [
    {
      topic: 'AI 工具如何提升内容团队效率',
      reason: 'AI 提效仍是企业内容生产的高关注方向，适合做工具清单、流程拆解和案例对比。',
      platform: '抖音',
      platformLabel: '抖音',
      style: '知识科普',
      styleLabel: '知识科普',
      audience: '内容运营团队',
      heat: '96',
      tagType: 'danger'
    },
    {
      topic: '新消费品牌如何做好短视频转化',
      reason: '品牌增长和种草转化是长期热门需求，适合输出方法论和落地步骤。',
      platform: '小红书',
      platformLabel: '小红书',
      style: '产品种草',
      styleLabel: '产品种草',
      audience: '品牌营销人员',
      heat: '92',
      tagType: 'success'
    },
    {
      topic: '普通人如何搭建个人内容 IP',
      reason: '个人品牌、职场成长和副业内容持续受关注，适合做系列化选题。',
      platform: 'B站',
      platformLabel: 'B站',
      style: '生活分享',
      styleLabel: '生活分享',
      audience: '内容创作者',
      heat: '89',
      tagType: 'warning'
    }
  ],
  'zh-TW': [
    {
      topic: 'AI 工具如何提升內容團隊效率',
      reason: 'AI 提效仍是企業內容生產的高關注方向，適合做工具清單、流程拆解和案例對比。',
      platform: '抖音',
      platformLabel: '抖音',
      style: '知识科普',
      styleLabel: '知識科普',
      audience: '內容營運團隊',
      heat: '96',
      tagType: 'danger'
    },
    {
      topic: '新消費品牌如何做好短影片轉化',
      reason: '品牌增長和種草轉化是長期熱門需求，適合輸出方法論和落地步驟。',
      platform: '小红书',
      platformLabel: '小紅書',
      style: '产品种草',
      styleLabel: '產品種草',
      audience: '品牌行銷人員',
      heat: '92',
      tagType: 'success'
    },
    {
      topic: '普通人如何搭建個人內容 IP',
      reason: '個人品牌、職場成長和副業內容持續受關注，適合做系列化選題。',
      platform: 'B站',
      platformLabel: 'B站',
      style: '生活分享',
      styleLabel: '生活分享',
      audience: '內容創作者',
      heat: '89',
      tagType: 'warning'
    }
  ],
  en: [
    {
      topic: 'How AI tools improve content team efficiency',
      reason: 'AI productivity is a strong topic for teams, tool lists, workflow breakdowns, and case comparisons.',
      platform: '抖音',
      platformLabel: 'Douyin',
      style: '知识科普',
      styleLabel: 'Knowledge',
      audience: 'content operations teams',
      heat: '96',
      tagType: 'danger'
    },
    {
      topic: 'How new consumer brands improve short-video conversion',
      reason: 'Brand growth and conversion remain high-demand topics for practical playbooks and step-by-step content.',
      platform: '小红书',
      platformLabel: 'Xiaohongshu',
      style: '产品种草',
      styleLabel: 'Product Seeding',
      audience: 'brand marketers',
      heat: '92',
      tagType: 'success'
    },
    {
      topic: 'How creators build a personal content IP',
      reason: 'Personal branding and creator growth work well for serial content and long-term audience building.',
      platform: 'B站',
      platformLabel: 'Bilibili',
      style: '生活分享',
      styleLabel: 'Lifestyle',
      audience: 'content creators',
      heat: '89',
      tagType: 'warning'
    }
  ],
  de: [
    {
      topic: 'Wie AI-Tools Content-Teams effizienter machen',
      reason: 'AI-Produktivität ist ein starkes Thema für Teams, Tool-Listen, Workflows und Fallvergleiche.',
      platform: '抖音',
      platformLabel: 'Douyin',
      style: '知识科普',
      styleLabel: 'Wissen',
      audience: 'Content-Operations-Teams',
      heat: '96',
      tagType: 'danger'
    },
    {
      topic: 'Wie neue Marken Kurzvideo-Conversions steigern',
      reason: 'Markenwachstum und Conversion bleiben zentrale Themen für praktische Playbooks.',
      platform: '小红书',
      platformLabel: 'Xiaohongshu',
      style: '产品种草',
      styleLabel: 'Produkt-Empfehlung',
      audience: 'Brand-Marketer',
      heat: '92',
      tagType: 'success'
    },
    {
      topic: 'Wie Creator eine persönliche Content-IP aufbauen',
      reason: 'Personal Branding und Creator-Wachstum eignen sich gut für Serienformate.',
      platform: 'B站',
      platformLabel: 'Bilibili',
      style: '生活分享',
      styleLabel: 'Lifestyle',
      audience: 'Content-Creator',
      heat: '89',
      tagType: 'warning'
    }
  ]
};

const hotTopics = computed(() => topicPresets[locale.value] || topicPresets['zh-CN']);
const todayText = computed(() => new Date().toLocaleDateString(locale.value));

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

function useTopic(item) {
  router.push({
    path: '/create',
    query: {
      topic: item.topic,
      platform: item.platform,
      style: item.style,
      duration: 30,
      audience: item.audience
    }
  });
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
