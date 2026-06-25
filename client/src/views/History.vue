<template>
  <section class="panel-card">
    <div class="history-toolbar">
      <div class="section-title">
        <h2>历史记录</h2>
        <p>所有保存过的创作方案都会持久化到 MySQL，刷新页面后仍可查看。</p>
      </div>
      <div class="history-actions">
        <el-button type="primary" @click="$router.push('/create')">新建创作</el-button>
        <el-button type="danger" plain :disabled="records.length === 0" @click="clearAll">清空全部</el-button>
      </div>
    </div>

    <div class="history-filters">
      <el-input v-model="filters.keyword" placeholder="搜索主题" clearable />
      <el-select v-model="filters.platform" placeholder="平台筛选" clearable>
        <el-option v-for="item in platforms" :key="item" :label="item" :value="item" />
      </el-select>
      <el-select v-model="filters.style" placeholder="风格筛选" clearable>
        <el-option v-for="item in styles" :key="item" :label="item" :value="item" />
      </el-select>
      <el-select v-model="filters.order" placeholder="时间排序">
        <el-option label="最新优先" value="desc" />
        <el-option label="最早优先" value="asc" />
      </el-select>
    </div>

    <div class="batch-bar">
      <span class="muted">已选择 {{ selectedRows.length }} 条，共 {{ filteredRecords.length }} 条匹配记录</span>
      <el-button type="danger" plain :disabled="selectedRows.length === 0" @click="removeBatch">批量删除</el-button>
    </div>

    <el-table
      :data="pagedRecords"
      v-loading="loading"
      border
      @selection-change="selectedRows = $event"
    >
      <el-table-column type="selection" width="48" />
      <el-table-column prop="topic" label="主题" min-width="220" show-overflow-tooltip />
      <el-table-column prop="platform" label="平台" width="110" />
      <el-table-column prop="style" label="风格" width="130" />
      <el-table-column prop="duration" label="时长" width="100">
        <template #default="{ row }">{{ row.duration }} 秒</template>
      </el-table-column>
      <el-table-column prop="generationMode" label="模式" width="130">
        <template #default="{ row }">
          <el-tag :type="modeTag(row.generationMode)" size="small">{{ modeText(row.generationMode) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="created_at" label="创建时间" min-width="180">
        <template #default="{ row }">{{ formatTime(row.created_at) }}</template>
      </el-table-column>
      <el-table-column label="操作" width="150" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" @click="viewDetail(row)">查看</el-button>
          <el-button link type="danger" @click="remove(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-empty v-if="!loading && filteredRecords.length === 0" description="暂无匹配的历史记录" />

    <div v-if="filteredRecords.length > 0" class="pagination-bar">
      <el-pagination
        v-model:current-page="pagination.page"
        v-model:page-size="pagination.pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :page-sizes="[5, 10, 20]"
        :total="filteredRecords.length"
      />
    </div>

    <el-drawer v-model="drawerVisible" size="58%" title="创作方案详情">
      <div v-loading="detailLoading">
        <template v-if="detail">
          <ResultCard title="基础信息">
            <el-descriptions :column="2" border>
              <el-descriptions-item label="主题">{{ detail.topic }}</el-descriptions-item>
              <el-descriptions-item label="平台">{{ detail.platform }}</el-descriptions-item>
              <el-descriptions-item label="风格">{{ detail.style }}</el-descriptions-item>
              <el-descriptions-item label="时长">{{ detail.duration }} 秒</el-descriptions-item>
              <el-descriptions-item label="目标受众">{{ detail.audience }}</el-descriptions-item>
              <el-descriptions-item label="创建时间">{{ formatTime(detail.created_at) }}</el-descriptions-item>
            </el-descriptions>
          </ResultCard>

          <ResultCard title="标题">
            <ol class="title-list">
              <li v-for="title in detail.titles" :key="title">{{ title }}</li>
            </ol>
          </ResultCard>

          <ResultCard title="口播文案">
            <p class="script">{{ detail.speechScript }}</p>
          </ResultCard>

          <ResultCard title="分镜脚本">
            <StoryboardTable :items="detail.storyboard" />
          </ResultCard>

          <ResultCard title="标签">
            <TagList :tags="detail.tags" />
          </ResultCard>

          <ResultCard title="发布建议">
            <el-descriptions :column="1" border>
              <el-descriptions-item label="推荐发布时间">{{ detail.publishAdvice.bestTime }}</el-descriptions-item>
              <el-descriptions-item label="封面文案">{{ detail.publishAdvice.coverText }}</el-descriptions-item>
              <el-descriptions-item label="互动引导语">{{ detail.publishAdvice.interactionGuide }}</el-descriptions-item>
              <el-descriptions-item label="平台发布建议">{{ detail.publishAdvice.platformAdvice }}</el-descriptions-item>
            </el-descriptions>
          </ResultCard>
        </template>
      </div>
    </el-drawer>
  </section>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import ResultCard from '../components/ResultCard.vue';
import StoryboardTable from '../components/StoryboardTable.vue';
import TagList from '../components/TagList.vue';
import request from '../utils/request';

const platforms = ['抖音', '小红书', 'B站', '视频号'];
const styles = ['知识科普', '生活分享', '产品种草', '剧情口播'];

const loading = ref(false);
const detailLoading = ref(false);
const drawerVisible = ref(false);
const records = ref([]);
const detail = ref(null);
const selectedRows = ref([]);

const filters = reactive({
  keyword: '',
  platform: '',
  style: '',
  order: 'desc'
});

const pagination = reactive({
  page: 1,
  pageSize: 10
});

const filteredRecords = computed(() => {
  return [...records.value]
    .filter((item) => !filters.keyword || item.topic.includes(filters.keyword.trim()))
    .filter((item) => !filters.platform || item.platform === filters.platform)
    .filter((item) => !filters.style || item.style === filters.style)
    .sort((a, b) => {
      const left = new Date(a.created_at).getTime();
      const right = new Date(b.created_at).getTime();
      return filters.order === 'asc' ? left - right : right - left;
    });
});

const pagedRecords = computed(() => {
  const start = (pagination.page - 1) * pagination.pageSize;
  return filteredRecords.value.slice(start, start + pagination.pageSize);
});

watch(filteredRecords, () => {
  pagination.page = 1;
  selectedRows.value = [];
});

function formatTime(value) {
  if (!value) return '-';
  return new Date(value).toLocaleString();
}

function modeText(mode) {
  if (mode === 'ai') return 'AI';
  if (mode === 'fallback_template') return '兜底模板';
  return '模板';
}

function modeTag(mode) {
  if (mode === 'ai') return 'success';
  if (mode === 'fallback_template') return 'warning';
  return 'info';
}

async function loadRecords() {
  loading.value = true;
  try {
    const res = await request.get('/creation/history');
    records.value = res.data || [];
  } catch (error) {
    records.value = [];
    ElMessage.error(error.message);
  } finally {
    loading.value = false;
  }
}

async function viewDetail(row) {
  drawerVisible.value = true;
  detailLoading.value = true;
  detail.value = null;
  try {
    const res = await request.get(`/creation/detail/${row.id}`);
    detail.value = res.data;
  } catch (error) {
    ElMessage.error(error.message);
  } finally {
    detailLoading.value = false;
  }
}

async function remove(row) {
  await ElMessageBox.confirm(`确认删除“${row.topic}”吗？`, '删除确认', { type: 'warning' });
  try {
    await request.delete(`/creation/${row.id}`);
    ElMessage.success('删除成功');
    await loadRecords();
  } catch (error) {
    ElMessage.error(error.message);
  }
}

async function removeBatch() {
  await ElMessageBox.confirm(`确认删除选中的 ${selectedRows.value.length} 条记录吗？`, '批量删除确认', { type: 'warning' });
  try {
    await request.delete('/creation/batch', { data: { ids: selectedRows.value.map((item) => item.id) } });
    ElMessage.success('批量删除成功');
    await loadRecords();
  } catch (error) {
    ElMessage.error(error.message);
  }
}

async function clearAll() {
  await ElMessageBox.confirm('确认清空当前账号的全部历史记录吗？此操作不可恢复。', '清空确认', { type: 'warning' });
  try {
    await request.delete('/creation/all');
    ElMessage.success('已清空全部历史记录');
    await loadRecords();
  } catch (error) {
    ElMessage.error(error.message);
  }
}

onMounted(loadRecords);
</script>
