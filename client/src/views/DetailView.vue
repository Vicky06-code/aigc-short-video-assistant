<template>
  <div class="app-shell">
    <header class="topbar">
      <div>
        <h1>{{ record?.topic || '创作详情' }}</h1>
        <span>{{ record?.platform }} / {{ record?.style }} / {{ record?.duration }}</span>
      </div>
      <el-button @click="$router.push('/history')">返回历史</el-button>
    </header>
    <main class="detail-page" v-loading="loading">
      <pre v-if="record">{{ JSON.stringify(record.result, null, 2) }}</pre>
    </main>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import { ElMessage } from 'element-plus';
import http from '../api/http';

const route = useRoute();
const loading = ref(false);
const record = ref(null);

onMounted(async () => {
  loading.value = true;
  try {
    const res = await http.get(`/creations/${route.params.id}`);
    record.value = res.data;
  } catch (error) {
    ElMessage.error(error.message);
  } finally {
    loading.value = false;
  }
});
</script>
