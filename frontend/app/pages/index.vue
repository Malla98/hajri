<template>
  <v-container fluid class="py-4">
    <!-- Header -->
    <v-row align="center" class="mb-6">
      <v-col cols="12" md="6">
        <h1 class="text-h5 font-weight-bold">Attendance</h1>
        <div class="text-body-2 text-medium-emphasis">
          {{ formatDate(selectedDate ?? '') }}
        </div>
      </v-col>

      <v-col cols="12" md="6" class="d-flex justify-md-end ga-3">
        <v-text-field v-model="selectedDate" type="date" :max="today" density="comfortable" hide-details
          @update:model-value="onDateChange" />

        <v-btn v-if="isAdmin" color="primary" :loading="isLoading" @click="refreshData">
          Refresh
        </v-btn>
      </v-col>
    </v-row>

    <!-- Loading -->
    <div v-if="isLoading" class="d-flex justify-center py-12">
      <v-progress-circular indeterminate size="48" width="4" color="primary" />
    </div>

    <!-- Content -->
    <template v-else>
      <!-- Desktop Table -->
      <v-card class="d-none d-lg-block" elevation="1" rounded="xl">
        <v-data-table :items="todaysAttendance" item-key="id" class="elevation-0">
          <template #headers>
            <tr>
              <th>Employee</th>
              <th v-if="isAdmin">Updated At</th>
              <th>Advance (₹)</th>
              <th>Remark</th>
              <th>Status</th>
            </tr>
          </template>

          <template #item="{ item }">
            <tr :class="item.status === 'present' ? 'row-present' : 'row-absent'">
              <td class="font-weight-medium">
                {{ item.name }}
              </td>

              <td v-if="isAdmin" class="text-body-2">
                {{ formatTime(item.updated_at ?? '') }}
              </td>

              <td>
                <v-text-field v-if="isAdmin" v-model.number="item.advance_amount" type="number" density="compact"
                  hide-details min="0" step="100" style="max-width: 120px;background: rgba(255, 255, 255, 0.6);"
                  @blur="attendanceStore.saveAttendance(item)" color="primary" variant="outlined" />
                <span v-else>
                  ₹{{ item.advance_amount || 0 }}
                </span>
              </td>

              <td>
                <v-text-field v-if="isAdmin" v-model="item.remark" density="compact" hide-details
                  style="background: rgba(255, 255, 255, 0.6);" @blur="attendanceStore.saveAttendance(item)"
                  color="primary" variant="outlined" />
                <span v-else>
                  {{ item.remark || '-' }}
                </span>
              </td>

              <td>
                <v-switch v-model="item.status" true-value="present" false-value="absent" :disabled="!isAdmin"
                  color="success" base-color="error" density="compact" hide-details
                  @update:model-value="attendanceStore.saveAttendance(item)">
                  <template #label>
                    <span :class="item.status === 'present'
                      ? 'text-success'
                      : 'text-error'" class="text-body-2 font-weight-medium">
                      {{ item.status === 'present' ? 'Present' : 'Absent' }}
                    </span>
                  </template>
                </v-switch>
              </td>
            </tr>
          </template>
        </v-data-table>
      </v-card>

      <!-- Mobile Cards -->
      <v-row v-if="smAndDown" class="d-lg-none" dense>
        <v-container class="mt-4 pa-2 border rounded-lg" >
          <div class="d-flex align-center ga-2 overflow-x-auto">
            <v-chip color="success" variant="tonal" rounded="1" size="small">
              <strong>{{ presentCount }}</strong>&nbsp;Present
            </v-chip>

            <v-chip color="error" variant="tonal" rounded="1" size="small">
              <strong>{{ absentCount }}</strong>&nbsp;Absent
            </v-chip>

            <v-chip color="primary" variant="tonal" rounded="1" size="small">
              ₹{{ totalAdvances }}&nbsp;Total Advances

            </v-chip>
          </div>
        </v-container>
      </v-row>
      <v-row class="d-lg-none" dense>
        <v-col v-for="item in todaysAttendance" :key="item.id" cols="12">
          <v-card elevation="1" rounded="xl" :class="item.status === 'present' ? 'row-present' : 'row-absent'">
            <v-card-title class="d-flex justify-space-between">
              <span class="font-weight-bold text-primary">{{ item.name }}</span>
              <v-switch v-model="item.status" true-value="present" false-value="absent" :disabled="!isAdmin"
                color="success" base-color="error" density="compact" hide-details
                @update:model-value="attendanceStore.saveAttendance(item)">
                <template #label>
                  <v-chip :class="item.status === 'present'
                    ? 'text-success'
                    : 'text-error'" class="text-caption font-weight-medium rounded-pill elevation-1">
                    {{ item.status === 'present' ? 'Present' : 'Absent' }}
                  </v-chip>
                </template>
              </v-switch>
            </v-card-title>

            <v-card-text>
              <v-row dense>
                <v-col cols="3">
                  <div class="text-caption text-medium-emphasis">
                    Advance
                  </div>
                  <v-text-field v-if="isAdmin" v-model.number="item.advance_amount" type="number" density="compact"
                    min="0" step="100" style="max-width: 140px;background: rgba(255, 255, 255, 0.6);" hide-details
                    @blur="attendanceStore.saveAttendance(item)" color="primary" variant="outlined" />
                  <div v-else class="font-weight-medium">
                    ₹{{ item.advance_amount || 0 }}
                  </div>
                </v-col>

                <v-col cols="9">
                  <div class="text-caption text-medium-emphasis">
                    Remark
                  </div>
                  <v-text-field v-if="isAdmin" v-model="item.remark" density="compact" hide-details
                    style="background: rgba(255, 255, 255, 0.6);" @blur="attendanceStore.saveAttendance(item)"
                    color="primary" variant="outlined" />
                  <div v-else class="font-weight-medium">
                    {{ item.remark || '-' }}
                  </div>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- Summary -->
      <v-card v-if="!smAndDown" class="mt-8" elevation="1" rounded="xl">
        <v-card-title>Today’s Summary</v-card-title>

        <v-card-text>
          <v-row>
            <v-col cols="12" sm="4">
              <v-sheet class="pa-4 text-center" color="green-lighten-5" rounded>
                <div class="text-h5 text-success">{{ presentCount }}</div>
                <div class="text-body-2">Present</div>
              </v-sheet>
            </v-col>

            <v-col cols="12" sm="4">
              <v-sheet class="pa-4 text-center" color="red-lighten-5" rounded>
                <div class="text-h5 text-error">{{ absentCount }}</div>
                <div class="text-body-2">Absent</div>
              </v-sheet>
            </v-col>

            <v-col cols="12" sm="4">
              <v-sheet class="pa-4 text-center" color="blue-lighten-5" rounded>
                <div class="text-h5 text-primary">₹{{ totalAdvances }}</div>
                <div class="text-body-2">Total Advances</div>
              </v-sheet>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </template>
  </v-container>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { computed, onMounted } from 'vue'
import { useDisplay } from 'vuetify'
import { useAttendanceStore } from '~/stores/attendance'
import { useAuthStore } from '~/stores/auth'

const { smAndDown } = useDisplay()


const authStore = useAuthStore()
const attendanceStore = useAttendanceStore()

const { todaysAttendance, selectedDate, isLoading } =
  storeToRefs(attendanceStore)

const isAdmin = computed(() => authStore.isAdmin)

const today = new Date().toISOString().split('T')[0]

const presentCount = computed(() =>
  todaysAttendance.value.filter(i => i.status === 'present').length
)

const absentCount = computed(() =>
  todaysAttendance.value.filter(i => i.status === 'absent').length
)

const totalAdvances = computed(() =>
  todaysAttendance.value.reduce(
    (sum, i) => sum + (i.advance_amount || 0),
    0
  )
)

onMounted(() => {
  attendanceStore.fetchTodaysAttendance()
})

const onDateChange = () => {
  attendanceStore.fetchTodaysAttendance(selectedDate.value)
}

const refreshData = () => {
  attendanceStore.fetchTodaysAttendance()
}

const formatDate = (dateStr: string) =>
  new Date(dateStr).toLocaleDateString('en-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

const formatTime = (timestamp: string) =>
  timestamp
    ? new Date(timestamp).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
    })
    : 'N/A'
</script>
<style>
.row-absent {
  background-color: #ffebee6a;
}

.row-present {
  background-color: #e8f5e96a;
}

@media (max-width: 600px) {
  .v-chip {
    font-size: 12px;
  }
}
</style>
