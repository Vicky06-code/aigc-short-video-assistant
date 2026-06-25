<template>
  <el-card class="result-card" shadow="never">
    <template #header>
      <div class="result-card-header">
        <span>{{ title }}</span>
        <slot name="extra" />
      </div>
    </template>
    <slot />
  </el-card>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    required: true
  }
});
</script>
