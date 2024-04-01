import { prisma } from '../../prisma'
import { AuthenticateType, LoginError, UserService } from './UserService'

export class UserServiceMock implements UserService {
  async authenticate(
    username: string,
    password: string,
  ): Promise<AuthenticateType> {
    const success = username === password
    const [student, prof] = await Promise.all([
      prisma.student.findFirst({ where: { username } }),
      prisma.prof.findFirst({ where: { username } }),
    ])
    if (student && success) {
      const faculty = await prisma.faculty.findFirst({
        where: { name: student.facultyName },
      })
      if (!faculty || student.birthDate === null) {
        return { error: LoginError.InvalidCredentials, ok: false }
      }
      return {
        // @ts-expect-error not worth fixing for mock
        data: { ...student, faculty: faculty.translatedName, type: 'Student' },
        ok: true,
      }
    }
    if (prof && success) {
      const faculty = await prisma.faculty.findFirst({
        where: { name: prof.facultyName },
      })
      if (!faculty) {
        return { error: LoginError.InvalidCredentials, ok: false }
      }
      return {
        data: { ...prof, faculty: faculty.translatedName, type: 'Professor' },
        ok: true,
      }
    }
    return { error: LoginError.InvalidCredentials, ok: false }
  }
}
