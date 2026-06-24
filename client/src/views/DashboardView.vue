<template>
  <div class="app-shell">
    <header class="topbar">
      <div>
        <h1>智能短视频创作台</h1>
        <span>规则模板模拟 AIGC，接口已预留真实模型替换点</span>
      </div>
      <nav>
        <el-button @click="$router.push('/history')">历史记录</el-button>
        <el-button type="danger" plain @click="logout">退出</el-button>
      </nav>
    </header>

    <main class="workspace">
      <section class="input-card">
        <h2>创作输入</h2>
        <el-form :model="form" label-position="top">
          <el-form-item label="视频主题">
            <el-input v-model="form.topic" placeholder="例如：AI 工具提升学习效率" />
          </el-form-item>
          <el-form-item label="发布平台">
            <el-select v-model="form.platform">
              <el-option v-for="item in platforms" :key="item" :label="item" :value="item" />
            </el-select>
          </el-form-item>
          <el-form-item label="内容风格">
            <el-select v-model="form.style">
              <el-option v-for="item in styles" :key="item" :label="item" :value="item" />
            </el-select>
          </el-form-item>
          <el-form-item label="视频时长">
            <el-radio-group v-model="form.duration">
              <el-radio-button label="15秒" />
              <el-radio-button label="30秒" />
              <el-radio-button label="60秒" />
            </el-radio-group>
          </el-form-item>
          <el-form-item label="目标受众">
            <el-input v-model="form.audience" placeholder="例如：大学生、新手博主、职场新人" />
          </el-form-item>
          <el-button type="primary" size="large" :loading="loading" @click="generate">生成创作方案</el-button>
        </el-form>
      </section>

      <section class="result-panel">
        <div v-if="!result" class="empty-state">
          <h2>等待生成</h2>
          <p>填写主题、平台、风格和受众后，即可生成标题、口播、分镜、标签和发布时间。</p>
        </div>
        <div v-else>
          <div class="result-actions">
            <h2>生成结果</h2>
            <div>
              <el-button @click="copyResult">复制</el-button>
              <el-button @click="downloadTxt">导出 TXT</el-button>
              <el-button @click="downloadJson">导出 JSON</el-button>
            </div>
          </div>
          <el-divider />
          <h3>标题备选</h3>
          <el-tag v-for="title in result.titles" :key="title" class="tag-item">{{ title }}</el-tag>
          <h3>口播文案</h3>
          <p class="script">{{ result.script }}</p>
          <h3>分镜脚本</h3>
          <el-timeline>
            <el-timeline-item v-for="shot in result.storyboard" :key="shot.time" :timestamp="shot.time">
              {{ shot.content }}
            </el-timeline-item>
          </el-timeline>
          <h3>镜头建议</h3>
          <p>{{ result.shotSuggestions }}</p>
          <h3>热门标签</h3>
          <el-tag v-for="tag in result.tags" :key="tag" type="success" class="tag-item">{{ tag }}</el-tag>
          <h3>发布时间 / 封面 / 互动</h3>
          <p>推荐发布时间：{{ result.publishTime }}</p>
          <p>封面文案：{{ result.coverText }}</p>
          <p>互动引导：{{ result.callToAction }}</p>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue';
import { ElMessage } from 'element-plus';
import http from '../api/http';

const platforms = ['抖音', '小红书', 'B站', '视频号'];
const styles = ['知识科普', '生活分享', '产品种草', '剧情口播'];
const loading = ref(false);
const result = ref(null);

const form = reactive({
  topic: '',
  platform: '抖音',
  style: '知识科普',
  duration: '30秒',
  audience: ''
});

async function generate() {
  loading.value = true;
  try {
    const res = await http.post('/creations/generate', form);
    result.value = res.data.result;
    ElMessage.success('创作方案已生成并保存');
  } catch (error) {
    ElMessage.error(error.message);
  } finally {
    loading.value = false;
  }
}

function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('username');
  location.href = '/login';
}

function resultText() {
  return JSON.stringify(result.value, null, 2);
}

async function copyResult() {
  await navigator.clipboard.writeText(resultText());
  ElMessage.success('已复制到剪贴板');
}

function download(content, filename, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function downloadTxt() {
  download(resultText(), 'short-video-plan.txt', 'text/plain;charset=utf-8');
}

function downloadJson() {
  download(resultText(), 'short-video-plan.json', 'application/json;charset=utf-8');
}
</script>
