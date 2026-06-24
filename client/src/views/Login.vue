<template>
  <div class="auth-page">
    <div class="auth-panel">
      <h1>AIGC 智能短视频创作助手</h1>
      <p>登录后开始生成课程展示级短视频方案</p>
      <el-form :model="form" label-position="top" @submit.prevent>
        <el-form-item label="邮箱">
          <el-input v-model="form.email" placeholder="请输入邮箱" />
        </el-form-item>
        <el-form-item label="密码">
          <el-input v-model="form.password" type="password" placeholder="请输入密码" show-password />
        </el-form-item>
        <el-button type="primary" size="large" :loading="loading" @click="submit">登录</el-button>
        <el-button link @click="$router.push('/register')">还没有账号？去注册</el-button>
      </el-form>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue';
import { ElMessage } from 'element-plus';
import { useRouter } from 'vue-router';
import request from '../utils/request';

const router = useRouter();
const loading = ref(false);
const form = reactive({ email: '', password: '' });

async function submit() {
  if (!form.email || !form.password) {
    ElMessage.warning('请填写邮箱和密码');
    return;
  }

  loading.value = true;
  try {
    const res = await request.post('/auth/login', form);
    localStorage.setItem('token', res.token);
    localStorage.setItem('user', JSON.stringify(res.user));
    ElMessage.success('登录成功');
    router.push('/dashboard');
  } catch (error) {
    ElMessage.error(error.message);
  } finally {
    loading.value = false;
  }
}
</script>
