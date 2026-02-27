<template>
  <div class="emp-root">

    <!-- ══════════════════════════════
         APP BAR
    ══════════════════════════════ -->
    <div class="emp-appbar elevation-4">
      <div class="appbar-inner">
        <div class="appbar-left">
          <div class="appbar-title-wrap">
            <div class="appbar-title">Employees</div>
            <div class="appbar-sub">{{ employees.length }} workers registered</div>
          </div>
        </div>
        <div class="appbar-right">
          <v-btn
            color="white"
            variant="flat"
            rounded="lg"
            size="small"
            style="color:#1565C0; font-weight:700;"
            prepend-icon="mdi-plus"
            @click="showAddModal = true"
          >
            <span class="d-none d-sm-inline">Add Employee</span>
            <span class="d-inline d-sm-none">Add</span>
          </v-btn>
        </div>
      </div>

      <!-- Stats chips -->
      <div class="appbar-chips px-3 pb-3">
        <div class="emp-chip emp-chip-blue">
          <v-icon size="13">mdi-account-group</v-icon>
          <span>{{ employees.length }} Total</span>
        </div>
        <div class="emp-chip emp-chip-green">
          <v-icon size="13">mdi-check-circle</v-icon>
          <span>{{ employees.filter(e => e.active).length }} Active</span>
        </div>
        <div class="emp-chip emp-chip-red">
          <v-icon size="13">mdi-close-circle</v-icon>
          <span>{{ employees.filter(e => !e.active).length }} Inactive</span>
        </div>
        <div class="emp-chip emp-chip-purple">
          <span>₹{{ employees.reduce((s, e) => s + (e.salary || 0), 0).toLocaleString('en-IN') }} Salary / Day</span>
        </div>
      </div>
    </div>

    <!-- ══════════════════════════════
         BODY
    ══════════════════════════════ -->
    <div class="emp-body">

      <!-- Loading -->
      <div v-if="isLoading" class="loading-wrap">
        <div v-for="i in 5" :key="i" class="skeleton-row">
          <v-skeleton-loader type="list-item-avatar-two-line" />
        </div>
      </div>

      <template v-else>

        <!-- ── SEARCH BAR ── -->
        <div class="search-wrap mb-3">
          <v-text-field
            v-model="search"
            density="compact"
            variant="outlined"
            rounded="lg"
            hide-details
            placeholder="Search by name, mobile, address…"
            prepend-inner-icon="mdi-magnify"
            clearable
            bg-color="white"
          />
        </div>

        <!-- ── DESKTOP TABLE ── -->
        <v-card rounded="xl" elevation="1" class="d-none d-md-block mb-4">
          <div class="table-topbar px-4 py-3">
            <div class="d-flex align-center gap-2">
              <v-icon size="18" color="primary">mdi-account-multiple</v-icon>
              <span class="text-body-2 font-weight-bold ml-3">All Employees</span>
            </div>
            <v-chip size="x-small" color="primary" variant="tonal">{{ filteredEmployees.length }} results</v-chip>
          </div>
          <v-divider />
          <v-data-table
            :items="filteredEmployees"
            item-key="id"
            class="emp-table"
            density="comfortable"
            :items-per-page="15"
          >
            <template #headers>
              <tr>
                <th class="table-th">Employee</th>
                <th class="table-th">Age</th>
                <th class="table-th">Mobile</th>
                <th class="table-th">Address</th>
                <th class="table-th">Salary / Day</th>
                <th class="table-th text-center">Status</th>
                <th class="table-th text-center">Actions</th>
              </tr>
            </template>

            <template #item="{ item }">
              <tr class="emp-row">
                <!-- Name + avatar -->
                <td>
                  <div class="d-flex align-center gap-3">
                    <div class="emp-avatar" :style="`background:${avatarColor(item.name)}`">
                      {{ item.name?.charAt(0).toUpperCase() }}
                    </div>
                    <div class="ml-3">
                      <div class="font-weight-bold text-body-2">{{ item.name }}</div>
                      <v-chip
                        size="x-small"
                        :color="item.role === 'admin' ? 'purple' : 'blue'"
                        variant="tonal"
                        class="mt-1"
                      >
                        {{ item.role }}
                      </v-chip>
                    </div>
                  </div>
                </td>
                <td class="text-body-2">{{ item.age }}</td>
                <td class="text-body-2">{{ item.mobile || '—' }}</td>
                <td class="text-body-2 text-medium-emphasis" style="max-width:160px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis">
                  {{ item.address || '—' }}
                </td>
                <td>
                  <span class="salary-pill">₹{{ item.salary?.toLocaleString('en-IN') }}</span>
                </td>
                <td class="text-center">
                  <v-chip
                    size="small"
                    :color="item.active ? 'success' : 'error'"
                    variant="tonal"
                    :prepend-icon="item.active ? 'mdi-check-circle' : 'mdi-close-circle'"
                  >
                    {{ item.active ? 'Active' : 'Inactive' }}
                  </v-chip>
                </td>
                <td>
                  <div class="d-flex align-center justify-center gap-1">
                    <v-tooltip text="Edit employee" location="top">
                      <template #activator="{ props }">
                        <v-btn v-bind="props" icon variant="text" size="small" color="primary" @click="editEmployee(item)">
                          <v-icon size="18">mdi-pencil</v-icon>
                        </v-btn>
                      </template>
                    </v-tooltip>
                    <v-tooltip text="View report" location="top">
                      <template #activator="{ props }">
                        <v-btn v-bind="props" icon variant="text" size="small" color="teal" @click="goToReport(item.id)">
                          <v-icon size="18">mdi-chart-bar</v-icon>
                        </v-btn>
                      </template>
                    </v-tooltip>
                    <v-tooltip v-if="item.role !== 'admin'" :text="item.active ? 'Deactivate' : 'Activate'" location="top">
                      <template #activator="{ props }">
                        <v-btn
                          v-bind="props"
                          icon variant="text" size="small"
                          :color="item.active ? 'error' : 'success'"
                          @click="toggleEmployeeStatus(item)"
                        >
                          <v-icon size="18">{{ item.active ? 'mdi-account-off' : 'mdi-account-check' }}</v-icon>
                        </v-btn>
                      </template>
                    </v-tooltip>
                  </div>
                </td>
              </tr>
            </template>

            <template #no-data>
              <div class="text-center py-10">
                <v-icon size="48" color="grey-lighten-2">mdi-account-search</v-icon>
                <p class="text-body-2 text-medium-emphasis mt-2">No employees found.</p>
              </div>
            </template>
          </v-data-table>
        </v-card>

        <!-- ── MOBILE CARDS ── -->
        <div class="d-block d-md-none">
          <div v-if="filteredEmployees.length === 0" class="empty-state">
            <v-icon size="52" color="grey-lighten-2">mdi-account-search</v-icon>
            <p class="empty-sub mt-2">No employees found.</p>
          </div>
          <div class="mob-emp-list">
            <div v-for="item in filteredEmployees" :key="item.id" class="mob-emp-card">

              <!-- Card header -->
              <div class="mob-card-header">
                <div class="d-flex align-center gap-3">
                  <div class="emp-avatar-lg" :style="`background:${avatarColor(item.name)}`">
                    {{ item.name?.charAt(0).toUpperCase() }}
                  </div>
                  <div class="ml-3">
                    <div class="mob-emp-name">{{ item.name }}</div>
                    <div class="mob-emp-meta">
                      <v-chip size="x-small" :color="item.role === 'admin' ? 'purple' : 'blue'" variant="tonal" class="mr-1">
                        {{ item.role }}
                      </v-chip>
                      <v-chip size="x-small" :color="item.active ? 'success' : 'error'" variant="tonal" :prepend-icon="item.active ? 'mdi-check-circle' : 'mdi-close-circle'">
                        {{ item.active ? 'Active' : 'Inactive' }}
                      </v-chip>
                    </div>
                  </div>
                </div>
                <div class="mob-salary-badge">
                  <div class="text-caption text-medium-emphasis">Per day</div>
                  <div class="mob-salary-val">₹{{ item.salary?.toLocaleString('en-IN') }}</div>
                </div>
              </div>

              <!-- Info row -->
              <div class="mob-info-row">
                <div v-if="item.mobile" class="mob-info-item">
                  <v-icon size="13" color="grey">mdi-phone</v-icon>
                  <span>{{ item.mobile }}</span>
                </div>
                <div v-if="item.age" class="mob-info-item">
                  <v-icon size="13" color="grey">mdi-cake-variant</v-icon>
                  <span>Age {{ item.age }}</span>
                </div>
                <div v-if="item.address" class="mob-info-item">
                  <v-icon size="13" color="grey">mdi-map-marker</v-icon>
                  <span class="mob-address">{{ item.address }}</span>
                </div>
              </div>

              <!-- Actions -->
              <div class="mob-actions">
                <v-btn
                  variant="tonal"
                  color="primary"
                  size="small"
                  rounded="lg"
                  prepend-icon="mdi-pencil"
                  @click="editEmployee(item)"
                >
                  Edit
                </v-btn>
                <v-btn
                  variant="tonal"
                  color="teal"
                  size="small"
                  rounded="lg"
                  prepend-icon="mdi-chart-bar"
                  @click="goToReport(item.id)"
                >
                  Report
                </v-btn>
                <v-btn
                  v-if="item.role !== 'admin'"
                  variant="tonal"
                  :color="item.active ? 'error' : 'success'"
                  size="small"
                  rounded="lg"
                  :prepend-icon="item.active ? 'mdi-account-off' : 'mdi-account-check'"
                  @click="toggleEmployeeStatus(item)"
                >
                  {{ item.active ? 'Deactivate' : 'Activate' }}
                </v-btn>
              </div>

            </div>
          </div>
        </div>

      </template>
    </div>

    <!-- ══════════════════════════════
         ADD / EDIT DIALOG
    ══════════════════════════════ -->
    <v-dialog v-model="dialogVisible" max-width="520" persistent>
      <v-card rounded="xl" class="dialog-card">

        <!-- Dialog Header -->
        <div class="dialog-header">
          <div class="dialog-header-icon">
            <v-icon color="white" size="22">{{ editingEmployee ? 'mdi-pencil' : 'mdi-account-plus' }}</v-icon>
          </div>
          <div>
            <div class="dialog-title">{{ editingEmployee ? 'Edit Employee' : 'Add New Employee' }}</div>
            <div class="dialog-sub">{{ editingEmployee ? 'Update employee details' : 'Fill in the details below' }}</div>
          </div>
          <v-spacer />
          <v-btn icon variant="text" size="small" @click="closeModal">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </div>

        <v-divider />

        <v-card-text class="pa-5">
          <v-form @submit.prevent="saveEmployee">

            <!-- Name -->
            <div class="field-label">Full Name *</div>
            <v-text-field
              v-model="form.name"
              placeholder="e.g. Ravi Kumar"
              density="comfortable"
              variant="outlined"
              rounded="lg"
              hide-details="auto"
              class="mb-4"
              prepend-inner-icon="mdi-account"
            />

            <!-- Age + Salary -->
            <v-row dense class="mb-4">
              <v-col cols="6">
                <div class="field-label">Age *</div>
                <v-text-field
                  v-model.number="form.age"
                  type="number"
                  placeholder="25"
                  min="18" max="70"
                  density="comfortable"
                  variant="outlined"
                  rounded="lg"
                  hide-details="auto"
                  prepend-inner-icon="mdi-cake-variant"
                />
              </v-col>
              <v-col cols="6">
                <div class="field-label">Daily Salary (₹) *</div>
                <v-text-field
                  v-model.number="form.salary"
                  type="number"
                  placeholder="500"
                  min="0"
                  density="comfortable"
                  variant="outlined"
                  rounded="lg"
                  hide-details="auto"
                  prepend-inner-icon="mdi-currency-inr"
                />
              </v-col>
            </v-row>

            <!-- Mobile -->
            <div class="field-label">Mobile</div>
            <v-text-field
              v-model="form.mobile"
              placeholder="9876543210"
              density="comfortable"
              variant="outlined"
              rounded="lg"
              hide-details
              class="mb-4"
              prepend-inner-icon="mdi-phone"
            />

            <!-- Address -->
            <div class="field-label">Address</div>
            <v-text-field
              v-model="form.address"
              placeholder="Village / City"
              density="comfortable"
              variant="outlined"
              rounded="lg"
              hide-details
              class="mb-4"
              prepend-inner-icon="mdi-map-marker"
            />

            <!-- Role + Active -->
            <v-row dense>
              <v-col cols="7">
                <div class="field-label">Role *</div>
                <v-select
                  v-model="form.role"
                  :items="['worker', 'admin']"
                  density="comfortable"
                  variant="outlined"
                  rounded="lg"
                  hide-details
                  prepend-inner-icon="mdi-shield-account"
                />
              </v-col>
              <v-col cols="5" class="d-flex align-end pb-1">
                <v-switch
                  v-model="form.active"
                  color="success"
                  hide-details
                  density="compact"
                  :label="form.active ? 'Active' : 'Inactive'"
                  class="ml-2"
                />
              </v-col>
            </v-row>

          </v-form>
        </v-card-text>

        <v-divider />

        <v-card-actions class="pa-4 gap-2">
          <v-btn variant="text" color="grey-darken-1" rounded="lg" @click="closeModal">
            Cancel
          </v-btn>
          <v-spacer />
          <v-btn
            color="primary"
            variant="flat"
            rounded="lg"
            :loading="isSaving"
            min-width="120"
            prepend-icon="mdi-check"
            @click="saveEmployee"
          >
            {{ editingEmployee ? 'Update' : 'Create' }}
          </v-btn>
        </v-card-actions>

      </v-card>
    </v-dialog>

    <!-- Confirm Dialog -->
    <v-dialog v-model="confirmDialog.show" max-width="380">
      <v-card rounded="xl" class="pa-2">
        <v-card-title class="d-flex align-center gap-2 pt-4 px-4">
          <v-icon :color="confirmDialog.action === 'deactivate' ? 'error' : 'success'">
            {{ confirmDialog.action === 'deactivate' ? 'mdi-account-off' : 'mdi-account-check' }}
          </v-icon>
          <span class="text-body-1 font-weight-bold">{{ confirmDialog.action === 'deactivate' ? 'Deactivate' : 'Activate' }} Employee?</span>
        </v-card-title>
        <v-card-text class="px-4 text-body-2 text-medium-emphasis">
          Are you sure you want to {{ confirmDialog.action }} <strong>{{ confirmDialog.name }}</strong>?
        </v-card-text>
        <v-card-actions class="px-4 pb-4 gap-2">
          <v-btn variant="text" rounded="lg" @click="confirmDialog.show = false">Cancel</v-btn>
          <v-spacer />
          <v-btn
            :color="confirmDialog.action === 'deactivate' ? 'error' : 'success'"
            variant="flat"
            rounded="lg"
            @click="confirmToggle"
          >
            Confirm
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

  </div>
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
const search = ref('')

const confirmDialog = reactive({
  show: false,
  name: '',
  action: 'deactivate' as 'deactivate' | 'activate',
  employee: null as RecordModel | null,
})

const dialogVisible = computed({
  get: () => showAddModal.value || !!editingEmployee.value,
  set: (val) => { if (!val) closeModal() },
})

const form = reactive({
  name: '', age: 18, role: 'worker',
  salary: 0, active: true, mobile: '', address: '',
})

const filteredEmployees = computed(() => {
  const q = search.value.toLowerCase().trim()
  if (!q) return employees.value
  return employees.value.filter(e =>
    e.name?.toLowerCase().includes(q) ||
    e.mobile?.includes(q) ||
    e.address?.toLowerCase().includes(q)
  )
})

// Deterministic avatar color from name
const avatarColors = [
  '#1976D2','#388E3C','#7B1FA2','#E65100',
  '#00796B','#C62828','#283593','#2E7D32',
]
const avatarColor = (name: string) => {
  const idx = (name?.charCodeAt(0) || 0) % avatarColors.length
  return avatarColors[idx] + '22' // transparent tint
}
const avatarTextColor = (name: string) => {
  const idx = (name?.charCodeAt(0) || 0) % avatarColors.length
  return avatarColors[idx]
}

onMounted(fetchEmployees)

const goToReport = (id: string) => router.push(`/reports/employee/${id}`)

async function fetchEmployees() {
  isLoading.value = true
  try {
    employees.value = await $pb.collection('employees').getFullList({
      filter: 'role = "worker"',
      sort: 'name',
    })
  } finally {
    isLoading.value = false
  }
}

function editEmployee(employee: RecordModel) {
  editingEmployee.value = employee
  Object.assign(form, employee)
}

function toggleEmployeeStatus(employee: RecordModel) {
  confirmDialog.employee = employee
  confirmDialog.name = employee.name
  confirmDialog.action = employee.active ? 'deactivate' : 'activate'
  confirmDialog.show = true
}

async function confirmToggle() {
  if (!confirmDialog.employee) return
  await $pb.collection('employees').update(confirmDialog.employee.id, {
    active: !confirmDialog.employee.active,
  })
  confirmDialog.show = false
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
  Object.assign(form, { name: '', age: 18, role: 'worker', salary: 0, active: true, mobile: '', address: '' })
}
</script>

<style scoped>
/* ═══════════════════ ROOT ═══════════════════ */
.emp-root {
  background: #F5F5F5;
  min-height: 100vh;
  font-family: 'Roboto', sans-serif;
}

/* ═══════════════════ APP BAR ═══════════════════ */
.emp-appbar {
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
  min-height: 56px;
  gap: 10px;
}
.appbar-left { flex: 1; min-width: 0; }
.appbar-right { flex-shrink: 0; }
.appbar-title { font-size: 1.1rem; font-weight: 700; color: white; line-height: 1.2; }
.appbar-sub { font-size: 0.7rem; color: rgba(255,255,255,0.68); }

/* Chips */
.appbar-chips {
  display: flex; flex-wrap: nowrap; gap: 6px;
  overflow-x: auto; scrollbar-width: none; padding-left: 14px;
  -webkit-overflow-scrolling: touch;
}
.appbar-chips::-webkit-scrollbar { display: none; }
.emp-chip {
  display: flex; align-items: center; gap: 4px;
  border-radius: 20px; padding: 3px 10px;
  font-size: 0.72rem; font-weight: 600;
  flex-shrink: 0; white-space: nowrap;
}
.emp-chip-blue   { background: rgba(33,150,243,0.25);  color: #BBDEFB; }
.emp-chip-green  { background: rgba(76,175,80,0.25);   color: #C8E6C9; }
.emp-chip-red    { background: rgba(244,67,54,0.25);   color: #FFCDD2; }
.emp-chip-purple { background: rgba(156,39,176,0.25);  color: #E1BEE7; }

/* ═══════════════════ BODY ═══════════════════ */
.emp-body { padding: 14px 12px 24px; }
@media (min-width: 600px) { .emp-body { padding: 16px 20px 28px; } }

/* ═══════════════════ SEARCH ═══════════════════ */
.search-wrap { }

/* ═══════════════════ LOADING ═══════════════════ */
.loading-wrap { display: flex; flex-direction: column; gap: 8px; }
.skeleton-row { background: white; border-radius: 16px; overflow: hidden; }

/* ═══════════════════ AVATARS ═══════════════════ */
.emp-avatar {
  width: 36px; height: 36px; border-radius: 10px;
  display: flex; align-items: center; justify-content: center;
  font-size: 0.9rem; font-weight: 800; flex-shrink: 0;
  color: #1565C0;
}
.emp-avatar-lg {
  width: 46px; height: 46px; border-radius: 14px;
  display: flex; align-items: center; justify-content: center;
  font-size: 1.1rem; font-weight: 800; flex-shrink: 0;
  color: #1565C0;
}

/* ═══════════════════ TABLE ═══════════════════ */
.table-topbar { display: flex; align-items: center; justify-content: space-between; }
.table-th {
  background: #FAFAFA !important;
  font-size: 0.7rem !important;
  font-weight: 700 !important;
  text-transform: uppercase !important;
  letter-spacing: 0.8px !important;
  color: #757575 !important;
  padding: 12px 16px !important;
  border-bottom: 1px solid #EEEEEE !important;
}
.emp-table :deep(td) { padding: 10px 16px !important; vertical-align: middle; }
.emp-row { transition: background 0.15s; }
.emp-row:hover td { background: #F3F4F6 !important; }
.salary-pill {
  background: rgba(0,150,136,0.1);
  color: #00695C;
  padding: 3px 10px;
  border-radius: 20px;
  font-size: 0.82rem;
  font-weight: 700;
}

/* ═══════════════════ MOBILE CARDS ═══════════════════ */
.mob-emp-list { display: flex; flex-direction: column; gap: 10px; }
.mob-emp-card {
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
.mob-emp-name { font-size: 0.95rem; font-weight: 700; color: #212121; margin-bottom: 4px; }
.mob-emp-meta { display: flex; align-items: center; flex-wrap: wrap; gap: 4px; }
.mob-salary-badge { text-align: right; flex-shrink: 0; }
.mob-salary-val { font-size: 1rem; font-weight: 800; color: #00695C; }
.mob-info-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 0 14px 10px;
  border-top: 1px solid rgba(0,0,0,0.05);
  padding-top: 8px;
}
.mob-info-item {
  display: flex; align-items: center; gap: 4px;
  font-size: 0.75rem; color: #757575;
}
.mob-address { max-width: 160px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.mob-actions {
  display: flex; align-items: center; flex-wrap: wrap; gap: 8px;
  padding: 0 14px 14px;
  border-top: 1px solid rgba(0,0,0,0.05);
  padding-top: 10px;
}

/* ═══════════════════ EMPTY ═══════════════════ */
.empty-state { text-align: center; padding: 60px 20px; }
.empty-sub { font-size: 0.85rem; color: #9E9E9E; }

/* ═══════════════════ DIALOG ═══════════════════ */
.dialog-card { overflow: hidden; }
.dialog-header {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 18px 20px 16px;
  background: linear-gradient(135deg, #1565C0 0%, #283593 100%);
}
.dialog-header-icon {
  width: 44px; height: 44px; border-radius: 12px;
  background: rgba(255,255,255,0.2);
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.dialog-title { font-size: 1rem; font-weight: 700; color: white; }
.dialog-sub { font-size: 0.72rem; color: rgba(255,255,255,0.72); }
.field-label {
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  color: #757575;
  margin-bottom: 6px;
}
</style>