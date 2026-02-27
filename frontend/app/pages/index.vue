<template>
  <div class="att-root">

    <!-- ══════════════════════════════
         MATERIAL APP BAR
    ══════════════════════════════ -->
    <div class="att-appbar elevation-4">
      <div class="appbar-inner">
        <div class="appbar-left">
          <div class="appbar-title-wrap">
            <div class="appbar-title">Attendance</div>
          </div>
        </div>
        <div class="appbar-right">
          <!-- Date Picker Wrapper — entire div clickable -->
          <div class="date-wrapper" @click="openDatePicker">
            <v-icon size="16" class="date-icon">mdi-calendar</v-icon>
            <span class="date-label">{{ dayjs(selectedDate).format('DD MMM YYYY') }}</span>
            <v-icon size="14" class="date-chevron">mdi-chevron-down</v-icon>
            <input
              ref="dateInputRef"
              v-model="selectedDate"
              type="date"
              :max="today"
              class="hidden-date-input"
              @change="onDateChange"
            />
          </div>
          <v-btn
            v-if="isAdmin"
            icon
            variant="text"
            color="white"
            size="small"
            :loading="isLoading"
            @click="refreshData"
          >
            <v-icon>mdi-refresh</v-icon>
          </v-btn>
        </div>
      </div>

      <!-- Summary chips — always visible in app bar -->
      <div class="appbar-chips px-3 pb-3">
        <div class="summary-chip summary-present">
           <div class="appbar-sub">{{ formatDate(selectedDate ?? '') }}</div>
        </div>
      </div>
    </div>

    <!-- ══════════════════════════════
         ATTENDANCE RATE BAR
    ══════════════════════════════ -->
    <div class="rate-bar-wrap">
      <div
        class="rate-bar-fill"
        :style="`width:${todaysAttendance.length > 0 ? Math.round((presentCount / todaysAttendance.length) * 100) : 0}%`"
      />
    </div>

    <!-- ══════════════════════════════
         BODY
    ══════════════════════════════ -->
    <div class="att-body">

      <!-- Loading -->
      <div v-if="isLoading" class="loading-wrap">
        <div v-for="i in 6" :key="i" class="skeleton-card">
          <v-skeleton-loader type="list-item-avatar-two-line" />
        </div>
      </div>

      <template v-else-if="todaysAttendance.length > 0">

        <!-- ── DESKTOP TABLE ── -->
        <v-card rounded="xl" elevation="1" class="d-none d-lg-block mb-4">
          <div class="table-topbar px-4 py-3">
            <div class="d-flex align-center gap-2">
              <v-icon size="18" color="primary">mdi-table-account</v-icon>
              <span class="text-body-2 font-weight-bold ml-3">All Employees</span>
            </div>
            <v-chip size="x-small" color="primary" variant="tonal">{{ todaysAttendance.length }} total</v-chip>
          </div>
          <v-divider />
          <v-data-table
            :items="todaysAttendance"
            item-key="id"
            class="att-table"
            density="comfortable"
            hide-default-footer
            :items-per-page="-1"
          >
            <template #headers>
              <tr class="table-header-row">
                <th class="table-th">Employee</th>
                <th v-if="isAdmin" class="table-th">Updated At</th>
                <th class="table-th">Advance (₹)</th>
                <th class="table-th">Remark</th>
                <th class="table-th text-center">Status</th>
              </tr>
            </template>

            <template #item="{ item }">
              <tr :class="item.status === 'present' ? 'row-present' : 'row-absent'">
                <td>
                  <div class="d-flex align-center gap-3">
                    <div class="emp-avatar-sm" :class="item.status === 'present' ? 'ava-present' : 'ava-absent'">
                      {{ item.name?.charAt(0).toUpperCase() }}
                    </div>
                    <span class="font-weight-medium ml-3">{{ item.name }}</span>
                  </div>
                </td>
                <td v-if="isAdmin" class="text-caption text-medium-emphasis">
                  {{ formatTime(item.updated_at ?? '') }}
                </td>
                <td>
                  <v-text-field
                    v-if="isAdmin"
                    v-model.number="item.advance_amount"
                    type="number"
                    density="compact"
                    hide-details
                    min="0"
                    step="100"
                    variant="outlined"
                    color="primary"
                    rounded="lg"
                    style="max-width:120px;"
                    prefix="₹"
                    @blur="attendanceStore.saveAttendance(item)"
                  />
                  <span v-else class="font-weight-medium" :class="item.advance_amount ? 'text-error' : 'text-disabled'">
                    {{ item.advance_amount ? `₹${item.advance_amount}` : '—' }}
                  </span>
                </td>
                <td>
                  <v-text-field
                    v-if="isAdmin"
                    v-model="item.remark"
                    density="compact"
                    hide-details
                    variant="outlined"
                    color="primary"
                    rounded="lg"
                    placeholder="Add remark…"
                    style="min-width:150px;"
                    @blur="attendanceStore.saveAttendance(item)"
                  />
                  <v-chip v-else-if="item.remark" size="x-small" variant="outlined" color="grey-darken-1">
                    {{ item.remark }}
                  </v-chip>
                  <span v-else class="text-caption text-disabled">—</span>
                </td>
                <td class="text-center">
                  <div class="d-flex align-center justify-center gap-2">
                    <v-switch
                      v-model="item.status"
                      true-value="present"
                      false-value="absent"
                      :disabled="!isAdmin"
                      color="success"
                      base-color="error"
                      density="compact"
                      hide-details
                      @update:model-value="attendanceStore.saveAttendance(item)"
                    />
                    <v-spacer />
                    <v-chip
                      :color="item.status === 'present' ? 'success' : 'error'"
                      variant="tonal"
                      size="small"
                      :prepend-icon="item.status === 'present' ? 'mdi-check-circle' : 'mdi-close-circle'"
                    >
                      {{ item.status === 'present' ? 'Present' : 'Absent' }}
                    </v-chip>
                  </div>
                </td>
              </tr>
            </template>
          </v-data-table>
        </v-card>

        <!-- ── MOBILE CARDS ── -->
        <div class="d-block d-lg-none">
          <div class="section-label pt-1 pb-3">Employees · {{ todaysAttendance.length }} total</div>
          <div class="mobile-cards">
            <div
              v-for="item in todaysAttendance"
              :key="item.id"
              class="mob-att-card"
              :class="item.status === 'present' ? 'row-present' : 'row-absent'"
            >
              <!-- Card Header -->
              <div class="mob-card-header">
                <div class="d-flex align-center gap-3">
                  <div class="emp-avatar-md mr-3" :class="item.status === 'present' ? 'ava-present' : 'ava-absent'">
                    {{ item.name?.charAt(0).toUpperCase() }}
                  </div>
                  <div>
                    <div class="mob-emp-name">{{ item.name }}</div>
                    <div v-if="isAdmin" class="text-caption text-medium-emphasis">
                      Updated {{ formatTime(item.updated_at ?? '') }}
                    </div>
                  </div>
                </div>
                <!-- Status toggle -->
                <div class="mob-status-wrap">
                  <v-switch
                    v-model="item.status"
                    true-value="present"
                    false-value="absent"
                    :disabled="!isAdmin"
                    color="success"
                    base-color="error"
                    density="compact"
                    hide-details
                    @update:model-value="attendanceStore.saveAttendance(item)"
                  />
                  <div class="mob-status-badge" :class="item.status === 'present' ? 'badge-present' : 'badge-absent'">
                    <v-icon size="11">{{ item.status === 'present' ? 'mdi-check-circle' : 'mdi-close-circle' }}</v-icon>
                    <span>{{ item.status === 'present' ? 'Present' : 'Absent' }}</span>
                  </div>
                </div>
              </div>

              <!-- Card Body: Advance + Remark -->
              <div v-if="isAdmin" class="mob-card-body">
                <div class="mob-field-wrap">
                  <div class="mob-field-label">Advance</div>
                  <v-text-field
                    v-model.number="item.advance_amount"
                    type="number"
                    density="compact"
                    hide-details
                    min="0"
                    step="100"
                    variant="outlined"
                    color="primary"
                    rounded="lg"
                    prefix="₹"
                     class="bg-white"
                    @blur="attendanceStore.saveAttendance(item)"
                  />
                </div>
                <div class="mob-field-wrap mob-field-remark">
                  <div class="mob-field-label">Remark</div>
                  <v-text-field
                    v-model="item.remark"
                    density="compact"
                    hide-details
                    variant="outlined"
                    color="primary"
                    rounded="lg"
                    placeholder="Optional…"
                     class="bg-white"
                    @blur="attendanceStore.saveAttendance(item)"
                  />
                </div>
              </div>

              <!-- Read-only view for non-admin -->
              <div v-else-if="item.advance_amount || item.remark" class="mob-readonly-row">
                <span v-if="item.advance_amount" class="text-caption text-error font-weight-bold">
                  −₹{{ item.advance_amount }} advance
                </span>
                <v-chip v-if="item.remark" size="x-small" variant="outlined" color="grey-darken-1" class="ml-2">
                  {{ item.remark }}
                </v-chip>
              </div>
            </div>
          </div>
        </div>

        <!-- ── DESKTOP SUMMARY ── -->
        <v-card rounded="xl" elevation="1" class="mt-2 mb-6">
          <v-card-title class="d-flex align-center gap-2 pa-4">
            <v-icon size="18" color="primary">mdi-chart-pie</v-icon>
            <span class="text-body-1 font-weight-bold">Summary</span>
          </v-card-title>
          <v-divider />
          <v-card-text class="pa-4">
            <div class="summary-grid">
              <div class="summary-box summary-box-green">
                <div class="summary-box-num text-success">{{ presentCount }}</div>
                <div class="summary-box-lbl">Present</div>
                <div class="summary-box-bar">
                  <div
                    class="summary-box-fill"
                    style="background:#4CAF50"
                    :style="`width:${todaysAttendance.length > 0 ? (presentCount / todaysAttendance.length) * 100 : 0}%`"
                  />
                </div>
              </div>
              <div class="summary-box summary-box-red">
                <div class="summary-box-num text-error">{{ absentCount }}</div>
                <div class="summary-box-lbl">Absent</div>
                <div class="summary-box-bar">
                  <div
                    class="summary-box-fill"
                    style="background:#F44336"
                    :style="`width:${todaysAttendance.length > 0 ? (absentCount / todaysAttendance.length) * 100 : 0}%`"
                  />
                </div>
              </div>
              <div class="summary-box summary-box-orange">
                <div class="summary-box-num" style="color:#E65100">₹{{ totalAdvances }}</div>
                <div class="summary-box-lbl">Total Advances</div>
                <div class="summary-box-bar">
                  <div class="summary-box-fill" style="background:#FF9800; width:60%" />
                </div>
              </div>
              <div class="summary-box summary-box-blue">
                <div class="summary-box-num text-primary">
                  {{ todaysAttendance.length > 0 ? Math.round((presentCount / todaysAttendance.length) * 100) : 0 }}%
                </div>
                <div class="summary-box-lbl">Attendance Rate</div>
                <div class="summary-box-bar">
                  <div
                    class="summary-box-fill"
                    style="background:#1976D2"
                    :style="`width:${todaysAttendance.length > 0 ? (presentCount / todaysAttendance.length) * 100 : 0}%`"
                  />
                </div>
              </div>
            </div>
          </v-card-text>
        </v-card>

      </template>

      <!-- Empty state -->
      <div v-else-if="!isLoading" class="empty-state">
        <v-icon size="64" color="grey-lighten-2">mdi-calendar-account</v-icon>
        <div class="empty-title">No Attendance Records</div>
        <div class="empty-sub">No data found for {{ dayjs(selectedDate).format('DD MMMM YYYY') }}</div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import dayjs from 'dayjs'
import { storeToRefs } from 'pinia'
import { computed, onMounted, ref } from 'vue'
import { useAttendanceStore } from '~/stores/attendance'
import { useAuthStore } from '~/stores/auth'

const authStore = useAuthStore()
const attendanceStore = useAttendanceStore()
const { todaysAttendance, selectedDate, isLoading } = storeToRefs(attendanceStore)
const isAdmin = computed(() => authStore.isAdmin)
const today = new Date().toISOString().split('T')[0]
const dateInputRef = ref<HTMLInputElement | null>(null)

const presentCount = computed(() => todaysAttendance.value.filter(i => i.status === 'present').length)
const absentCount = computed(() => todaysAttendance.value.filter(i => i.status === 'absent').length)
const totalAdvances = computed(() => todaysAttendance.value.reduce((sum, i) => sum + (i.advance_amount || 0), 0))

onMounted(() => attendanceStore.fetchTodaysAttendance())

const onDateChange = () => attendanceStore.fetchTodaysAttendance(selectedDate.value)
const refreshData = () => attendanceStore.fetchTodaysAttendance()

const openDatePicker = () => {
  dateInputRef.value?.showPicker?.()
  dateInputRef.value?.focus()
  dateInputRef.value?.click()
}

const formatDate = (dateStr: string) =>
  new Date(dateStr).toLocaleDateString('en-IN', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  })

const formatTime = (timestamp: string) =>
  timestamp
    ? new Date(timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
    : 'N/A'
</script>

<style scoped>
/* ═══════════════════ ROOT ═══════════════════ */
.att-root {
  background: #F5F5F5;
  min-height: 100vh;
  font-family: 'Roboto', sans-serif;
}

/* ═══════════════════ APP BAR ═══════════════════ */
.att-appbar {
  background: linear-gradient(135deg, #1565C0 0%, #283593 100%);
  position: sticky;
  top: 0;
  z-index: 20;
  box-shadow: 0 2px 4px -1px rgba(0,0,0,0.2),
              0 4px 5px 0 rgba(0,0,0,0.14),
              0 1px 10px 0 rgba(0,0,0,0.12);
}
.appbar-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 14px 6px;
  gap: 10px;
  min-height: 56px;
}
.appbar-left { flex: 1; min-width: 0; }
.appbar-title {
  font-size: 1.1rem;
  font-weight: 700;
  color: white;
  line-height: 1.2;
}
.appbar-sub {
  font-size: 0.7rem;
  color: rgba(255,255,255,0.68);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.appbar-right {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
}

/* Date wrapper — fully clickable */
.date-wrapper {
  display: flex;
  align-items: center;
  gap: 6px;
  background: rgba(255,255,255,0.18);
  border-radius: 10px;
  padding: 6px 10px;
  cursor: pointer;
  position: relative;
  transition: background 0.15s;
  user-select: none;
}
.date-wrapper:hover { background: rgba(255,255,255,0.28); }
.date-wrapper:active { background: rgba(255,255,255,0.35); }
.date-icon { color: rgba(255,255,255,0.85) !important; flex-shrink: 0; }
.date-label { font-size: 0.82rem; font-weight: 600; color: white; white-space: nowrap; }
.date-chevron { color: rgba(255,255,255,0.7) !important; }
.hidden-date-input {
  position: absolute; inset: 0;
  width: 100%; height: 100%;
  opacity: 0; pointer-events: none;
  cursor: pointer;
}

/* Chips row */
.appbar-chips {
  display: flex;
  flex-wrap: nowrap;
  gap: 6px;
  overflow-x: auto;
  scrollbar-width: none;
  -webkit-overflow-scrolling: touch;
  padding-left: 14px;
}
.appbar-chips::-webkit-scrollbar { display: none; }
.summary-chip {
  display: flex;
  align-items: center;
  gap: 4px;
  border-radius: 20px;
  padding: 3px 10px;
  font-size: 0.72rem;
  font-weight: 600;
  flex-shrink: 0;
  white-space: nowrap;
}
.summary-present { background: rgba(76,175,80,0.25); color: #C8E6C9; }
.summary-absent { background: rgba(244,67,54,0.25); color: #FFCDD2; }
.summary-advance { background: rgba(255,152,0,0.25); color: #FFE0B2; }
.summary-rate { background: rgba(255,255,255,0.15); color: rgba(255,255,255,0.9); }

/* ═══════════════════ RATE BAR ═══════════════════ */
.rate-bar-wrap {
  height: 4px;
  background: rgba(244,67,54,0.4);
  position: sticky;
  top: 0; /* sits just below appbar via natural flow */
  z-index: 19;
}
.rate-bar-fill {
  height: 100%;
  background: #4CAF50;
  transition: width 0.8s cubic-bezier(0.4,0,0.2,1);
}

/* ═══════════════════ BODY ═══════════════════ */
.att-body { padding: 14px 12px 20px; }
@media (min-width: 600px) { .att-body { padding: 16px 20px 24px; } }

/* ═══════════════════ SECTION LABEL ═══════════════════ */
.section-label {
  font-size: 0.68rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1.4px;
  color: #9E9E9E;
}

/* ═══════════════════ LOADING ═══════════════════ */
.loading-wrap { display: flex; flex-direction: column; gap: 10px; }
.skeleton-card { background: white; border-radius: 16px; overflow: hidden; }

/* ═══════════════════ EMPLOYEE AVATARS ═══════════════════ */
.emp-avatar-sm {
  width: 34px; height: 34px; border-radius: 10px;
  display: flex; align-items: center; justify-content: center;
  font-size: 0.85rem; font-weight: 700; flex-shrink: 0;
}
.emp-avatar-md {
  width: 42px; height: 42px; border-radius: 12px;
  display: flex; align-items: center; justify-content: center;
  font-size: 1rem; font-weight: 700; flex-shrink: 0;
}
.ava-present { background: rgba(76,175,80,0.18); color: #2E7D32; }
.ava-absent  { background: rgba(244,67,54,0.12); color: #C62828; }

/* ═══════════════════ TABLE (desktop) ═══════════════════ */
.table-topbar { display: flex; align-items: center; justify-content: space-between; }
.table-header-row th {
  background: #FAFAFA !important;
  font-size: 0.7rem !important;
  font-weight: 700 !important;
  text-transform: uppercase !important;
  letter-spacing: 0.8px !important;
  color: #757575 !important;
  padding: 12px 16px !important;
  border-bottom: 1px solid #EEEEEE !important;
}
.att-table :deep(td) { padding: 10px 16px !important; vertical-align: middle; }

/* ═══════════════════ ROW STATES ═══════════════════ */
.row-present {
  background: linear-gradient(135deg, rgba(34,197,94,0.1), rgba(34,197,94,0.03)) !important;
  border-left: 3px solid #22C55E;
  transition: background 0.3s, box-shadow 0.3s;
}
.row-absent {
  background: linear-gradient(135deg, rgba(239,68,68,0.08), rgba(239,68,68,0.02)) !important;
  border-left: 3px solid #EF4444;
  transition: background 0.3s, box-shadow 0.3s;
}

/* ═══════════════════ MOBILE CARDS ═══════════════════ */
.mobile-cards { display: flex; flex-direction: column; gap: 10px; }
.mob-att-card {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}
.mob-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 14px 10px;
  gap: 8px;
}
.mob-emp-name { font-size: 0.95rem; font-weight: 700; color: #212121; }
.mob-status-wrap { display: flex; flex-direction: column; align-items: flex-end; gap: 3px; flex-shrink: 0; }
.mob-status-badge {
  display: flex; align-items: center; gap: 3px;
  border-radius: 20px; padding: 2px 8px;
  font-size: 0.68rem; font-weight: 700; white-space: nowrap;
}
.badge-present { background: rgba(76,175,80,0.15); color: #2E7D32; }
.badge-absent  { background: rgba(244,67,54,0.12); color: #C62828; }
.mob-card-body {
  display: flex;
  gap: 10px;
  padding: 0 14px 14px;
  border-top: 1px solid rgba(0,0,0,0.05);
  padding-top: 10px;
}
.mob-field-wrap { display: flex; flex-direction: column; gap: 4px; flex: 0 0 120px; }
.mob-field-remark { flex: 1; }
.mob-field-label { font-size: 0.65rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px; color: #9E9E9E; }
.mob-readonly-row { padding: 6px 14px 12px; display: flex; align-items: center; flex-wrap: wrap; gap: 4px; }

/* ═══════════════════ DESKTOP SUMMARY ═══════════════════ */
.summary-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}
@media (max-width: 960px) { .summary-grid { grid-template-columns: repeat(2, 1fr); } }
.summary-box {
  background: #FAFAFA;
  border-radius: 14px;
  padding: 16px;
  border: 1px solid rgba(0,0,0,0.06);
}
.summary-box-green { border-top: 3px solid #4CAF50; }
.summary-box-red   { border-top: 3px solid #F44336; }
.summary-box-orange{ border-top: 3px solid #FF9800; }
.summary-box-blue  { border-top: 3px solid #1976D2; }
.summary-box-num { font-size: 1.8rem; font-weight: 800; line-height: 1; margin-bottom: 4px; }
.summary-box-lbl { font-size: 0.7rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; color: #757575; margin-bottom: 10px; }
.summary-box-bar { height: 6px; border-radius: 3px; background: #E0E0E0; overflow: hidden; }
.summary-box-fill { height: 100%; border-radius: 3px; transition: width 0.6s cubic-bezier(0.4,0,0.2,1); }

/* ═══════════════════ EMPTY STATE ═══════════════════ */
.empty-state { text-align: center; padding: 80px 20px; }
.empty-title { font-size: 1.1rem; font-weight: 700; color: #424242; margin-top: 16px; }
.empty-sub { font-size: 0.82rem; color: #9E9E9E; margin-top: 6px; }
</style>