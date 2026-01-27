import { defineStore } from 'pinia';
import type { RecordModel } from 'pocketbase';
import { useAuthStore } from './auth';

interface AttendanceItem {
  id: string;
  name?: string;
  attendanceId?: string;
  status: string;
  advance_amount: number;
  remark: string;
  updated_at: string | null;
}

interface AttendanceState {
  todaysAttendance: AttendanceItem[];
  selectedDate: string;
  isLoading: boolean;
}

export const useAttendanceStore = defineStore('attendance', {
  state: (): AttendanceState => ({
    todaysAttendance: [],
    selectedDate: new Date().toISOString().split('T')[0] ?? '',
    isLoading: false,
  }),

  actions: {
    async fetchTodaysAttendance(date?: string) {
      const { $pb } = useNuxtApp();
      this.isLoading = true;
      const targetDate = (date || this.selectedDate) + ' 00:00:00.000Z';

      try {
        const employees = await $pb.collection('employees').getFullList({
          filter: 'active = true && role = "worker"',
          sort: 'id',
        });

        const attendance = await $pb.collection('attendance').getFullList({
          filter: `date = "${targetDate}"`,
        });

        this.todaysAttendance = employees.map(emp => {
          const existing = attendance.find(a => a.employee === emp.id);
          return {
            ...emp,
            attendanceId: existing?.id,
            status: existing?.status || 'absent',
            advance_amount: existing?.advance_amount || 0,
            remark: existing?.remark || '',
            updated_at: existing?.updated_at || null,
          };
        });
      } finally {
        this.isLoading = false;
      }
    },

    /** 🔥 SINGLE SOURCE OF TRUTH */
    async saveAttendance(item: AttendanceItem) {
      const { $pb } = useNuxtApp();
      const authStore = useAuthStore();

      if (!authStore.employeesId) return;

      const payload = {
        employee: item.id,
        date: this.selectedDate,
        status: item.status,
        advance_amount: item.advance_amount || 0,
        remark: item.remark || '',
        updated_by: authStore.employeesId,
      };

      try {
        let old_data: RecordModel = {} as RecordModel;
        let new_data: RecordModel;

        if (item.attendanceId) {
          old_data = await $pb.collection('attendance').getFirstListItem(`id="${item.attendanceId}"`);
          new_data = await $pb.collection('attendance').update(item.attendanceId, payload);
        } else {
          new_data = await $pb.collection('attendance').create(payload);
          item.attendanceId = new_data.id;
        }

        item.updated_at = new_data.updated_at;

        await $pb.collection('attendance_logs').create({
          attendance: item.attendanceId,
          old_data: JSON.stringify(old_data),
          new_data: JSON.stringify(new_data),
          changed_by: authStore.employeesId,
        });
      } catch (e) {
        console.error('Save attendance failed', e);
        throw e;
      }
    },
  },
});
