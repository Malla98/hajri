<template>
  <v-app>
    <v-layout class="bg-grey-lighten-4">
      <!-- Header -->
      <AppHeader />

      <!-- Main Content -->
      <v-main>
          <v-container
            class="px-1 px-sm-1 px-lg-1"
            max-width="1200"
          >
          <v-alert
            v-if="!isOnline"
            type="warning"
            class="mb-4"
          >
            You are currently offline. your data may not be saved until you go online.
          </v-alert>
            <slot />
        </v-container>
      </v-main>
    </v-layout>
  </v-app>
</template>

<script setup lang="ts">
import AppHeader from '~/components/common/AppHeader.vue';
const isOnline = ref(navigator.onLine)

function updateStatus() {
  isOnline.value = navigator.onLine
}

onMounted(() => {
  window.addEventListener('online', updateStatus)
  window.addEventListener('offline', updateStatus)
})

onBeforeUnmount(() => {
  window.removeEventListener('online', updateStatus)
  window.removeEventListener('offline', updateStatus)
})
</script>