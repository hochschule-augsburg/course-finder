import { Client, InvalidCredentialsError } from 'ldapts'

import { prisma } from '../../../prisma'
import { AuthenticateType, LoginError, UserService } from '../UserService'
import { resultSpec as userDataSpec } from './UserDataSpec'

export class UserServiceLdap implements UserService {
  baseDn: string
  client: Client

  constructor() {
    if (!process.env.LDAP_URL || !process.env.LDAP_BASE_DN) {
      throw new Error(
        'LDAP_URL and LDAP_BASE_DN has to be set for LDAP to work',
      )
    }
    this.client = new Client({
      connectTimeout: 5000,
      strictDN: true,
      timeout: 0,
      tlsOptions: {
        minVersion: 'TLSv1.2',
      },
      url: process.env.LDAP_URL,
    })
    this.baseDn = process.env.LDAP_BASE_DN
  }

  async authenticate(
    username: string,
    password: string,
  ): Promise<AuthenticateType> {
    try {
      await this.client.bind(`uid=${username},${this.baseDn}`, password)
      const data = userDataSpec.parse(
        (await this.client.search(`uid=${username},${this.baseDn}`))
          .searchEntries[0],
      )
      switch (data.type) {
        case 'Student':
          await prisma.student.upsert({
            create: {
              ...{ ...data, type: undefined },
              faculty: { connect: { name: data.facultyName } },
              facultyName: undefined,
            },
            update: {
              ...{ ...data, type: undefined },
              faculty: { connect: { name: data.facultyName } },
              facultyName: undefined,
            },
            where: { email: data.email },
          })
          break
        case 'Professor':
          await prisma.prof.upsert({
            create: {
              ...{ ...data, type: undefined },
              faculty: { connect: { name: data.facultyName } },
              facultyName: undefined,
            },
            update: {
              ...{ ...data, type: undefined },
              faculty: { connect: { name: data.facultyName } },
              facultyName: undefined,
            },
            where: { email: data.email },
          })
          break
      }
      await this.client.unbind()

      const faculty = await prisma.faculty.findFirst({
        where: { name: data.facultyName },
      })
      if (!faculty) {
        return { error: LoginError.InvalidCredentials, ok: false }
      }

      return { data: { ...data, faculty: faculty.translatedName }, ok: true }
    } catch (e: unknown) {
      if (e instanceof InvalidCredentialsError) {
        return { error: LoginError.InvalidCredentials, ok: false }
      }
      console.error(e)
      return { error: LoginError.ServiceNotAvailable, ok: false }
    }
  }
}
