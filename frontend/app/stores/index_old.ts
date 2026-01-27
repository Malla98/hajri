// import { defineStore } from 'pinia';
// import type { RecordModel } from 'pocketbase';

// export const useAuthStore = defineStore('auth', {
//   state: () => ({
//     user: null as any,
//     isAdmin: false,
//     isWorker: false,
//     employeesId: '' as string,
//   }),
//   getters: {
//     isAuthenticated: (state) => !!state.user,
//   },
//   actions: {
//    async login(email: string, password: string) {
//   const { $pb } = useNuxtApp()

//   try {
//     const authData = await $pb
//       .collection('users')
//       .authWithPassword(email, password)

//     const employee = await $pb
//       .collection('employees')
//       .getFirstListItem(`user="${authData.record.id}"`)

//     if (employee.role !== 'admin') {
//       throw new Error('Only admin can login')
//     }

//     this.user = authData.record
//     this.isAdmin = employee.role === 'admin'
//     this.employeesId = employee.id

//     return authData
//   } catch (error) {
//     console.error(error)
//     throw error
//   }
// }
// ,
    
//     logout() {
//       const { $pb } = useNuxtApp();
//       $pb.authStore.clear();
//       this.$reset();
//     },
    
//    async checkAuth() {
//   const { $pb } = useNuxtApp();

//   if (!$pb.authStore.isValid) {
//     this.logout();
//     return;
//   }

//   try {
//     // refresh token once
//     await $pb.collection('users').authRefresh();

//     this.user = $pb.authStore.record;

//     const employee = await $pb
//       .collection('employees')
//       .getFirstListItem(`user="${this.user.id}"`);

//     if (employee.role !== 'admin') {
//       throw new Error('Only admin can login');
//     }

//     this.isAdmin = employee.role === 'admin';
//      this.employeesId = employee.id
//   } catch (e) {
//     this.logout();
//   }
// }
//   }
// });

// export const useAttendanceStore = defineStore('attendance', {
//   state: () => ({
//     todaysAttendance: [] as any[],
//     selectedDate: new Date().toISOString().split('T')[0],
//     isLoading: false,
//   }),

//   actions: {
//     async fetchTodaysAttendance(date?: string) {
//       const { $pb } = useNuxtApp();

//       this.isLoading = true;
//       const targetDate = (date || this.selectedDate) + ' 00:00:00.000Z';

//       try {
//         const employees = await $pb.collection('employees').getFullList({
//           filter: 'active = true',
//           sort: 'id',
//         });

//         const attendance = await $pb.collection('attendance').getFullList({
//           filter: `date = "${targetDate}"`,
//         });

//         this.todaysAttendance = employees.map(emp => {
//           const existing = attendance.find(a => a.employee === emp.id);

//           return {
//             ...emp,
//             attendanceId: existing?.id || null,
//             status: existing?.status || 'absent',
//             advance_amount: existing?.advance_amount || 0,
//             remark: existing?.remark || '',
//             updated_at: existing?.updated_at || null,
//           };
//         });
//       } finally {
//         this.isLoading = false;
//       }
//     },

//     /** 🔥 SINGLE SOURCE OF TRUTH */
//     async saveAttendance(item: any) {
//       const { $pb } = useNuxtApp();
//       const authStore = useAuthStore();

//       if (!authStore.employeesId) return;

//       const payload = {
//         employee: item.id,
//         date: this.selectedDate,
//         status: item.status,
//         advance_amount: item.advance_amount || 0,
//         remark: item.remark || '',
//         updated_by: authStore.employeesId,
//       };

//       try {
//             let old_data = {} as RecordModel;
//             let new_data = {} as RecordModel;
//         if (item.attendanceId) {
//             old_data = await $pb
//             .collection('attendance')
//             .getFirstListItem(`id="${item.attendanceId}"`);
//           const res = await $pb
//             .collection('attendance')
//             .update(item.attendanceId, payload);

//           item.updated_at = res.updated_at;
//           new_data = res;
//         } else {
//           const res = await $pb
//             .collection('attendance')
//             .create(payload);

//           item.attendanceId = res.id;
//           item.updated_at = res.updated_at;
//           new_data = res;
//         }
//         $pb.collection('attendance_logs').create({
//         attendance: item.attendanceId,
//         old_data: JSON.stringify(old_data),
//         new_data: JSON.stringify(new_data),
//         changed_by: authStore.employeesId,
//      });
//       } catch (e) {
//         console.error('Save attendance failed', e);
//         throw e;
//       }
//     },
//   },
// });