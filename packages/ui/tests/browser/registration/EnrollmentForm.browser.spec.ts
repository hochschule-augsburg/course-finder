import { flushPromises } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import { defineComponent, ref } from 'vue'
import EnrollmentForm from '@/components/EnrollmentForm.vue'
import { useAppConfStore } from '@/stores/AppConfStore'
import { useCoursesStore } from '@/stores/CoursesStore'
import { useEnrollmentStore } from '@/stores/EnrollmentStore'
import { trpcMock } from '../support/browserSetup'
import { renderWithPlugins } from '../support/renderHelper'
import {
  createMockEnrolledCourse,
  createMockPhase,
  createMockSubject,
} from '../fixtures/registrationFixtures'

const TestHarness = defineComponent({
  components: { EnrollmentForm },
  setup() {
    const isVisible = ref(false)
    return { isVisible }
  },
  template: `
    <div>
      <button id="open-form" @click="isVisible = true">Open</button>
      <EnrollmentForm v-model:visible="isVisible" />
    </div>
  `,
})

describe('EnrollmentForm.vue (Vitest Browser Mode)', () => {
  let appConfStore: ReturnType<typeof useAppConfStore>
  let coursesStore: ReturnType<typeof useCoursesStore>
  let enrollmentStore: ReturnType<typeof useEnrollmentStore>

  async function setupForm(options: {
    phaseState?: 'OPEN' | 'CLOSED'
    courses?: ReturnType<typeof createMockEnrolledCourse>[]
    creditsNeeded?: number
    maxCredits?: number
  } = {}) {
    const defaultCourses = options.courses ?? [
      createMockEnrolledCourse('CS101', 0, 'prio', 'Machine Learning'),
      createMockEnrolledCourse('CS102', 0, 'prio', 'Web Security'),
    ]

    const mockSubjects = [
      createMockSubject('CS101', 'Machine Learning', 'Machine Learning'),
      createMockSubject('CS102', 'Web Security', 'Web Security'),
    ]

    trpcMock.course.getPhaseCourses.query.mockResolvedValue(mockSubjects as any)
    trpcMock.course.getCourses.query.mockResolvedValue(mockSubjects as any)

    trpcMock.enroll.list.query.mockResolvedValue({
      choices: defaultCourses.map((c) => ({
        moduleCode: c.moduleCode,
        points: c.points,
      })),
      creditsNeeded: options.creditsNeeded ?? 10,
    })

    const { screen, pinia } = renderWithPlugins(TestHarness)

    appConfStore = useAppConfStore(pinia)
    coursesStore = useCoursesStore(pinia)
    enrollmentStore = useEnrollmentStore(pinia)

    appConfStore.conf = { maxCredits: options.maxCredits ?? 30 } as any
    coursesStore.subjects = mockSubjects

    coursesStore.currentPhase = createMockPhase({
      state: options.phaseState ?? 'OPEN',
    })

    await flushPromises()

    enrollmentStore.enrolledSubjects = defaultCourses
    enrollmentStore.creditsNeeded = options.creditsNeeded ?? 10

    await screen.getByRole('button', { name: 'Open' }).click()
    await expect.element(screen.getByText('Priorisierung', { exact: true })).toBeInTheDocument()

    return { screen }
  }

  it('renders dialog with enrolled courses and credits input', async () => {
    const { screen } = await setupForm()

    await expect.element(screen.getByText('Machine Learning').first()).toBeInTheDocument()
    await expect.element(screen.getByText('Web Security').first()).toBeInTheDocument()
  })

  it('shows error if submitting with points not summing to 100', async () => {
    const { screen } = await setupForm()

    const registerBtn = screen.getByRole('button', { name: 'Anmelden' })
    await registerBtn.click()

    await expect.element(screen.getByText('Insgesamt 100 Punkte vergeben!').first()).toBeInTheDocument()
  })

  it('autofills points equally for all priority courses', async () => {
    const { screen } = await setupForm()

    const autofillBtn = screen.getByRole('button', { name: 'Autofill' })
    await autofillBtn.click()

    const mlInput = screen.getByLabelText('Machine Learning')
    const wsInput = screen.getByLabelText('Web Security')

    await expect.element(mlInput).toHaveValue('50')
    await expect.element(wsInput).toHaveValue('50')
  })

  it('distributes 1 point to fallback and remainder to priority on autofill', async () => {
    const courses = [
      createMockEnrolledCourse('CS101', 0, 'prio', 'Machine Learning'),
      createMockEnrolledCourse('CS102', 0, 'fallback', 'Web Security'),
    ]
    const { screen } = await setupForm({ courses })

    const autofillBtn = screen.getByRole('button', { name: 'Autofill' })
    await autofillBtn.click()

    const mlInput = screen.getByLabelText('Machine Learning')
    const wsInput = screen.getByLabelText('Web Security')

    await expect.element(wsInput).toHaveValue('1')
    await expect.element(mlInput).toHaveValue('99')
  })

  it('submits valid enrollment and calls enrollmentStore.enroll', async () => {
    const { screen } = await setupForm()

    const enrollSpy = vi.fn().mockResolvedValue(undefined)
    enrollmentStore.enroll = enrollSpy

    const autofillBtn = screen.getByRole('button', { name: 'Autofill' })
    await autofillBtn.click()

    const registerBtn = screen.getByRole('button', { name: 'Anmelden' })
    await registerBtn.click()

    expect(enrollSpy).toHaveBeenCalledTimes(1)
    expect(enrollSpy).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ moduleCode: 'CS101', points: 50 }),
        expect.objectContaining({ moduleCode: 'CS102', points: 50 }),
      ]),
      10,
    )
  })

  it('disables register button when phase is not OPEN', async () => {
    const { screen } = await setupForm({ phaseState: 'CLOSED' })

    const registerBtn = screen.getByRole('button', { name: 'Anmelden' })
    await expect.element(registerBtn).toBeDisabled()
  })
})
