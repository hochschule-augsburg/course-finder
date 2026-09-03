import { flushPromises } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import { defineComponent } from 'vue'
import { ModalDialog } from '@/components/DialogService'
import EnrollCheckbox from '@/components/subject/EnrollCheckbox.vue'
import { useCoursesStore } from '@/stores/CoursesStore'
import { useEnrollmentStore } from '@/stores/EnrollmentStore'
import { useUserStore } from '@/stores/UserStore'
import { defaultMockUser, trpcMock } from '../support/browserSetup'
import { renderWithPlugins } from '../support/renderHelper'
import {
  createMockEnrolledCourse,
  createMockPhase,
  createMockSubject,
} from '../fixtures/registrationFixtures'

const CheckboxHarness = defineComponent({
  components: { EnrollCheckbox, ModalDialog },
  props: {
    subject: {
      type: Object,
      required: true,
    },
    setupStores: {
      type: Function,
      default: undefined,
    },
  },
  setup(props) {
    props.setupStores?.()
    return {}
  },
  template: `
    <div>
      <EnrollCheckbox :subject="subject" />
      <ModalDialog />
    </div>
  `,
})

describe('EnrollCheckbox.vue (Vitest Browser Mode)', () => {
  async function setupCheckbox(options: {
    mayEnroll?: boolean
    enrolledPoints?: number
    isEnrolled?: boolean
    phaseState?: 'OPEN' | 'CLOSED'
    externalRegistration?: boolean
  } = {}) {
    const subject = createMockSubject('CS101', 'Machine Learning', 'Machine Learning', {
      offeredCourse: {
        externalRegistration: options.externalRegistration ?? false,
      } as any,
    })

    const mockPhase = createMockPhase({
      state: options.phaseState ?? 'OPEN',
    })

    trpcMock.auth.getUser.query.mockResolvedValue({
      ...defaultMockUser,
      Student: {
        ...defaultMockUser.Student,
        mayEnroll: options.mayEnroll ?? true,
      },
    } as any)

    trpcMock.course.getCurrentPhase.query.mockResolvedValue(mockPhase as any)
    trpcMock.course.getPhaseCourses.query.mockResolvedValue([subject] as any)
    trpcMock.course.getCourses.query.mockResolvedValue([subject] as any)

    let enrollmentStoreRef: ReturnType<typeof useEnrollmentStore>

    const { screen } = renderWithPlugins(CheckboxHarness, {
      props: {
        subject,
        setupStores: () => {
          const userStore = useUserStore()
          const coursesStore = useCoursesStore()
          const enrollmentStore = useEnrollmentStore()
          enrollmentStoreRef = enrollmentStore

          userStore.user = {
            ...defaultMockUser,
            Student: {
              ...defaultMockUser.Student,
              mayEnroll: options.mayEnroll ?? true,
            },
          } as any

          coursesStore.subjects = [subject]
          coursesStore.currentPhase = mockPhase

          if (options.isEnrolled) {
            enrollmentStore.enrolledSubjects = [
              createMockEnrolledCourse(
                'CS101',
                options.enrolledPoints ?? 0,
                'prio',
                'Machine Learning',
              ),
            ]
          } else {
            enrollmentStore.enrolledSubjects = []
          }
        },
      },
    })

    await flushPromises()

    return { enrollmentStore: enrollmentStoreRef!, screen, subject }
  }

  it('selects course when not currently enrolled', async () => {
    const { enrollmentStore, screen } = await setupCheckbox({ isEnrolled: false })

    console.log('DOM CONTENT:', document.body.innerHTML)

    const addSpy = vi.fn()
    enrollmentStore.addSubject = addSpy

    const checkbox = screen.getByTestId('enroll-checkbox')
    await checkbox.click()

    expect(addSpy).toHaveBeenCalledWith('CS101')
  })

  it('deselects directly when enrolled with 0 points', async () => {
    const { enrollmentStore, screen } = await setupCheckbox({ isEnrolled: true, enrolledPoints: 0 })

    const removeSpy = vi.fn()
    enrollmentStore.removeSubject = removeSpy

    const checkbox = screen.getByTestId('enroll-checkbox')
    await checkbox.click()

    expect(removeSpy).toHaveBeenCalledWith('CS101')
  })

  it('shows confirmation dialog when deselecting course with assigned points', async () => {
    const { enrollmentStore, screen } = await setupCheckbox({ isEnrolled: true, enrolledPoints: 50 })

    const removeSpy = vi.fn()
    enrollmentStore.removeSubject = removeSpy

    const checkbox = screen.getByTestId('enroll-checkbox')
    await checkbox.click()

    // Confirmation dialog appears
    await expect.element(screen.getByText('Die vergebenen Punkte gehen verloren!')).toBeInTheDocument()

    // Click confirm
    const confirmBtn = screen.getByRole('button', { name: 'Bestätigen' })
    await confirmBtn.click()

    expect(removeSpy).toHaveBeenCalledWith('CS101')
  })

  it('displays lock icon when student is not eligible (mayEnroll: false)', async () => {
    const { screen } = await setupCheckbox({ mayEnroll: false })

    const lockIcon = screen.getByTestId('enroll-lock-ineligible')
    await expect.element(lockIcon).toBeInTheDocument()
  })

  it('shows external registration icon for external courses', async () => {
    const { screen } = await setupCheckbox({ externalRegistration: true })

    const extIcon = screen.getByTestId('enroll-external-badge')
    await expect.element(extIcon).toBeInTheDocument()
  })

  it('renders disabled checkbox when phase is CLOSED', async () => {
    const { screen } = await setupCheckbox({ phaseState: 'CLOSED' })

    const disabledCheckbox = screen.getByTestId('enroll-checkbox-disabled')
    await expect.element(disabledCheckbox).toBeInTheDocument()
  })
})
