<template>
  <div class="app-shell">
    <header class="topbar">
      <div>
        <h1>AIGC 短视频创作生成</h1>
        <span>规则模板模拟智能生成，后端已预留真实大模型 API 替换入口</span>
      </div>
      <nav>
        <el-button @click="$router.push('/history')">历史记录</el-button>
        <el-button type="danger" plain @click="logout">退出登录</el-button>
      </nav>
    </header>

    <main class="create-layout">
      <section class="create-input">
        <div class="section-title">
          <h2>创作输入</h2>
          <p>输入主题后，系统会组合平台、风格、时长和受众生成完整创作方案。</p>
        </div>

        <el-form :model="form" label-position="top">
          <el-form-item label="视频主题">
            <el-input v-model="form.topic" placeholder="例如：大学生如何提高学习效率" clearable />
          </el-form-item>

          <el-form-item label="发布平台">
            <el-select v-model="form.platform" class="full-width">
              <el-option v-for="item in platforms" :key="item" :label="item" :value="item" />
            </el-select>
          </el-form-item>

          <el-form-item label="内容风格">
            <el-select v-model="form.style" class="full-width">
              <el-option v-for="item in styles" :key="item" :label="item" :value="item" />
            </el-select>
          </el-form-item>

          <el-form-item label="视频时长">
            <el-radio-group v-model="form.duration">
              <el-radio-button :label="15">15 秒</el-radio-button>
              <el-radio-button :label="30">30 秒</el-radio-button>
              <el-radio-button :label="60">60 秒</el-radio-button>
            </el-radio-group>
          </el-form-item>

          <el-form-item label="目标受众">
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
          <p>生成后会展示标题推荐、口播文案、分镜脚本、标签和发布建议。</p>
        </div>

        <template v-else>
          <el-card class="result-card" shadow="never">
            <template #header>
              <div class="card-header">
                <span>标题推荐</span>
                <el-tag type="primary">已选：{{ result.selectedTitle }}</el-tag>
              </div>
            </template>
            <ol class="title-list">
              <li v-for="title in result.titles" :key="title">{{ title }}</li>
            </ol>
          </el-card>

          <el-card class="result-card" shadow="never">
            <template #header>口播文案</template>
            <p class="script">{{ result.speechScript }}</p>
          </el-card>

          <el-card class="result-card" shadow="never">
            <template #header>分镜脚本</template>
            <el-table :data="result.storyboard" border>
              <el-table-column prop="sceneNo" label="镜头编号" width="90" />
              <el-table-column prop="timeRange" label="时间范围" width="100" />
              <el-table-column prop="visual" label="画面内容" min-width="180" />
              <el-table-column prop="voiceover" label="口播内容" min-width="220" />
              <el-table-column prop="subtitle" label="字幕建议" min-width="160" />
              <el-table-column prop="camera" label="镜头建议" min-width="180" />
            </el-table>
          </el-card>

          <el-card class="result-card" shadow="never">
            <template #header>标签</template>
            <el-tag v-for="tag in result.tags" :key="tag" class="tag-item" type="success">
              {{ tag }}
            </el-tag>
          </el-card>

          <el-card class="result-card" shadow="never">
            <template #header>发布建议</template>
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
          </el-card>
        </template>
      </section>
    </main>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue';
import { ElMessage } from 'element-plus';
import request from '../utils/request';

const platforms = ['抖音', '小红书', 'B站', '视频号'];
const styles = ['知识科普', '生活分享', '产品种草', '剧情口播'];
const loading = ref(false);
const result = ref(null);

const form = reactive({
  topic: '',
  platform: '抖音',
  style: '知识科普',
  duration: 30,
  audience: ''
});

function validateForm() {
  if (!form.topic.trim() || !form.audience.trim()) {
    ElMessage.warning('请填写视频主题和目标受众');
    return false;
  }
  return true;
}

async function generate() {
  if (!validateForm()) return;

  loading.value = true;
  try {
    const res = await request.post('/creation/generate', form);
    result.value = res.data;
    ElMessage.success('创作方案已生成');
  } catch (error) {
    ElMessage.error(error.message);
  } finally {
    loading.value = false;
  }
}

function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  location.href = '/login';
}
</script>
