<script setup lang="ts">
import dayjs from 'dayjs'

const { $pb } = useNuxtApp()
const { calculate } = useAttendanceCalc()

const month = ref(dayjs().format('YYYY-MM'))
const rows = ref<any[]>([])
const loading = ref(false)
const search = ref('')
const dateInputRef = ref<HTMLInputElement | null>(null)

const headers = [
  { title: 'Employee', key: 'employee' },
  { title: 'Present', key: 'presentDays', align: 'center' },
  { title: 'Absent', key: 'absentDays', align: 'center' },
  { title: 'Gross', key: 'gross', align: 'end' },
  { title: 'Advance', key: 'advance', align: 'end' },
  { title: 'Net Pay', key: 'net', align: 'end' },
]

const filteredRows = computed(() => {
  const q = search.value.toLowerCase().trim()
  if (!q) return rows.value
  return rows.value.filter(r => r.employee.toLowerCase().includes(q))
})

// Summary totals
const totalGross   = computed(() => rows.value.reduce((s, r) => s + r.gross, 0))
const totalAdvance = computed(() => rows.value.reduce((s, r) => s + r.advance, 0))
const totalNet     = computed(() => rows.value.reduce((s, r) => s + r.net, 0))
const totalPresent = computed(() => rows.value.reduce((s, r) => s + r.presentDays, 0))
const totalAbsent  = computed(() => rows.value.reduce((s, r) => s + r.absentDays, 0))
const monthLabel   = computed(() => dayjs(`${month.value}-01`).format('MMMM YYYY'))

const avatarColors = ['#1976D2','#388E3C','#7B1FA2','#E65100','#00796B','#C62828','#283593','#2E7D32']
const avatarBg = (name: string) => avatarColors[(name?.charCodeAt(0) || 0) % avatarColors.length] + '22'
const avatarFg = (name: string) => avatarColors[(name?.charCodeAt(0) || 0) % avatarColors.length]

const openMonthPicker = () => {
  dateInputRef.value?.showPicker?.()
  dateInputRef.value?.focus()
  dateInputRef.value?.click()
}

const loadPayout = async () => {
  if (loading.value) return
  loading.value = true
  try {
    const employees = await $pb.collection('employees').getFullList({
      filter: 'active=true && role="worker"',
    })
    const start = `${month.value}-01`
    const end = dayjs(start).endOf('month').format('YYYY-MM-DD')
    rows.value = []
    for (const emp of employees) {
      const attendance = await $pb.collection('attendance').getFullList({
        filter: `employee="${emp.id}" && date >= "${start}" && date <= "${end}"`,
      })
      const calc = calculate({ perDaySalary: emp.salary, attendance })
      rows.value.push({ employee: emp.name, ...calc })
    }
  } finally {
    loading.value = false
  }
}

watch(month, loadPayout, { immediate: true })
</script>

<template>
  <div class="payout-root">

    <!-- ══════════════════════════════
         APP BAR
    ══════════════════════════════ -->
    <div class="payout-appbar elevation-4">
      <div class="appbar-inner">
        <div class="appbar-left">
          <div class="appbar-title">Payout Report</div>
          <div class="appbar-sub">{{ monthLabel }} · {{ rows.length }} employees</div>
        </div>
        <div class="appbar-right">
          <!-- Clickable month picker -->
          <div class="month-wrapper" @click="openMonthPicker">
            <v-icon size="16" class="month-icon">mdi-calendar</v-icon>
            <span class="month-label">{{ dayjs(`${month}-01`).format('MMM YYYY') }}</span>
            <v-icon size="14" class="month-chevron">mdi-chevron-down</v-icon>
            <input
              ref="dateInputRef"
              v-model="month"
              type="month"
              class="hidden-input"
            />
          </div>
        </div>
      </div>

      <!-- Summary chips -->
      <div class="appbar-chips px-3 pb-3">
        <div class="p-chip p-chip-green">
          <v-icon size="13">mdi-check-circle</v-icon>
          <span>{{ totalPresent }} Present</span>
        </div>
        <div class="p-chip p-chip-red">
          <v-icon size="13">mdi-close-circle</v-icon>
          <span>{{ totalAbsent }} Absent</span>
        </div>
        <div class="p-chip p-chip-orange">
          <v-icon size="13">mdi-cash</v-icon>
          <span>₹{{ totalAdvance.toFixed(0) }} Advance</span>
        </div>
        <div class="p-chip p-chip-teal">
          <v-icon size="13">mdi-currency-inr</v-icon>
          <span>₹{{ totalNet.toFixed(0) }} Net Total</span>
        </div>
      </div>
    </div>

    <!-- ══════════════════════════════
         BODY
    ══════════════════════════════ -->
    <div class="payout-body">

      <!-- KPI Cards -->
      <div v-if="!loading && rows.length > 0" class="kpi-grid mb-4">
        <div class="kpi-card" style="border-top:3px solid #00796B">
          <div class="kpi-icon-ring" style="background:rgba(0,150,136,0.1)">
            <v-icon color="#00796B" size="20">mdi-calculator</v-icon>
          </div>
          <div class="kpi-val" style="color:#00695C">₹{{ totalGross.toLocaleString('en-IN') }}</div>
          <div class="kpi-lbl">Total Gross</div>
        </div>
        <div class="kpi-card" style="border-top:3px solid #F44336">
          <div class="kpi-icon-ring" style="background:rgba(244,67,54,0.1)">
            <v-icon color="#D32F2F" size="20">mdi-cash</v-icon>
          </div>
          <div class="kpi-val" style="color:#C62828">₹{{ totalAdvance.toLocaleString('en-IN') }}</div>
          <div class="kpi-lbl">Total Advance</div>
        </div>
        <div class="kpi-card" style="border-top:3px solid #4CAF50">
          <div class="kpi-icon-ring" style="background:rgba(76,175,80,0.12)">
            <v-icon color="#388E3C" size="20">mdi-wallet</v-icon>
          </div>
          <div class="kpi-val" style="color:#2E7D32">₹{{ totalNet.toLocaleString('en-IN') }}</div>
          <div class="kpi-lbl">Total Net Pay</div>
        </div>
        <div class="kpi-card" style="border-top:3px solid #1976D2">
          <div class="kpi-icon-ring" style="background:rgba(25,118,210,0.1)">
            <v-icon color="#1565C0" size="20">mdi-account-group</v-icon>
          </div>
          <div class="kpi-val" style="color:#1565C0">{{ rows.length }}</div>
          <div class="kpi-lbl">Employees</div>
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
      <v-card rounded="xl" elevation="1" class="d-none d-md-block mb-4">
        <div class="table-topbar px-4 py-3">
          <div class="d-flex align-center gap-2">
            <v-icon size="18" color="primary">mdi-currency-inr</v-icon>
            <span class="text-body-2 font-weight-bold ml-3">Payout Breakdown</span>
          </div>
          <v-chip size="x-small" color="primary" variant="tonal">{{ filteredRows.length }} employees</v-chip>
        </div>
        <v-divider />

        <v-data-table
          :headers="headers"
          :items="filteredRows"
          item-key="employee"
          :loading="loading"
          loading-text="Loading payout data…"
          class="payout-table"
          density="comfortable"
        >
          <template #item.employee="{ item }">
            <div class="d-flex align-center gap-3">
              <div class="emp-avatar" :style="`background:${avatarBg(item.employee)}; color:${avatarFg(item.employee)}`">
                {{ item.employee?.charAt(0).toUpperCase() }}
              </div>
              <span class="font-weight-medium ml-3">{{ item.employee }}</span>
            </div>
          </template>

          <template #item.presentDays="{ item }">
            <v-chip color="success" variant="tonal" size="small">{{ item.presentDays }}</v-chip>
          </template>

          <template #item.absentDays="{ item }">
            <v-chip color="error" variant="tonal" size="small">{{ item.absentDays }}</v-chip>
          </template>

          <template #item.gross="{ item }">
            <span class="font-weight-medium" style="color:#00695C">₹{{ item.gross.toFixed(2) }}</span>
          </template>

          <template #item.advance="{ item }">
            <span v-if="item.advance > 0" class="text-error font-weight-medium">
              −₹{{ item.advance.toFixed(2) }}
            </span>
            <span v-else class="text-caption text-disabled">—</span>
          </template>

          <template #item.net="{ item }">
            <span class="net-pill">₹{{ item.net.toFixed(2) }}</span>
          </template>

          <!-- Totals footer -->
          <template #tfoot>
              <tfoot class="totals-tfoot">
      <tr>
        <!-- Employee col — left aligned, label here -->
        <td class="totals-td totals-label-cell">
          <div class="d-flex align-center gap-1">
            <v-icon size="15" color="primary">mdi-sigma</v-icon>
            <span class="totals-label-text">Totals · {{ rows.length }} employees</span>
          </div>
        </td>
        <!-- Present — center -->
        <td class="totals-td text-center">
          <v-chip color="success" variant="tonal" size="small">{{ totalPresent }}</v-chip>
        </td>
        <!-- Absent — center -->
        <td class="totals-td text-center">
          <v-chip color="error" variant="tonal" size="small">{{ totalAbsent }}</v-chip>
        </td>
        <!-- Gross — right -->
        <td class="totals-td text-right font-weight-bold" style="color:#00695C">
          ₹{{ totalGross.toFixed(2) }}
        </td>
        <!-- Advance — right -->
        <td class="totals-td text-right font-weight-bold text-error">
          −₹{{ totalAdvance.toFixed(2) }}
        </td>
        <!-- Net — right -->
        <td class="totals-td text-right">
          <span class="net-pill net-pill-lg">₹{{ totalNet.toFixed(2) }}</span>
        </td>
      </tr>
    </tfoot>
          </template>

          <template #no-data>
            <div class="text-center py-10">
              <v-icon size="48" color="grey-lighten-2">mdi-cash-remove</v-icon>
              <p class="text-body-2 text-medium-emphasis mt-2">No payout records found for this month.</p>
            </div>
          </template>
        </v-data-table>
      </v-card>

      <!-- ── MOBILE CARDS ── -->
      <div class="d-block d-md-none">
        <div class="section-label pb-3">Employee Payouts</div>

        <div v-if="loading" class="d-flex flex-column gap-2">
          <v-skeleton-loader v-for="i in 5" :key="i" type="list-item-avatar-two-line" class="rounded-xl" />
        </div>

        <div v-else-if="filteredRows.length === 0" class="text-center py-10">
          <v-icon size="52" color="grey-lighten-2">mdi-cash-remove</v-icon>
          <p class="text-body-2 text-medium-emphasis mt-2">No records for this month.</p>
        </div>

        <div v-else class="mob-list">
          <div v-for="item in filteredRows" :key="item.employee" class="mob-card">

            <!-- Header -->
            <div class="mob-header">
              <div class="d-flex align-center gap-3">
                <div class="emp-avatar-lg" :style="`background:${avatarBg(item.employee)}; color:${avatarFg(item.employee)}`">
                  {{ item.employee?.charAt(0).toUpperCase() }}
                </div>
                <div class="ml-3">
                  <div class="mob-name">{{ item.employee }}</div>
                  <div class="d-flex gap-1 mt-1">
                    <v-chip color="success" variant="tonal" size="x-small" prepend-icon="mdi-check-circle">
                      {{ item.presentDays }}
                    </v-chip>
                    <v-chip color="error" variant="tonal" size="x-small" prepend-icon="mdi-close-circle">
                      {{ item.absentDays }}
                    </v-chip>
                  </div>
                </div>
              </div>
              <div class="mob-net-badge">
                <div class="mob-net-label">Net Pay</div>
                <div class="mob-net-val">₹{{ item.net.toFixed(0) }}</div>
              </div>
            </div>

            <!-- Calculation row -->
            <div class="mob-calc-row">
              <div class="mob-calc-item">
                <div class="mob-calc-label">Gross</div>
                <div class="mob-calc-val" style="color:#00695C">₹{{ item.gross.toFixed(0) }}</div>
              </div>
              <div class="mob-calc-arrow">
                <v-icon size="14" color="grey">mdi-minus</v-icon>
              </div>
              <div class="mob-calc-item">
                <div class="mob-calc-label">Advance</div>
                <div class="mob-calc-val text-error">
                  {{ item.advance > 0 ? `₹${item.advance.toFixed(0)}` : '—' }}
                </div>
              </div>
              <div class="mob-calc-arrow">
                <v-icon size="14" color="grey">mdi-equal</v-icon>
              </div>
              <div class="mob-calc-item">
                <div class="mob-calc-label">Net</div>
                <div class="mob-calc-val" style="color:#2E7D32; font-weight:800">₹{{ item.net.toFixed(0) }}</div>
              </div>
            </div>

          </div>
        </div>

        <!-- Mobile totals card -->
        <div v-if="!loading && rows.length > 0" class="mob-totals-card mt-3">
          <div class="mob-totals-title">
            <v-icon size="16" color="primary" class="mr-1">mdi-sigma</v-icon>
            Total Payout — {{ monthLabel }}
          </div>
          <div class="mob-totals-grid">
            <div class="mob-total-item">
              <div class="mob-total-label">Gross</div>
              <div class="mob-total-val" style="color:#00695C">₹{{ totalGross.toLocaleString('en-IN') }}</div>
            </div>
            <div class="mob-total-item">
              <div class="mob-total-label">Advance</div>
              <div class="mob-total-val text-error">₹{{ totalAdvance.toLocaleString('en-IN') }}</div>
            </div>
            <div class="mob-total-item">
              <div class="mob-total-label">Net Pay</div>
              <div class="mob-total-val" style="color:#1B5E20; font-size:1.3rem">₹{{ totalNet.toLocaleString('en-IN') }}</div>
            </div>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<style scoped>
/* Totals footer */
.totals-tfoot {
  border-top: 2px dotted #960d0d !important;
  border-radius: 40%;
  background-color: #f874082f  !important;;
}
.totals-td {
  padding: 12px 16px !important;
  font-size: 0.88rem;
  vertical-align: middle;
  /* Match Vuetify's default td padding exactly */
  height: 52px;
}
.totals-label-cell {
  /* same left padding as the employee column td */
  padding-left: 16px !important;
}
.totals-label-text {
  font-size: 0.82rem;
  font-weight: 700;
  color: #424242;
}
.payout-root {
  background: #F5F5F5;
  min-height: 100vh;
  font-family: 'Roboto', sans-serif;
}

/* ══ APP BAR ══ */
.payout-appbar {
  background: linear-gradient(135deg, #1565C0 0%, #283593 100%);
  position: sticky; top: 0; z-index: 20;
  box-shadow: 0 2px 4px -1px rgba(0,0,0,0.2), 0 4px 5px rgba(0,0,0,0.14);
}
.appbar-inner {
  display: flex; align-items: center; justify-content: space-between;
  padding: 12px 14px 6px; min-height: 56px; gap: 10px;
}
.appbar-left { flex: 1; min-width: 0; }
.appbar-right { flex-shrink: 0; }
.appbar-title { font-size: 1.1rem; font-weight: 700; color: white; line-height: 1.2; }
.appbar-sub { font-size: 0.7rem; color: rgba(255,255,255,0.68); }

/* Month picker */
.month-wrapper {
  display: flex; align-items: center; gap: 6px;
  background: rgba(255,255,255,0.18); border-radius: 10px;
  padding: 6px 10px; cursor: pointer; position: relative;
  transition: background 0.15s; user-select: none;
}
.month-wrapper:hover { background: rgba(255,255,255,0.28); }
.month-icon { color: rgba(255,255,255,0.85) !important; }
.month-label { font-size: 0.82rem; font-weight: 600; color: white; white-space: nowrap; }
.month-chevron { color: rgba(255,255,255,0.7) !important; }
.hidden-input {
  position: absolute; inset: 0; width: 100%; height: 100%;
  opacity: 0; pointer-events: none;
}

/* Chips */
.appbar-chips {
  display: flex; flex-wrap: nowrap; gap: 6px;
  overflow-x: auto; scrollbar-width: none; -webkit-overflow-scrolling: touch; padding-left: 14px;
}
.appbar-chips::-webkit-scrollbar { display: none; }
.p-chip {
  display: flex; align-items: center; gap: 4px; border-radius: 20px;
  padding: 3px 10px; font-size: 0.72rem; font-weight: 600; flex-shrink: 0; white-space: nowrap;
}
.p-chip-green  { background: rgba(76,175,80,0.25);  color: #C8E6C9; }
.p-chip-red    { background: rgba(244,67,54,0.25);  color: #FFCDD2; }
.p-chip-orange { background: rgba(255,152,0,0.25);  color: #FFE0B2; }
.p-chip-teal   { background: rgba(0,150,136,0.25);  color: #B2DFDB; }

/* ══ BODY ══ */
.payout-body { padding: 14px 12px 24px; }
@media (min-width: 600px) { .payout-body { padding: 16px 20px 28px; } }

/* ══ KPI ══ */
.kpi-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
@media (min-width: 960px) { .kpi-grid { grid-template-columns: repeat(4, 1fr); } }
.kpi-card {
  background: white; border-radius: 16px; padding: 14px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  transition: transform 0.15s, box-shadow 0.15s;
}
.kpi-card:hover { transform: translateY(-2px); box-shadow: 0 6px 16px rgba(0,0,0,0.12); }
.kpi-icon-ring { width: 38px; height: 38px; border-radius: 10px; display: flex; align-items: center; justify-content: center; margin-bottom: 8px; }
.kpi-val { font-size: 1.45rem; font-weight: 800; line-height: 1; margin-bottom: 4px; }
.kpi-lbl { font-size: 0.65rem; color: #757575; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }

/* ══ TABLE ══ */
.section-label { font-size: 0.68rem; font-weight: 700; text-transform: uppercase; letter-spacing: 1.4px; color: #9E9E9E; }
.table-topbar { display: flex; align-items: center; justify-content: space-between; }
.payout-table :deep(.v-data-table__th) {
  background: #FAFAFA !important; font-size: 0.7rem !important; font-weight: 700 !important;
  text-transform: uppercase !important; letter-spacing: 0.8px !important; color: #757575 !important;
}
.payout-table :deep(.v-data-table__tr:hover td) { background: #F3F4F6 !important; }
.emp-avatar {
  width: 34px; height: 34px; border-radius: 10px;
  display: flex; align-items: center; justify-content: center;
  font-size: 0.85rem; font-weight: 800; flex-shrink: 0;
}
.net-pill {
  background: rgba(76,175,80,0.14); color: #1B5E20;
  padding: 3px 10px; border-radius: 20px;
  font-size: 0.85rem; font-weight: 800;
}
.net-pill-lg { font-size: 0.95rem; }

/* Totals footer row */
.totals-row {
  display: flex; align-items: center; justify-content: space-between;
  padding: 12px 16px; background: #F8F9FA;
  border-top: 2px solid #E0E0E0; flex-wrap: wrap; gap: 10px;
}
.totals-label { font-size: 0.82rem; font-weight: 700; color: #424242; display: flex; align-items: center; }
.totals-values { display: flex; align-items: center; gap: 20px; flex-wrap: wrap; }
.totals-item { font-size: 0.88rem; }

/* ══ MOBILE ══ */
.mob-list { display: flex; flex-direction: column; gap: 10px; }
.mob-card { background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
.mob-header { display: flex; align-items: center; justify-content: space-between; padding: 14px 14px 10px; gap: 8px; }
.emp-avatar-lg {
  width: 44px; height: 44px; border-radius: 13px;
  display: flex; align-items: center; justify-content: center;
  font-size: 1rem; font-weight: 800; flex-shrink: 0;
}
.mob-name { font-size: 0.95rem; font-weight: 700; color: #212121; }
.mob-net-badge { text-align: right; flex-shrink: 0; }
.mob-net-label { font-size: 0.62rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.6px; color: #9E9E9E; }
.mob-net-val { font-size: 1.1rem; font-weight: 800; color: #1B5E20; }

/* Calculation formula row */
.mob-calc-row {
  display: flex; align-items: center; justify-content: space-between;
  padding: 10px 14px 14px;
  border-top: 1px solid rgba(0,0,0,0.05);
  gap: 4px;
}
.mob-calc-item { text-align: center; flex: 1; }
.mob-calc-label { font-size: 0.6rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: #9E9E9E; margin-bottom: 2px; }
.mob-calc-val { font-size: 0.88rem; font-weight: 700; }
.mob-calc-arrow { flex-shrink: 0; }

/* Totals card */
.mob-totals-card {
  background: white; border-radius: 16px; padding: 14px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  border-top: 3px solid #1976D2;
}
.mob-totals-title { font-size: 0.82rem; font-weight: 700; color: #424242; display: flex; align-items: center; margin-bottom: 12px; }
.mob-totals-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; text-align: center; }
.mob-total-label { font-size: 0.62rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: #9E9E9E; margin-bottom: 4px; }
.mob-total-val { font-size: 1rem; font-weight: 800; }
</style>