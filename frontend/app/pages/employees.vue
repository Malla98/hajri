<template>
  <v-container fluid class="py-2">
    <!-- Header -->
    <v-row class="mb-4" align="center">
      <v-col cols="12" sm="6">
        <h1 class="text-h5 text-sm-h4 font-weight-bold">
          Employees
        </h1>
      </v-col>

      <v-col cols="12" sm="6" class="d-flex justify-sm-end">
        <v-btn
          color="primary"
          prepend-icon="mdi-plus"
          @click="showAddModal = true"
        >
          Add Employee
        </v-btn>
      </v-col>
    </v-row>

    <!-- Loading -->
    <div v-if="isLoading" class="d-flex justify-center py-12">
      <v-progress-circular
        indeterminate
        size="48"
        width="4"
        color="primary"
      />
    </div>

    <!-- Table -->
    <v-card v-else elevation="1" rounded="xl">
      <v-data-table
        :items="employees"
        item-key="id"
        class="elevation-0"
      >
        <template #headers>
          <tr>
            <th>Name</th>
            <th>Age</th>
            <th>Role</th>
            <th>Mobile</th>
            <th>Address</th>
            <th>Salary</th>
            <th>Status</th>
            <th>Actions</th>
            <th>Report</th>
          </tr>
        </template>

        <template #item="{ item }">
          <tr>
            <td class="font-weight-medium">{{ item.name }}</td>
            <td>{{ item.age }}</td>

            <td>
              <v-chip
                size="small"
                :color="item.role === 'admin' ? 'purple' : 'primary'"
                variant="tonal"
              >
                {{ item.role }}
              </v-chip>
            </td>

            <td>{{ item.mobile }}</td>
            <td>{{ item.address }}</td>
            <td>₹{{ item.salary }}</td>

            <td>
              <v-chip
                size="small"
                :color="item.active ? 'success' : 'error'"
                variant="tonal"
              >
                {{ item.active ? 'Active' : 'Inactive' }}
              </v-chip>
            </td>

            <td>
              <v-btn
                variant="text"
                color="primary"
                size="small"
                @click="editEmployee(item)"
              >
                Edit
              </v-btn>

              <v-btn
                v-if="item.role !== 'admin'"
                variant="text"
                color="error"
                size="small"
                @click="toggleEmployeeStatus(item)"
              >
                {{ item.active ? 'Deactivate' : 'Activate' }}
              </v-btn>
            </td>

            <td>
              <v-btn
                variant="text"
                color="primary"
                size="small"
                @click="goToReport(item.id)"
              >
                View Report
              </v-btn>
            </td>
          </tr>
        </template>
      </v-data-table>
    </v-card>

    <!-- Add / Edit Dialog -->
    <v-dialog
      v-model="dialogVisible"
      max-width="500"
      persistent
    >
      <v-card rounded="xl">
        <v-card-title class="text-h6 font-weight-bold">
          {{ editingEmployee ? 'Edit Employee' : 'Add Employee' }}
        </v-card-title>

        <v-card-text>
          <v-form @submit.prevent="saveEmployee">
            <v-text-field
              v-model="form.name"
              label="Name"
              required
            />

            <v-row>
              <v-col cols="6">
                <v-text-field
                  v-model.number="form.age"
                  label="Age"
                  type="number"
                  min="18"
                  max="70"
                  required
                />
              </v-col>

              <v-col cols="6">
                <v-text-field
                  v-model.number="form.salary"
                  label="Salary (₹)"
                  type="number"
                  min="0"
                  required
                />
              </v-col>
            </v-row>

            <v-text-field
              v-model="form.mobile"
              label="Mobile"
            />

            <v-text-field
              v-model="form.address"
              label="Address"
            />

            <v-select
              v-model="form.role"
              label="Role"
              :items="['worker', 'admin']"
              required
            />

            <v-checkbox
              v-model="form.active"
              label="Active"
            />
          </v-form>
        </v-card-text>

        <v-card-actions class="justify-end">
          <v-btn variant="text" @click="closeModal">
            Cancel
          </v-btn>

          <v-btn
            color="primary"
            :loading="isSaving"
            @click="saveEmployee"
          >
            {{ editingEmployee ? 'Update' : 'Create' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup lang="ts">
import type { RecordModel } from 'pocketbase'
import { useAuthStore } from '~/stores/auth'

const { $pb } = useNuxtApp()
const authStore = useAuthStore()
const router = useRouter()

const employees = ref<RecordModel[]>([])
const isLoading = ref(false)
const isSaving = ref(false)
const showAddModal = ref(false)
const editingEmployee = ref<RecordModel | null>(null)

const dialogVisible = computed({
  get: () => showAddModal.value || !!editingEmployee.value,
  set: (val) => {
    if (!val) closeModal()
  },
})

const form = reactive({
  name: '',
  age: 18,
  role: 'worker',
  salary: 0,
  active: true,
  mobile: '',
  address: '',
})

onMounted(fetchEmployees)

const goToReport = (id: string) => {
  router.push(`/reports/employee/${id}`)
}

async function fetchEmployees() {
  isLoading.value = true
  try {
    employees.value = await $pb.collection('employees').getFullList({
      filter: 'role = "worker"',
      sort: 'id',
    })
  } finally {
    isLoading.value = false
  }
}

function editEmployee(employee: RecordModel) {
  editingEmployee.value = employee
  Object.assign(form, employee)
}

async function toggleEmployeeStatus(employee: RecordModel) {
  if (!confirm(`Are you sure you want to ${employee.active ? 'deactivate' : 'activate'} ${employee.name}?`)) return
  await $pb.collection('employees').update(employee.id, {
    active: !employee.active,
  })
  fetchEmployees()
}

async function saveEmployee() {
  if (!authStore.isAdmin) return
  isSaving.value = true
  try {
    if (editingEmployee.value) {
      await $pb.collection('employees').update(editingEmployee.value.id, form)
    } else {
      await $pb.collection('employees').create(form)
    }
    closeModal()
    fetchEmployees()
  } finally {
    isSaving.value = false
  }
}

function closeModal() {
  showAddModal.value = false
  editingEmployee.value = null
  Object.assign(form, {
    name: '',
    age: 18,
    role: 'worker',
    salary: 0,
    active: true,
    mobile: '',
    address: '',
  })
}
</script>
