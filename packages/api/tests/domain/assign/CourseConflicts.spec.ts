import type { CourseAppointmentsJson } from '../../../src/prisma/PrismaTypes'

import { coursesConflict } from '../../../src/domain/assign/CourseConflicts'

function appointment(
  type: CourseAppointmentsJson<string>['type'],
  from: string,
  to: string,
): CourseAppointmentsJson<string> {
  return { dates: [{ from, to }], type }
}

describe('coursesConflict', () => {
  it.each([
    [
      'weekly appointments on the same weekday',
      appointment('weekly', '2026-01-05T10:00:00', '2026-01-05T12:00:00'),
      appointment('weekly', '2026-01-12T11:00:00', '2026-01-12T13:00:00'),
      true,
    ],
    [
      'weekly appointments on different weekdays',
      appointment('weekly', '2026-01-05T10:00:00', '2026-01-05T12:00:00'),
      appointment('weekly', '2026-01-06T10:00:00', '2026-01-06T12:00:00'),
      false,
    ],
    [
      'adjacent weekly appointments',
      appointment('weekly', '2026-01-05T10:00:00', '2026-01-05T12:00:00'),
      appointment('weekly', '2026-01-05T12:00:00', '2026-01-05T14:00:00'),
      false,
    ],
    [
      'weekly and irregular appointments in Berlin local time',
      appointment('weekly', '2026-01-05T10:00:00', '2026-01-05T12:00:00'),
      appointment('irregular', '2026-07-06T08:30:00Z', '2026-07-06T09:30:00Z'),
      true,
    ],
    [
      'weekly and irregular appointments on different weekdays',
      appointment('weekly', '2026-01-05T10:00:00', '2026-01-05T12:00:00'),
      appointment('irregular', '2026-07-07T08:30:00Z', '2026-07-07T09:30:00Z'),
      false,
    ],
    [
      'weekly appointment within a block',
      appointment('weekly', '2026-01-05T10:00:00', '2026-01-05T12:00:00'),
      appointment(
        'block',
        '2026-07-06T00:00:00+02:00',
        '2026-07-06T08:00:00+02:00',
      ),
      true,
    ],
    [
      'weekly appointment outside a block',
      appointment('weekly', '2026-01-05T10:00:00', '2026-01-05T12:00:00'),
      appointment(
        'block',
        '2026-07-07T00:00:00+02:00',
        '2026-07-07T08:00:00+02:00',
      ),
      false,
    ],
    [
      'block includes its end date',
      appointment('block', '2026-07-06T00:00:00', '2026-07-07T00:00:00'),
      appointment(
        'irregular',
        '2026-07-07T22:00:00+02:00',
        '2026-07-07T23:00:00+02:00',
      ),
      true,
    ],
    [
      'adjacent blocks',
      appointment('block', '2026-07-06T00:00:00', '2026-07-06T12:00:00'),
      appointment('block', '2026-07-07T00:00:00', '2026-07-07T12:00:00'),
      false,
    ],
    [
      'overlapping irregular appointments',
      appointment('irregular', '2026-07-06T10:00:00Z', '2026-07-06T12:00:00Z'),
      appointment('irregular', '2026-07-06T11:00:00Z', '2026-07-06T13:00:00Z'),
      true,
    ],
    [
      'mixed local and offset irregular appointments',
      appointment('irregular', '2026-07-06T10:00:00', '2026-07-06T11:00:00'),
      appointment('irregular', '2026-07-06T08:30:00Z', '2026-07-06T09:30:00Z'),
      true,
    ],
    [
      'irregular appointments in the two different autumn DST hours',
      appointment(
        'irregular',
        '2026-10-25T02:00:00+02:00',
        '2026-10-25T02:30:00+02:00',
      ),
      appointment(
        'irregular',
        '2026-10-25T02:00:00+01:00',
        '2026-10-25T02:30:00+01:00',
      ),
      false,
    ],
    [
      'appointments without dates',
      appointment('weekly', '2026-01-05T10:00:00', '2026-01-05T12:00:00'),
      { dates: [], type: 'weekly' },
      false,
    ],
  ] satisfies [
    string,
    CourseAppointmentsJson<string>,
    CourseAppointmentsJson<string>,
    boolean,
  ][])('%s', (_, a, b, expected) => {
    expect(coursesConflict(a, b)).toBe(expected)
    expect(coursesConflict(b, a)).toBe(expected)
  })

  it('matches any appointment in the date lists', () => {
    expect(
      coursesConflict(
        appointment('weekly', '2026-01-05T10:00:00', '2026-01-05T12:00:00'),
        {
          dates: [
            { from: '2026-07-07T10:00:00', to: '2026-07-07T12:00:00' },
            { from: '2026-07-06T11:00:00', to: '2026-07-06T13:00:00' },
          ],
          type: 'irregular',
        },
      ),
    ).toBe(true)
  })

  it('treats missing appointment data as non-conflicting', () => {
    expect(
      coursesConflict(
        appointment('weekly', '2026-01-05T10:00:00', '2026-01-05T12:00:00'),
        undefined,
      ),
    ).toBe(false)
  })

  it('throws for invalid appointment intervals', () => {
    expect(() =>
      coursesConflict(
        appointment('weekly', '2026-01-05T10:00:00', '2026-01-05T12:00:00'),
        appointment('irregular', 'not-a-date', '2026-01-05T11:00:00'),
      ),
    ).toThrow('Invalid course appointment date')
    expect(() =>
      coursesConflict(
        appointment('weekly', '2026-01-05T10:00:00', '2026-01-05T12:00:00'),
        appointment('irregular', '2026-01-05T12:00:00', '2026-01-05T11:00:00'),
      ),
    ).toThrow('Invalid course appointment interval')
  })
})
