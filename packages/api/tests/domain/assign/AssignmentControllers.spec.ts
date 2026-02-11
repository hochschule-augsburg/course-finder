import type {
  StudentChoice,
  StudentPhase,
} from '../../../src/generated/prisma/client.js'

import { AssignmentStudentController } from '../../../src/domain/assign/AssignmentControllers'

describe('AssignmentStudentController', () => {
  let controller: AssignmentStudentController
  let phase: StudentPhase & { StudentChoice: StudentChoice[] }
  let offeredCourses: {
    Course: { creditPoints: number }
    moduleCode: string
  }[]

  beforeEach(() => {
    phase = {
      createdAt: new Date(),
      creditsNeeded: 6,
      phaseId: 0,
      StudentChoice: [
        {
          moduleCode: '1',
          phaseId: 0,
          points: 1000,
          username: '',
        },
      ],
      username: 'user1',
    }
    offeredCourses = [
      { Course: { creditPoints: 3 }, moduleCode: '1' },
      { Course: { creditPoints: 3 }, moduleCode: '2' },
    ]
    controller = new AssignmentStudentController(phase, offeredCourses)
  })

  it('should initialize with correct values', () => {
    expect(controller.choices).toEqual(phase.StudentChoice)
    expect(controller.gained).toEqual([])
    expect(controller.lost).toEqual([])
  })

  it('should gain a course', () => {
    controller.gainCourse('1')
    expect(controller.gained).toEqual([
      expect.objectContaining({ moduleCode: '1', points: 1000 }),
    ])
    expect(controller.choices).toEqual([])
  })

  it('should lose a course', () => {
    controller.looseCourse('1')
    expect(controller.lost).toEqual([
      expect.objectContaining({ moduleCode: '1', points: 1000 }),
    ])
    expect(controller.choices.length).toBe(0)
  })

  it('should cancel a course', () => {
    controller.gainCourse('1')
    controller.courseCanceled('1')
    expect(controller.lost).toEqual([
      expect.objectContaining({ moduleCode: '1', points: 1000 }),
    ])
    expect(controller.choices.length).toBe(0)
    expect(controller.gained.length).toBe(0)
  })

  it('should check if finished', () => {
    phase.StudentChoice.push({
      moduleCode: '2',
      phaseId: 0,
      points: 1,
      username: '',
    })
    controller = new AssignmentStudentController(phase, offeredCourses)
    expect(controller.isFinished()).toBe(false)
    controller.gainCourse('1')
    expect(controller.isFinished()).toBe(false)
    controller.gainCourse('2')
    expect(controller.isFinished()).toBe(true)
  })

  it('should return username', () => {
    expect(controller.username).toBe('user1')
  })
})
