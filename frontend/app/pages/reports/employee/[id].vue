<script setup lang="ts">
import dayjs from 'dayjs'

const route = useRoute()
const { $pb } = useNuxtApp()
const { calculate } = useAttendanceCalc()

const desktopPicker = ref<HTMLInputElement | null>(null)
const mobilePicker  = ref<HTMLInputElement | null>(null)

const openMonthPicker = (which: 'desktop' | 'mobile') => {
  const el = which === 'desktop' ? desktopPicker.value : mobilePicker.value
  el?.showPicker?.()
  el?.focus()
  el?.click()
}
const month = ref(dayjs().format('YYYY-MM'))
const loading = ref(false)
const showCalcBreakdown = ref(false)

const employee = ref<any>(null)
const attendance = ref<any[]>([])
const summary = ref<any>(null)

const headers = [
  { title: 'Date', key: 'date' },
  { title: 'Day', key: 'day' },
  { title: 'Status', key: 'status', align: 'center' },
  { title: 'Advance Taken', key: 'advance_amount', align: 'end' },
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
      perDaySalary: employee.value.salary,
      attendance: attendance.value,
    })
  } finally {
    loading.value = false
  }
}

watch(() => [month.value, route.params.id], loadReport, { immediate: true })

const calendarDays = computed(() => {
  if (!month.value) return []
  const start = dayjs(`${month.value}-01`)
  const daysInMonth = start.daysInMonth()
  const days = []
  for (let i = 1; i <= daysInMonth; i++) {
    const date = start.date(i).format('YYYY-MM-DD')
    const record = attendance.value.find(a => dayjs(a.date).format('YYYY-MM-DD') === date)
    days.push({
      date, day: i,
      weekday: start.date(i).format('ddd'),
      status: record?.status || null,
      advance: record?.advance_amount || 0,
      remark: record?.remark || null,
    })
  }
  return days
})

const attendanceRate = computed(() => {
  if (!summary.value || !attendance.value.length) return 0
  return Math.round((summary.value.presentDays / attendance.value.length) * 100)
})

const monthLabel = computed(() => dayjs(`${month.value}-01`).format('MMMM YYYY'))
const getInitials = (name: string) => name?.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) || '??'
const rateColor = computed(() => {
  if (attendanceRate.value >= 80) return '#4CAF50'
  if (attendanceRate.value >= 50) return '#FF9800'
  return '#F44336'
})
</script>

<template>
  <div class="report-root">

    <!-- ── Material App Bar ── -->
    <div class="md-appbar elevation-4">
    <div class="appbar-inner">

  <!-- Row 1: back button + employee info -->
  <div class="appbar-top-row">
    <div class="appbar-left">
      <v-btn icon variant="text" color="white" size="small" class="mr-2" @click="$router.back()">
        <v-icon>mdi-arrow-left</v-icon>
      </v-btn>
      <div v-if="employee" class="d-flex align-center">
        <div class="md-avatar mr-2">{{ getInitials(employee.name) }}</div>
        <div class="emp-info">
          <div class="appbar-title">{{ employee.name }}</div>
          <div class="appbar-sub">Monthly Attendance Report</div>
        </div>
      </div>
      <div v-else class="appbar-title">Employee Report</div>
    </div>

   <!-- Desktop only: month picker stays inline -->
<div class="appbar-right d-none d-sm-flex">
  <div class="month-wrapper" @click="openMonthPicker('desktop')">
    <v-icon size="18" class="month-icon">mdi-calendar</v-icon>
    <span class="month-display">{{ dayjs(`${month}-01`).format('MMMM, YYYY') }}</span>
    <v-icon size="16" class="month-chevron">mdi-chevron-down</v-icon>
    <input
      ref="desktopPicker"
      v-model="month"
      type="month"
      class="hidden-month-input"
    />
  </div>
</div>
  </div>

  <!-- Row 2: mobile only — full-width month picker below name -->
<div class="d-flex d-sm-none mt-2">
  <div class="month-wrapper month-wrapper-full" @click="openMonthPicker('mobile')">
    <v-icon size="18" class="month-icon">mdi-calendar</v-icon>
    <span class="month-display">{{ dayjs(`${month}-01`).format('MMMM, YYYY') }}</span>
    <v-icon size="16" class="month-chevron">mdi-chevron-down</v-icon>
    <input
      ref="mobilePicker"
      v-model="month"
      type="month"
      class="hidden-month-input"
    />
  </div>
</div>

</div>
      <div class="appbar-chips px-4 pb-3">
        <v-chip size="small" variant="tonal" color="white" class="mr-2">
          <v-icon start size="14">mdi-calendar-month</v-icon>
          {{ monthLabel }}
        </v-chip>
      </div>
    </div>

    <!-- ── Body ── -->
    <div class="report-body">

      <div v-if="loading" class="px-4 pt-4">
        <v-skeleton-loader type="card" class="mb-3 rounded-xl" />
        <v-skeleton-loader type="card" class="mb-3 rounded-xl" />
        <v-skeleton-loader type="table" class="rounded-xl" />
      </div>

      <template v-else-if="summary">

        <!-- KPI Cards -->
        <div class="section-label px-4 pt-5 pb-2">Overview</div>
        <div class="kpi-scroll px-4">
          <div class="kpi-track">

            <div class="md-kpi-card">
              <div class="kpi-icon-ring" style="background:rgba(76,175,80,0.12)">
                <v-icon color="#4CAF50" size="22">mdi-check-circle-outline</v-icon>
              </div>
              <div class="kpi-num" style="color:#2E7D32">{{ summary.presentDays }}</div>
              <div class="kpi-lbl">Days Present</div>
            </div>

            <div class="md-kpi-card">
              <div class="kpi-icon-ring" style="background:rgba(244,67,54,0.1)">
                <v-icon color="#F44336" size="22">mdi-close-circle-outline</v-icon>
              </div>
              <div class="kpi-num" style="color:#C62828">{{ summary.absentDays }}</div>
              <div class="kpi-lbl">Days Absent</div>
            </div>

            <div class="md-kpi-card">
              <div class="kpi-icon-ring" style="background:rgba(33,150,243,0.1)">
                <v-icon color="#1976D2" size="22">mdi-percent-circle-outline</v-icon>
              </div>
              <div class="kpi-num" :style="`color:${rateColor}`">{{ attendanceRate }}%</div>
              <div class="kpi-lbl">Attendance Rate</div>
            </div>

            <div class="md-kpi-card">
              <div class="kpi-icon-ring" style="background:rgba(255,152,0,0.12)">
                <v-icon color="#E65100" size="22">mdi-cash-minus</v-icon>
              </div>
              <div class="kpi-num" style="color:#E65100">₹{{ summary.advance.toFixed(0) }}</div>
              <div class="kpi-lbl">Advance Taken</div>
            </div>

            <div class="md-kpi-card">
              <div class="kpi-icon-ring" style="background:rgba(0,150,136,0.1)">
                <v-icon color="#00796B" size="22">mdi-calculator-variant-outline</v-icon>
              </div>
              <div class="kpi-num" style="color:#00695C">₹{{ summary.gross.toFixed(0) }}</div>
              <div class="kpi-lbl">Gross Pay</div>
            </div>

            <div class="md-kpi-card kpi-net-card">
              <div class="kpi-icon-ring" style="background:rgba(76,175,80,0.2)">
                <v-icon color="#388E3C" size="22">mdi-wallet-outline</v-icon>
              </div>
              <div class="kpi-num" style="color:#1B5E20; font-size:1.8rem">₹{{ summary.net.toFixed(0) }}</div>
              <div class="kpi-lbl" style="font-weight:700; color:#388E3C; font-size:0.73rem">Net Pay</div>
            </div>

          </div>
        </div>

        <!-- Attendance Bar -->
        <div class="section-label px-4 pt-5 pb-2">Attendance Rate</div>
        <v-card rounded="xl" elevation="1" class="mx-4 mb-1">
          <v-card-text class="pa-4">
            <div class="d-flex justify-space-between align-center mb-3">
              <div>
                <span class="text-body-2 font-weight-medium">{{ summary.presentDays }} present</span>
                <span class="text-caption text-medium-emphasis mx-2">·</span>
                <span class="text-body-2 text-error">{{ summary.absentDays }} absent</span>
              </div>
              <span class="font-weight-bold text-body-1" :style="`color:${rateColor}`">{{ attendanceRate }}%</span>
            </div>
            <div class="att-bar-wrap">
              <div class="att-bar-fill" :style="`width:${attendanceRate}%; background:${rateColor}`" />
            </div>
            <div class="d-flex justify-space-between mt-2">
              <span class="text-caption text-disabled">0%</span>
              <span class="text-caption text-medium-emphasis">{{ attendance.length }} days recorded</span>
              <span class="text-caption text-disabled">100%</span>
            </div>
          </v-card-text>
        </v-card>

        <!-- Salary Breakdown -->
        <div class="section-label px-4 pt-5 pb-2">Salary Breakdown</div>
        <v-card rounded="xl" elevation="1" class="mx-4 mb-1">
          <div class="calc-header" @click="showCalcBreakdown = !showCalcBreakdown">
            <div class="d-flex align-center gap-3">
              <div class="calc-icon-wrap">
                <v-icon color="white" size="20">mdi-receipt-text</v-icon>
              </div>
              <div class="ml-3">
                <div class="text-body-2 font-weight-bold">How is Net Pay calculated?</div>
                <div class="text-caption text-medium-emphasis">Tap to see step-by-step breakdown</div>
              </div>
            </div>
            <v-icon :icon="showCalcBreakdown ? 'mdi-chevron-up' : 'mdi-chevron-down'" color="grey" />
          </div>

          <v-expand-transition>
            <div v-show="showCalcBreakdown">
              <v-divider />
              <v-card-text class="pa-4">

                <div class="calc-step">
                  <div class="step-badge" style="background:#1976D2">1</div>
                  <div class="step-body">
                    <div class="step-title">Per Day Salary</div>
                    <div class="step-desc">Fixed daily rate for this employee</div>
                  </div>
                  <div class="step-amount" style="color:#1976D2">₹{{ employee?.salary?.toFixed(2) }}</div>
                </div>

                <div class="step-connector">
                  <div class="connector-line" />
                  <div class="connector-op">× {{ summary.presentDays }} days present</div>
                </div>

                <div class="calc-step">
                  <div class="step-badge" style="background:#00796B">2</div>
                  <div class="step-body">
                    <div class="step-title">Gross Pay</div>
                    <div class="step-desc">Per day × Days present</div>
                  </div>
                  <div class="step-amount" style="color:#00796B">₹{{ summary.gross.toFixed(2) }}</div>
                </div>

                <div class="step-connector">
                  <div class="connector-line" />
                  <div class="connector-op text-error">− ₹{{ summary.advance.toFixed(2) }} advance deducted</div>
                </div>

                <div class="calc-step net-step">
                  <div class="step-badge" style="background:#388E3C">3</div>
                  <div class="step-body">
                    <div class="step-title font-weight-bold" style="color:#2E7D32">Net Pay</div>
                    <div class="step-desc">Final amount to be paid</div>
                  </div>
                  <div class="step-amount text-h6" style="color:#1B5E20">₹{{ summary.net.toFixed(2) }}</div>
                </div>

                <div class="formula-chip mt-4">
                  <v-icon size="14" color="#5C35CC" class="mr-1">mdi-function-variant</v-icon>
                  <span class="formula-inner">
                    (₹{{ employee?.salary }} × {{ summary.presentDays }}) − ₹{{ summary.advance }} =
                    <strong style="color:#1B5E20"> ₹{{ summary.net.toFixed(2) }}</strong>
                  </span>
                </div>

              </v-card-text>
            </div>
          </v-expand-transition>
        </v-card>

        <!-- Calendar Heatmap -->
        <div class="section-label px-4 pt-5 pb-2">Monthly Calendar</div>
        <v-card rounded="xl" elevation="1" class="mx-4 mb-1">
          <v-card-text class="pa-3">
            <div class="cal-legend mb-3">
              <span class="legend-dot" style="background:rgba(76,175,80,0.8); border-radius:3px" /><span class="text-caption mr-3">Present</span>
              <span class="legend-dot" style="background:rgba(244,67,54,0.7); border-radius:3px" /><span class="text-caption mr-3">Absent</span>
              <span class="legend-dot" style="background:#E0E0E0; border-radius:3px" /><span class="text-caption mr-3">Not Marked</span>
              <span class="legend-dot" style="background:#FF9800; border-radius:50%" /><span class="text-caption">Has Advance</span>
            </div>
            <div class="calendar-grid">
              <v-tooltip v-for="d in calendarDays" :key="d.date" location="top">
                <template #activator="{ props }">
                  <div
                    v-bind="props"
                    class="cal-cell"
                    :class="{
                      'cc-present': d.status === 'present',
                      'cc-absent': d.status === 'absent',
                      'cc-blank': !d.status,
                    }"
                  >
                    <span class="cc-day">{{ d.day }}</span>
                    <span class="cc-wday">{{ d.weekday }}</span>
                    <span v-if="d.advance > 0" class="cc-dot" />
                  </div>
                </template>
                <div class="text-caption">
                  <div class="font-weight-bold mb-1">{{ dayjs(d.date).format('ddd, DD MMM') }}</div>
                  <div>{{ d.status ? d.status.toUpperCase() : 'Not marked' }}</div>
                  <div v-if="d.advance > 0" style="color:#FFB74D">Advance ₹{{ d.advance }}</div>
                  <div v-if="d.remark" style="color:#B0BEC5">{{ d.remark }}</div>
                </div>
              </v-tooltip>
            </div>
          </v-card-text>
        </v-card>

        <!-- Detailed Table -->
        <div class="section-label px-4 pt-5 pb-2">Detailed Records</div>
        <v-card rounded="xl" elevation="1" class="mx-4 mb-6">
          <div class="table-topbar px-4 py-3">
            <span class="text-body-2 font-weight-medium">All Entries</span>
            <v-chip size="x-small" color="primary" variant="tonal">{{ attendance.length }} records</v-chip>
          </div>
          <v-divider />
          <v-data-table
            :headers="headers"
            :items="attendance"
            :loading="loading"
            item-key="id"
            class="md-table"
            hover
          >
            <template #item.date="{ item }">
              <span class="font-weight-medium">{{ dayjs(item.date).format('DD MMM YYYY') }}</span>
            </template>
            <template #item.day="{ item }">
              <span class="text-caption text-medium-emphasis">{{ dayjs(item.date).format('dddd') }}</span>
            </template>
            <template #item.status="{ item }">
              <v-chip
                :color="item.status === 'present' ? 'success' : 'error'"
                variant="tonal"
                size="small"
                :prepend-icon="item.status === 'present' ? 'mdi-check-circle' : 'mdi-close-circle'"
              >
                {{ item.status }}
              </v-chip>
            </template>
            <template #item.advance_amount="{ item }">
              <span v-if="item.advance_amount" class="text-error font-weight-medium">− ₹{{ item.advance_amount }}</span>
              <span v-else class="text-caption text-disabled">—</span>
            </template>
            <template #item.remark="{ item }">
              <v-chip v-if="item.remark" size="x-small" variant="outlined" color="grey-darken-1">{{ item.remark }}</v-chip>
              <span v-else class="text-caption text-disabled">—</span>
            </template>
            <template #no-data>
              <div class="text-center py-10">
                <v-icon size="52" color="grey-lighten-2">mdi-calendar-remove</v-icon>
                <p class="text-body-2 text-medium-emphasis mt-2">No records for this month.</p>
              </div>
            </template>
          </v-data-table>
        </v-card>

      </template>

      <div v-else-if="!loading" class="text-center py-16">
        <v-icon size="64" color="grey-lighten-2">mdi-account-search</v-icon>
        <p class="text-body-1 text-medium-emphasis mt-3">Select a month to load the report.</p>
      </div>

    </div>
  </div>
</template>

<style scoped>
.report-root {
  background: #F5F5F5;
  min-height: 100vh;
  font-family: 'Roboto', sans-serif;
}

/* App Bar */
.md-appbar {
  background: linear-gradient(135deg, #1565C0 0%, #283593 100%);
  color: white;
  position: sticky;
  top: 0;
  z-index: 20;
  box-shadow: 0 2px 4px -1px rgba(0,0,0,0.2), 0 4px 5px 0 rgba(0,0,0,0.14), 0 1px 10px 0 rgba(0,0,0,0.12);
}
.appbar-inner {
  display: flex;
  flex-direction: column;         /* stack rows vertically */
  padding: 10px 12px 8px;
  gap: 0;
}

.appbar-top-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  gap: 8px;
}

.appbar-left {
  display: flex;
  align-items: center;
  flex: 1;
  min-width: 0;
  overflow: hidden;
}

.emp-info {
  min-width: 0;
  overflow: hidden;
}

.appbar-title {
  font-size: 1rem;
  font-weight: 700;
  color: white;
  line-height: 1.2;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.appbar-sub {
  font-size: 0.7rem;
  color: rgba(255, 255, 255, 0.72);
  white-space: nowrap;
}

.md-avatar {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.22);
  border: 2px solid rgba(255, 255, 255, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.85rem;
  font-weight: 700;
  color: white;
  flex-shrink: 0;
}

.appbar-right {
  flex-shrink: 0;
}

/* Month picker — white text + icon */
.month-picker :deep(.v-field__input) {
  color: white !important;
  font-size: 0.85rem;
}
.month-picker :deep(.v-icon) {
  color: rgba(255, 255, 255, 0.8) !important;
}

/* Desktop: restore horizontal layout */
@media (min-width: 600px) {
  .appbar-inner {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    padding: 12px 16px 8px;
  }
  .appbar-top-row {
    flex: 1;
  }
  .appbar-title {
    font-size: 1.1rem;
  }
  .md-avatar {
    width: 44px;
    height: 44px;
    font-size: 1rem;
  }
}
.md-avatar {
  width: 44px; height: 44px;
  border-radius: 50%;
  background: rgba(255,255,255,0.22);
  border: 2px solid rgba(255,255,255,0.5);
  display: flex; align-items: center; justify-content: center;
  font-size: 1rem; font-weight: 700; color: white; flex-shrink: 0;
}
.appbar-title { font-size: 1.1rem; font-weight: 700; color: white; line-height: 1.2; }
.appbar-sub { font-size: 0.72rem; color: rgba(255,255,255,0.72); }
.appbar-chips { display: flex; flex-wrap: wrap; gap: 6px; padding-left: 60px; }
.month-picker :deep(.v-field__input) { color: white !important; font-size: 0.85rem; }
.month-picker :deep(.v-icon) { color: rgba(255,255,255,0.8) !important; }

/* Section Labels */
.section-label {
  font-size: 0.68rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1.4px;
  color: #9E9E9E;
}

/* KPI */
.kpi-scroll { overflow-x: auto; padding-bottom: 6px; }
.kpi-track { display: flex; gap: 10px; min-width: max-content; padding-bottom: 2px; }
.md-kpi-card {
  background: white;
  border-radius: 16px;
  padding: 16px;
  min-width: 128px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.08);
  transition: box-shadow 0.2s, transform 0.15s;
}
.md-kpi-card:hover {
  box-shadow: 0 4px 12px rgba(0,0,0,0.18);
  transform: translateY(-2px);
}
.kpi-net-card {
  background: linear-gradient(135deg, #E8F5E9 0%, #C8E6C9 100%);
  border: 1.5px solid #A5D6A7;
}
.kpi-icon-ring {
  width: 40px; height: 40px;
  border-radius: 12px;
  display: flex; align-items: center; justify-content: center;
  margin-bottom: 10px;
}
.kpi-num { font-size: 1.6rem; font-weight: 800; line-height: 1; margin-bottom: 4px; }
.kpi-lbl { font-size: 0.67rem; color: #757575; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }

/* Attendance Bar */
.att-bar-wrap {
  height: 12px;
  border-radius: 6px;
  background: #FFCDD2;
  overflow: hidden;
}
.att-bar-fill {
  height: 100%;
  border-radius: 6px;
  transition: width 0.6s cubic-bezier(0.4,0,0.2,1);
}

/* Calc */
.calc-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 16px; cursor: pointer;
  border-radius: inherit;
  transition: background 0.15s;
}
.calc-header:hover { background: rgba(0,0,0,0.03); }
.calc-icon-wrap {
  width: 40px; height: 40px;
  border-radius: 12px;
  background: linear-gradient(135deg, #5C6BC0, #3949AB);
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.calc-step {
  display: flex; align-items: center; gap: 12px; padding: 10px 0;
}
.step-badge {
  width: 28px; height: 28px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 0.75rem; font-weight: 700; color: white; flex-shrink: 0;
}
.step-body { flex: 1; min-width: 0; }
.step-title { font-size: 0.9rem; font-weight: 600; color: #212121; }
.step-desc { font-size: 0.74rem; color: #9E9E9E; }
.step-amount { font-size: 1rem; font-weight: 700; white-space: nowrap; }
.step-connector { display: flex; align-items: center; gap: 8px; padding: 0 14px; }
.connector-line { width: 2px; height: 20px; background: #E0E0E0; border-radius: 1px; }
.connector-op { font-size: 0.78rem; color: #757575; }
.net-step { border-bottom: 1px solid #0a8006; border-radius: 12px; }
.formula-chip {
  background: #EDE7F6; border-radius: 10px; padding: 10px 14px;
  display: flex; align-items: center; flex-wrap: wrap; gap: 4px;
}
.formula-inner { font-size: 0.82rem; color: #4527A0; font-family: 'Roboto Mono', 'Courier New', monospace; }

/* Calendar */
.cal-legend { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
.legend-dot { width: 10px; height: 10px; display: inline-block; vertical-align: middle; }
.calendar-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 6px; }
@media (max-width: 480px) { .calendar-grid { grid-template-columns: repeat(5, 1fr); gap: 4px; } }
.cal-cell {
  position: relative; border-radius: 10px;
  padding: 7px 4px 6px;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  min-height: 52px; cursor: default;
  transition: transform 0.12s, box-shadow 0.12s;
}
.cal-cell:hover { transform: scale(1.1); box-shadow: 0 3px 10px rgba(0,0,0,0.15); z-index: 2; }
.cc-present { background: rgba(76,175,80,0.14); border: 1.5px solid rgba(76,175,80,0.5); color: #2E7D32; }
.cc-absent { background: rgba(244,67,54,0.09); border: 1.5px solid rgba(244,67,54,0.4); color: #B71C1C; }
.cc-blank { background: #F5F5F5; border: 1.5px solid #E0E0E0; color: #BDBDBD; }
.cc-day { font-size: 0.95rem; font-weight: 700; line-height: 1; }
.cc-wday { font-size: 0.56rem; text-transform: uppercase; margin-top: 2px; opacity: 0.7; letter-spacing: 0.3px; }
.cc-dot { position: absolute; top: 4px; right: 4px; width: 6px; height: 6px; border-radius: 50%; background: #FF9800; }

/* Table */
.table-topbar { display: flex; align-items: center; justify-content: space-between; }
.md-table :deep(.v-data-table__th) {
  background: #FAFAFA !important;
  font-size: 0.7rem !important;
  font-weight: 700 !important;
  text-transform: uppercase !important;
  letter-spacing: 0.8px !important;
  color: #757575 !important;
}
.md-table :deep(.v-data-table__tr:hover td) { background: #F3F4F6 !important; }

/* ── Clickable month wrapper ── */
.month-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(255, 255, 255, 0.18);
  border-radius: 10px;
  padding: 7px 12px;
  cursor: pointer;
  position: relative;
  min-width: 185px;
  transition: background 0.15s;
  user-select: none;
}
.month-wrapper:hover {
  background: rgba(255, 255, 255, 0.28);
}
.month-wrapper:active {
  background: rgba(255, 255, 255, 0.35);
}
.month-wrapper-full {
  width: 100%;
  min-width: 0;
}

.month-icon {
  color: rgba(255, 255, 255, 0.85) !important;
  flex-shrink: 0;
}
.month-display {
  flex: 1;
  font-size: 0.88rem;
  font-weight: 600;
  color: white;
  white-space: nowrap;
}
.month-chevron {
  color: rgba(255, 255, 255, 0.7) !important;
  flex-shrink: 0;
}

/* Hide the native input but keep it functional */
.hidden-month-input {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
  /* push the native picker popup to appear at element position */
  pointer-events: none; /* clicks handled by wrapper @click */
}
</style>