<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup lang="ts">
// Global middleware
onMounted(() => {
  const auth = useAuthStore();
  auth.checkAuth();
});
</script>