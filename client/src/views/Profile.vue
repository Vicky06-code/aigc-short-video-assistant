<template>
  <div class="profile-grid">
    <section class="panel-card profile-user">
      <div class="profile-avatar">{{ initials }}</div>
      <h2>{{ currentUser?.username || '未命名用户' }}</h2>
      <span class="muted">{{ currentUser?.email || '暂无邮箱信息' }}</span>
      <div class="profile-actions">
        <el-button type="primary" @click="openUsernameDialog">修改用户名</el-button>
        <el-button @click="passwordDialogVisible = true">修改密码</el-button>
        <el-button type="danger" plain @click="logout">退出登录</el-button>
      </div>
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
          本系统用于辅助短视频内容策划，已实现用户认证、AI/模板双模式生成、历史记录持久化和后台式导航。
          服务端保留 DeepSeek API 接入能力，答辩现场可随时切回模板模式兜底演示。
        </p>
      </div>

      <el-descriptions :column="1" border>
        <el-descriptions-item label="前端技术">Vue3 + Vite + Element Plus + Axios</el-descriptions-item>
        <el-descriptions-item label="后端技术">Node.js + Express + JWT</el-descriptions-item>
        <el-descriptions-item label="数据库">MySQL</el-descriptions-item>
        <el-descriptions-item label="系统版本">v1.0.0 MVP 展示版</el-descriptions-item>
        <el-descriptions-item label="开发信息">课程大作业：基于 AIGC 的智能短视频内容创作辅助系统</el-descriptions-item>
      </el-descriptions>
    </section>

    <el-dialog v-model="usernameDialogVisible" title="修改用户名" width="420px">
      <el-form ref="usernameFormRef" :model="usernameForm" :rules="usernameRules" label-position="top">
        <el-form-item label="新用户名" prop="username">
          <el-input v-model="usernameForm.username" maxlength="30" show-word-limit />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="usernameDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="updatingUsername" @click="updateUsername">保存</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="passwordDialogVisible" title="修改密码" width="420px">
      <el-form ref="passwordFormRef" :model="passwordForm" :rules="passwordRules" label-position="top">
        <el-form-item label="原密码" prop="oldPassword">
          <el-input v-model="passwordForm.oldPassword" type="password" show-password />
        </el-form-item>
        <el-form-item label="新密码" prop="newPassword">
          <el-input v-model="passwordForm.newPassword" type="password" show-password />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="passwordDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="updatingPassword" @click="changePassword">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue';
import { ElMessage } from 'element-plus';
import request from '../utils/request';

const loading = ref(false);
const updatingUsername = ref(false);
const updatingPassword = ref(false);
const usernameDialogVisible = ref(false);
const passwordDialogVisible = ref(false);
const usernameFormRef = ref(null);
const passwordFormRef = ref(null);

const stats = reactive({
  total: 0,
  latestTime: '-'
});

const userState = ref(readUser());

const currentUser = computed(() => userState.value);
const initials = computed(() => (currentUser.value?.username || 'AI').slice(0, 2).toUpperCase());

const usernameForm = reactive({
  username: ''
});

const passwordForm = reactive({
  oldPassword: '',
  newPassword: ''
});

const usernameRules = {
  username: [{ required: true, min: 2, max: 30, message: '用户名长度为 2 到 30 个字符', trigger: 'blur' }]
};

const passwordRules = {
  oldPassword: [{ required: true, message: '请输入原密码', trigger: 'blur' }],
  newPassword: [{ required: true, min: 6, message: '新密码至少 6 位', trigger: 'blur' }]
};

function readUser() {
  try {
    return JSON.parse(localStorage.getItem('user') || 'null');
  } catch (error) {
    return null;
  }
}

function setUser(user) {
  userState.value = user;
  localStorage.setItem('user', JSON.stringify(user));
}

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

function openUsernameDialog() {
  usernameForm.username = currentUser.value?.username || '';
  usernameDialogVisible.value = true;
}

async function updateUsername() {
  const valid = await usernameFormRef.value.validate().catch(() => false);
  if (!valid) return;

  updatingUsername.value = true;
  try {
    const res = await request.put('/auth/profile', { username: usernameForm.username.trim() });
    setUser(res.data);
    usernameDialogVisible.value = false;
    ElMessage.success('用户名已更新');
  } catch (error) {
    ElMessage.error(error.message);
  } finally {
    updatingUsername.value = false;
  }
}

async function changePassword() {
  const valid = await passwordFormRef.value.validate().catch(() => false);
  if (!valid) return;

  updatingPassword.value = true;
  try {
    await request.put('/auth/password', { ...passwordForm });
    passwordDialogVisible.value = false;
    passwordForm.oldPassword = '';
    passwordForm.newPassword = '';
    ElMessage.success('密码已更新，请妥善保存');
  } catch (error) {
    ElMessage.error(error.message);
  } finally {
    updatingPassword.value = false;
  }
}

function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  location.href = '/login';
}

onMounted(loadStats);
</script>
