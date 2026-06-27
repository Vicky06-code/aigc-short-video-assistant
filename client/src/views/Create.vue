<template>
  <div class="create-layout">
    <section class="create-input">
      <div class="section-title">
        <h2>{{ t('createInput') }}</h2>
        <p>{{ t('createInputDesc') }}</p>
      </div>

      <el-alert v-if="isDemo" class="demo-alert" :title="t('demoEnabled')" type="success" show-icon :closable="false" />

      <el-form ref="formRef" :model="form" :rules="rules" label-position="top">
        <el-form-item :label="t('topic')" prop="topic">
          <el-input v-model="form.topic" :placeholder="t('topicPlaceholder')" clearable />
        </el-form-item>

        <el-form-item :label="t('platform')" prop="platform">
          <el-select v-model="form.platform" class="full-width">
            <el-option v-for="item in platforms" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>

        <el-form-item :label="t('style')" prop="style">
          <el-select v-model="form.style" class="full-width">
            <el-option v-for="item in styles" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>

        <el-form-item :label="t('duration')" prop="duration">
          <el-radio-group v-model="form.duration">
            <el-radio-button :label="15">15s</el-radio-button>
            <el-radio-button :label="30">30s</el-radio-button>
            <el-radio-button :label="60">60s</el-radio-button>
          </el-radio-group>
        </el-form-item>

        <el-form-item :label="t('audience')" prop="audience">
          <el-input v-model="form.audience" :placeholder="t('audiencePlaceholder')" clearable />
        </el-form-item>

        <el-form-item :label="t('creativeRequirement')" prop="creativeRequirement">
          <el-input
            v-model="form.creativeRequirement"
            type="textarea"
            :rows="4"
            maxlength="500"
            show-word-limit
            :placeholder="t('creativeRequirementPlaceholder')"
          />
        </el-form-item>

        <GenerationModeSwitch v-model="generationModePreference" />

        <div class="form-actions">
          <el-button class="full-width" type="primary" size="large" :loading="loading" :disabled="loading" @click="generate">
            {{ loading ? t('generating') : t('generate') }}
          </el-button>
          <el-button v-if="result" size="large" :disabled="loading" @click="generate">
            {{ t('regenerate') }}
          </el-button>
        </div>
      </el-form>
    </section>

    <section ref="resultSection" class="create-results">
      <div v-if="loading" class="empty-state">
        <el-icon class="loading-icon"><Loading /></el-icon>
        <h2>{{ t('generating') }}</h2>
        <p>{{ t('generatingDesc') }}</p>
      </div>

      <div v-else-if="!result" class="empty-state">
        <h2>{{ t('waitingGenerate') }}</h2>
        <p>{{ t('waitingGenerateDesc') }}</p>
      </div>

      <template v-else>
        <div class="save-bar">
          <div>
            <strong>{{ t('result') }}</strong>
            <span>{{ modeText }}。{{ saved ? t('savedHint') : t('saveHint') }}</span>
          </div>
          <div class="save-actions">
            <el-tag :type="modeTagType">{{ modeLabel }}</el-tag>
            <el-button @click="copyAll">{{ t('copyAll') }}</el-button>
            <el-button type="success" :loading="saving" :disabled="saved" @click="saveResult">
              {{ saved ? t('saved') : t('savePlan') }}
            </el-button>
          </div>
        </div>

        <el-alert
          v-if="generationMode === 'fallback_template'"
          class="mode-fallback-alert"
          type="warning"
          show-icon
          :closable="false"
          :title="fallbackNotice"
        />

        <ResultCard :title="t('qualityReport')">
          <div class="quality-report">
            <div class="quality-score">
              <el-progress type="dashboard" :percentage="qualityReport.score" :color="qualityColor" />
              <strong>{{ qualityReport.level }}</strong>
              <span>{{ t('qualityScoreDesc') }}</span>
            </div>
            <div class="quality-items">
              <div v-for="item in qualityReport.items" :key="item.label" class="quality-item">
                <div>
                  <strong>{{ item.label }}</strong>
                  <span>{{ item.hint }}</span>
                </div>
                <el-tag :type="item.passed ? 'success' : 'warning'">
                  {{ item.passed ? t('qualityPassed') : t('qualityImprove') }}
                </el-tag>
              </div>
            </div>
          </div>
        </ResultCard>

        <ResultCard :title="t('titleRecommend')">
          <template #extra>
            <el-tag type="primary">{{ t('selected') }}：{{ result.selectedTitle }}</el-tag>
          </template>
          <ol class="title-list">
            <li v-for="title in result.titles" :key="title">{{ title }}</li>
          </ol>
        </ResultCard>

        <ResultCard :title="t('speechScript')">
          <p class="script">{{ result.speechScript }}</p>
        </ResultCard>

        <ResultCard :title="t('storyboard')">
          <StoryboardTable :items="result.storyboard" />
        </ResultCard>

        <ResultCard :title="t('tags')">
          <TagList :tags="result.tags" />
        </ResultCard>

        <ResultCard :title="t('publishAdvice')">
          <el-descriptions :column="1" border>
            <el-descriptions-item :label="t('bestTime')">{{ result.publishAdvice.bestTime }}</el-descriptions-item>
            <el-descriptions-item :label="t('coverText')">{{ result.publishAdvice.coverText }}</el-descriptions-item>
            <el-descriptions-item :label="t('interactionGuide')">{{ result.publishAdvice.interactionGuide }}</el-descriptions-item>
            <el-descriptions-item :label="t('platformAdvice')">{{ result.publishAdvice.platformAdvice }}</el-descriptions-item>
          </el-descriptions>
        </ResultCard>
      </template>
    </section>
  </div>
</template>

<script setup>
import { computed, nextTick, onMounted, reactive, ref } from 'vue';
import { onBeforeRouteLeave, useRoute } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Loading } from '@element-plus/icons-vue';
import GenerationModeSwitch from '../components/GenerationModeSwitch.vue';
import ResultCard from '../components/ResultCard.vue';
import StoryboardTable from '../components/StoryboardTable.vue';
import TagList from '../components/TagList.vue';
import { useI18n } from '../i18n';
import request from '../utils/request';

const route = useRoute();
const { t, locale } = useI18n();
const formRef = ref(null);
const resultSection = ref(null);
const loading = ref(false);
const saving = ref(false);
const saved = ref(false);
const result = ref(null);
const generationMode = ref('template');
const fallbackReason = ref('');
const generationModePreference = ref(localStorage.getItem('generationModePreference') || 'template');
const isDemo = computed(() => route.query.demo === '1');

const platformLabels = {
  'zh-CN': ['抖音', '小红书', 'B站', '视频号'],
  'zh-TW': ['抖音', '小紅書', 'B站', '視頻號'],
  en: ['Douyin', 'Xiaohongshu', 'Bilibili', 'WeChat Channels'],
  de: ['Douyin', 'Xiaohongshu', 'Bilibili', 'WeChat Channels']
};

const styleLabels = {
  'zh-CN': ['知识科普', '生活分享', '产品种草', '剧情口播', '热点解读', '教程教学', '测评体验', '职场干货', '情感共鸣', '搞笑娱乐'],
  'zh-TW': ['知識科普', '生活分享', '產品種草', '劇情口播', '熱點解讀', '教程教學', '測評體驗', '職場乾貨', '情感共鳴', '搞笑娛樂'],
  en: ['Knowledge', 'Lifestyle', 'Product Seeding', 'Storytelling', 'Trend Analysis', 'Tutorial', 'Review', 'Career Tips', 'Emotional', 'Comedy'],
  de: ['Wissen', 'Lifestyle', 'Produkt-Empfehlung', 'Storytelling', 'Trend-Analyse', 'Tutorial', 'Review', 'Karriere-Tipps', 'Emotional', 'Comedy']
};

const platformValues = ['抖音', '小红书', 'B站', '视频号'];
const styleValues = ['知识科普', '生活分享', '产品种草', '剧情口播', '热点解读', '教程教学', '测评体验', '职场干货', '情感共鸣', '搞笑娱乐'];
const platforms = computed(() => platformValues.map((value, index) => ({ value, label: platformLabels[locale.value]?.[index] || value })));
const styles = computed(() => styleValues.map((value, index) => ({ value, label: styleLabels[locale.value]?.[index] || value })));

const form = reactive({
  topic: '',
  platform: '抖音',
  style: '知识科普',
  duration: 30,
  audience: '',
  creativeRequirement: ''
});

const rules = computed(() => ({
  topic: [{ required: true, message: t('topicPlaceholder'), trigger: 'blur' }],
  platform: [{ required: true, message: t('platform'), trigger: 'change' }],
  style: [{ required: true, message: t('style'), trigger: 'change' }],
  duration: [{ required: true, message: t('duration'), trigger: 'change' }],
  audience: [{ required: true, message: t('audiencePlaceholder'), trigger: 'blur' }]
}));

const modeTagType = computed(() => {
  if (generationMode.value === 'ai') return 'success';
  if (generationMode.value === 'fallback_template') return 'warning';
  return 'info';
});

const modeLabel = computed(() => {
  if (generationMode.value === 'ai') return t('aiMode');
  if (generationMode.value === 'fallback_template') return t('fallbackMode');
  return t('templateMode');
});

const modeText = computed(() => {
  if (generationMode.value === 'ai') return t('modeAiText');
  if (generationMode.value === 'fallback_template') return t('modeFallbackText');
  return t('modeTemplateText');
});

const hasUnsavedResult = computed(() => Boolean(result.value) && !saved.value);

const fallbackNotice = computed(() => {
  return fallbackReason.value ? `${t('modeFallbackText')}：${fallbackReason.value}` : t('modeFallbackText');
});

const qualityReport = computed(() => {
  if (!result.value) {
    return { score: 0, level: '-', items: [] };
  }

  const expectedScenes = { 15: 3, 30: 5, 60: 7 }[Number(form.duration)] || 5;
  const minScriptLength = { 15: 45, 30: 90, 60: 160 }[Number(form.duration)] || 90;
  const titleCount = result.value.titles?.length || 0;
  const scriptLength = (result.value.speechScript || '').replace(/\s/g, '').length;
  const storyboardCount = result.value.storyboard?.length || 0;
  const tagCount = result.value.tags?.length || 0;
  const advice = result.value.publishAdvice || {};

  const items = [
    {
      label: t('qualityTitleCount'),
      passed: titleCount >= 5 && Boolean(result.value.selectedTitle),
      hint: t('qualityTitleHint', { count: titleCount })
    },
    {
      label: t('qualityScriptLength'),
      passed: scriptLength >= minScriptLength,
      hint: t('qualityScriptHint', { count: scriptLength, target: minScriptLength })
    },
    {
      label: t('qualityStoryboard'),
      passed: storyboardCount >= expectedScenes,
      hint: t('qualityStoryboardHint', { count: storyboardCount, expected: expectedScenes })
    },
    {
      label: t('qualityTags'),
      passed: tagCount >= 8,
      hint: t('qualityTagsHint', { count: tagCount })
    },
    {
      label: t('qualityAdvice'),
      passed: Boolean(advice.bestTime && advice.coverText && advice.interactionGuide && advice.platformAdvice),
      hint: t('qualityAdviceHint')
    }
  ];

  const score = Math.round((items.filter((item) => item.passed).length / items.length) * 100);
  const level = score >= 90 ? t('qualityExcellent') : score >= 70 ? t('qualityGood') : t('qualityNeedsWork');

  return { score, level, items };
});

const qualityColor = computed(() => {
  if (qualityReport.value.score >= 90) return '#22a06b';
  if (qualityReport.value.score >= 70) return '#2f7cff';
  return '#e6a23c';
});

function fillDemoForm() {
  form.topic = '新品牌如何提升短视频内容转化率';
  form.platform = '抖音';
  form.style = '产品种草';
  form.duration = 30;
  form.audience = '内容运营和品牌营销人员';
  form.creativeRequirement = '像朋友聊天一样自然，加入一个具体例子，结尾给出行动建议。';
}

function fillFromQuery() {
  if (!route.query.topic) return false;

  form.topic = String(route.query.topic || '');
  form.platform = String(route.query.platform || form.platform);
  form.style = String(route.query.style || form.style);
  form.duration = Number(route.query.duration || form.duration);
  form.audience = String(route.query.audience || '');
  form.creativeRequirement = String(route.query.creativeRequirement || form.creativeRequirement || '');
  return true;
}

async function scrollToResult() {
  await nextTick();
  resultSection.value?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

async function generate() {
  if (loading.value) return;

  const valid = await formRef.value.validate().catch(() => false);
  if (!valid) return;

  loading.value = true;
  saved.value = false;
  try {
    localStorage.setItem('generationModePreference', generationModePreference.value);
    const res = await request.post('/creation/generate', {
      ...form,
      generationMode: generationModePreference.value
    });
    result.value = res.data;
    generationMode.value = res.generationMode || 'template';
    fallbackReason.value = res.fallbackReason || '';
    ElMessage.success(t('generate'));
    await scrollToResult();
  } catch (error) {
    ElMessage.error(error.message);
  } finally {
    loading.value = false;
  }
}

async function saveResult() {
  if (!result.value) return false;

  saving.value = true;
  try {
    await request.post('/creation/save', {
      ...form,
      titles: result.value.titles,
      speechScript: result.value.speechScript,
      storyboard: result.value.storyboard,
      tags: result.value.tags,
      publishAdvice: result.value.publishAdvice,
      generationMode: generationMode.value
    });
    saved.value = true;
    ElMessage.success(t('saved'));
    return true;
  } catch (error) {
    ElMessage.error(error.message);
    return false;
  } finally {
    saving.value = false;
  }
}

async function copyAll() {
  if (!result.value) return;

  const storyboardText = result.value.storyboard
    .map((item) => `${item.sceneNo}. ${item.timeRange} | ${item.visual} | ${item.voiceover} | ${item.subtitle} | ${item.camera}`)
    .join('\n');

  const text = [
    `${t('topic')}：${form.topic}`,
    `${t('platform')}：${form.platform}`,
    `${t('style')}：${form.style}`,
    `${t('duration')}：${form.duration}s`,
    `${t('audience')}：${form.audience}`,
    form.creativeRequirement ? `${t('creativeRequirement')}：${form.creativeRequirement}` : '',
    '',
    `${t('titleRecommend')}：`,
    ...(result.value.titles || []).map((title, index) => `${index + 1}. ${title}`),
    '',
    `${t('speechScript')}：\n${result.value.speechScript}`,
    '',
    `${t('storyboard')}：\n${storyboardText}`,
    '',
    `${t('tags')}：${(result.value.tags || []).join(' ')}`,
    '',
    `${t('publishAdvice')}：`,
    `${t('bestTime')}：${result.value.publishAdvice.bestTime}`,
    `${t('coverText')}：${result.value.publishAdvice.coverText}`,
    `${t('interactionGuide')}：${result.value.publishAdvice.interactionGuide}`,
    `${t('platformAdvice')}：${result.value.publishAdvice.platformAdvice}`
  ].join('\n');

  await navigator.clipboard.writeText(text);
  ElMessage.success(t('copyAll'));
}

onMounted(async () => {
  if (isDemo.value) {
    fillDemoForm();
    await nextTick();
    generate();
    return;
  }

  fillFromQuery();
});

onBeforeRouteLeave(async () => {
  if (!hasUnsavedResult.value) return true;

  try {
    await ElMessageBox.confirm(
      t('unsavedCreationMessage'),
      t('unsavedCreationTitle'),
      {
        type: 'warning',
        confirmButtonText: t('saveAndLeave'),
        cancelButtonText: t('leaveWithoutSave'),
        distinguishCancelAndClose: true,
        closeOnClickModal: false
      }
    );

    return saveResult();
  } catch (action) {
    return action === 'cancel';
  }
});
</script>
