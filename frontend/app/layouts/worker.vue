<template>
  <div class="min-h-screen bg-gray-100">
    <div class="bg-blue-600 text-white p-4">
      <div class="max-w-7xl mx-auto">
        <h1 class="text-xl font-bold">Attendance System</h1>
        <p class="text-sm opacity-90">Worker View - Read Only</p>
      </div>
    </div>
    <div class="max-w-7xl mx-auto px-4 py-6">
      <slot />
    </div>
  </div>
</template>