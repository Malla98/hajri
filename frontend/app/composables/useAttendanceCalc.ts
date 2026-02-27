export function useAttendanceCalc() {
  const calculate = ({
    perDaySalary,
    attendance,
  }: {
    perDaySalary: number
    attendance: any[]
  }) => {
    let presentDays = 0
    let absentDays = 0
    let advance = 0

    attendance.forEach((a) => {
      if (a.status === 'present') presentDays++
      else absentDays++

      advance += Number(a.advance_amount || 0)
    })

    const gross = presentDays * perDaySalary
    const net = gross - advance

    return {
      presentDays,
      absentDays,
      gross,
      advance,
      net,
    }
  }

  return { calculate }
}