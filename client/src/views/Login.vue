<template>
  <div class="auth-page">
    <div class="auth-language">
      <LanguageSwitcher />
    </div>
    <div class="auth-panel">
      <h1>{{ t('loginTitle') }}</h1>
      <p>{{ t('loginIntro') }}</p>

      <el-form ref="formRef" :model="form" :rules="rules" label-position="top" @submit.prevent>
        <el-form-item :label="t('email')" prop="email">
          <el-input v-model="form.email" :placeholder="t('inputEmail')" clearable />
        </el-form-item>

        <el-form-item :label="t('password')" prop="password">
          <el-input v-model="form.password" type="password" :placeholder="t('inputPassword')" show-password />
        </el-form-item>

        <div class="auth-actions">
          <el-button class="auth-submit" type="primary" size="large" :loading="loading" @click="submit">{{ t('login') }}</el-button>
          <div class="auth-links">
            <el-button link @click="resetDialogVisible = true">{{ t('forgotPassword') }}</el-button>
            <span class="auth-link-divider"></span>
            <el-button link @click="$router.push('/register')">{{ t('goRegister') }}</el-button>
          </div>
        </div>
      </el-form>
    </div>

    <el-dialog v-model="resetDialogVisible" :title="t('resetPassword')" width="440px" align-center>
      <el-form ref="resetFormRef" :model="resetForm" :rules="resetRules" label-position="top" @submit.prevent>
        <el-form-item :label="t('email')" prop="email">
          <div class="verification-row">
            <el-input v-model="resetForm.email" :placeholder="t('inputEmail')" clearable />
            <el-button :loading="sendingCode" :disabled="countdown > 0" @click="sendCode">
              {{ countdown > 0 ? `${countdown}s` : t('sendCode') }}
            </el-button>
          </div>
        </el-form-item>

        <el-form-item :label="t('verificationCode')" prop="code">
          <el-input v-model="resetForm.code" :placeholder="t('inputVerificationCode')" maxlength="6" clearable />
        </el-form-item>

        <el-form-item :label="t('newPassword')" prop="newPassword">
          <el-input v-model="resetForm.newPassword" type="password" :placeholder="t('passwordRule')" show-password />
        </el-form-item>

        <el-form-item :label="t('confirmPassword')" prop="confirmPassword">
          <el-input v-model="resetForm.confirmPassword" type="password" :placeholder="t('inputConfirmPassword')" show-password />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="resetDialogVisible = false">{{ t('cancel') }}</el-button>
        <el-button type="primary" :loading="resetting" @click="confirmReset">{{ t('confirmReset') }}</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { computed, onUnmounted, reactive, ref } from 'vue';
import { ElMessage } from 'element-plus';
import { useRoute, useRouter } from 'vue-router';
import LanguageSwitcher from '../components/LanguageSwitcher.vue';
import { useI18n } from '../i18n';
import request from '../utils/request';

const router = useRouter();
const route = useRoute();
const { t } = useI18n();
const formRef = ref(null);
const resetFormRef = ref(null);
const loading = ref(false);
const sendingCode = ref(false);
const resetting = ref(false);
const resetDialogVisible = ref(false);
const countdown = ref(0);
let countdownTimer = null;

const form = reactive({
  email: '',
  password: ''
});

const resetForm = reactive({
  email: '',
  code: '',
  newPassword: '',
  confirmPassword: ''
});

const rules = computed(() => ({
  email: [
    { required: true, message: t('inputEmail'), trigger: 'blur' },
    { type: 'email', message: t('emailInvalid'), trigger: ['blur', 'change'] }
  ],
  password: [{ required: true, message: t('inputPassword'), trigger: 'blur' }]
}));

const resetRules = computed(() => ({
  email: [
    { required: true, message: t('inputEmail'), trigger: 'blur' },
    { type: 'email', message: t('emailInvalid'), trigger: ['blur', 'change'] }
  ],
  code: [
    { required: true, message: t('inputVerificationCode'), trigger: 'blur' },
    { pattern: /^\d{6}$/, message: t('verificationCodeInvalid'), trigger: ['blur', 'change'] }
  ],
  newPassword: [
    { required: true, message: t('inputNewPassword'), trigger: 'blur' },
    {
      pattern: /^(?=.*[A-Za-z])(?=.*\d)[^\s]{8,20}$/,
      message: t('passwordRule'),
      trigger: ['blur', 'change']
    }
  ],
  confirmPassword: [
    { required: true, message: t('inputConfirmPassword'), trigger: 'blur' },
    {
      validator: (_, value, callback) => {
        if (value !== resetForm.newPassword) {
          callback(new Error(t('passwordNotMatch')));
          return;
        }
        callback();
      },
      trigger: ['blur', 'change']
    }
  ]
}));

async function submit() {
  const valid = await formRef.value.validate().catch(() => false);
  if (!valid) return;

  loading.value = true;
  try {
    const res = await request.post('/auth/login', form);
    localStorage.setItem('token', res.token);
    localStorage.setItem('user', JSON.stringify(res.user));
    ElMessage.success(t('loginSuccess'));
    router.push(route.query.redirect || '/dashboard');
  } catch (error) {
    ElMessage.error(error.message);
  } finally {
    loading.value = false;
  }
}

function startCountdown() {
  countdown.value = 60;
  clearInterval(countdownTimer);
  countdownTimer = setInterval(() => {
    countdown.value -= 1;
    if (countdown.value <= 0) {
      clearInterval(countdownTimer);
      countdownTimer = null;
    }
  }, 1000);
}

async function sendCode() {
  const validEmail = await resetFormRef.value.validateField('email').catch(() => false);
  if (validEmail === false) return;

  sendingCode.value = true;
  try {
    await request.post('/auth/password-reset/request', { email: resetForm.email });
    ElMessage.success(t('verificationCodeSent'));
    startCountdown();
  } catch (error) {
    ElMessage.error(error.message);
  } finally {
    sendingCode.value = false;
  }
}

async function confirmReset() {
  const valid = await resetFormRef.value.validate().catch(() => false);
  if (!valid) return;

  resetting.value = true;
  try {
    await request.post('/auth/password-reset/confirm', {
      email: resetForm.email,
      code: resetForm.code,
      newPassword: resetForm.newPassword
    });
    ElMessage.success(t('passwordResetSuccess'));
    resetDialogVisible.value = false;
    form.email = resetForm.email;
    form.password = '';
    resetForm.code = '';
    resetForm.newPassword = '';
    resetForm.confirmPassword = '';
  } catch (error) {
    ElMessage.error(error.message);
  } finally {
    resetting.value = false;
  }
}

onUnmounted(() => {
  clearInterval(countdownTimer);
});
</script>
