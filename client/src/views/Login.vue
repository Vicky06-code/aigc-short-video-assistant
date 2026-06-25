<template>
  <div class="auth-page">
    <div class="auth-panel">
      <h1>AIGC 智能短视频创作助手</h1>
      <p>登录后进入工作台，生成标题、口播文案、分镜脚本和发布建议。</p>

      <el-form ref="formRef" :model="form" :rules="rules" label-position="top" @submit.prevent>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="form.email" placeholder="请输入邮箱" clearable />
        </el-form-item>

        <el-form-item label="密码" prop="password">
          <el-input v-model="form.password" type="password" placeholder="请输入密码" show-password />
        </el-form-item>

        <div class="auth-actions">
          <el-button type="primary" size="large" :loading="loading" @click="submit">登录</el-button>
          <el-button link @click="$router.push('/register')">还没有账号？去注册</el-button>
        </div>
      </el-form>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue';
import { ElMessage } from 'element-plus';
import { useRoute, useRouter } from 'vue-router';
import request from '../utils/request';

const router = useRouter();
const route = useRoute();
const formRef = ref(null);
const loading = ref(false);

const form = reactive({
  email: '',
  password: ''
});

const rules = {
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '邮箱格式不正确', trigger: ['blur', 'change'] }
  ],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
};

async function submit() {
  const valid = await formRef.value.validate().catch(() => false);
  if (!valid) return;

  loading.value = true;
  try {
    const res = await request.post('/auth/login', form);
    localStorage.setItem('token', res.token);
    localStorage.setItem('user', JSON.stringify(res.user));
    ElMessage.success('登录成功');
    router.push(route.query.redirect || '/dashboard');
  } catch (error) {
    ElMessage.error(error.message);
  } finally {
    loading.value = false;
  }
}
</script>
