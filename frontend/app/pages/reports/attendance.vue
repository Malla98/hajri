<script setup lang="ts">
const { $pb } = useNuxtApp();

const rows = ref<
  { name: string; present: number; absent: number }[]
>([])

onMounted(async () => {
  const records = await $pb.collection('attendance').getFullList({
    expand: 'employee',
  })

  const map: Record<string, any> = {}

  records.forEach((a: any) => {
    const name = a.expand.employee.name

    if (!map[name]) {
      map[name] = { name, present: 0, absent: 0 }
    }

    map[name][a.status]++
  })

  rows.value = Object.values(map)
})
</script>

<template>
  <div class="p-6 space-y-6">
    <h1 class="text-2xl font-semibold text-gray-800">
      Attendance Summary
    </h1>

    <div class="overflow-x-auto border rounded-xl">
      <table class="min-w-full text-sm">
        <thead class="bg-gray-100 text-gray-600">
          <tr>
            <th class="px-4 py-3 text-left">Employee</th>
            <th class="px-4 py-3 text-center">Present</th>
            <th class="px-4 py-3 text-center">Absent</th>
            <th class="px-4 py-3 text-center">Total</th>
          </tr>
        </thead>

        <tbody>
          <tr
            v-for="r in rows"
            :key="r.name"
            class="border-t hover:bg-gray-50"
          >
            <td class="px-4 py-3 font-medium">{{ r.name }}</td>
            <td class="px-4 py-3 text-center text-green-600">
              {{ r.present }}
            </td>
            <td class="px-4 py-3 text-center text-red-600">
              {{ r.absent }}
            </td>
            <td class="px-4 py-3 text-center font-semibold">
              {{ r.present + r.absent }}
            </td>
          </tr>
          <tr v-if="rows.length == 0">
            <td colspan="4" class="px-4 py-6 text-center text-gray-500">
              No attendance records found.
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
