<template>
  <div class="auth-page">
    <div class="auth-panel">
      <h1>AIGC 智能短视频创作助手</h1>
      <p>登录后开始生成课程展示级短视频方案</p>
      <el-form :model="form" label-position="top" @submit.prevent>
        <el-form-item label="用户名">
          <el-input v-model="form.username" placeholder="请输入用户名" />
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
import http from '../api/http';

const router = useRouter();
const loading = ref(false);
const form = reactive({ username: '', password: '' });

async function submit() {
  loading.value = true;
  try {
    const res = await http.post('/auth/login', form);
    localStorage.setItem('token', res.data.token);
    localStorage.setItem('username', res.data.user.username);
    ElMessage.success('登录成功');
    router.push('/dashboard');
  } catch (error) {
    ElMessage.error(error.message);
  } finally {
    loading.value = false;
  }
}
</script>
