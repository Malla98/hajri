<script setup lang="ts">
import dayjs from 'dayjs'

const route = useRoute()
const { $pb } = useNuxtApp()
const { calculate } = useAttendanceCalc()

const month = ref(dayjs().format('YYYY-MM'))
const loading = ref(false)

const employee = ref<any>(null)
const attendance = ref<any[]>([])
const summary = ref<any>(null)

const headers = [
  { title: 'Date', key: 'date' },
  { title: 'Status', key: 'status', align: 'center' },
  { title: 'Advance', key: 'advance_amount', align: 'end' },
  { title: 'Remark', key: 'remark' },
]

const loadReport = async () => {
  if (loading.value) return
  loading.value = true

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
    loading.value = false
  }
}

watch(
  () => [month.value, route.params.id],
  loadReport,
  { immediate: true }
)
</script>

<template>
  <v-container fluid class="pa-6">
    <!-- Header -->
    <v-row align="center" justify="space-between" class="mb-4">
      <v-col cols="12" md="6">
        <h1 class="text-h5 font-weight-bold">
          {{ employee?.name }}
        </h1>
        <p class="text-caption text-medium-emphasis">
          Monthly Report
        </p>
      </v-col>

      <v-col cols="12" md="3">
        <v-text-field
          v-model="month"
          type="month"
          label="Month"
          density="comfortable"
          variant="outlined"
        />
      </v-col>
    </v-row>

    <!-- Summary -->
    <v-row v-if="summary" class="mb-6" dense>
      <v-col cols="12" md="3">
        <v-card rounded="xl" elevation="2">
          <v-card-text>
            <div class="text-caption text-medium-emphasis">Present Days</div>
            <div class="text-h5 font-weight-bold">
              {{ summary.presentDays }}
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="3">
        <v-card rounded="xl" elevation="2">
          <v-card-text>
            <div class="text-caption text-medium-emphasis">Absent Days</div>
            <div class="text-h5 font-weight-bold">
              {{ summary.absentDays }}
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="3">
        <v-card rounded="xl" elevation="2">
          <v-card-text>
            <div class="text-caption text-medium-emphasis">Advance</div>
            <div class="text-h5 font-weight-bold text-error">
              ₹{{ summary.advance }}
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="3">
        <v-card rounded="xl" elevation="2">
          <v-card-text>
            <div class="text-caption text-medium-emphasis">Net Pay</div>
            <div class="text-h5 font-weight-bold text-success">
              ₹{{ summary.net.toFixed(2) }}
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Attendance Table -->
    <v-card rounded="xl" elevation="2">
      <v-data-table
        :headers="headers"
        :items="attendance"
        :loading="loading"
        item-key="id"
        class="elevation-0"
      >
        <template #item.date="{ item }">
          {{ dayjs(item.date).format('DD MMM YYYY') }}
        </template>

        <template #item.status="{ item }">
          <v-chip
            :color="item.status === 'present' ? 'success' : 'error'"
            variant="tonal"
            size="small"
          >
            {{ item.status }}
          </v-chip>
        </template>

        <template #item.advance_amount="{ item }">
          ₹{{ item.advance_amount || 0 }}
        </template>

        <template #item.remark="{ item }">
          {{ item.remark || '-' }}
        </template>

        <template #no-data>
          <v-empty-state
            icon="mdi-calendar-remove"
            title="No attendance data"
            text="No attendance records found for this month."
          />
        </template>
      </v-data-table>
    </v-card>
  </v-container>
</template>
