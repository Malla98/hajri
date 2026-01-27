<template>
  <header class="bg-white shadow-sm border-b">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center h-16">
        <!-- Left: Logo -->
         <img src="assets/favicon.png" alt="Kamal Global Tradelink" class="h-18 w-20" />

        <!-- Desktop Navigation -->
        <nav class="hidden md:flex items-center space-x-4">
          <NuxtLink to="/" :class="$route.path === '/'
      ? 'bg-blue-100 text-blue-700 p-2 rounded-md '
      : 'text-gray-700 hover:bg-gray-100  p-2 rounded-md'">Attendance</NuxtLink>

          <NuxtLink v-if="isAdmin" to="/employees" :class="$route.path === '/employees'
      ? 'bg-blue-100 text-blue-700 p-2 rounded-md '
      : 'text-gray-700 hover:bg-gray-100  p-2 rounded-md'">Employees</NuxtLink>
          <NuxtLink v-if="isAdmin" to="/dashboard" :class="$route.path === '/dashboard'
      ? 'bg-blue-100 text-blue-700 p-2 rounded-md '
      : 'text-gray-700 hover:bg-gray-100  p-2 rounded-md'">Dashboard</NuxtLink>
          <NuxtLink v-if="isAdmin" to="/reports/payout" :class="$route.path === '/reports/payout'
      ? 'bg-blue-100 text-blue-700 p-2 rounded-md '
      : 'text-gray-700 hover:bg-gray-100  p-2 rounded-md'">Payout Report</NuxtLink>

          <NuxtLink v-if="!isAdmin && $route.fullPath !== '/login'" to="/login" >Login</NuxtLink>
        </nav>

        <!-- Right -->
        <div class="hidden md:flex items-center gap-4">
          <div v-if="user" class="text-sm text-gray-700">
            <p class="font-medium">{{ user.name }}</p>
          </div>

          <button
            v-if="isAdmin"
            @click="handleLogout"
            class="text-sm font-medium text-red-600 hover:text-red-800"
          >
            Logout
          </button>
        </div>

        <!-- Mobile menu button -->
        <button
          class="md:hidden p-2 rounded-md hover:bg-gray-100"
          @click="isOpen = !isOpen"
        >
          <svg
            class="h-6 w-6 text-gray-700"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              :d="isOpen
                ? 'M6 18L18 6M6 6l12 12'
                : 'M4 6h16M4 12h16M4 18h16'"
            />
          </svg>
        </button>
      </div>
    </div>

   <!-- Mobile Overlay -->
<div
  v-if="isOpen"
  class="fixed inset-0 z-40 bg-black/40 md:hidden"
  @click="close"
/>

<!-- Mobile Drawer -->
<div
  class="fixed top-0 right-0 z-50 h-full w-72 bg-white shadow-lg
         transform transition-transform duration-300 ease-in-out md:hidden"
  :class="isOpen ? 'translate-x-0' : 'translate-x-full'"
>
  <!-- Header -->
  <div class="flex items-center justify-between px-4 h-16 border-b">
    <span class="font-semibold text-gray-800"></span>
    <button @click="close" class="p-2 rounded hover:bg-gray-100">
      ✕
    </button>
  </div>

  <!-- Menu Items -->
  <nav class="px-4 py-4 space-y-2">
    <MobileLink to="/" @click="close">
      Attendance
    </MobileLink>

    <MobileLink v-if="isAdmin" to="/employees" @click="close">
      Employees
    </MobileLink>

    <MobileLink v-if="isAdmin" to="/dashboard" @click="close">
      Dashboard
    </MobileLink>
    <MobileLink v-if="isAdmin" to="/reports/payout" @click="close">
      Payout Report
    </MobileLink>

    <MobileLink v-if="!isAdmin" to="/login" @click="close">
      Login
    </MobileLink>

    <div v-if="user" class="pt-4 text-sm text-gray-600 border-t">
      Logged in as <strong>{{ user.name }}</strong>
    </div>

    <button
      v-if="isAdmin"
      @click="handleLogout"
      class="w-full text-left text-red-600 font-medium pt-3"
    >
      Logout
    </button>
  </nav>
</div>
  </header>
</template>
<script setup lang="ts">
import { useRouter } from '#app'
import { computed, ref } from 'vue'
import { useAuthStore } from '~/stores/auth'

const authStore = useAuthStore()
const router = useRouter()

const user = computed(() => authStore.user)
const isAdmin = computed(() => authStore.isAdmin)

const isOpen = ref(false)

const close = () => {
  isOpen.value = false
}

const handleLogout = () => {
  authStore.logout()
  isOpen.value = false
  router.push('/login')
}
</script>
