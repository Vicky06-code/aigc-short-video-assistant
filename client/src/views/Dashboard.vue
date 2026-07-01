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
          <h3>{{ getHotTopicTitle(item) }}</h3>
          <p>{{ getHotTopicReason(item) }}</p>
          <div class="trend-meta">
            <span>{{ t('trendStyle') }}{{ labelSeparator }}{{ getStyleLabel(item.style) }}</span>
            <span>{{ t('trendAudience') }}{{ labelSeparator }}{{ getAudienceLabel(item.audience) }}</span>
          </div>
          <el-button data-testid="hot-topic-use" type="primary" plain @click="useTopic(item)">{{ t('trendUse') }}</el-button>
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

const audienceLabelMap = {
  'zh-CN': {
    内容创作者: '内容创作者',
    大学生: '大学生',
    职场新人: '职场新人',
    品牌运营人员: '品牌运营人员',
    普通用户: '普通用户',
    新手博主: '新手博主'
  },
  'zh-TW': {
    内容创作者: '內容創作者',
    大学生: '大學生',
    职场新人: '職場新人',
    品牌运营人员: '品牌營運人員',
    普通用户: '一般使用者',
    新手博主: '新手創作者'
  },
  en: {
    内容创作者: 'Content creators',
    大学生: 'College students',
    职场新人: 'New professionals',
    品牌运营人员: 'Brand operators',
    普通用户: 'General users',
    新手博主: 'Beginner creators'
  },
  de: {
    内容创作者: 'Content Creator',
    大学生: 'Studierende',
    职场新人: 'Berufseinsteiger',
    品牌运营人员: 'Brand Operators',
    普通用户: 'Allgemeine Nutzer',
    新手博主: 'Neue Creator'
  }
};

const hotTopicDisplayCopy = {
  'zh-CN': {
    title: (item) => item.topic,
    liveReason: '来自今日热榜的高关注话题，适合快速拆解事件背景、用户关注点和可拍摄角度。',
    fallbackReason: '根据日期轮换的备用热点选题，适合在热榜接口不可用时保持每日内容灵感更新。'
  },
  'zh-TW': {
    title: (item) => item.topic,
    liveReason: '來自今日熱榜的高關注話題，適合快速拆解事件背景、使用者關注點和可拍攝角度。',
    fallbackReason: '根據日期輪換的備用熱門選題，適合在熱榜接口不可用時保持每日內容靈感更新。'
  },
  en: {
    title: () => 'Trending short-video idea',
    liveReason: 'A high-attention topic from today’s hot list, ready to turn into a clear short-video angle with background, audience interest, and filming direction.',
    fallbackReason: 'A rotating fallback topic for daily content inspiration when the live hot list is unavailable.'
  },
  de: {
    title: () => 'Trendidee für Kurzvideo',
    liveReason: 'Ein stark beachtetes Thema aus den heutigen Trends, geeignet für Hintergrund, Publikumsinteresse und konkrete Videoansätze.',
    fallbackReason: 'Ein rotierendes Ersatzthema für tägliche Content-Ideen, wenn die Live-Trendliste nicht verfügbar ist.'
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
const labelSeparator = computed(() => (locale.value === 'zh-CN' || locale.value === 'zh-TW' ? '：' : ': '));

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

function getAudienceLabel(audience) {
  return audienceLabelMap[locale.value]?.[audience] || audience;
}

function getHotTopicTitle(item) {
  const copy = hotTopicDisplayCopy[locale.value] || hotTopicDisplayCopy['zh-CN'];
  return copy.title(item);
}

function getHotTopicReason(item) {
  const copy = hotTopicDisplayCopy[locale.value] || hotTopicDisplayCopy['zh-CN'];
  return hotTopicSource.value === 'baidu' ? copy.liveReason : copy.fallbackReason;
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
