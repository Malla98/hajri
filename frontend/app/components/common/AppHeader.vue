<template>
  <!-- App Bar -->
  <v-app-bar
    app
    color="white"
    elevation="1"
  >
    <!-- Mobile menu button -->
    <div class="d-flex align-center w-100">
    <!-- Mobile menu icon -->
    <v-app-bar-nav-icon
      class="d-md-none"
      @click="drawer = !drawer"
    />

    <!-- Logo -->
    <v-img
      src="/favicon.png"
      alt="Kamal Global Tradelink"
      max-width="80"
      contain
      class="logo-responsive ml-2 d-none d-md-block"
    />

    <!-- Spacer pushes logo to right on mobile -->
    <v-spacer />
  </div>
    <!-- Desktop Navigation -->
    <v-btn
      v-for="item in desktopMenu"
      :key="item.to"
      :to="item.to"
      variant="text"
      class="d-none d-md-flex"
      :color="isActive(item.to) ? 'primary' : undefined"
    >
      {{ item.label }}
    </v-btn>

    <!-- Desktop Right -->
    <div class="d-none d-md-flex align-center ga-3 ml-4">
      <span v-if="user" class="text-body-2">
        {{ user.name }}
      </span>

      <v-btn
        v-if="isAdmin"
        color="error"
        variant="text"
        @click="handleLogout"
      >
        Logout
      </v-btn>
    </div>
  <div class="d-flex align-center w-100 d-md-none justify-end">
    <!-- Logo -->
    <v-img
      src="/favicon.png"
      alt="Kamal Global Tradelink"
      max-width="80"
      contain
      class="logo-responsive ml-2"
    />
  </div>
  </v-app-bar>

  <!-- Mobile Drawer -->
  <v-navigation-drawer
    v-model="drawer"
    location="left"
    temporary
    width="280"
  >
    <v-list density="comfortable">
      <v-list-item
        v-for="item in mobileMenu"
        :key="item.to"
        :to="item.to"
        @click="drawer = false"
      >
        <v-list-item-title>
          {{ item.label }}
        </v-list-item-title>
      </v-list-item>

      <v-divider class="my-3" />

      <v-list-item v-if="user">
        <v-list-item-subtitle>
          Logged in as
        </v-list-item-subtitle>
        <v-list-item-title class="font-weight-medium">
          {{ user.name }}
        </v-list-item-title>
      </v-list-item>

      <v-list-item
        v-if="isAdmin"
        class="text-error"
        @click="handleLogout"
      >
        <v-list-item-title>
          Logout
        </v-list-item-title>
      </v-list-item>
    </v-list>
  </v-navigation-drawer>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from '#app'
import { computed, ref } from 'vue'
import { useAuthStore } from '~/stores/auth'

const authStore = useAuthStore()
const router = useRouter()
const route = useRoute()

const drawer = ref(false)

const user = computed(() => authStore.user)
const isAdmin = computed(() => authStore.isAdmin)

const desktopMenu = computed(() => [
  { label: 'Attendance', to: '/' },
  ...(isAdmin.value
    ? [
        { label: 'Employees', to: '/employees' },
        { label: 'Dashboard', to: '/dashboard' },
        { label: 'Payout Report', to: '/reports/payout' },
      ]
    : []),
  ...(!isAdmin.value && route.path !== '/login'
    ? [{ label: 'Login', to: '/login' }]
    : []),
])

const mobileMenu = desktopMenu

const isActive = (path: string) => route.path === path

const handleLogout = () => {
  authStore.logout()
  drawer.value = false
  router.push('/login')
}
</script>
