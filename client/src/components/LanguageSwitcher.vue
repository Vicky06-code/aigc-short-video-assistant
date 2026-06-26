<template>
  <el-select v-model="selectedLocale" class="language-switcher" size="small" @change="setLocale">
    <el-option v-for="item in localeOptions" :key="item.value" :label="item.label" :value="item.value" />
  </el-select>
</template>

<script setup>
import { computed } from 'vue';
import { useI18n } from '../i18n';

const { locale, localeOptions, setLocale } = useI18n();
const selectedLocale = computed({
  get: () => locale.value,
  set: (value) => setLocale(value)
});
</script>
