import PocketBase from 'pocketbase';

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig();
  const pb = new PocketBase(config.public.pocketbaseUrl);

  // VERY IMPORTANT
  pb.autoCancellation(false);

  return {
    provide: { pb },
  };
});