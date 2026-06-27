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
        <div class="trend-source">
          <el-tag type="primary">{{ todayText }}</el-tag>
          <el-tag :type="hotTopicSource === 'baidu' ? 'success' : 'warning'">
            {{ hotTopicSource === 'baidu' ? t('hotSourceRealtime') : t('hotSourceFallback') }}
          </el-tag>
        </div>
      </div>

      <div class="trend-platform-tabs">
        <button
          v-for="item in platformFilters"
          :key="item.value"
          class="trend-platform-tab"
          :class="{ active: activeHotPlatform === item.value }"
          type="button"
          @click="activeHotPlatform = item.value"
        >
          <span>{{ item.label }}</span>
          <strong>{{ item.count }}</strong>
        </button>
      </div>

      <div class="trend-grid" v-loading="hotLoading">
        <article v-for="item in filteredHotTopics" :key="`${item.platform}-${item.topic}`" class="trend-card">
          <div class="trend-card-header">
            <el-tag :type="item.tagType">{{ getPlatformLabel(item.platform) }}</el-tag>
            <span>{{ t('trendHeat') }} {{ item.heat }}</span>
          </div>
          <h3>{{ item.topic }}</h3>
          <p>{{ item.reason }}</p>
          <div class="trend-meta">
            <span>{{ t('trendStyle') }}：{{ getStyleLabel(item.style) }}</span>
            <span>{{ t('trendAudience') }}：{{ item.audience }}</span>
          </div>
          <el-button type="primary" plain @click="useTopic(item)">{{ t('trendUse') }}</el-button>
        </article>
      </div>

      <el-empty v-if="!hotLoading && filteredHotTopics.length === 0" :description="t('emptyPlatformTopics')" />
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
const hotLoading = ref(false);
const hotTopics = ref([]);
const hotTopicSource = ref('fallback');
const activeHotPlatform = ref('all');

const platformValues = ['抖音', '小红书', 'B站', '视频号'];
const platformLabelMap = {
  'zh-CN': ['抖音', '小红书', 'B站', '视频号'],
  'zh-TW': ['抖音', '小紅書', 'B站', '視頻號'],
  en: ['Douyin', 'Xiaohongshu', 'Bilibili', 'WeChat Channels'],
  de: ['Douyin', 'Xiaohongshu', 'Bilibili', 'WeChat Channels']
};

const styleLabelMap = {
  'zh-CN': {
    知识科普: '知识科普',
    生活分享: '生活分享',
    产品种草: '产品种草',
    剧情口播: '剧情口播',
    热点解读: '热点解读',
    教程教学: '教程教学',
    测评体验: '测评体验',
    职场干货: '职场干货',
    情感共鸣: '情感共鸣',
    搞笑娱乐: '搞笑娱乐'
  },
  'zh-TW': {
    知识科普: '知識科普',
    生活分享: '生活分享',
    产品种草: '產品種草',
    剧情口播: '劇情口播',
    热点解读: '熱點解讀',
    教程教学: '教程教學',
    测评体验: '測評體驗',
    职场干货: '職場乾貨',
    情感共鸣: '情感共鳴',
    搞笑娱乐: '搞笑娛樂'
  },
  en: {
    知识科普: 'Knowledge',
    生活分享: 'Lifestyle',
    产品种草: 'Product',
    剧情口播: 'Storytelling',
    热点解读: 'Trend Analysis',
    教程教学: 'Tutorial',
    测评体验: 'Review',
    职场干货: 'Career Tips',
    情感共鸣: 'Emotional',
    搞笑娱乐: 'Comedy'
  },
  de: {
    知识科普: 'Wissen',
    生活分享: 'Lifestyle',
    产品种草: 'Produkt',
    剧情口播: 'Storytelling',
    热点解读: 'Trend-Analyse',
    教程教学: 'Tutorial',
    测评体验: 'Review',
    职场干货: 'Karriere',
    情感共鸣: 'Emotional',
    搞笑娱乐: 'Comedy'
  }
};

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

const todayText = computed(() => new Date().toLocaleDateString(locale.value));

const platformFilters = computed(() => {
  const items = [
    {
      value: 'all',
      label: t('allPlatforms'),
      count: hotTopics.value.length
    }
  ];

  platformValues.forEach((platform, index) => {
    items.push({
      value: platform,
      label: platformLabelMap[locale.value]?.[index] || platform,
      count: hotTopics.value.filter((topic) => topic.platform === platform).length
    });
  });

  return items;
});

const filteredHotTopics = computed(() => {
  if (activeHotPlatform.value === 'all') return hotTopics.value;
  return hotTopics.value.filter((item) => item.platform === activeHotPlatform.value);
});

function getPlatformLabel(platform) {
  const index = platformValues.indexOf(platform);
  return platformLabelMap[locale.value]?.[index] || platform;
}

function getStyleLabel(style) {
  return styleLabelMap[locale.value]?.[style] || style;
}

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
      audience: item.audience,
      creativeRequirement: item.creativeRequirement || ''
    }
  });
}

async function loadHotTopics() {
  hotLoading.value = true;
  try {
    const res = await request.get('/hot-topics');
    hotTopics.value = res.data?.topics || [];
    hotTopicSource.value = res.data?.source || 'fallback';
  } catch (error) {
    hotTopics.value = [];
    hotTopicSource.value = 'fallback';
    ElMessage.warning(error.message);
  } finally {
    hotLoading.value = false;
  }
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

onMounted(() => {
  loadStats();
  loadHotTopics();
});
</script>
