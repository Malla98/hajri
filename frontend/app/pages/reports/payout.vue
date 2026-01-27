<script setup lang="ts">
import dayjs from 'dayjs';
const { $pb } = useNuxtApp();
const { calculate } = useAttendanceCalc()


const month = ref(dayjs().format('YYYY-MM'))
const rows = ref<any[]>([])
let loading = false

const loadPayout = async () => {

if (loading) return
  loading = true

  try {
    const employees = await $pb.collection('employees').getFullList({ filter: 'active=true && role="worker"' })


const start = `${month.value}-01`
const end = dayjs(start).endOf('month').format('YYYY-MM-DD')


rows.value = []


for (const emp of employees) {
const attendance = await $pb.collection('attendance').getFullList({
filter: `employee="${emp.id}" && date >= "${start}" && date <= "${end}"`
})


const calc = calculate({
salary: emp.salary,
attendance,
totalDays: dayjs(end).date()
})


rows.value.push({
employee: emp.name,
...calc
})
}
  } finally {
    loading = false
  }


}

watch(month, loadPayout, { immediate: true })

</script>


<template>
<div class="p-6 space-y-6">
  <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
    <h1 class="text-2xl font-semibold text-gray-800">
      Monthly Payout Report
    </h1>

    <input
      type="month"
      v-model="month"
      class="border rounded-lg px-3 py-2 w-48"
    />
  </div>

  <div class="overflow-x-auto rounded-xl border">
    <table class="min-w-full text-sm">
      <thead class="bg-gray-100 text-gray-600">
        <tr>
          <th class="px-4 py-3 text-left">Employee</th>
          <th class="px-4 py-3 text-center">Present</th>
          <th class="px-4 py-3 text-center">Absent</th>
          <th class="px-4 py-3 text-right">Gross</th>
          <th class="px-4 py-3 text-right">Advance</th>
          <th class="px-4 py-3 text-right">Net Pay</th>
        </tr>
      </thead>

      <tbody>
        <tr
          v-for="r in rows"
          :key="r.employee"
          class="border-t hover:bg-gray-50"
        >
          <td class="px-4 py-3 font-medium">{{ r.employee }}</td>
          <td class="px-4 py-3 text-center">{{ r.presentDays }}</td>
          <td class="px-4 py-3 text-center">{{ r.absentDays }}</td>
          <td class="px-4 py-3 text-right">₹{{ r.gross.toFixed(2) }}</td>
          <td class="px-4 py-3 text-right text-red-600">
            -₹{{ r.advance.toFixed(2) }}
          </td>
          <td class="px-4 py-3 text-right font-semibold text-green-600">
            ₹{{ r.net.toFixed(2) }}
          </td>
        </tr>
         <tr v-if="rows.length == 0">
          <td colspan="6" class="px-4 py-6 text-center text-gray-500">
            No payout records found.
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</div>

</template>