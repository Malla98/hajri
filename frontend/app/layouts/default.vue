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
            <slot />
        </v-container>
      </v-main>
    </v-layout>
  </v-app>
</template>

<script setup lang="ts">
import AppHeader from '~/components/common/AppHeader.vue';
</script>