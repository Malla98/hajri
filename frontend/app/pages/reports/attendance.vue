<script setup lang="ts">
const { $pb } = useNuxtApp()

const rows = ref<
  { name: string; present: number; absent: number }[]
>([])

const loading = ref(false)

const headers = [
  { title: 'Employee', key: 'name' },
  { title: 'Present', key: 'present', align: 'center' },
  { title: 'Absent', key: 'absent', align: 'center' },
  { title: 'Total', key: 'total', align: 'center' },
]

onMounted(async () => {
  loading.value = true
  try {
    const records = await $pb.collection('attendance').getFullList({
      expand: 'employee',
      filter: 'employee.role="worker"',
    })

    const map: Record<string, any> = {}

    records.forEach((a: any) => {
      const name = a.expand.employee.name

      if (!map[name]) {
        map[name] = { name, present: 0, absent: 0 }
      }

      map[name][a.status]++
    })

    rows.value = Object.values(map).map((r: any) => ({
      ...r,
      total: r.present + r.absent,
    }))
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <v-container fluid class="pa-6">
    <h1 class="text-h5 font-weight-bold mb-4">
      Attendance Summary
    </h1>

    <v-card rounded="xl" elevation="2">
      <v-data-table
        :headers="headers"
        :items="rows"
        :loading="loading"
        item-key="name"
        loading-text="Loading attendance data..."
        class="elevation-0"
      >
        <template #item.present="{ item }">
          <span class="text-success font-weight-medium">
            {{ item.present }}
          </span>
        </template>

        <template #item.absent="{ item }">
          <span class="text-error font-weight-medium">
            {{ item.absent }}
          </span>
        </template>

        <template #item.total="{ item }">
          <span class="font-weight-bold">
            {{ item.total }}
          </span>
        </template>

        <template #no-data>
          <v-empty-state
            icon="mdi-calendar-remove"
            title="No attendance records"
            text="No attendance records found."
          />
        </template>
      </v-data-table>
    </v-card>
  </v-container>
</template>
