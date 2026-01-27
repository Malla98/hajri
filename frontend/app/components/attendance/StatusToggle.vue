<!-- components/attendance/StatusToggle.vue -->
<template>
  <button
    @click="onToggle"
    :disabled="!isAdmin || disabled"
    :class="[
      'px-4 py-2 rounded-lg font-semibold transition-all duration-200 min-w-[100px]',
      'disabled:opacity-50 disabled:cursor-not-allowed',
      status === 'present' 
        ? 'bg-green-100 text-green-800 hover:bg-green-200' 
        : 'bg-red-100 text-red-800 hover:bg-red-200'
    ]"
  >
    {{ status === 'present' ? '✅ Present' : '❌ Absent' }}
  </button>
</template>

<script setup lang="ts">
defineProps({
  status: {
    type: String as () => 'present' | 'absent',
    required: true
  },
  isAdmin: {
    type: Boolean,
    default: false
  },
  disabled: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['toggle']);

const onToggle = () => {
  emit('toggle');
};
</script>