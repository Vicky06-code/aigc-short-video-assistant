<template>
  <section class="panel-card">
    <div class="history-toolbar">
      <div class="section-title">
        <h2>{{ t('historyTitle') }}</h2>
        <p>{{ t('historyIntro') }}</p>
      </div>
      <div class="history-actions">
        <el-button type="primary" @click="$router.push('/create')">{{ t('newCreate') }}</el-button>
        <el-button type="danger" plain :disabled="records.length === 0" @click="clearAll">{{ t('clearAll') }}</el-button>
      </div>
    </div>

    <div class="history-filters">
      <el-input v-model="filters.keyword" :placeholder="t('searchTopic')" clearable />
      <el-select v-model="filters.platform" :placeholder="t('filterPlatform')" clearable>
        <el-option v-for="item in platforms" :key="item" :label="item" :value="item" />
      </el-select>
      <el-select v-model="filters.style" :placeholder="t('filterStyle')" clearable>
        <el-option v-for="item in styles" :key="item" :label="item" :value="item" />
      </el-select>
      <el-select v-model="filters.order" :placeholder="t('sortTime')">
        <el-option :label="t('newest')" value="desc" />
        <el-option :label="t('oldest')" value="asc" />
      </el-select>
    </div>

    <div class="batch-bar">
      <span class="muted">{{ t('selectedRows', { count: selectedRows.length, total: filteredRecords.length }) }}</span>
      <el-button type="danger" plain :disabled="selectedRows.length === 0" @click="removeBatch">{{ t('batchDelete') }}</el-button>
    </div>

    <el-table :data="pagedRecords" v-loading="loading" border @selection-change="selectedRows = $event">
      <el-table-column type="selection" width="48" />
      <el-table-column prop="topic" :label="t('tableTopic')" min-width="220" show-overflow-tooltip />
      <el-table-column prop="platform" :label="t('platform')" width="110" />
      <el-table-column prop="style" :label="t('style')" width="130" />
      <el-table-column prop="duration" :label="t('duration')" width="100">
        <template #default="{ row }">{{ row.duration }}s</template>
      </el-table-column>
      <el-table-column prop="generationMode" :label="t('mode')" width="130">
        <template #default="{ row }">
          <el-tag :type="modeTag(row.generationMode)" size="small">{{ modeText(row.generationMode) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="created_at" :label="t('createdAt')" min-width="180">
        <template #default="{ row }">{{ formatTime(row.created_at) }}</template>
      </el-table-column>
      <el-table-column :label="t('actions')" width="220" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" @click="viewDetail(row)">{{ t('view') }}</el-button>
          <el-button link type="primary" @click="reuseRecord(row)">{{ t('reuseCreation') }}</el-button>
          <el-button link type="danger" @click="remove(row)">{{ t('delete') }}</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-empty v-if="!loading && filteredRecords.length === 0" :description="t('emptyHistory')" />

    <div v-if="filteredRecords.length > 0" class="pagination-bar">
      <el-pagination
        v-model:current-page="pagination.page"
        v-model:page-size="pagination.pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :page-sizes="[5, 10, 20]"
        :total="filteredRecords.length"
      />
    </div>

    <el-drawer v-model="drawerVisible" size="58%" :title="t('detailTitle')">
      <div v-loading="detailLoading">
        <template v-if="detail">
          <div class="detail-actions">
            <el-button @click="exportWord(detail)">{{ t('exportWord') }}</el-button>
            <el-button @click="exportPdf(detail)">{{ t('exportPdf') }}</el-button>
            <el-button type="primary" @click="reuseDetail(detail)">{{ t('reuseCreation') }}</el-button>
          </div>

          <ResultCard :title="t('basicInfo')">
            <el-descriptions :column="2" border>
              <el-descriptions-item :label="t('topic')">{{ detail.topic }}</el-descriptions-item>
              <el-descriptions-item :label="t('platform')">{{ detail.platform }}</el-descriptions-item>
              <el-descriptions-item :label="t('style')">{{ detail.style }}</el-descriptions-item>
              <el-descriptions-item :label="t('duration')">{{ detail.duration }}s</el-descriptions-item>
              <el-descriptions-item :label="t('audience')">{{ detail.audience }}</el-descriptions-item>
              <el-descriptions-item :label="t('createdAt')">{{ formatTime(detail.created_at) }}</el-descriptions-item>
              <el-descriptions-item v-if="detail.creativeRequirement" :label="t('creativeRequirement')" :span="2">
                {{ detail.creativeRequirement }}
              </el-descriptions-item>
            </el-descriptions>
          </ResultCard>

          <ResultCard :title="t('titleRecommend')">
            <ol class="title-list">
              <li v-for="title in detail.titles" :key="title">{{ title }}</li>
            </ol>
          </ResultCard>

          <ResultCard :title="t('speechScript')">
            <p class="script">{{ detail.speechScript }}</p>
          </ResultCard>

          <ResultCard :title="t('storyboard')">
            <StoryboardTable :items="detail.storyboard" />
          </ResultCard>

          <ResultCard :title="t('tags')">
            <TagList :tags="detail.tags" />
          </ResultCard>

          <ResultCard :title="t('publishAdvice')">
            <el-descriptions :column="1" border>
              <el-descriptions-item :label="t('bestTime')">{{ detail.publishAdvice.bestTime }}</el-descriptions-item>
              <el-descriptions-item :label="t('coverText')">{{ detail.publishAdvice.coverText }}</el-descriptions-item>
              <el-descriptions-item :label="t('interactionGuide')">{{ detail.publishAdvice.interactionGuide }}</el-descriptions-item>
              <el-descriptions-item :label="t('platformAdvice')">{{ detail.publishAdvice.platformAdvice }}</el-descriptions-item>
            </el-descriptions>
          </ResultCard>
        </template>
      </div>
    </el-drawer>
  </section>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import ResultCard from '../components/ResultCard.vue';
import StoryboardTable from '../components/StoryboardTable.vue';
import TagList from '../components/TagList.vue';
import { useI18n } from '../i18n';
import request from '../utils/request';

const { t } = useI18n();
const router = useRouter();
const platforms = ['抖音', '小红书', 'B站', '视频号'];
const styles = ['知识科普', '生活分享', '产品种草', '剧情口播', '热点解读', '教程教学', '测评体验', '职场干货', '情感共鸣', '搞笑娱乐'];
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
  if (mode === 'ai') return t('aiMode');
  if (mode === 'fallback_template') return t('fallbackMode');
  return t('templateMode');
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

function reuseDetail(record) {
  router.push({
    path: '/create',
    query: {
      topic: record.topic || '',
      platform: record.platform || '',
      style: record.style || '',
      duration: record.duration || '',
      audience: record.audience || '',
      creativeRequirement: record.creativeRequirement || ''
    }
  });
}

async function reuseRecord(row) {
  try {
    const res = await request.get(`/creation/detail/${row.id}`);
    reuseDetail(res.data || row);
  } catch (error) {
    ElMessage.error(error.message);
  }
}

function escapeHtml(value = '') {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function sanitizeFileName(value = '') {
  return String(value || 'creation-plan')
    .replace(/[\\/:*?"<>|]/g, '-')
    .replace(/\s+/g, '-')
    .slice(0, 60);
}

function buildExportHtml(record) {
  const titles = (record.titles || []).map((title, index) => `<li>${index + 1}. ${escapeHtml(title)}</li>`).join('');
  const tags = (record.tags || []).map((tag) => `<span class="tag">${escapeHtml(tag)}</span>`).join('');
  const storyboardRows = (record.storyboard || [])
    .map((item) => `
      <tr>
        <td>${escapeHtml(item.sceneNo)}</td>
        <td>${escapeHtml(item.timeRange)}</td>
        <td>${escapeHtml(item.visual)}</td>
        <td>${escapeHtml(item.voiceover)}</td>
        <td>${escapeHtml(item.subtitle)}</td>
        <td>${escapeHtml(item.camera)}</td>
      </tr>
    `)
    .join('');
  const advice = record.publishAdvice || {};

  return `
<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>${escapeHtml(record.topic)} - ${escapeHtml(t('detailTitle'))}</title>
  <style>
    body { margin: 0; padding: 32px; color: #172033; font-family: "Microsoft YaHei", Arial, sans-serif; line-height: 1.75; }
    h1 { margin: 0 0 8px; font-size: 26px; color: #172033; }
    h2 { margin: 26px 0 10px; padding-bottom: 6px; border-bottom: 1px solid #d9e2f2; font-size: 18px; color: #1f5fe0; }
    .meta { color: #63718a; margin-bottom: 18px; }
    .grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px 18px; }
    .item strong { color: #28344f; }
    ol { padding-left: 20px; }
    table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 13px; }
    th, td { border: 1px solid #d9e2f2; padding: 8px; vertical-align: top; }
    th { background: #f4f7ff; color: #28344f; }
    .script { white-space: pre-line; }
    .tag { display: inline-block; margin: 0 8px 8px 0; padding: 4px 9px; border-radius: 999px; background: #edf4ff; color: #1f5fe0; }
    @media print { body { padding: 18mm; } }
  </style>
</head>
<body>
  <h1>${escapeHtml(record.topic)}</h1>
  <div class="meta">${escapeHtml(t('detailTitle'))} · ${escapeHtml(formatTime(record.created_at))}</div>

  <h2>${escapeHtml(t('basicInfo'))}</h2>
  <div class="grid">
    <div class="item"><strong>${escapeHtml(t('platform'))}：</strong>${escapeHtml(record.platform)}</div>
    <div class="item"><strong>${escapeHtml(t('style'))}：</strong>${escapeHtml(record.style)}</div>
    <div class="item"><strong>${escapeHtml(t('duration'))}：</strong>${escapeHtml(record.duration)}s</div>
    <div class="item"><strong>${escapeHtml(t('audience'))}：</strong>${escapeHtml(record.audience)}</div>
    ${record.creativeRequirement ? `<div class="item"><strong>${escapeHtml(t('creativeRequirement'))}：</strong>${escapeHtml(record.creativeRequirement)}</div>` : ''}
  </div>

  <h2>${escapeHtml(t('titleRecommend'))}</h2>
  <ol>${titles}</ol>

  <h2>${escapeHtml(t('speechScript'))}</h2>
  <div class="script">${escapeHtml(record.speechScript)}</div>

  <h2>${escapeHtml(t('storyboard'))}</h2>
  <table>
    <thead>
      <tr>
        <th>${escapeHtml(t('sceneNo'))}</th>
        <th>${escapeHtml(t('timeRange'))}</th>
        <th>${escapeHtml(t('visual'))}</th>
        <th>${escapeHtml(t('voiceover'))}</th>
        <th>${escapeHtml(t('subtitle'))}</th>
        <th>${escapeHtml(t('camera'))}</th>
      </tr>
    </thead>
    <tbody>${storyboardRows}</tbody>
  </table>

  <h2>${escapeHtml(t('tags'))}</h2>
  <div>${tags}</div>

  <h2>${escapeHtml(t('publishAdvice'))}</h2>
  <div class="item"><strong>${escapeHtml(t('bestTime'))}：</strong>${escapeHtml(advice.bestTime)}</div>
  <div class="item"><strong>${escapeHtml(t('coverText'))}：</strong>${escapeHtml(advice.coverText)}</div>
  <div class="item"><strong>${escapeHtml(t('interactionGuide'))}：</strong>${escapeHtml(advice.interactionGuide)}</div>
  <div class="item"><strong>${escapeHtml(t('platformAdvice'))}：</strong>${escapeHtml(advice.platformAdvice)}</div>
</body>
</html>`;
}

function downloadBlob(content, filename, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function exportWord(record) {
  const html = buildExportHtml(record);
  const filename = `${sanitizeFileName(record.topic)}.doc`;
  downloadBlob(html, filename, 'application/msword;charset=utf-8');
  ElMessage.success(t('exportSuccess'));
}

function exportPdf(record) {
  const html = buildExportHtml(record);
  const printWindow = window.open('', '_blank');

  if (!printWindow) {
    ElMessage.error(t('exportPopupBlocked'));
    return;
  }

  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();
  printWindow.focus();
  setTimeout(() => {
    printWindow.print();
  }, 300);
}

async function remove(row) {
  await ElMessageBox.confirm(`${t('delete')} "${row.topic}"?`, t('delete'), { type: 'warning' });
  try {
    await request.delete(`/creation/${row.id}`);
    ElMessage.success(t('delete'));
    await loadRecords();
  } catch (error) {
    ElMessage.error(error.message);
  }
}

async function removeBatch() {
  await ElMessageBox.confirm(`${t('batchDelete')} ${selectedRows.value.length}?`, t('batchDelete'), { type: 'warning' });
  try {
    await request.delete('/creation/batch', { data: { ids: selectedRows.value.map((item) => item.id) } });
    ElMessage.success(t('batchDelete'));
    await loadRecords();
  } catch (error) {
    ElMessage.error(error.message);
  }
}

async function clearAll() {
  await ElMessageBox.confirm(t('clearAll'), t('clearAll'), { type: 'warning' });
  try {
    await request.delete('/creation/all');
    ElMessage.success(t('clearAll'));
    await loadRecords();
  } catch (error) {
    ElMessage.error(error.message);
  }
}

onMounted(loadRecords);
</script>
