<template>
  <div class="min-h-screen bg-gray-50 p-4">
    <h1 class="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>
    
    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <div class="bg-white p-6 rounded-xl shadow-sm">
        <h3 class="text-lg font-semibold text-gray-700 mb-2">Total Employees</h3>
        <p class="text-3xl font-bold text-blue-600">{{ stats.totalEmployees }}</p>
      </div>
      
      <div class="bg-white p-6 rounded-xl shadow-sm">
        <h3 class="text-lg font-semibold text-gray-700 mb-2">Today's Present</h3>
        <p class="text-3xl font-bold text-green-600">{{ stats.todayPresent }}</p>
      </div>
      
      <div class="bg-white p-6 rounded-xl shadow-sm">
        <h3 class="text-lg font-semibold text-gray-700 mb-2">Total Salary</h3>
        <p class="text-3xl font-bold text-purple-600">₹{{ stats.totalSalary }}</p>
      </div>
       <div class="bg-white p-6 rounded-xl shadow-sm">
        <h3 class="text-lg font-semibold text-gray-700 mb-2">Attendance Report</h3>
        <p class="text-1xl font-bold text-purple-600">
          <NuxtLink
            to="/reports/attendance"
            class="text-blue-600 hover:underline"
          >
            View Report
          </NuxtLink>
        </p>
      </div>
    </div>
    
    <!-- Recent Activity -->
    <div class="bg-white rounded-xl shadow-sm p-6">
      <h2 class="text-xl font-semibold text-gray-900 mb-4">Recent Attendance</h2>
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Present</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Absent</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Advances</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            <tr v-for="record in recentAttendance" :key="record.date">
              <td class="px-4 py-3 text-sm text-gray-900">{{ formatDate(record.date) }}</td>
              <td class="px-4 py-3 text-sm">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  {{ record.present }}
                </span>
              </td>
              <td class="px-4 py-3 text-sm">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                  {{ record.absent }}
                </span>
              </td>
              <td class="px-4 py-3 text-sm text-gray-900">₹{{ record.advances }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth';

const { $pb } = useNuxtApp();
const authStore = useAuthStore();

const stats = ref({
  totalEmployees: 0,
  todayPresent: 0,
  totalSalary: 0
});

const recentAttendance = ref<any>([]);

onMounted(async () => {
  await fetchStats();
  await fetchRecentAttendance();
});

const fetchStats = async () => {
  try {
    // Total employees
    const employees = await $pb.collection('employees').getFullList({
      filter: 'active = true'
    });

    
    // Today's attendance
    const today = new Date().toISOString().split('T')[0];
    const attendance = await $pb.collection('attendance').getFullList({
      filter: `date = "${today} 00:00:00.000Z" && status = "present"`
    });
    
    // Calculate total salary
    const totalSalary = employees.reduce((sum, emp) => sum + emp.salary, 0);
    
    stats.value = {
      totalEmployees: employees.length,
      todayPresent: attendance.length,
      totalSalary
    };
    
  } catch (error) {
    console.error('Error fetching stats:', error);
  }
};

const fetchRecentAttendance = async () => {
  try {
    const today = new Date();
    const last7Days = [];
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      last7Days.push(date.toISOString().split('T')[0]+' 00:00:00.000Z');
    }
    
    const attendanceData = await $pb.collection('attendance').getFullList({
      filter: last7Days.map(date => `date = "${date}"`).join(' || '),
      sort: '-date'
    });


    // Group by date
    const grouped = attendanceData.reduce((acc:any, record) => {
      const date = record.date;
      if (!acc[date]) {
        acc[date] = { present: 0, absent: 0, advances: 0 };
      }
      
      if (record.status === 'present') {
        acc[date].present++;
        acc[date].advances += record.advance_amount || 0;
      } else {
        acc[date].absent++;
      }
      
      return acc;
    }, {});
    
    recentAttendance.value = last7Days
      .filter(date => grouped[date])
      .map(date => ({
        date,
        ...grouped[date]
      }));
   
  } catch (error) {
    console.error('Error fetching recent attendance:', error);
  }
};

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  if (date.toDateString() === today.toDateString()) return 'Today';
  if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
  
  return date.toLocaleDateString('en-IN', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  });
};
</script>