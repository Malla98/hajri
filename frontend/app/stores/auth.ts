import { defineStore } from 'pinia';
import type { AuthRecord } from 'pocketbase';

interface AuthState {
  user?: AuthRecord|null;
  isAdmin: boolean;
  employeesId: string;
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    user: null,
    isAdmin: false,
    employeesId: '',
  }),
  getters: {
    isAuthenticated: (state) => !!state.user,
  },
  actions: {
    async login(email: string, password: string) {
      const { $pb } = useNuxtApp();

      try {
        const authData = await $pb.collection('users').authWithPassword(email, password);
        const employee = await $pb.collection('employees').getFirstListItem(`user="${authData.record.id}"`);

        if (employee.role !== 'admin') throw new Error('Only admin can login');

        this.user = authData.record;
        this.isAdmin = true;
        this.employeesId = employee.id;

        return authData;
      } catch (error) {
        console.error('Login failed', error);
        throw error;
      }
    },

    logout() {
      const { $pb } = useNuxtApp();
      $pb.authStore.clear();
      this.$reset();
    },

    async checkAuth() {
      const { $pb } = useNuxtApp();

      if (!$pb.authStore.isValid) return this.logout();

      try {
        await $pb.collection('users').authRefresh();
        this.user = $pb.authStore.record;

        const employee = await $pb.collection('employees').getFirstListItem(`user="${this.user?.id}"`);

        if (employee.role !== 'admin') throw new Error('Only admin can login');

        this.isAdmin = true;
        this.employeesId = employee.id;
      } catch {
        this.logout();
      }
    },
  },
});
