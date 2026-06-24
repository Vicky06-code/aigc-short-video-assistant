<template>
  <div class="auth-page">
    <div class="auth-panel">
      <h1>创建账号</h1>
      <p>注册后即可保存每一次短视频创作方案</p>
      <el-form :model="form" label-position="top" @submit.prevent>
        <el-form-item label="用户名">
          <el-input v-model="form.username" placeholder="请输入用户名" />
        </el-form-item>
        <el-form-item label="邮箱">
          <el-input v-model="form.email" placeholder="请输入邮箱" />
        </el-form-item>
        <el-form-item label="密码">
          <el-input v-model="form.password" type="password" placeholder="至少 6 位" show-password />
        </el-form-item>
        <el-button type="primary" size="large" :loading="loading" @click="submit">注册</el-button>
        <el-button link @click="$router.push('/login')">已有账号？去登录</el-button>
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
const form = reactive({ username: '', email: '', password: '' });

async function submit() {
  if (!form.username || !form.email || !form.password) {
    ElMessage.warning('请完整填写注册信息');
    return;
  }

  loading.value = true;
  try {
    await request.post('/auth/register', form);
    ElMessage.success('注册成功，请登录');
    router.push('/login');
  } catch (error) {
    ElMessage.error(error.message);
  } finally {
    loading.value = false;
  }
}
</script>
