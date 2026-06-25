<template>
  <div class="tag-list">
    <el-tag v-for="tag in tags" :key="tag" type="success" effect="light">
      {{ tag }}
    </el-tag>
  </div>
</template>

<script setup>
defineProps({
  tags: {
    type: Array,
    default: () => []
  }
});
</script>
