<template>
  <div class="auth-page">
    <div class="auth-language">
      <LanguageSwitcher />
    </div>
    <div class="auth-panel">
      <h1>{{ t('registerTitle') }}</h1>
      <p>{{ t('registerIntro') }}</p>

      <el-form ref="formRef" :model="form" :rules="rules" label-position="top" @submit.prevent>
        <el-form-item :label="t('username')" prop="username">
          <el-input v-model="form.username" :placeholder="t('inputUsername')" clearable />
        </el-form-item>

        <el-form-item :label="t('email')" prop="email">
          <el-input v-model="form.email" :placeholder="t('inputEmail')" clearable />
        </el-form-item>

        <el-form-item :label="t('password')" prop="password">
          <el-input v-model="form.password" type="password" :placeholder="t('passwordRule')" show-password />
        </el-form-item>

        <el-form-item :label="t('confirmPassword')" prop="confirmPassword">
          <el-input v-model="form.confirmPassword" type="password" :placeholder="t('inputConfirmPassword')" show-password />
        </el-form-item>

        <div class="auth-actions">
          <el-button type="primary" size="large" :loading="loading" @click="submit">{{ t('register') }}</el-button>
          <el-button link @click="$router.push('/login')">{{ t('goLogin') }}</el-button>
        </div>
      </el-form>
    </div>
  </div>
</template>

<script setup>
import { computed, reactive, ref } from 'vue';
import { ElMessage } from 'element-plus';
import { useRouter } from 'vue-router';
import LanguageSwitcher from '../components/LanguageSwitcher.vue';
import { useI18n } from '../i18n';
import request from '../utils/request';

const router = useRouter();
const { t } = useI18n();
const formRef = ref(null);
const loading = ref(false);

const form = reactive({
  username: '',
  email: '',
  password: '',
  confirmPassword: ''
});

function validateConfirmPassword(rule, value, callback) {
  if (value !== form.password) {
    callback(new Error(t('passwordNotMatch')));
    return;
  }
  callback();
}

function validatePassword(rule, value, callback) {
  if (!/^(?=.*[A-Za-z])(?=.*\d)[^\s]{8,20}$/.test(value || '')) {
    callback(new Error(t('passwordRule')));
    return;
  }
  callback();
}

const rules = computed(() => ({
  username: [
    { required: true, message: t('inputUsername'), trigger: 'blur' },
    { min: 2, max: 20, message: '2-20', trigger: 'blur' }
  ],
  email: [
    { required: true, message: t('inputEmail'), trigger: 'blur' },
    { type: 'email', message: t('emailInvalid'), trigger: ['blur', 'change'] }
  ],
  password: [
    { required: true, message: t('inputPassword'), trigger: 'blur' },
    { validator: validatePassword, trigger: ['blur', 'change'] }
  ],
  confirmPassword: [
    { required: true, message: t('inputConfirmPassword'), trigger: 'blur' },
    { validator: validateConfirmPassword, trigger: ['blur', 'change'] }
  ]
}));

async function submit() {
  const valid = await formRef.value.validate().catch(() => false);
  if (!valid) return;

  loading.value = true;
  try {
    await request.post('/auth/register', {
      username: form.username,
      email: form.email,
      password: form.password
    });
    ElMessage.success(t('registerSuccess'));
    router.push('/login');
  } catch (error) {
    ElMessage.error(error.message);
  } finally {
    loading.value = false;
  }
}
</script>
