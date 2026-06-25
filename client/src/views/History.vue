<template>
  <section class="panel-card">
    <div class="history-toolbar">
      <div class="section-title">
        <h2>历史记录</h2>
        <p>这里用于展示已生成并保存的创作方案，后续可继续扩展详情预览和复用编辑。</p>
      </div>
      <el-button type="primary" @click="$router.push('/create')">新建创作</el-button>
    </div>

    <el-table :data="records" v-loading="loading" border>
      <el-table-column prop="topic" label="主题" min-width="180" />
      <el-table-column prop="platform" label="平台" width="110" />
      <el-table-column prop="style" label="风格" width="130" />
      <el-table-column prop="duration" label="时长" width="100" />
      <el-table-column prop="created_at" label="生成时间" min-width="180" />
      <el-table-column label="操作" width="180">
        <template #default="{ row }">
          <el-button link type="primary" @click="viewDetail(row)">查看详情</el-button>
          <el-button link type="danger" @click="remove(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-empty v-if="!loading && records.length === 0" description="暂无历史记录，先去生成一条创作方案吧" />
  </section>
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
    records.value = res.data || [];
  } catch (error) {
    records.value = [];
    ElMessage.warning(error.message);
  } finally {
    loading.value = false;
  }
}

function viewDetail(row) {
  ElMessage.info(`已预留详情入口：${row.topic}`);
}

async function remove(row) {
  await ElMessageBox.confirm(`确认删除“${row.topic}”吗？`, '删除确认');
  try {
    await request.delete(`/creations/${row.id}`);
    ElMessage.success('删除成功');
    loadRecords();
  } catch (error) {
    ElMessage.error(error.message);
  }
}

onMounted(loadRecords);
</script>
