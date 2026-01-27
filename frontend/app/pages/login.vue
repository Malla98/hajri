<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 p-4">
    
    <div class="max-w-md w-full space-y-8">
      <div class="text-center">
        <h2 class="text-3xl font-bold text-gray-900">Attendance System</h2>
        <p class="mt-2 text-gray-600">Admin Login</p>
      </div>
      
      <form @submit.prevent="handleLogin" class="mt-8 space-y-6">
        <div class="space-y-4">
          <div>
            <label for="reg_no" class="block text-sm font-medium text-gray-700">
              Registration Number
            </label>
            <input
              id="login"
              v-model="form.email"
              type="email"
              required
              class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="abc@example.com"
            />
          </div>
          
          <div>
            <label for="password" class="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              id="password"
              v-model="form.password"
              type="password"
              required
              class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
        
        <div v-if="error" class="p-3 bg-red-50 text-red-700 rounded-md">
          {{ error }}
        </div>
        
        <button
          type="submit"
          :disabled="isLoading"
          class="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          <span v-if="isLoading" class="animate-spin mr-2">⟳</span>
          Sign in
        </button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth';

const router = useRouter();
const authStore = useAuthStore();

const form = reactive({
  email: '',
  password: ''
});

const isLoading = ref(false);
const error = ref('');

const handleLogin = async () => {
  isLoading.value = true;
  error.value = '';
  
  try {
    await authStore.login(form.email, form.password);
    router.push('/');
  } catch (err: any) {
    error.value = err.message || 'Invalid credentials';
  } finally {
    isLoading.value = false;
  }
};
</script>