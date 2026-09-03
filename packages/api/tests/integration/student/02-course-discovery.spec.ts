import { afterAll, beforeEach, describe, expect, it } from 'vitest'

import {
  seedAppConf,
  seedCourse,
  seedOfferedCourse,
  seedPhase,
  seedStudent,
} from '../harness/factories.ts'
import {
  createPublicCaller,
  createStudentCaller,
} from '../harness/testClient.ts'
import { cleanDatabase, disconnectDatabase, prisma } from '../harness/testDb.ts'

describe('Course Discovery & Information (student.md §2, §3.1)', () => {
  beforeEach(async () => {
    await cleanDatabase()
    await seedAppConf({ maxCredits: 25 })
  })

  afterAll(async () => {
    await disconnectDatabase()
  })

  describe('Course Catalog (course.getCourses)', () => {
    it('should return published courses and filter out unpublished courses', async () => {
      await seedCourse({
        creditPoints: 5,
        moduleCode: 'PUB101',
        published: true,
        semesterHours: 4,
        title: { de: 'Veröffentlichtes Fach', en: 'Published Course' },
      })
      await seedCourse({
        moduleCode: 'DRAFT101',
        published: false,
        title: { de: 'Entwurf Fach', en: 'Draft Course' },
      })

      const publicCaller = createPublicCaller()
      const courses = await publicCaller.course.getCourses()

      const codes = courses.map((c) => c.moduleCode)
      expect(codes).toContain('PUB101')
      expect(codes).not.toContain('DRAFT101')
    })
  })

  describe('Active Phase Detection (course.getCurrentPhase)', () => {
    it('should return current phase when phase is OPEN, CLOSED, or DRAWING', async () => {
      const student = await seedStudent({ username: 'eva' })
      const caller = createStudentCaller({
        ...student.user,
        Student: student.student,
      })

      // 1. When NOT_STARTED -> returns null
      const phaseNotStarted = await seedPhase('NOT_STARTED')
      let currentPhase = await caller.course.getCurrentPhase()
      expect(currentPhase).toBeNull()

      // 2. When OPEN -> returns phase
      await prisma.enrollphase.update({
        data: { state: 'OPEN' },
        where: { id: phaseNotStarted.id },
      })
      currentPhase = await caller.course.getCurrentPhase()
      expect(currentPhase?.id).toBe(phaseNotStarted.id)
      expect(currentPhase?.state).toBe('OPEN')

      // 3. When CLOSED -> returns phase
      await prisma.enrollphase.update({
        data: { state: 'CLOSED' },
        where: { id: phaseNotStarted.id },
      })
      currentPhase = await caller.course.getCurrentPhase()
      expect(currentPhase?.id).toBe(phaseNotStarted.id)
      expect(currentPhase?.state).toBe('CLOSED')

      // 4. When DRAWING -> returns phase
      await prisma.enrollphase.update({
        data: { state: 'DRAWING' },
        where: { id: phaseNotStarted.id },
      })
      currentPhase = await caller.course.getCurrentPhase()
      expect(currentPhase?.id).toBe(phaseNotStarted.id)
      expect(currentPhase?.state).toBe('DRAWING')

      // 5. When FINISHED -> returns null
      await prisma.enrollphase.update({
        data: { state: 'FINISHED' },
        where: { id: phaseNotStarted.id },
      })
      currentPhase = await caller.course.getCurrentPhase()
      expect(currentPhase).toBeNull()
    })
  })

  describe('Offered Courses & Field of Study Scoping (course.getOfferedCourses)', () => {
    it('should only return offered courses applicable to the student field of study', async () => {
      const infStudent = await seedStudent({
        fieldOfStudy: 'Informatik (Bachelor)',
        username: 'inf_frank',
      })
      const wiStudent = await seedStudent({
        fieldOfStudy: 'Wirtschaftsinformatik (Bachelor)',
        username: 'wi_grace',
      })

      const phase = await seedPhase('OPEN')

      await seedCourse({ moduleCode: 'INF_ONLY', published: true })
      await seedCourse({ moduleCode: 'WI_ONLY', published: true })
      await seedCourse({ moduleCode: 'COMMON_COURSE', published: true })

      await seedOfferedCourse(phase.id, 'INF_ONLY', {
        for: ['Informatik (Bachelor)'],
      })
      await seedOfferedCourse(phase.id, 'WI_ONLY', {
        for: ['Wirtschaftsinformatik (Bachelor)'],
      })
      await seedOfferedCourse(phase.id, 'COMMON_COURSE', {
        for: ['Informatik (Bachelor)', 'Wirtschaftsinformatik (Bachelor)'],
      })

      const infCaller = createStudentCaller({
        ...infStudent.user,
        Student: infStudent.student,
      })
      const wiCaller = createStudentCaller({
        ...wiStudent.user,
        Student: wiStudent.student,
      })

      const infCourses = await infCaller.course.getOfferedCourses({
        phaseId: phase.id,
      })
      const wiCourses = await wiCaller.course.getOfferedCourses({
        phaseId: phase.id,
      })

      const infCodes = infCourses.map((c) => c.moduleCode)
      const wiCodes = wiCourses.map((c) => c.moduleCode)

      expect(infCodes).toEqual(['COMMON_COURSE', 'INF_ONLY'])
      expect(wiCodes).toEqual(['COMMON_COURSE', 'WI_ONLY'])
    })

    it('should hide minParticipants when hideMinParticipants is true', async () => {
      const student = await seedStudent({ username: 'heidi' })
      const caller = createStudentCaller({
        ...student.user,
        Student: student.student,
      })
      const phase = await seedPhase('OPEN')

      await seedCourse({ moduleCode: 'COURSE_VISIBLE', published: true })
      await seedCourse({ moduleCode: 'COURSE_HIDDEN', published: true })

      await seedOfferedCourse(phase.id, 'COURSE_VISIBLE', {
        for: ['Informatik (Bachelor)'],
        hideMinParticipants: false,
        minParticipants: 12,
      })
      await seedOfferedCourse(phase.id, 'COURSE_HIDDEN', {
        for: ['Informatik (Bachelor)'],
        hideMinParticipants: true,
        minParticipants: 12,
      })

      const offered = await caller.course.getOfferedCourses({
        phaseId: phase.id,
      })

      const visible = offered.find((c) => c.moduleCode === 'COURSE_VISIBLE')
      const hidden = offered.find((c) => c.moduleCode === 'COURSE_HIDDEN')

      expect(visible?.offeredCourse.minParticipants).toBe(12)
      expect(hidden?.offeredCourse.minParticipants).toBeNull()
    })
  })

  describe('Module Handbook PDF & App Config Details', () => {
    it('should return course syllabus PDF binary buffer', async () => {
      const pdfContent = Buffer.from('%PDF-1.4 Mock PDF Content')
      await seedCourse({
        moduleCode: 'PDF_COURSE',
        pdf: pdfContent,
        published: true,
      })

      const publicCaller = createPublicCaller()
      const result = await publicCaller.course.getPdf({
        moduleCode: 'PDF_COURSE',
      })

      expect(result.pdf).toBeDefined()
      expect(result.pdf).toBeInstanceOf(Int8Array)
    })

    it('should provide public app configuration but withhold admin-only contact lists', async () => {
      await seedAppConf({
        allowedEnrollmentEmails: ['secret@hs-augsburg.de'],
        hasMinFocuses: true,
        mailReceivers: ['admin1@hs-augsburg.de'],
        maxCredits: 28,
      })

      const student = await seedStudent({ username: 'ivan' })
      const caller = createStudentCaller({
        ...student.user,
        Student: student.student,
      })

      const conf = await caller.appConf.read()

      expect(conf?.maxCredits).toBe(28)
      expect(conf?.hasMinFocuses).toBe(true)
      // Confidential fields must not be exposed to students
      expect(conf).toBeDefined()
      expect('allowedEnrollmentEmails' in (conf ?? {})).toBe(false)
      expect('mailReceivers' in (conf ?? {})).toBe(false)
    })
  })
})
