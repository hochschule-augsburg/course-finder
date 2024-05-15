import { groupBy, isEqual, range, sumBy } from 'lodash-es'

import type { AssignmentStudentController } from '../../../src/domain/assign/AssignmentControllers'

import {
  normalizeChoices,
  shuffleFirsts,
} from '../../../src/domain/assign/AssignmentUtils'

describe('AssignmentUtils', () => {
  describe('shuffleFirsts', () => {
    it.each([0, 1])(
      'should return the same array when length is %i',
      (length) => {
        const students = range(length).map((i) => ({
          choices: [{ points: 10 }],
          username: i.toString(),
        }))
        // @ts-ignore
        const shuffled = shuffleFirsts(students.slice())
        expect(isEqual(shuffled, students)).toBe(true)
      },
    )

    it('should shuffle students with the same maximum points', () => {
      const NUM_FIRSTS = 9
      const students = [
        ...range(NUM_FIRSTS).map((i) => ({
          choices: [{ points: 10 }],
          username: i.toString(),
        })),
        { choices: [{ points: 5 }] },
      ] as AssignmentStudentController[]
      const result = shuffleFirsts(students.slice())
      expect(
        isEqual(
          result.map((e) => e.username),
          range(NUM_FIRSTS),
        ),
      ).toBe(false)
      expect(result.length).toEqual(students.length)
    })
  })

  describe('normalizeChoices', () => {
    it('should keep the total points of all choices to 1000', () => {
      const phase = [
        {
          StudentChoice: [{ points: 200 }, { points: 300 }],
          phase: 'phase1',
        },
        {
          StudentChoice: [{ points: 500 }, { points: 500 }],
          phase: 'phase2',
        },
      ]
      // @ts-ignore
      const result = normalizeChoices(phase)
      expect(sumBy(result[0].StudentChoice, 'points')).toEqual(1000)
      expect(sumBy(result[1].StudentChoice, 'points')).toEqual(1000)
    })
    it('should keep the total points of all choices to 1000', () => {
      const choices = [
        { StudentChoice: [{ points: 1000 }, { points: 10000 }], username: '1' },
        { StudentChoice: [{ points: 1 }], username: '2' },
        { StudentChoice: [{ points: 400 }, { points: 300 }], username: '3' },
        // TODO would need validation
        {
          StudentChoice: [{ points: 3 }, { points: 2 }, { points: 1 }],
          username: 'first-second-third',
        },
      ]
      // @ts-ignore
      const normalized = normalizeChoices(choices)
      Object.values(groupBy(normalized, (choice) => choice.username)).forEach(
        (choices) => {
          expect(sumBy(choices, (e) => sumBy(e.StudentChoice, 'points'))).toBe(
            1000,
          )
        },
      )
      expect(normalized).toEqual(
        (
          [
            { StudentChoice: [{ points: 91 }, { points: 909 }], username: '1' },
            { StudentChoice: [{ points: 1000 }], username: '2' },
            {
              StudentChoice: [{ points: 571 }, { points: 429 }],
              username: '3',
            },
            {
              StudentChoice: [
                { points: 500 },
                { points: 333 },
                { points: 167 },
              ],
              username: 'first-second-third',
            },
          ] satisfies typeof choices
        ).map((e) => expect.objectContaining(e)),
      )
    })
  })
})
