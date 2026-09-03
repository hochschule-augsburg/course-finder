import { afterAll, beforeEach, describe, expect, it } from 'vitest'

import { seedAppConf, seedStudent } from '../harness/factories.ts'
import {
  createMockFastifyReply,
  createPublicCaller,
  createStudentCaller,
} from '../harness/testClient.ts'
import { cleanDatabase, disconnectDatabase, prisma } from '../harness/testDb.ts'

describe('Student Auth Lifecycle & Eligibility (student.md §1.4, §1.5)', () => {
  beforeEach(async () => {
    await cleanDatabase()
    await seedAppConf()
  })

  afterAll(async () => {
    await disconnectDatabase()
  })

  describe('Login & Session Management', () => {
    it('should successfully log in with valid credentials and issue JWT cookie', async () => {
      const { password, user } = await seedStudent({
        password: 'securePassword123!',
        username: 'alice',
      })

      const replyRecorder = createMockFastifyReply()
      const publicCaller = createPublicCaller(replyRecorder)

      const loginResult = await publicCaller.auth.login({
        password,
        username: user.username,
      })

      expect(typeof loginResult).toBe('object')
      if (typeof loginResult === 'object') {
        expect(loginResult.username).toBe('alice')
        expect(loginResult.type).toBe('Student')
      }

      // Verify JWT cookie was issued
      expect(replyRecorder.jwtSignMock).toHaveBeenCalled()
      expect(replyRecorder.setCookieMock).toHaveBeenCalledWith(
        'cf-token',
        expect.any(String),
        expect.objectContaining({
          httpOnly: true,
          path: '/',
        }),
      )
    })

    it('should reject login with invalid credentials', async () => {
      await seedStudent({
        password: 'correctPassword',
        username: 'bob',
      })

      const publicCaller = createPublicCaller()
      const result = await publicCaller.auth.login({
        password: 'wrongPassword',
        username: 'bob',
      })

      expect(result).toBe('invalid-credentials')
    })

    it('should return already-logged-in if user is already authenticated', async () => {
      const { student, user } = await seedStudent({ username: 'charlie' })
      const studentCaller = createStudentCaller({ ...user, Student: student })

      const result = await studentCaller.auth.login({
        password: 'anyPassword',
        username: 'charlie',
      })

      expect(result).toBe('already-logged-in')
    })

    it('should clear authentication cookie on logout', async () => {
      const { student, user } = await seedStudent({ username: 'diana' })
      const replyRecorder = createMockFastifyReply()
      const studentCaller = createStudentCaller(
        { ...user, Student: student },
        replyRecorder,
      )

      await studentCaller.auth.logout()

      expect(replyRecorder.clearCookieMock).toHaveBeenCalledWith(
        'cf-token',
        expect.objectContaining({
          httpOnly: true,
          path: '/',
        }),
      )
    })
  })

  describe('Two-Factor Authentication (2FA) Workflow', () => {
    it('should require 2FA and validate generated TOTP', async () => {
      const { password, user } = await seedStudent({
        password: 'studentPassword',
        twoFA: true,
        username: 'twoFaUser',
      })

      const publicCaller = createPublicCaller()

      // Step 1: Login triggers 2FA
      const loginResult = await publicCaller.auth.login({
        password,
        username: user.username,
      })
      expect(loginResult).toBe('two-fa-required')

      // Verify OTP was stored in DB
      const updatedUser = await prisma.user.findUnique({
        where: { username: user.username },
      })
      expect(updatedUser?.otp).toBeDefined()
      const otpData = updatedUser?.otp as { expires: number; otp: string }
      expect(otpData.otp).toHaveLength(6)

      // Step 2: Submit wrong code
      const wrongCodeResult = await publicCaller.auth.twoFA({
        otp: '000000',
        username: user.username,
      })
      expect(wrongCodeResult).toBe('code-invalid')

      // Step 3: Submit expired code simulation
      await prisma.user.update({
        data: { otp: { expires: Date.now() - 5000, otp: otpData.otp } },
        where: { username: user.username },
      })
      const expiredResult = await publicCaller.auth.twoFA({
        otp: otpData.otp,
        username: user.username,
      })
      expect(expiredResult).toBe('code-expired')

      // Step 4: Submit valid code
      await prisma.user.update({
        data: { otp: { expires: Date.now() + 60000, otp: '123456' } },
        where: { username: user.username },
      })
      const validReplyRecorder = createMockFastifyReply()
      const publicCallerWithReply = createPublicCaller(validReplyRecorder)

      const successResult = await publicCallerWithReply.auth.twoFA({
        otp: '123456',
        username: user.username,
      })
      expect(typeof successResult).toBe('object')
      if (typeof successResult === 'object') {
        expect(successResult?.username).toBe('twoFaUser')
      }
      expect(validReplyRecorder.jwtSignMock).toHaveBeenCalled()
      expect(validReplyRecorder.setCookieMock).toHaveBeenCalledWith(
        'cf-token',
        expect.any(String),
        expect.anything(),
      )
    })
  })

  describe('Eligibility Verification (mayEnroll) & getUser', () => {
    it('should update lastActive timestamp when getUser is called', async () => {
      const { student, user } = await seedStudent({ username: 'activeStudent' })
      const oldLastActive = new Date(Date.now() - 100000)
      await prisma.user.update({
        data: { lastActive: oldLastActive },
        where: { username: user.username },
      })

      const studentCaller = createStudentCaller({ ...user, Student: student })
      const activeUser = await studentCaller.auth.getUser()

      expect(activeUser?.username).toBe('activeStudent')
      // Wait for fire-and-forget update
      await new Promise((resolve) => setTimeout(resolve, 50))
      const freshUser = await prisma.user.findUnique({
        where: { username: user.username },
      })
      expect(freshUser!.lastActive.getTime()).toBeGreaterThan(
        oldLastActive.getTime(),
      )
    })

    it('should correctly evaluate eligibility for Bachelor Term 1 vs Term 2 vs Master', async () => {
      // 1. Bachelor Informatik Term 1: ineligible
      const s1 = await seedStudent({
        fieldOfStudy: 'Informatik (Bachelor)',
        finalDegree: 'Bachelor',
        term: 1,
        username: 'infTerm1',
      })
      const caller1 = createStudentCaller({ ...s1.user, Student: s1.student })
      const user1 = await caller1.auth.getUser()
      expect(user1?.Student?.mayEnroll).toBe(false)

      // 2. Bachelor Informatik Term 2: eligible
      const s2 = await seedStudent({
        fieldOfStudy: 'Informatik (Bachelor)',
        finalDegree: 'Bachelor',
        term: 2,
        username: 'infTerm2',
      })
      const caller2 = createStudentCaller({ ...s2.user, Student: s2.student })
      const user2 = await caller2.auth.getUser()
      expect(user2?.Student?.mayEnroll).toBe(true)

      // 3. Master student: always eligible regardless of term
      const s3 = await seedStudent({
        fieldOfStudy: 'Informatik (Master)',
        finalDegree: 'Master',
        term: 1,
        username: 'infMaster',
      })
      const caller3 = createStudentCaller({ ...s3.user, Student: s3.student })
      const user3 = await caller3.auth.getUser()
      expect(user3?.Student?.mayEnroll).toBe(true)

      // 4. Whitelisted email overrides term restriction
      await seedAppConf({
        allowedEnrollmentEmails: ['infterm1@hs-augsburg.de'],
      })
      const user1Whitelisted = await caller1.auth.getUser()
      expect(user1Whitelisted?.Student?.mayEnroll).toBe(true)
    })
  })

  describe('Role-Based Access Control (RBAC)', () => {
    it('should throw UNAUTHORIZED when unauthenticated client calls studentOnlyProcedure', async () => {
      const publicCaller = createPublicCaller()

      await expect(() =>
        publicCaller.course.getCurrentPhase(),
      ).rejects.toThrowError(
        expect.objectContaining({
          code: 'UNAUTHORIZED',
        }),
      )
    })
  })
})
