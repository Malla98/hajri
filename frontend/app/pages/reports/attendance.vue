<script setup lang="ts">
import dayjs from 'dayjs'

const { $pb } = useNuxtApp()

const rows = ref<{ name: string; present: number; absent: number; total: number; rate: number }[]>([])
const loading = ref(false)
const search = ref('')

const headers = [
  { title: 'Employee', key: 'name' },
  { title: 'Present', key: 'present', align: 'center' },
  { title: 'Absent', key: 'absent', align: 'center' },
  { title: 'Total', key: 'total', align: 'center' },
  { title: 'Attendance Rate', key: 'rate', align: 'center' },
]

const filteredRows = computed(() => {
  const q = search.value.toLowerCase().trim()
  if (!q) return rows.value
  return rows.value.filter(r => r.name.toLowerCase().includes(q))
})

// Summary stats
const totalPresent = computed(() => rows.value.reduce((s, r) => s + r.present, 0))
const totalAbsent  = computed(() => rows.value.reduce((s, r) => s + r.absent, 0))
const overallRate  = computed(() => {
  const total = totalPresent.value + totalAbsent.value
  return total > 0 ? Math.round((totalPresent.value / total) * 100) : 0
})
const topAttendee  = computed(() => rows.value.reduce((best, r) => r.rate > (best?.rate ?? -1) ? r : best, null as any))

const rateColor = (rate: number) => {
  if (rate >= 80) return '#4CAF50'
  if (rate >= 50) return '#FF9800'
  return '#F44336'
}

const avatarColors = [
  '#1976D2','#388E3C','#7B1FA2','#E65100',
  '#00796B','#C62828','#283593','#2E7D32',
]
const avatarBg = (name: string) => avatarColors[(name?.charCodeAt(0) || 0) % avatarColors.length] + '22'
const avatarFg = (name: string) => avatarColors[(name?.charCodeAt(0) || 0) % avatarColors.length]

onMounted(async () => {
  loading.value = true
  try {
    const records = await $pb.collection('attendance').getFullList({
      expand: 'employee',
      filter: 'employee.role="worker"',
    })
    const map: Record<string, any> = {}
    records.forEach((a: any) => {
      const name = a.expand?.employee?.name
      if (!name) return
      if (!map[name]) map[name] = { name, present: 0, absent: 0 }
      map[name][a.status]++
    })
    rows.value = Object.values(map).map((r: any) => ({
      ...r,
      total: r.present + r.absent,
      rate: r.present + r.absent > 0 ? Math.round((r.present / (r.present + r.absent)) * 100) : 0,
    })).sort((a, b) => b.rate - a.rate)
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="summary-root">

    <!-- ══ APP BAR ══ -->
    <div class="summary-appbar elevation-4">
      <div class="appbar-inner">
        <div>
          <div class="appbar-title">Attendance Summary</div>
          <div class="appbar-sub">All-time records · {{ rows.length }} employees</div>
        </div>
      </div>
      <div class="appbar-chips px-3 pb-3">
        <div class="s-chip s-chip-green">
          <v-icon size="13">mdi-check-circle</v-icon>
          <span>{{ totalPresent }} Present</span>
        </div>
        <div class="s-chip s-chip-red">
          <v-icon size="13">mdi-close-circle</v-icon>
          <span>{{ totalAbsent }} Absent</span>
        </div>
        <div class="s-chip s-chip-blue">
          <v-icon size="13">mdi-percent</v-icon>
          <span>{{ overallRate }}% Overall</span>
        </div>
        <div v-if="topAttendee" class="s-chip s-chip-gold">
          <v-icon size="13">mdi-trophy</v-icon>
          <span>{{ topAttendee.name }} {{ topAttendee.rate }}%</span>
        </div>
      </div>
    </div>

    <!-- ══ BODY ══ -->
    <div class="summary-body">

      <!-- KPI Row -->
      <div v-if="!loading" class="kpi-grid mb-4">
        <div class="kpi-card kpi-green">
          <div class="kpi-icon-ring" style="background:rgba(76,175,80,0.12)">
            <v-icon color="#388E3C" size="22">mdi-check-circle</v-icon>
          </div>
          <div class="kpi-val" style="color:#2E7D32">{{ totalPresent }}</div>
          <div class="kpi-lbl">Total Present</div>
        </div>
        <div class="kpi-card kpi-red">
          <div class="kpi-icon-ring" style="background:rgba(244,67,54,0.1)">
            <v-icon color="#D32F2F" size="22">mdi-close-circle</v-icon>
          </div>
          <div class="kpi-val" style="color:#C62828">{{ totalAbsent }}</div>
          <div class="kpi-lbl">Total Absent</div>
        </div>
        <div class="kpi-card kpi-blue">
          <div class="kpi-icon-ring" style="background:rgba(33,150,243,0.1)">
            <v-icon color="#1976D2" size="22">mdi-percent</v-icon>
          </div>
          <div class="kpi-val" :style="`color:${rateColor(overallRate)}`">{{ overallRate }}%</div>
          <div class="kpi-lbl">Overall Rate</div>
        </div>
        <div class="kpi-card kpi-gold">
          <div class="kpi-icon-ring" style="background:rgba(255,193,7,0.15)">
            <v-icon color="#F57F17" size="22">mdi-trophy</v-icon>
          </div>
          <div class="kpi-val" style="color:#E65100; font-size:1.1rem; font-weight:800">{{ topAttendee?.name || '—' }}</div>
          <div class="kpi-lbl">Top Attendee</div>
        </div>
      </div>

      <!-- Search -->
      <v-text-field
        v-model="search"
        density="compact"
        variant="outlined"
        rounded="lg"
        hide-details
        placeholder="Search employee…"
        prepend-inner-icon="mdi-magnify"
        clearable
        bg-color="white"
        class="mb-3"
      />

      <!-- ── DESKTOP TABLE ── -->
      <v-card rounded="xl" elevation="1" class="d-none d-md-block">
        <div class="table-topbar px-4 py-3">
          <div class="d-flex align-center gap-2">
            <v-icon size="18" color="primary">mdi-chart-bar</v-icon>
            <span class="text-body-2 font-weight-bold ml-3">Employee Breakdown</span>
          </div>
          <v-chip size="x-small" color="primary" variant="tonal">{{ filteredRows.length }} employees</v-chip>
        </div>
        <v-divider />
        <v-data-table
          :headers="headers"
          :items="filteredRows"
          :loading="loading"
          item-key="name"
          class="att-sum-table"
          density="comfortable"
          loading-text="Loading attendance data…"
        >
          <template #item.name="{ item }">
            <div class="d-flex align-center gap-3">
              <div class="emp-avatar" :style="`background:${avatarBg(item.name)}; color:${avatarFg(item.name)}`">
                {{ item.name?.charAt(0).toUpperCase() }}
              </div>
              <span class="font-weight-medium ml-3">{{ item.name }}</span>
            </div>
          </template>

          <template #item.present="{ item }">
            <v-chip color="success" variant="tonal" size="small">{{ item.present }}</v-chip>
          </template>

          <template #item.absent="{ item }">
            <v-chip color="error" variant="tonal" size="small">{{ item.absent }}</v-chip>
          </template>

          <template #item.total="{ item }">
            <span class="font-weight-bold">{{ item.total }}</span>
          </template>

          <template #item.rate="{ item }">
            <div class="rate-cell">
              <div class="rate-bar-bg">
                <div class="rate-bar-fill" :style="`width:${item.rate}%; background:${rateColor(item.rate)}`" />
              </div>
              <span class="rate-label font-weight-bold" :style="`color:${rateColor(item.rate)}`">
                {{ item.rate }}%
              </span>
            </div>
          </template>

          <template #no-data>
            <div class="text-center py-10">
              <v-icon size="48" color="grey-lighten-2">mdi-calendar-remove</v-icon>
              <p class="text-body-2 text-medium-emphasis mt-2">No attendance records found.</p>
            </div>
          </template>
        </v-data-table>
      </v-card>

      <!-- ── MOBILE CARDS ── -->
      <div class="d-block d-md-none">
        <div class="section-label pb-3">Employee Breakdown · {{ filteredRows.length }} total</div>

        <div v-if="loading" class="d-flex flex-column gap-2">
          <v-skeleton-loader v-for="i in 5" :key="i" type="list-item-avatar-two-line" class="rounded-xl" />
        </div>

        <div v-else class="mob-list">
          <div
            v-for="item in filteredRows"
            :key="item.name"
            class="mob-card"
          >
            <!-- Header -->
            <div class="mob-header">
              <div class="d-flex align-center gap-3">
                <div class="emp-avatar-lg" :style="`background:${avatarBg(item.name)}; color:${avatarFg(item.name)}`">
                  {{ item.name?.charAt(0).toUpperCase() }}
                </div>
                <div>
                  <div class="mob-name">{{ item.name }}</div>
                  <div class="mob-total text-caption text-medium-emphasis">{{ item.total }} days recorded</div>
                </div>
              </div>
              <div class="mob-rate-badge" :style="`background:${rateColor(item.rate)}22; color:${rateColor(item.rate)}`">
                {{ item.rate }}%
              </div>
            </div>

            <!-- Rate Bar -->
            <div class="mob-bar-wrap">
              <div class="mob-bar-fill" :style="`width:${item.rate}%; background:${rateColor(item.rate)}`" />
            </div>

            <!-- Chips -->
            <div class="mob-chips">
              <v-chip color="success" variant="tonal" size="x-small" prepend-icon="mdi-check-circle">
                {{ item.present }} present
              </v-chip>
              <v-chip color="error" variant="tonal" size="x-small" prepend-icon="mdi-close-circle">
                {{ item.absent }} absent
              </v-chip>
            </div>
          </div>

          <div v-if="filteredRows.length === 0" class="text-center py-10">
            <v-icon size="48" color="grey-lighten-2">mdi-calendar-remove</v-icon>
            <p class="text-body-2 text-medium-emphasis mt-2">No records found.</p>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<style scoped>
.summary-root {
  background: #F5F5F5;
  min-height: 100vh;
  font-family: 'Roboto', sans-serif;
}

/* ══ APP BAR ══ */
.summary-appbar {
  background: linear-gradient(135deg, #1565C0 0%, #283593 100%);
  position: sticky; top: 0; z-index: 20;
  box-shadow: 0 2px 4px -1px rgba(0,0,0,0.2), 0 4px 5px rgba(0,0,0,0.14);
}
.appbar-inner { padding: 12px 16px 6px; }
.appbar-title { font-size: 1.1rem; font-weight: 700; color: white; }
.appbar-sub { font-size: 0.7rem; color: rgba(255,255,255,0.68); }
.appbar-chips {
  display: flex; flex-wrap: nowrap; gap: 6px;
  overflow-x: auto; scrollbar-width: none; -webkit-overflow-scrolling: touch;
}
.appbar-chips::-webkit-scrollbar { display: none; }
.s-chip {
  display: flex; align-items: center; gap: 4px;
  border-radius: 20px; padding: 3px 10px;
  font-size: 0.72rem; font-weight: 600; flex-shrink: 0; white-space: nowrap;
}
.s-chip-green  { background: rgba(76,175,80,0.25);  color: #C8E6C9; }
.s-chip-red    { background: rgba(244,67,54,0.25);  color: #FFCDD2; }
.s-chip-blue   { background: rgba(33,150,243,0.25); color: #BBDEFB; }
.s-chip-gold   { background: rgba(255,193,7,0.25);  color: #FFF9C4; }

/* ══ BODY ══ */
.summary-body { padding: 14px 12px 24px; }
@media (min-width: 600px) { .summary-body { padding: 16px 20px 28px; } }

/* ══ KPI ══ */
.kpi-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}
@media (min-width: 960px) { .kpi-grid { grid-template-columns: repeat(4, 1fr); } }
.kpi-card {
  background: white; border-radius: 16px; padding: 14px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  transition: transform 0.15s, box-shadow 0.15s;
}
.kpi-card:hover { transform: translateY(-2px); box-shadow: 0 6px 16px rgba(0,0,0,0.12); }
.kpi-green  { border-top: 3px solid #4CAF50; }
.kpi-red    { border-top: 3px solid #F44336; }
.kpi-blue   { border-top: 3px solid #1976D2; }
.kpi-gold   { border-top: 3px solid #FFC107; }
.kpi-icon-ring {
  width: 38px; height: 38px; border-radius: 10px;
  display: flex; align-items: center; justify-content: center; margin-bottom: 8px;
}
.kpi-val { font-size: 1.55rem; font-weight: 800; line-height: 1; margin-bottom: 4px; }
.kpi-lbl { font-size: 0.65rem; color: #757575; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }

/* ══ TABLE ══ */
.table-topbar { display: flex; align-items: center; justify-content: space-between; }
.att-sum-table :deep(.v-data-table__th) {
  background: #FAFAFA !important; font-size: 0.7rem !important; font-weight: 700 !important;
  text-transform: uppercase !important; letter-spacing: 0.8px !important; color: #757575 !important;
}
.att-sum-table :deep(.v-data-table__tr:hover td) { background: #F3F4F6 !important; }
.emp-avatar {
  width: 34px; height: 34px; border-radius: 10px;
  display: flex; align-items: center; justify-content: center;
  font-size: 0.85rem; font-weight: 800; flex-shrink: 0;
}

/* Rate bar in table */
.rate-cell { display: flex; align-items: center; gap: 10px; min-width: 140px; }
.rate-bar-bg { flex: 1; height: 8px; border-radius: 4px; background: #EEEEEE; overflow: hidden; }
.rate-bar-fill { height: 100%; border-radius: 4px; transition: width 0.6s cubic-bezier(0.4,0,0.2,1); }
.rate-label { font-size: 0.82rem; white-space: nowrap; min-width: 36px; text-align: right; }

/* ══ MOBILE ══ */
.section-label { font-size: 0.68rem; font-weight: 700; text-transform: uppercase; letter-spacing: 1.4px; color: #9E9E9E; }
.mob-list { display: flex; flex-direction: column; gap: 10px; }
.mob-card {
  background: white; border-radius: 16px; padding: 14px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}
.mob-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; }
.emp-avatar-lg {
  width: 44px; height: 44px; border-radius: 13px;
  display: flex; align-items: center; justify-content: center;
  font-size: 1rem; font-weight: 800; flex-shrink: 0;
}
.mob-name { font-size: 0.95rem; font-weight: 700; color: #212121; }
.mob-total { margin-top: 2px; }
.mob-rate-badge {
  border-radius: 20px; padding: 4px 12px;
  font-size: 0.88rem; font-weight: 800; flex-shrink: 0;
}
.mob-bar-wrap { height: 8px; border-radius: 4px; background: #EEEEEE; overflow: hidden; margin-bottom: 10px; }
.mob-bar-fill { height: 100%; border-radius: 4px; transition: width 0.6s cubic-bezier(0.4,0,0.2,1); }
.mob-chips { display: flex; gap: 8px; flex-wrap: wrap; }
</style>