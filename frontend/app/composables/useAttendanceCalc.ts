
export function useAttendanceCalc() {
const calculate = ({
salary,
attendance,
totalDays
}: {
salary: number
attendance: any[]
totalDays: number
}) => {
const perDay = salary / totalDays


let presentDays = 0
let advance = 0


attendance.forEach(a => {
if (a.status === 'present') presentDays++
if (a.advance_amount) advance += a.advance_amount
})


const gross = presentDays * perDay
const net = gross - advance


return {
presentDays,
absentDays: totalDays - presentDays,
gross,
advance,
net
}
}


return { calculate }
}