<template>
  <div class="dashboard-root">

    <!-- ══ HERO HEADER ══ -->
    <div class="dash-hero">
      <div class="hero-content">
        <div class="hero-left">
          <div class="greeting-line">
            <v-icon size="18" class="mr-1" style="color:rgba(255,255,255,0.75)">mdi-view-dashboard</v-icon>
            <span class="greeting-sub">Dashboard</span>
          </div>
          <div class="greeting-title">Good {{ timeOfDay }}, {{ authStore.user?.name?.split(' ')[0] || 'Admin' }} 👋</div>
          <div class="greeting-date">{{ todayFormatted }}</div>
        </div>
        <div class="hero-right d-none d-sm-flex">
          <NuxtLink to="/reports/attendance" style="text-decoration:none">
            <v-btn
              variant="flat"
              rounded="lg"
              size="small"
              color="white"
              style="color:#1565C0; font-weight:700;"
              prepend-icon="mdi-chart-bar"
            >
              Attendance Report
            </v-btn>
          </NuxtLink>
        </div>
      </div>
    </div>

    <div class="dash-body">

      <!-- ══ KPI CARDS ══ -->
      <div class="section-label px-1 pt-2 pb-3">Overview</div>
      <div class="kpi-grid">

        <!-- Total Employees -->
        <div class="kpi-card kpi-blue" :class="{ 'kpi-loading': loading }">
          <div class="kpi-card-inner">
            <div class="kpi-icon-wrap" style="background:rgba(25,118,210,0.12)">
              <v-icon color="#1976D2" size="24">mdi-account-group</v-icon>
            </div>
            <div class="kpi-value" style="color:#1565C0">
              <span v-if="!loading">{{ stats.totalEmployees }}</span>
              <v-skeleton-loader v-else type="text" width="40" />
            </div>
            <div class="kpi-label">Total Employees</div>
          </div>
          <div class="kpi-footer">
            <v-icon size="12" color="#1976D2">mdi-circle</v-icon>
            <span>Active workers</span>
          </div>
        </div>

        <!-- Today Present -->
        <div class="kpi-card kpi-green" :class="{ 'kpi-loading': loading }">
          <div class="kpi-card-inner">
            <div class="kpi-icon-wrap" style="background:rgba(56,142,60,0.12)">
              <v-icon color="#388E3C" size="24">mdi-check-circle</v-icon>
            </div>
            <div class="kpi-value" style="color:#2E7D32">
              <span v-if="!loading">{{ stats.todayPresent }}</span>
              <v-skeleton-loader v-else type="text" width="40" />
            </div>
            <div class="kpi-label">Today Present</div>
          </div>
          <div class="kpi-footer">
            <v-icon size="12" color="#388E3C">mdi-circle</v-icon>
            <span>
              <span v-if="!loading && stats.totalEmployees > 0">
                {{ Math.round((stats.todayPresent / stats.totalEmployees) * 100) }}% attendance
              </span>
              <span v-else>—</span>
            </span>
          </div>
        </div>

        <!-- Today Absent -->
        <div class="kpi-card kpi-red" :class="{ 'kpi-loading': loading }">
          <div class="kpi-card-inner">
            <div class="kpi-icon-wrap" style="background:rgba(211,47,47,0.1)">
              <v-icon color="#D32F2F" size="24">mdi-close-circle</v-icon>
            </div>
            <div class="kpi-value" style="color:#C62828">
              <span v-if="!loading">{{ stats.totalEmployees - stats.todayPresent }}</span>
              <v-skeleton-loader v-else type="text" width="40" />
            </div>
            <div class="kpi-label">Today Absent</div>
          </div>
          <div class="kpi-footer">
            <v-icon size="12" color="#D32F2F">mdi-circle</v-icon>
            <span>As of today</span>
          </div>
        </div>

        <!-- Total Salary -->
        <div class="kpi-card kpi-purple" :class="{ 'kpi-loading': loading }">
          <div class="kpi-card-inner">
            <div class="kpi-icon-wrap" style="background:rgba(123,31,162,0.1)">
              <v-icon color="#7B1FA2" size="24">mdi-currency-inr</v-icon>
            </div>
            <div class="kpi-value" style="color:#6A1B9A">
              <span v-if="!loading">₹{{ stats.totalSalary.toLocaleString('en-IN') }}</span>
              <v-skeleton-loader v-else type="text" width="60" />
            </div>
            <div class="kpi-label">Monthly Salary Pool</div>
          </div>
          <div class="kpi-footer">
            <v-icon size="12" color="#7B1FA2">mdi-circle</v-icon>
            <span>All employees combined</span>
          </div>
        </div>

      </div>

      <!-- Mobile: Attendance Report button -->
      <div class="d-flex d-sm-none mt-3 mb-1">
        <NuxtLink to="/reports/attendance" style="text-decoration:none; width:100%">
          <v-btn variant="flat" color="primary" rounded="lg" block prepend-icon="mdi-chart-bar">
            View Attendance Report
          </v-btn>
        </NuxtLink>
      </div>

      <!-- ══ TODAY ATTENDANCE MINI BAR ══ -->
      <v-card rounded="xl" elevation="1" class="mt-4 mb-1">
        <v-card-text class="pa-4">
          <div class="d-flex justify-space-between align-center mb-3">
            <span class="text-body-2 font-weight-bold">Today's Attendance</span>
            <span class="text-caption text-medium-emphasis">{{ todayShort }}</span>
          </div>
          <div class="today-bar-wrap">
            <div
              class="today-bar-fill"
              :style="`width:${stats.totalEmployees > 0 ? Math.round((stats.todayPresent / stats.totalEmployees) * 100) : 0}%`"
            />
          </div>
          <div class="d-flex justify-space-between mt-2">
            <span class="text-caption" style="color:#388E3C">
              <v-icon size="12">mdi-check-circle</v-icon>
              {{ stats.todayPresent }} present
            </span>
            <span class="text-caption" style="color:#D32F2F">
              {{ stats.totalEmployees - stats.todayPresent }} absent
              <v-icon size="12">mdi-close-circle</v-icon>
            </span>
          </div>
        </v-card-text>
      </v-card>

      <!-- ══ RECENT ATTENDANCE TABLE ══ -->
      <div class="section-label px-1 pt-4 pb-3">Last 7 Days</div>
      <v-card rounded="xl" elevation="1" class="mb-6">
        <div class="table-topbar px-4 py-3">
          <div class="d-flex align-center gap-2">
            <v-icon size="18" color="primary">mdi-calendar-clock</v-icon>
            <span class="text-body-2 font-weight-bold">Recent Attendance</span>
          </div>
          <v-chip size="x-small" color="primary" variant="tonal">7 days</v-chip>
        </div>
        <v-divider />

        <!-- Mobile: card rows -->
        <div class="d-block d-sm-none">
          <div v-if="loading" class="pa-4">
            <v-skeleton-loader v-for="i in 4" :key="i" type="list-item-two-line" class="mb-2" />
          </div>
          <div
            v-for="(item, idx) in recentAttendance"
            :key="item.date"
            class="mob-att-row"
            :class="{ 'mob-att-border': idx < recentAttendance.length - 1 }"
          >
            <div class="d-flex align-center justify-space-between">
              <div>
                <div class="text-body-2 font-weight-bold">{{ formatDate(item.date) }}</div>
                <div class="text-caption text-medium-emphasis">{{ formatDateSub(item.date) }}</div>
              </div>
              <div class="d-flex align-center" style="gap:8px">
                <v-chip color="success" variant="tonal" size="x-small" prepend-icon="mdi-check-circle">
                  {{ item.present }}
                </v-chip>
                <v-chip color="error" variant="tonal" size="x-small" prepend-icon="mdi-close-circle">
                  {{ item.absent }}
                </v-chip>
                <span v-if="item.advances > 0" class="text-caption text-error font-weight-medium">
                  −₹{{ item.advances }}
                </span>
              </div>
            </div>
          </div>
          <div v-if="!loading && recentAttendance.length === 0" class="text-center py-8">
            <v-icon size="40" color="grey-lighten-2">mdi-calendar-remove</v-icon>
            <p class="text-caption text-medium-emphasis mt-2">No attendance data yet.</p>
          </div>
        </div>

        <!-- Desktop: data table -->
        <v-data-table
          class="dash-table d-none d-sm-block"
          :items="recentAttendance"
          :headers="headers"
          :loading="loading"
          item-key="date"
          density="comfortable"
          hide-default-footer
        >
          <template #item.date="{ item }">
            <div>
              <div class="font-weight-medium">{{ formatDate(item.date) }}</div>
              <div class="text-caption text-medium-emphasis">{{ formatDateSub(item.date) }}</div>
            </div>
          </template>
          <template #item.present="{ item }">
            <v-chip color="success" variant="tonal" size="small" prepend-icon="mdi-check-circle">
              {{ item.present }}
            </v-chip>
          </template>
          <template #item.absent="{ item }">
            <v-chip color="error" variant="tonal" size="small" prepend-icon="mdi-close-circle">
              {{ item.absent }}
            </v-chip>
          </template>
          <template #item.advances="{ item }">
            <span v-if="item.advances > 0" class="text-error font-weight-medium">
              −₹{{ item.advances }}
            </span>
            <span v-else class="text-caption text-disabled">—</span>
          </template>
          <template #no-data>
            <div class="text-center py-8">
              <v-icon size="40" color="grey-lighten-2">mdi-calendar-remove</v-icon>
              <p class="text-body-2 text-medium-emphasis mt-2">No attendance data yet.</p>
            </div>
          </template>
        </v-data-table>
      </v-card>

    </div>
  </div>
</template>

<script setup lang="ts">
import dayjs from 'dayjs'
import { useAuthStore } from '~/stores/auth'

const { $pb } = useNuxtApp()
const authStore = useAuthStore()
const loading = ref(true)
const lastDay =  dayjs().endOf('month').date()
console.log('GGF',lastDay);

const stats = ref({
  totalEmployees: 0,
  todayPresent: 0,
  totalSalary: 0,
})

const recentAttendance = ref<any[]>([])

const headers = [
  { title: 'Date', key: 'date' },
  { title: 'Present', key: 'present', align: 'center' },
  { title: 'Absent', key: 'absent', align: 'center' },
  { title: 'Advances', key: 'advances', align: 'end' },
]

const timeOfDay = computed(() => {
  const h = new Date().getHours()
  if (h < 12) return 'morning'
  if (h < 17) return 'afternoon'
  return 'evening'
})

const todayFormatted = computed(() => dayjs().format('dddd, DD MMMM YYYY'))
const todayShort = computed(() => dayjs().format('DD MMM YYYY'))

onMounted(async () => {
  await Promise.all([fetchStats(), fetchRecentAttendance()])
  loading.value = false
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
    stats.value = {
      totalEmployees: employees.length,
      todayPresent: attendance.length,
      totalSalary: (employees.reduce((sum, emp) => sum + emp.salary, 0) * lastDay),
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
      if (!acc[date]) acc[date] = { present: 0, absent: 0, advances: 0 }
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
      .map(date => ({ date, ...grouped[date] }))
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
  return dayjs(date).format('ddd, DD MMM')
}

const formatDateSub = (dateStr: string) => {
  const date = new Date(dateStr)
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  if (date.toDateString() === today.toDateString()) return dayjs(date).format('DD MMM YYYY')
  if (date.toDateString() === yesterday.toDateString()) return dayjs(date).format('DD MMM YYYY')
  return dayjs(date).format('YYYY')
}
</script>

<style scoped>
.dashboard-root {
  background: #F5F5F5;
  min-height: 100vh;
  font-family: 'Roboto', sans-serif;
}

/* ═══ HERO ═══ */
.dash-hero {
  background: linear-gradient(135deg, #1565C0 0%, #283593 100%);
  padding: 20px 16px 24px;
}
@media (min-width: 600px) {
  .dash-hero { padding: 24px 24px 28px; }
}
.hero-content {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}
.greeting-line {
  display: flex;
  align-items: center;
  margin-bottom: 4px;
}
.greeting-sub {
  font-size: 0.72rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1.2px;
  color: rgba(255,255,255,0.72);
}
.greeting-title {
  font-size: 1.4rem;
  font-weight: 800;
  color: white;
  line-height: 1.2;
  margin-bottom: 4px;
}
@media (min-width: 600px) {
  .greeting-title { font-size: 1.7rem; }
}
.greeting-date {
  font-size: 0.8rem;
  color: rgba(255,255,255,0.65);
}

/* ═══ BODY ═══ */
.dash-body {
  padding: 16px 12px;
}
@media (min-width: 600px) {
  .dash-body { padding: 20px 20px; }
}

/* ═══ SECTION LABEL ═══ */
.section-label {
  font-size: 0.68rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1.4px;
  color: #9E9E9E;
}

/* ═══ KPI GRID ═══ */
.kpi-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}
@media (min-width: 960px) {
  .kpi-grid { grid-template-columns: repeat(4, 1fr); }
}

.kpi-card {
  background: white;
  border-radius: 16px;
  padding: 14px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06);
  transition: transform 0.15s, box-shadow 0.15s;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: 130px;
}
.kpi-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0,0,0,0.12);
}
.kpi-card-inner { margin-bottom: 10px; }
.kpi-icon-wrap {
  width: 40px; height: 40px;
  border-radius: 12px;
  display: flex; align-items: center; justify-content: center;
  margin-bottom: 10px;
}
.kpi-value {
  font-size: 1.6rem;
  font-weight: 800;
  line-height: 1;
  margin-bottom: 4px;
}
.kpi-label {
  font-size: 0.68rem;
  color: #757575;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.kpi-footer {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 0.7rem;
  color: #9E9E9E;
  border-top: 1px solid rgba(0,0,0,0.05);
  padding-top: 8px;
  margin-top: auto;
}

/* Card accent borders */
.kpi-blue { border-top: 3px solid #1976D2; }
.kpi-green { border-top: 3px solid #388E3C; }
.kpi-red { border-top: 3px solid #D32F2F; }
.kpi-purple { border-top: 3px solid #7B1FA2; }

/* ═══ TODAY BAR ═══ */
.today-bar-wrap {
  height: 10px;
  border-radius: 5px;
  background: #FFCDD2;
  overflow: hidden;
}
.today-bar-fill {
  height: 100%;
  border-radius: 5px;
  background: #4CAF50;
  transition: width 0.6s cubic-bezier(0.4,0,0.2,1);
}

/* ═══ TABLE ═══ */
.table-topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.dash-table :deep(.v-data-table__th) {
  background: #FAFAFA !important;
  font-size: 0.7rem !important;
  font-weight: 700 !important;
  text-transform: uppercase !important;
  letter-spacing: 0.8px !important;
  color: #757575 !important;
}
.dash-table :deep(.v-data-table__tr:hover td) {
  background: #F3F4F6 !important;
}

/* ═══ MOBILE ROWS ═══ */
.mob-att-row { padding: 12px 16px; }
.mob-att-border { border-bottom: 1px solid rgba(0,0,0,0.06); }
</style>