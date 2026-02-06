<template>
  <v-container
    fluid
    class="d-flex align-center justify-center"
    style="min-height: 100vh"
  >
    <v-card
      elevation="2"
      rounded="xl"
      max-width="420"
      width="100%"
      class="pa-6"
    >
      <!-- Header -->
      <div class="text-center mb-6">
        <div class="text-h5 font-weight-bold">
          Attendance System
        </div>
        <div class="text-body-2 text-medium-emphasis mt-1">
          Admin Login
        </div>
      </div>

      <!-- Form -->
      <v-form @submit.prevent="handleLogin">
        <v-text-field
          v-model="form.email"
          label="Email"
          type="email"
          required
          prepend-inner-icon="mdi-email-outline"
          variant="outlined"
          density="comfortable"
          class="mb-4"
        />

        <v-text-field
          v-model="form.password"
          label="Password"
          type="password"
          required
          prepend-inner-icon="mdi-lock-outline"
          variant="outlined"
          density="comfortable"
          class="mb-2"
        />

        <!-- Error -->
        <v-alert
          v-if="error"
          type="error"
          variant="tonal"
          class="mb-4"
          density="compact"
        >
          {{ error }}
        </v-alert>

        <!-- Submit -->
        <v-btn
          type="submit"
          color="primary"
          size="large"
          block
          :loading="isLoading"
        >
          Sign in
        </v-btn>
      </v-form>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
import { useRouter } from '#app'
import { reactive, ref } from 'vue'
import { useAuthStore } from '~/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const form = reactive({
  email: '',
  password: '',
})

const isLoading = ref(false)
const error = ref('')

const handleLogin = async () => {
  isLoading.value = true
  error.value = ''

  try {
    await authStore.login(form.email, form.password)
    router.push('/')
  } catch (err: any) {
    error.value = err?.message || 'Invalid credentials'
  } finally {
    isLoading.value = false
  }
}
</script>
