<template>
  <v-container fluid class="pa-4">
    <v-row class="mb-6">
      <v-col cols="12">
        <h1 class="text-h5 font-weight-bold">Dashboard</h1>
      </v-col>
    </v-row>

    <!-- Stats Cards -->
    <v-row class="mb-8" dense>
      <v-col cols="12" md="3">
        <v-card elevation="2" rounded="xl">
          <v-card-text>
            <div class="text-subtitle-1 text-medium-emphasis mb-2">
              Total Employees
            </div>
            <div class="text-h4 font-weight-bold text-primary">
              {{ stats.totalEmployees }}
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="3">
        <v-card elevation="2" rounded="xl">
          <v-card-text>
            <div class="text-subtitle-1 text-medium-emphasis mb-2">
              Today's Present
            </div>
            <div class="text-h4 font-weight-bold text-success">
              {{ stats.todayPresent }}
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="3">
        <v-card elevation="2" rounded="xl">
          <v-card-text>
            <div class="text-subtitle-1 text-medium-emphasis mb-2">
              Total Salary
            </div>
            <div class="text-h4 font-weight-bold text-purple">
              ₹{{ stats.totalSalary }}
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="3">
        <v-card elevation="2" rounded="xl">
          <v-card-text>
            <div class="text-subtitle-1 text-medium-emphasis mb-2">
              Attendance Report
            </div>
            <NuxtLink to="/reports/attendance">
              <v-btn variant="text" color="primary">
                View Report
              </v-btn>
            </NuxtLink>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Recent Attendance -->
    <v-card elevation="2" rounded="xl">
      <v-card-title class="text-h6 font-weight-bold">
        Recent Attendance
      </v-card-title>

      <v-data-table
        :items="recentAttendance"
        :headers="headers"
        item-key="date"
        class="elevation-0"
        density="comfortable"
      >
        <template #item.date="{ item }">
          {{ formatDate(item.date) }}
        </template>

        <template #item.present="{ item }">
          <v-chip color="success" variant="tonal" size="small">
            {{ item.present }}
          </v-chip>
        </template>

        <template #item.absent="{ item }">
          <v-chip color="error" variant="tonal" size="small">
            {{ item.absent }}
          </v-chip>
        </template>

        <template #item.advances="{ item }">
          ₹{{ item.advances }}
        </template>
      </v-data-table>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'

const { $pb } = useNuxtApp()
const authStore = useAuthStore()

const stats = ref({
  totalEmployees: 0,
  todayPresent: 0,
  totalSalary: 0,
})

const recentAttendance = ref<any[]>([])

const headers = [
  { title: 'Date', key: 'date' },
  { title: 'Present', key: 'present' },
  { title: 'Absent', key: 'absent' },
  { title: 'Advances', key: 'advances' },
]

onMounted(async () => {
  await fetchStats()
  await fetchRecentAttendance()
})

const fetchStats = async () => {
  try {
    const employees = await $pb.collection('employees').getFullList({
      filter: 'active = true && role = "worker"',
    })

    const today = new Date().toISOString().split('T')[0]
    const attendance = await $pb.collection('attendance').getFullList({
      filter: `date = "${today} 00:00:00.000Z" && status = "present"`,
    })

    const totalSalary = employees.reduce(
      (sum, emp) => sum + emp.salary,
      0
    )

    stats.value = {
      totalEmployees: employees.length,
      todayPresent: attendance.length,
      totalSalary,
    }
  } catch (err) {
    console.error(err)
  }
}

const fetchRecentAttendance = async () => {
  try {
    const today = new Date()
    const last7Days: string[] = []

    for (let i = 0; i < 7; i++) {
      const d = new Date(today)
      d.setDate(d.getDate() - i)
      last7Days.push(d.toISOString().split('T')[0] + ' 00:00:00.000Z')
    }

    const attendanceData = await $pb.collection('attendance').getFullList({
      filter: last7Days.map(d => `date = "${d}"`).join(' || '),
      sort: '-date',
    })

    const grouped = attendanceData.reduce((acc: any, record: any) => {
      const date = record.date
      if (!acc[date]) {
        acc[date] = { present: 0, absent: 0, advances: 0 }
      }

      if (record.status === 'present') {
        acc[date].present++
        acc[date].advances += record.advance_amount || 0
      } else {
        acc[date].absent++
      }

      return acc
    }, {})

    recentAttendance.value = last7Days
      .filter(date => grouped[date])
      .map(date => ({
        date,
        ...grouped[date],
      }))
  } catch (err) {
    console.error(err)
  }
}

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr)
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  if (date.toDateString() === today.toDateString()) return 'Today'
  if (date.toDateString() === yesterday.toDateString()) return 'Yesterday'

  return date.toLocaleDateString('en-IN', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })
}
</script>
