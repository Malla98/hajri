<template>
  <div class="min-h-screen bg-gray-50 p-4">
    <!-- Header -->
    <div class="mb-6">
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Attendance</h1>
          <p class="text-gray-600">{{ formatDate(selectedDate ?? '') }}</p>
        </div>
        
        <div class="flex items-center gap-4">
          <input
            type="date"
            v-model="selectedDate"
            @change="onDateChange"
            class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            :max="today"
            @click="openDatePicker"
          />
          <button
            v-if="isAdmin"
            @click="refreshData"
            class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            :disabled="isLoading"
          >
            Refresh
          </button>
        </div>
      </div>
    </div>
    
    <!-- Loading State -->
    <div v-if="isLoading" class="flex justify-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
    
    <!-- Content when not loading -->
    <template v-else>
      <!-- Desktop Table View -->
      <div class="hidden lg:block">
        <div class="bg-white rounded-xl shadow-sm overflow-hidden">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Employee
                </th>
                <th v-if="isAdmin" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Updated At
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Advance (₹)
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Remark
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="item in todaysAttendance" :key="item.id">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <div>
                      <div class="text-sm font-medium text-gray-900">{{ item.name }}</div>
                    </div>
                  </div>
                </td>
                <td v-if="isAdmin" class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  Last updated: {{ formatTime(item.updated_at ?? '') }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <input
                    v-if="isAdmin"
                    type="number"
                    v-model.number="item.advance_amount"
                    @blur="attendanceStore.saveAttendance(item)"
                    class="w-32 px-3 py-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="0"
                    min="0"
                    step="100"
                  />
                  <span v-else class="text-gray-700">
                    ₹{{ item.advance_amount || 0 }}
                  </span>
                </td>
                <td class="px-6 py-4">
                <div v-if="isAdmin">
                <input
                  type="text"
                  v-model="item.remark"
                  @blur="attendanceStore.saveAttendance(item)"
                   class="w-32 px-3 py-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter remark"
                />
              </div>
                  <span  v-else class="text-sm text-gray-700">
                    {{ item.remark || '-' }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <button
                    @click="() => {
                      item.status = item.status === 'present' ? 'absent' : 'present'
                      attendanceStore.saveAttendance(item)
                    }"
                    :disabled="!isAdmin"
                    :class="[
                      'px-4 py-2 rounded-lg font-semibold transition-all duration-200 min-w-[100px]',
                      'disabled:opacity-50 disabled:cursor-not-allowed',
                      item.status === 'present' 
                        ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                        : 'bg-red-100 text-red-800 hover:bg-red-200'
                    ]"
                  >
                    {{ item.status === 'present' ? '✅ Present' : '❌ Absent' }}
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      
      <!-- Mobile Card View -->
      <div class="lg:hidden space-y-4">
        <div 
          v-for="item in todaysAttendance" 
          :key="item.id"
          class="bg-white rounded-xl shadow-sm p-4"
        >
          <div class="flex justify-between items-start mb-3">
            <div>
              <h3 class="font-semibold text-gray-900">{{ item.name }}</h3>
            </div>
            <button
               @click="() => {
                  item.status = item.status === 'present' ? 'absent' : 'present'
                  attendanceStore.saveAttendance(item)
                }"
              :disabled="!isAdmin"
              :class="[
                'px-4 py-2 rounded-lg font-semibold transition-all duration-200 min-w-[100px]',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                item.status === 'present' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              ]"
            >
              {{ item.status === 'present' ? '✅ Present' : '❌ Absent' }}
            </button>
          </div>
          
          <div class="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p class="text-gray-500">Advance</p>
              <div v-if="isAdmin">
                <input
                  type="number"
                   v-model.number="item.advance_amount"
                  @blur="attendanceStore.saveAttendance(item)"
                  class="w-full px-3 py-1 border border-gray-300 rounded-md"
                  placeholder="0"
                  min="0"
                />
              </div>
              <p v-else class="font-medium">₹{{ item.advance_amount || 0 }}</p>
            </div>
            <div>
              <p class="text-gray-500">Remark</p>
              <div v-if="isAdmin">
                <input
                  type="text"
                  v-model="item.remark"
                  @blur="attendanceStore.saveAttendance(item)"
                  class="w-full px-3 py-1 border border-gray-300 rounded-md"
                  placeholder="Enter remark"
                />
              </div>
              <p v-else class="font-medium">{{ item.remark || '-' }}</p>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Summary -->
      <div v-if="isAdmin" class="mt-8 p-6 bg-white rounded-xl shadow-sm">
        <h2 class="text-lg font-semibold mb-4">Today's Summary</h2>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div class="text-center p-4 bg-green-50 rounded-lg">
            <p class="text-2xl font-bold text-green-700">{{ presentCount }}</p>
            <p class="text-green-600">Present</p>
          </div>
          <div class="text-center p-4 bg-red-50 rounded-lg">
            <p class="text-2xl font-bold text-red-700">{{ absentCount }}</p>
            <p class="text-red-600">Absent</p>
          </div>
          <div class="text-center p-4 bg-blue-50 rounded-lg">
            <p class="text-2xl font-bold text-blue-700">₹{{ totalAdvances }}</p>
            <p class="text-blue-600">Total Advances</p>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { useAttendanceStore } from '~/stores/attendance';
import { useAuthStore } from '~/stores/auth';

const authStore = useAuthStore();
const attendanceStore = useAttendanceStore();

const { todaysAttendance, selectedDate, isLoading } = storeToRefs(attendanceStore);
const isAdmin = computed(() => authStore.isAdmin);

const today = new Date().toISOString().split('T')[0];

const presentCount = computed(() => 
  todaysAttendance.value.filter(item => item.status === 'present').length
);

const absentCount = computed(() => 
  todaysAttendance.value.filter(item => item.status === 'absent').length
);

const totalAdvances = computed(() => 
  todaysAttendance.value.reduce((sum, item) => sum + (item.advance_amount || 0), 0)
);

onMounted(async () => {
  await attendanceStore.fetchTodaysAttendance();
});
 const openDatePicker = (event:any) => {
    event?.target?.showPicker();
};

const onDateChange = async () => {
  await attendanceStore.fetchTodaysAttendance(selectedDate.value);
};

const refreshData = async () => {
  await attendanceStore.fetchTodaysAttendance();
};


const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('en-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

const formatTime = (timestamp: string) => {
  if (!timestamp) return 'N/A';
  return new Date(timestamp).toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit'
  });
};
</script>