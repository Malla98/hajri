
<template>
  <div class="d-flex align-center gap-3">
    <v-btn
      variant="tonal"
      color="error"
      size="small"
      rounded="lg"
      :loading="downloading"
      :disabled="disabled"
      prepend-icon="mdi-file-pdf-box"
      @click="$emit('pdf')"
    >
      <span class="d-none d-sm-inline">PDF</span>
      <span class="d-inline d-sm-none">PDF</span>
    </v-btn>
    <v-btn
      variant="tonal"
      color="success"
      size="small"
      rounded="lg"
      :loading="downloading"
      :disabled="disabled"
      prepend-icon="mdi-microsoft-excel"
      @click="$emit('excel')"
    >
      <span class="d-none d-sm-inline">Excel</span>
      <span class="d-inline d-sm-none">XLS</span>
    </v-btn>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  downloading?: boolean
  disabled?: boolean
}>()

defineEmits<{
  pdf:   []
  excel: []
}>()
</script>