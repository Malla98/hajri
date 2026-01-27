<template>
  <div class="min-h-screen bg-gray-50 p-1">
    <div class="mb-6">
      <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 class="text-xl sm:text-2xl font-bold text-gray-900">
          Employees
        </h1>

        <button @click="showAddModal = true"
          class="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
          <span class="text-lg leading-none">+</span>
          <span>Add Employee</span>
        </button>
      </div>
    </div>


    <!-- Loading -->
    <div v-if="isLoading" class="flex justify-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>

    <!-- Employees Table -->
    <div v-else class="rounded-xl bg-white shadow-sm">
      <div class="relative w-full overflow-x-auto">
        <table class="min-w-[900px] divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500">Reg No</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500">Name</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500">Age</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500">Role</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500">Mobile</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500">Address</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500">Salary</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500">Status</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500">Actions</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500">Report</th>
            </tr>
          </thead>

          <tbody class="divide-y divide-gray-100">
            <tr v-for="employee in employees" :key="employee.id" class="hover:bg-gray-50">
              <td class="px-4 py-3 text-sm">{{ employee.id }}</td>
              <td class="px-4 py-3 text-sm font-medium">{{ employee.name }}</td>
              <td class="px-4 py-3 text-sm">{{ employee.age }}</td>

              <td class="px-4 py-3">
                <span :class="[
                  'rounded-full px-2.5 py-0.5 text-xs font-medium',
                  employee.role === 'admin'
                    ? 'bg-purple-100 text-purple-800'
                    : 'bg-blue-100 text-blue-800'
                ]">
                  {{ employee.role }}
                </span>
              </td>
              <td class="px-4 py-3 text-sm whitespace-nowrap">
                {{ employee.mobile }}
              </td>
              <td class="px-4 py-3 text-sm whitespace-nowrap">
                {{ employee.address }}
              </td>

              <td class="px-4 py-3 text-sm whitespace-nowrap">
                ₹{{ employee.salary }}
              </td>

              <td class="px-4 py-3">
                <span :class="[
                  'rounded-full px-2.5 py-0.5 text-xs font-medium',
                  employee.active
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                ]">
                  {{ employee.active ? 'Active' : 'Inactive' }}
                </span>
              </td>

              <td class="px-4 py-3 text-sm whitespace-nowrap">
                <div class="flex gap-3">
                  <button @click="editEmployee(employee)" class="font-medium text-blue-600 hover:underline">
                    Edit
                  </button>

                  <button v-if="employee.role !== 'admin'" @click="toggleEmployeeStatus(employee)"
                    class="font-medium text-red-600 hover:underline">
                    {{ employee.active ? 'Deactivate' : 'Activate' }}
                  </button>
                </div>
              </td>
              <td class="px-4 py-3 text-sm whitespace-nowrap">
                <button @click="goToReport(employee.id)" class="font-medium text-blue-600 hover:underline">
                  View Report
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>



    <!-- Add/Edit Modal -->
    <div v-if="showAddModal || editingEmployee"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-xl shadow-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div class="p-6">
          <h2 class="text-xl font-bold text-gray-900 mb-4">
            {{ editingEmployee ? 'Edit Employee' : 'Add Employee' }}
          </h2>

          <form @submit.prevent="saveEmployee" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Name *</label>
              <input v-model="form.name" type="text" required
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Age *</label>
                <input v-model.number="form.age" type="number" required min="18" max="70"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Salary (₹) *</label>
                <input v-model.number="form.salary" type="number" required min="0"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
              </div>
            </div>
            

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Mobile </label>
              <input v-model="form.mobile" type="text" 
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Address </label>
              <input v-model="form.address" type="text" 
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Role *</label>
              <select v-model="form.role" required
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
               >
                <option value="worker">Worker</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <div class="flex items-center">
              <input v-model="form.active" type="checkbox" id="active"
                class="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
              <label for="active" class="ml-2 block text-sm text-gray-700">
                Active
              </label>
            </div>

            <div class="flex justify-end gap-3 pt-4">
              <button type="button" @click="closeModal"
                class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">
                Cancel
              </button>
              <button type="submit" :disabled="isSaving"
                class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50">
                <span v-if="isSaving" class="animate-spin mr-2">⟳</span>
                {{ editingEmployee ? 'Update' : 'Create' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { RecordModel } from 'pocketbase';
import { useAuthStore } from '~/stores/auth';


const { $pb } = useNuxtApp();
const authStore = useAuthStore();
const router = useRouter();
const employees = ref<RecordModel[]>([]);
const isLoading = ref(false);
const isSaving = ref(false);
const showAddModal = ref(false);
const editingEmployee = ref<RecordModel | null>(null);

const form = reactive({
  name: '',
  age: 18,
  role: 'worker',
  salary: 0,
  active: true,
  mobile:'',
  address:'',
});

onMounted(async () => {
  await fetchEmployees();
});
const goToReport = (id: string) => {
  router.push(`/reports/employee/${id}`);
};
const fetchEmployees = async () => {
  isLoading.value = true;
  try {
    const records = await $pb.collection('employees').getFullList({
      sort: 'id'
    });
    employees.value = records;
  } catch (error) {
    console.error('Error fetching employees:', error);
  } finally {
    isLoading.value = false;
  }
};

const editEmployee = (employee: RecordModel) => {
  editingEmployee.value = employee;
  Object.assign(form, {
    name: employee.name,
    age: employee.age,
    role: employee.role,
    salary: employee.salary,
    active: employee.active,
    mobile: employee.mobile,
    address: employee.address
  });
};

const toggleEmployeeStatus = async (employee: RecordModel) => {
  if (!confirm(`Are you sure you want to ${employee.active ? 'deactivate' : 'activate'} ${employee.name}?`)) {
    return;
  }

  try {
    await $pb.collection('employees').update(employee.id, {
      active: !employee.active
    });
    await fetchEmployees();
  } catch (error) {
    console.error('Error toggling employee status:', error);
    alert('Failed to update employee status');
  }
};

const saveEmployee = async () => {
  if (!authStore.isAdmin) return;

  isSaving.value = true;

  try {
    const data = {
      name: form.name,
      age: form.age,
      role: form.role,
      salary: form.salary,
      active: form.active,
      mobile: form.mobile,
      address: form.address,
    };


    if (editingEmployee.value) {
      await $pb.collection('employees').update(editingEmployee.value.id, data);
    } else {
      await $pb.collection('employees').create(data);
    }

    closeModal();
    await fetchEmployees();

  } catch (error) {
    console.error('Error saving employee:', error);
    alert('Failed to save employee');
  } finally {
    isSaving.value = false;
  }
};

const closeModal = () => {
  showAddModal.value = false;
  editingEmployee.value = null;
  resetForm();
};

const resetForm = () => {
  Object.assign(form, {
    name: '',
    age: 18,
    role: 'worker',
    salary: 0,
    active: true,
    mobile:'',
    address:'',
  });
};

</script>