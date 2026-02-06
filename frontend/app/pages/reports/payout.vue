<script setup lang="ts">
import dayjs from 'dayjs'

const { $pb } = useNuxtApp()
const { calculate } = useAttendanceCalc()

const month = ref(dayjs().format('YYYY-MM'))
const rows = ref<any[]>([])
const loading = ref(false)

const headers = [
  { title: 'Employee', key: 'employee' },
  { title: 'Present', key: 'presentDays', align: 'center' },
  { title: 'Absent', key: 'absentDays', align: 'center' },
  { title: 'Gross', key: 'gross', align: 'end' },
  { title: 'Advance', key: 'advance', align: 'end' },
  { title: 'Net Pay', key: 'net', align: 'end' },
]

const loadPayout = async () => {
  if (loading.value) return
  loading.value = true

  try {
    const employees = await $pb
      .collection('employees')
      .getFullList({ filter: 'active=true && role="worker"' })

    const start = `${month.value}-01`
    const end = dayjs(start).endOf('month').format('YYYY-MM-DD')

    rows.value = []

    for (const emp of employees) {
      const attendance = await $pb.collection('attendance').getFullList({
        filter: `employee="${emp.id}" && date >= "${start}" && date <= "${end}"`,
      })

      const calc = calculate({
        salary: emp.salary,
        attendance,
        totalDays: dayjs(end).date(),
      })

      rows.value.push({
        employee: emp.name,
        ...calc,
      })
    }
  } finally {
    loading.value = false
  }
}

watch(month, loadPayout, { immediate: true })
</script>

<template>
  <v-container fluid class="pa-6">
    <v-row class="mb-4" align="center">
      <v-col cols="12" md="6">
        <h1 class="text-h5 font-weight-bold">
          Monthly Payout Report
        </h1>
      </v-col>

      <v-col cols="12" md="6" class="text-md-right">
        <v-text-field
          v-model="month"
          type="month"
          label="Select Month"
          density="comfortable"
          variant="outlined"
          max-width="220"
        />
      </v-col>
    </v-row>

    <v-card rounded="xl" elevation="2">
      <v-data-table
        :headers="headers"
        :items="rows"
        item-key="employee"
        :loading="loading"
        loading-text="Loading payout data..."
        class="elevation-0"
      >
        <template #item.gross="{ item }">
          ₹{{ item.gross.toFixed(2) }}
        </template>

        <template #item.advance="{ item }">
          <span class="text-error">
            -₹{{ item.advance.toFixed(2) }}
          </span>
        </template>

        <template #item.net="{ item }">
          <span class="text-success font-weight-bold">
            ₹{{ item.net.toFixed(2) }}
          </span>
        </template>

        <template #no-data>
          <v-empty-state
            icon="mdi-cash-remove"
            title="No payout records"
            text="No payout records found for this month."
          />
        </template>
      </v-data-table>
    </v-card>
  </v-container>
</template>
