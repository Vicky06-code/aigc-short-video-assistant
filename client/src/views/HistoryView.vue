<template>
  <div class="app-shell">
    <header class="topbar">
      <div>
        <h1>历史记录</h1>
        <span>查看、复用和删除已生成的创作方案</span>
      </div>
      <el-button @click="$router.push('/dashboard')">返回创作台</el-button>
    </header>
    <main class="history-list">
      <el-table :data="records" v-loading="loading">
        <el-table-column prop="topic" label="主题" min-width="180" />
        <el-table-column prop="platform" label="平台" width="100" />
        <el-table-column prop="style" label="风格" width="120" />
        <el-table-column prop="duration" label="时长" width="100" />
        <el-table-column prop="created_at" label="生成时间" min-width="180" />
        <el-table-column label="操作" width="180">
          <template #default="{ row }">
            <el-button link type="primary" @click="$router.push(`/history/${row.id}`)">详情</el-button>
            <el-button link type="danger" @click="remove(row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </main>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import request from '../utils/request';

const loading = ref(false);
const records = ref([]);

async function loadRecords() {
  loading.value = true;
  try {
    const res = await request.get('/creations');
    records.value = res.data;
  } catch (error) {
    ElMessage.error(error.message);
  } finally {
    loading.value = false;
  }
}

async function remove(id) {
  await ElMessageBox.confirm('确认删除这条创作记录吗？', '删除确认');
  await request.delete(`/creations/${id}`);
  ElMessage.success('删除成功');
  loadRecords();
}

onMounted(loadRecords);
</script>
