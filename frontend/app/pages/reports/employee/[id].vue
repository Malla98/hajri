<script setup lang="ts">
import dayjs from 'dayjs'

const route = useRoute()
const {$pb} = useNuxtApp()
const { calculate } = useAttendanceCalc()

const month = ref(dayjs().format('YYYY-MM'))
let loading = false
const employee = ref<any>(null)
const attendance = ref<any[]>([])
const summary = ref<any>(null)

const loadReport = async () => {
if (loading) return
  loading = true

    try {
     const empId = route.params.id as string
  if (!empId) return

  employee.value = await $pb.collection('employees').getOne(empId)

  const start = `${month.value}-01`
  const end = dayjs(start).endOf('month').format('YYYY-MM-DD')

  attendance.value = await $pb.collection('attendance').getFullList({
    filter: `employee="${empId}" && date >= "${start}" && date <= "${end}"`,
    sort: 'date',
  })

  summary.value = calculate({
    salary: employee.value.salary,
    attendance: attendance.value,
    totalDays: dayjs(end).date(),
  })
  } finally {
    loading = false
  }
 
}

/**
 * 🔥 Explicit reactivity
 */
watch(
  () => [month.value, route.params.id],
  loadReport,
  { immediate: true }
)
</script>

<template>
  <div class="p-6 space-y-6">
    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div>
        <h1 class="text-2xl font-semibold">
          {{ employee?.name }}
        </h1>
        <p class="text-sm text-gray-500">
          Monthly Report
        </p>
      </div>

      <input
        type="month"
        v-model="month"
        class="border rounded-lg px-3 py-2"
      />
    </div>

    <!-- Summary Cards -->
    <div v-if="summary" class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div class="bg-white border rounded-xl p-4">
        <p class="text-sm text-gray-500">Present Days</p>
        <p class="text-2xl font-bold">{{ summary.presentDays }}</p>
      </div>

      <div class="bg-white border rounded-xl p-4">
        <p class="text-sm text-gray-500">Absent Days</p>
        <p class="text-2xl font-bold">{{ summary.absentDays }}</p>
      </div>

      <div class="bg-white border rounded-xl p-4">
        <p class="text-sm text-gray-500">Advance</p>
        <p class="text-2xl font-bold text-red-600">
          ₹{{ summary.advance }}
        </p>
      </div>

      <div class="bg-white border rounded-xl p-4">
        <p class="text-sm text-gray-500">Net Pay</p>
        <p class="text-2xl font-bold text-green-600">
          ₹{{ summary.net.toFixed(2) }}
        </p>
      </div>
    </div>

    <!-- Attendance Table -->
    <div class="overflow-x-auto border rounded-xl">
      <table class="min-w-full text-sm">
        <thead class="bg-gray-100">
          <tr>
            <th class="px-4 py-3 text-left">Date</th>
            <th class="px-4 py-3 text-center">Status</th>
            <th class="px-4 py-3 text-right">Advance</th>
            <th class="px-4 py-3 text-left">Remark</th>
          </tr>
        </thead>

        <tbody>
          <tr
            v-for="a in attendance"
            :key="a.id"
            class="border-t"
          >
            <td class="px-4 py-3">
              {{ dayjs(a.date).format('DD MMM YYYY') }}
            </td>
            <td
              class="px-4 py-3 text-center font-medium"
              :class="
                a.status === 'present'
                  ? 'text-green-600'
                  : 'text-red-600'
              "
            >
              {{ a.status }}
            </td>
            <td class="px-4 py-3 text-right">
              ₹{{ a.advance_amount || 0 }}
            </td>
            <td class="px-4 py-3">
              {{ a.remark || '-' }}
            </td>
          </tr>
          <tr v-if="attendance.length == 0">
            <td colspan="4" class="px-4 py-6 text-center text-gray-500">
              No attendance records found.
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
