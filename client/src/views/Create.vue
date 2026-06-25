<template>
  <div class="create-layout">
    <section class="create-input">
      <div class="section-title">
        <h2>创作输入</h2>
        <p>填写基础信息后，系统会生成适合不同平台的短视频创作方案，并可保存到数据库。</p>
      </div>

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

        <el-button class="full-width" type="primary" size="large" :loading="loading" @click="generate">
          生成创作方案
        </el-button>
      </el-form>
    </section>

    <section class="create-results">
      <div v-if="!result" class="empty-state">
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
            <el-descriptions-item label="推荐发布时间">
              {{ result.publishAdvice.bestTime }}
            </el-descriptions-item>
            <el-descriptions-item label="封面文案">
              {{ result.publishAdvice.coverText }}
            </el-descriptions-item>
            <el-descriptions-item label="互动引导语">
              {{ result.publishAdvice.interactionGuide }}
            </el-descriptions-item>
            <el-descriptions-item label="平台发布建议">
              {{ result.publishAdvice.platformAdvice }}
            </el-descriptions-item>
          </el-descriptions>
        </ResultCard>
      </template>
    </section>
  </div>
</template>

<script setup>
import { computed, reactive, ref } from 'vue';
import { ElMessage } from 'element-plus';
import ResultCard from '../components/ResultCard.vue';
import StoryboardTable from '../components/StoryboardTable.vue';
import TagList from '../components/TagList.vue';
import request from '../utils/request';

const platforms = ['抖音', '小红书', 'B站', '视频号'];
const styles = ['知识科普', '生活分享', '产品种草', '剧情口播'];
const formRef = ref(null);
const loading = ref(false);
const saving = ref(false);
const saved = ref(false);
const result = ref(null);
const generationMode = ref('template');

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

async function generate() {
  const valid = await formRef.value.validate().catch(() => false);
  if (!valid) return;

  loading.value = true;
  try {
    const res = await request.post('/creation/generate', form);
    result.value = res.data;
    generationMode.value = res.generationMode || 'template';
    saved.value = false;
    ElMessage.success('创作方案已生成');
  } catch (error) {
    ElMessage.error(error.message);
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
      publishAdvice: result.value.publishAdvice
    });
    saved.value = true;
    ElMessage.success('保存成功，可在历史记录中查看');
  } catch (error) {
    ElMessage.error(error.message);
  } finally {
    saving.value = false;
  }
}
</script>
