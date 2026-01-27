<script setup lang="ts">
defineProps<{ to: string }>()
</script>

<template>
  <NuxtLink
    :to="to"
    class="px-3 py-2 rounded-md text-sm font-medium block"
    :class="$route.path === to
      ? 'bg-blue-100 text-blue-700'
      : 'text-gray-700 hover:bg-gray-100'"
  >
    <slot />
  </NuxtLink>
</template>