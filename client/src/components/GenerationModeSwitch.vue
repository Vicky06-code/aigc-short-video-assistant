<template>
  <div class="generation-mode-switch">
    <div class="mode-switch-heading">
      <span>{{ t('generationMode') }}</span>
      <el-tag size="small" :type="modelValue === 'ai' ? 'success' : 'info'">
        {{ modelValue === 'ai' ? t('aiMode') : t('templateMode') }}
      </el-tag>
    </div>

    <el-radio-group data-testid="generation-mode-switch" :model-value="modelValue" class="mode-radio-group" @change="emit('update:modelValue', $event)">
      <el-radio-button label="template">{{ t('templateMode') }}</el-radio-button>
      <el-radio-button label="ai">{{ t('aiMode') }}</el-radio-button>
    </el-radio-group>
  </div>
</template>

<script setup>
import { useI18n } from '../i18n';

defineProps({
  modelValue: {
    type: String,
    default: 'template'
  }
});

const emit = defineEmits(['update:modelValue']);
const { t } = useI18n();
</script>
