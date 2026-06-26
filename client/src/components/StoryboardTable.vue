<template>
  <el-table :data="items" border class="storyboard-table">
    <el-table-column prop="sceneNo" :label="t('sceneNo')" width="90" />
    <el-table-column prop="timeRange" :label="t('timeRange')" width="100" />
    <el-table-column prop="visual" :label="t('visual')" min-width="180" />
    <el-table-column prop="voiceover" :label="t('voiceover')" min-width="220" />
    <el-table-column prop="subtitle" :label="t('subtitle')" min-width="160" />
    <el-table-column prop="camera" :label="t('camera')" min-width="180" />
  </el-table>
</template>

<script setup>
import { useI18n } from '../i18n';

const { t } = useI18n();

defineProps({
  items: {
    type: Array,
    default: () => []
  }
});
</script>
