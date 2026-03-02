import dayjs from 'dayjs'

export function useEmployeeReport() {
  const { $pb } = useNuxtApp()
  const route = useRoute()

  const month    = ref(dayjs().format('YYYY-MM'))
  const loading  = ref(false)
  const employee = ref<any>(null)

  // ── Raw DB records (used for table display + advance amounts) ──
  const rawAttendance = ref<any[]>([])

  // ── Calendar days — SINGLE SOURCE OF TRUTH ──
  // Every past day in the month exists here.
  // No DB record on a past day = absent.
  const calendarDays = computed(() => {
    if (!month.value) return []
    const start       = dayjs(`${month.value}-01`)
    const daysInMonth = start.daysInMonth()
    const today       = dayjs()
    const days        = []

    for (let i = 1; i <= daysInMonth; i++) {
      const current  = start.date(i)
      const date     = current.format('YYYY-MM-DD')
      const isFuture = current.isAfter(today, 'day')
      const record   = rawAttendance.value.find(
        a => dayjs(a.date).format('YYYY-MM-DD') === date
      )

      days.push({
        date,
        day:     i,
        weekday: current.format('ddd'),
        // future = null (grey), past with no record = absent
        status:  isFuture ? null : (record?.status ?? 'absent'),
        advance: record?.advance_amount || 0,
        remark:  record?.remark || null,
        // keep raw record id so table can reference it
        id:      record?.id || null,
      })
    }

    return days
  })

  // ── Table rows — derived from calendarDays (NOT rawAttendance) ──
  // This ensures table and calendar always show the same data
  const tableRows = computed(() =>
    calendarDays.value.filter(d => d.status !== null) // exclude future
  )

  // ── Summary — derived from calendarDays ──
  const summary = computed(() => {
    if (!employee.value) return null

    const markedDays  = calendarDays.value.filter(d => d.status !== null)
    const presentDays = markedDays.filter(d => d.status === 'present').length
    const absentDays  = markedDays.filter(d => d.status === 'absent').length
    const advance     = markedDays.reduce((sum, d) => sum + (d.advance || 0), 0)
    const gross       = presentDays * (employee.value.salary || 0)
    const net         = gross - advance

    return { presentDays, absentDays, advance, gross, net }
  })

  // ── Attendance rate — derived from summary ──
  const attendanceRate = computed(() => {
    if (!summary.value) return 0
    const total = summary.value.presentDays + summary.value.absentDays
    return total > 0
      ? Math.round((summary.value.presentDays / total) * 100)
      : 0
  })

  const rateColor = computed(() => {
    if (attendanceRate.value >= 80) return '#4CAF50'
    if (attendanceRate.value >= 50) return '#FF9800'
    return '#F44336'
  })

  const monthLabel = computed(() =>
    dayjs(`${month.value}-01`).format('MMMM YYYY')
  )

  // ── Load data ──
  const loadReport = async (empId?: string) => {
    const id = empId || (route.params.id as string)
    if (!id || loading.value) return

    loading.value = true
    try {
      employee.value = await $pb.collection('employees').getOne(id)

      const start = `${month.value}-01`
      const end   = dayjs(start).endOf('month').format('YYYY-MM-DD')

      rawAttendance.value = await $pb.collection('attendance').getFullList({
        filter: `employee="${id}" && date >= "${start}" && date <= "${end}"`,
        sort:   'date',
      })
    } finally {
      loading.value = false
    }
  }

  // Re-fetch when month changes
  watch(month, () => loadReport())

  return {
    // state
    month,
    loading,
    employee,
    rawAttendance,

    // computed — all derived from same calendarDays source
    calendarDays,
    tableRows,
    summary,
    attendanceRate,
    rateColor,
    monthLabel,

    // actions
    loadReport,
  }
}