<template>
  <el-table :data="items" border class="storyboard-table">
    <el-table-column prop="sceneNo" label="镜头编号" width="90" />
    <el-table-column prop="timeRange" label="时间范围" width="100" />
    <el-table-column prop="visual" label="画面内容" min-width="180" />
    <el-table-column prop="voiceover" label="口播内容" min-width="220" />
    <el-table-column prop="subtitle" label="字幕建议" min-width="160" />
    <el-table-column prop="camera" label="镜头建议" min-width="180" />
  </el-table>
</template>

<script setup>
defineProps({
  items: {
    type: Array,
    default: () => []
  }
});
</script>
