export default defineNuxtRouteMiddleware((to) => {
  const { $pb } = useNuxtApp();
  const authStore = useAuthStore();

  // Public route
  if (to.path === '/login') {
    if ($pb.authStore.isValid && authStore.isAdmin) {
      return navigateTo('/attendance');
    }
    return;
  }

  // Protected routes
  if (!$pb.authStore.isValid) {
    return navigateTo('/login');
  }
});