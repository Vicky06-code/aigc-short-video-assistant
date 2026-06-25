<template>
  <div class="create-layout">
    <section class="create-input">
      <div class="section-title">
        <h2>创作输入</h2>
        <p>填写基础信息后，系统会生成适合不同平台的短视频创作方案，并可保存到数据库。</p>
      </div>

      <el-alert
        v-if="isDemo"
        class="demo-alert"
        title="课程演示模式已启用，系统已自动填充答辩示例。"
        type="success"
        show-icon
        :closable="false"
      />

      <el-form ref="formRef" :model="form" :rules="rules" label-position="top">
        <el-form-item label="视频主题" prop="topic">
          <el-input v-model="form.topic" placeholder="例如：大学生如何提高学习效率" clearable />
        </el-form-item>

        <el-form-item label="发布平台" prop="platform">
          <el-select v-model="form.platform" class="full-width">
            <el-option v-for="item in platforms" :key="item" :label="item" :value="item" />
          </el-select>
        </el-form-item>

        <el-form-item label="内容风格" prop="style">
          <el-select v-model="form.style" class="full-width">
            <el-option v-for="item in styles" :key="item" :label="item" :value="item" />
          </el-select>
        </el-form-item>

        <el-form-item label="视频时长" prop="duration">
          <el-radio-group v-model="form.duration">
            <el-radio-button :label="15">15 秒</el-radio-button>
            <el-radio-button :label="30">30 秒</el-radio-button>
            <el-radio-button :label="60">60 秒</el-radio-button>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="目标受众" prop="audience">
          <el-input v-model="form.audience" placeholder="例如：大学生、新手博主、职场新人" clearable />
        </el-form-item>

        <div class="form-actions">
          <el-button class="full-width" type="primary" size="large" :loading="loading" :disabled="loading" @click="generate">
            {{ loading ? '正在生成...' : '生成创作方案' }}
          </el-button>
          <el-button v-if="result" size="large" :disabled="loading" @click="generate">
            重新生成
          </el-button>
        </div>
      </el-form>
    </section>

    <section ref="resultSection" class="create-results">
      <div v-if="loading" class="empty-state">
        <el-icon class="loading-icon"><Loading /></el-icon>
        <h2>正在生成</h2>
        <p>系统正在组合标题、口播、分镜、标签和发布建议，请稍等。</p>
      </div>

      <div v-else-if="!result" class="empty-state">
        <h2>等待生成</h2>
        <p>生成后会在这里展示标题推荐、口播文案、分镜脚本、标签和发布建议。</p>
      </div>

      <template v-else>
        <div class="save-bar">
          <div>
            <strong>生成结果</strong>
            <span>{{ modeText }}。{{ saved ? '当前方案已保存到数据库' : '保存后可在历史记录中查看' }}</span>
          </div>
          <div class="save-actions">
            <el-tag :type="modeTagType">{{ modeLabel }}</el-tag>
            <el-button @click="copyAll">一键复制全部内容</el-button>
            <el-button type="success" :loading="saving" :disabled="saved" @click="saveResult">
              {{ saved ? '已保存' : '保存创作方案' }}
            </el-button>
          </div>
        </div>

        <ResultCard title="标题推荐">
          <template #extra>
            <el-tag type="primary">已选：{{ result.selectedTitle }}</el-tag>
          </template>
          <ol class="title-list">
            <li v-for="title in result.titles" :key="title">{{ title }}</li>
          </ol>
        </ResultCard>

        <ResultCard title="口播文案">
          <p class="script">{{ result.speechScript }}</p>
        </ResultCard>

        <ResultCard title="分镜脚本">
          <StoryboardTable :items="result.storyboard" />
        </ResultCard>

        <ResultCard title="标签">
          <TagList :tags="result.tags" />
        </ResultCard>

        <ResultCard title="发布建议">
          <el-descriptions :column="1" border>
            <el-descriptions-item label="推荐发布时间">{{ result.publishAdvice.bestTime }}</el-descriptions-item>
            <el-descriptions-item label="封面文案">{{ result.publishAdvice.coverText }}</el-descriptions-item>
            <el-descriptions-item label="互动引导语">{{ result.publishAdvice.interactionGuide }}</el-descriptions-item>
            <el-descriptions-item label="平台发布建议">{{ result.publishAdvice.platformAdvice }}</el-descriptions-item>
          </el-descriptions>
        </ResultCard>
      </template>
    </section>
  </div>
</template>

<script setup>
import { computed, nextTick, onMounted, reactive, ref } from 'vue';
import { useRoute } from 'vue-router';
import { ElMessage } from 'element-plus';
import { Loading } from '@element-plus/icons-vue';
import ResultCard from '../components/ResultCard.vue';
import StoryboardTable from '../components/StoryboardTable.vue';
import TagList from '../components/TagList.vue';
import request from '../utils/request';

const platforms = ['抖音', '小红书', 'B站', '视频号'];
const styles = ['知识科普', '生活分享', '产品种草', '剧情口播'];
const route = useRoute();
const formRef = ref(null);
const resultSection = ref(null);
const loading = ref(false);
const saving = ref(false);
const saved = ref(false);
const result = ref(null);
const generationMode = ref('template');

const isDemo = computed(() => route.query.demo === '1');

const form = reactive({
  topic: '',
  platform: '抖音',
  style: '知识科普',
  duration: 30,
  audience: ''
});

const rules = {
  topic: [{ required: true, message: '请输入视频主题', trigger: 'blur' }],
  platform: [{ required: true, message: '请选择发布平台', trigger: 'change' }],
  style: [{ required: true, message: '请选择内容风格', trigger: 'change' }],
  duration: [{ required: true, message: '请选择视频时长', trigger: 'change' }],
  audience: [{ required: true, message: '请输入目标受众', trigger: 'blur' }]
};

const modeLabelMap = {
  ai: 'AI 智能生成',
  template: '模板规则生成',
  fallback_template: '兜底模板模式'
};

const modeTextMap = {
  ai: '当前生成模式：AI 智能生成',
  template: '当前生成模式：模板规则生成',
  fallback_template: 'AI 调用失败，已自动切换为模板生成'
};

const modeTagType = computed(() => {
  if (generationMode.value === 'ai') return 'success';
  if (generationMode.value === 'fallback_template') return 'warning';
  return 'info';
});

const modeLabel = computed(() => modeLabelMap[generationMode.value] || modeLabelMap.template);
const modeText = computed(() => modeTextMap[generationMode.value] || modeTextMap.template);

function fillDemoForm() {
  form.topic = '大学生如何提高学习效率';
  form.platform = '小红书';
  form.style = '知识科普';
  form.duration = 30;
  form.audience = '大学生';
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
    const res = await request.post('/creation/generate', { ...form });
    result.value = res.data;
    generationMode.value = res.generationMode || 'template';
    ElMessage.success('创作方案已生成');
    await scrollToResult();
  } catch (error) {
    ElMessage.error(error.message || '生成失败，请稍后重试');
  } finally {
    loading.value = false;
  }
}

async function saveResult() {
  if (!result.value) return;

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
    ElMessage.success('保存成功，可在历史记录中查看');
  } catch (error) {
    ElMessage.error(error.message || '保存失败');
  } finally {
    saving.value = false;
  }
}

async function copyAll() {
  if (!result.value) return;

  const storyboardText = result.value.storyboard
    .map((item) => `${item.sceneNo}. ${item.timeRange}｜${item.visual}｜${item.voiceover}｜${item.subtitle}｜${item.camera}`)
    .join('\n');

  const text = [
    `主题：${form.topic}`,
    `平台：${form.platform}`,
    `风格：${form.style}`,
    `时长：${form.duration}秒`,
    `目标受众：${form.audience}`,
    '',
    '标题推荐：',
    ...(result.value.titles || []).map((title, index) => `${index + 1}. ${title}`),
    '',
    `口播文案：\n${result.value.speechScript}`,
    '',
    `分镜脚本：\n${storyboardText}`,
    '',
    `标签：${(result.value.tags || []).join(' ')}`,
    '',
    '发布建议：',
    `推荐发布时间：${result.value.publishAdvice.bestTime}`,
    `封面文案：${result.value.publishAdvice.coverText}`,
    `互动引导语：${result.value.publishAdvice.interactionGuide}`,
    `平台发布建议：${result.value.publishAdvice.platformAdvice}`
  ].join('\n');

  await navigator.clipboard.writeText(text);
  ElMessage.success('已复制全部创作内容');
}

onMounted(async () => {
  if (isDemo.value) {
    fillDemoForm();
    await nextTick();
    generate();
  }
});
</script>
