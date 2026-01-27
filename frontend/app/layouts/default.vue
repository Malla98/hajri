<template>
  <div class="min-h-screen bg-gray-50">
    <AppHeader />
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import AppHeader from '~/components/common/AppHeader.vue';
</script>