<template>
  <div class="profile-grid">
    <section class="panel-card profile-user">
      <div class="profile-avatar">{{ initials }}</div>
      <h2>{{ currentUser?.username || t('creator') }}</h2>
      <span class="muted">{{ currentUser?.email || '-' }}</span>
      <div class="profile-actions">
        <el-button type="primary" @click="openUsernameDialog">{{ t('updateUsername') }}</el-button>
        <el-button @click="passwordDialogVisible = true">{{ t('updatePassword') }}</el-button>
        <el-button type="danger" plain @click="logout">{{ t('logout') }}</el-button>
      </div>
    </section>

    <section class="panel-card">
      <div class="section-title">
        <h2>{{ t('profileStats') }}</h2>
        <p>{{ t('profileStatsDesc') }}</p>
      </div>

      <div class="stats-grid" v-loading="loading">
        <div class="stat-card">
          <strong>{{ stats.total }}</strong>
          <span>{{ t('totalGenerations') }}</span>
        </div>
        <div class="stat-card">
          <strong>{{ stats.total }}</strong>
          <span>{{ t('historyCount') }}</span>
        </div>
        <div class="stat-card">
          <strong>{{ stats.latestTime }}</strong>
          <span>{{ t('latestTime') }}</span>
        </div>
      </div>

      <el-divider />

      <div class="section-title">
        <h2>{{ t('systemIntro') }}</h2>
        <p>{{ t('profileSystemDesc') }}</p>
      </div>

      <el-descriptions :column="1" border>
        <el-descriptions-item :label="t('frontendTech')">Vue3 + Vite + Element Plus + Axios</el-descriptions-item>
        <el-descriptions-item :label="t('backendTech')">Node.js + Express + JWT</el-descriptions-item>
        <el-descriptions-item :label="t('database')">MySQL</el-descriptions-item>
        <el-descriptions-item :label="t('systemVersion')">v1.0.0 Production Ready</el-descriptions-item>
        <el-descriptions-item :label="t('developerInfo')">AIGC Short Video Assistant</el-descriptions-item>
      </el-descriptions>
    </section>

    <el-dialog v-model="usernameDialogVisible" :title="t('updateUsername')" width="420px">
      <el-form ref="usernameFormRef" :model="usernameForm" :rules="usernameRules" label-position="top">
        <el-form-item :label="t('newUsername')" prop="username">
          <el-input v-model="usernameForm.username" maxlength="30" show-word-limit />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="usernameDialogVisible = false">{{ t('cancel') }}</el-button>
        <el-button type="primary" :loading="updatingUsername" @click="updateUsername">{{ t('save') }}</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="passwordDialogVisible" :title="t('updatePassword')" width="420px">
      <el-form ref="passwordFormRef" :model="passwordForm" :rules="passwordRules" label-position="top">
        <el-form-item :label="t('oldPassword')" prop="oldPassword">
          <el-input v-model="passwordForm.oldPassword" type="password" show-password />
        </el-form-item>
        <el-form-item :label="t('newPassword')" prop="newPassword">
          <el-input v-model="passwordForm.newPassword" type="password" :placeholder="t('passwordRule')" show-password />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="passwordDialogVisible = false">{{ t('cancel') }}</el-button>
        <el-button type="primary" :loading="updatingPassword" @click="changePassword">{{ t('save') }}</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue';
import { ElMessage } from 'element-plus';
import { useI18n } from '../i18n';
import request from '../utils/request';

const { t } = useI18n();
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

const usernameRules = computed(() => ({
  username: [{ required: true, min: 2, max: 30, message: t('inputUsername'), trigger: 'blur' }]
}));

const passwordRules = computed(() => ({
  oldPassword: [{ required: true, message: t('inputPassword'), trigger: 'blur' }],
  newPassword: [
    { required: true, message: t('inputNewPassword'), trigger: 'blur' },
    {
      pattern: /^(?=.*[A-Za-z])(?=.*\d)[^\s]{8,20}$/,
      message: t('passwordRule'),
      trigger: ['blur', 'change']
    }
  ]
}));

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
    ElMessage.success(t('save'));
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
    ElMessage.success(t('save'));
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
