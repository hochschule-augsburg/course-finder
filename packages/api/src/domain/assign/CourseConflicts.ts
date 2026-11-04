import type { CourseAppointmentsJson } from '../../prisma/PrismaTypes.ts'

const day = 24 * 60 * 60 * 1000
const week = 7 * day
const monday = Date.UTC(1970, 0, 5)
const berlin = new Intl.DateTimeFormat('en-GB', {
  day: '2-digit',
  hour: '2-digit',
  hourCycle: 'h23',
  minute: '2-digit',
  month: '2-digit',
  second: '2-digit',
  timeZone: 'Europe/Berlin',
  year: 'numeric',
})

type Interval = {
  absolute?: { from: number; to: number }
  from: number
  to: number
}

function dateParts(value: string) {
  const zoned = /(?:Z|[+-]\d{2}:\d{2})$/.test(value)
  const date = new Date(zoned ? value : `${value}Z`)
  if (!Number.isFinite(date.getTime())) {
    throw new Error(`Invalid course appointment date: ${value}`)
  }

  if (!zoned) {
    return { wallTime: date.getTime() }
  }

  const parts = berlin.formatToParts(date)
  const part = (name: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((entry) => entry.type === name)?.value)
  const wallTime = Date.UTC(
    part('year'),
    part('month') - 1,
    part('day'),
    part('hour'),
    part('minute'),
    part('second'),
    date.getUTCMilliseconds(),
  )
  return { absolute: date.getTime(), wallTime }
}

function intervals(appointments: CourseAppointmentsJson<string>): Interval[] {
  return appointments.dates.map(({ from, to }) => {
    const start = dateParts(from)
    const end = dateParts(to)
    let intervalStart = start.wallTime
    let intervalEnd = end.wallTime

    if (appointments.type === 'block') {
      intervalStart = Math.floor(intervalStart / day) * day
      intervalEnd = (Math.floor(intervalEnd / day) + 1) * day
    }

    if (intervalEnd <= intervalStart) {
      throw new Error(`Invalid course appointment interval: ${from} - ${to}`)
    }

    if (appointments.type === 'weekly') {
      const weekday = new Date(intervalStart).getUTCDay()
      const daysFromMonday = (weekday + 6) % 7
      const startOfDay = Math.floor(intervalStart / day) * day
      const weeklyStart = daysFromMonday * day + intervalStart - startOfDay
      return {
        from: weeklyStart,
        to: weeklyStart + (intervalEnd - intervalStart),
      }
    }

    return {
      absolute:
        appointments.type === 'irregular' &&
        start.absolute !== undefined &&
        end.absolute !== undefined
          ? { from: start.absolute, to: end.absolute }
          : undefined,
      from: intervalStart,
      to: intervalEnd,
    }
  })
}

function overlaps(a: Interval, b: Interval) {
  return a.from < b.to && b.from < a.to
}

function recurringOverlap(recurring: Interval, fixed: Interval) {
  const offset =
    Math.floor((fixed.from - monday - recurring.from) / week) * week + monday
  return [-week, 0, week].some((shift) =>
    overlaps(
      {
        from: recurring.from + offset + shift,
        to: recurring.to + offset + shift,
      },
      fixed,
    ),
  )
}

export function coursesConflict(
  a: CourseAppointmentsJson<string> | undefined,
  b: CourseAppointmentsJson<string> | undefined,
) {
  if (!a?.dates.length || !b?.dates.length) {
    return false
  }

  const first = intervals(a)
  const second = intervals(b)

  return first.some((left) =>
    second.some((right) => {
      if (
        a.type === 'irregular' &&
        b.type === 'irregular' &&
        left.absolute &&
        right.absolute
      ) {
        return overlaps(left.absolute, right.absolute)
      }
      if (a.type === 'weekly' && b.type === 'weekly') {
        return [-week, 0, week].some((shift) =>
          overlaps(left, {
            from: right.from + shift,
            to: right.to + shift,
          }),
        )
      }
      if (a.type === 'weekly') {
        return recurringOverlap(left, right)
      }
      if (b.type === 'weekly') {
        return recurringOverlap(right, left)
      }
      return overlaps(left, right)
    }),
  )
}
