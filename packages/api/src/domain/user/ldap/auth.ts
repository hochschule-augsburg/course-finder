import { Client, InvalidCredentialsError } from 'ldapts'
import { once, pick } from 'lodash-es'
import { ZodError } from 'zod'

import { prisma } from '../../../prisma'
import { AuthResult } from '../UserService'
import {
  type ResultType as UserDataType,
  resultSpec as userDataSpec,
} from './UserDataSpec'

declare module 'lodash-es' {
  interface LoDashStatic {
    pick<T, K extends keyof T>(object: T, ...props: K[]): Pick<T, K>
  }
}

export async function pwdAuth(
  username: string,
  password: string,
): Promise<AuthResult> {
  const { baseDn, url } = getConfiguration()
  const client = new Client({
    connectTimeout: 1000,
    timeout: 1000,
    tlsOptions: {
      minVersion: 'TLSv1.2',
    },
    url,
  })

  let result: UserDataType
  try {
    await client.bind(`uid=${username},${baseDn}`, password)
    const searchEntries = (await client.search(`uid=${username},${baseDn}`))
      .searchEntries
    if (!searchEntries.length) {
      return undefined
    }
    result = userDataSpec.parse(searchEntries[0])
  } catch (e) {
    if (e instanceof InvalidCredentialsError || e instanceof ZodError) {
      return undefined
    }
    return 'service-not-available'
  }

  const user = await prisma.user.upsert({
    create: {
      ...(pick(result, Object.keys(prisma.user.fields)) as typeof result),
      Faculty: {
        connectOrCreate: {
          create: {
            name: result.facultyName,
            translatedName: { de: result.facultyName },
          },
          where: { name: result.facultyName },
        },
      },
      auth: {
        method: 'ldap',
      },
      facultyName: undefined,
    },
    include: { Faculty: true },
    update: {
      ...(pick(result, Object.keys(prisma.user.fields)) as typeof result),
      Faculty: {
        connectOrCreate: {
          create: {
            name: result.facultyName,
            translatedName: { de: result.facultyName },
          },
          where: { name: result.facultyName },
        },
      },
      auth: {
        method: 'ldap',
      },
      facultyName: undefined,
    },
    where: { username: result.username },
  })
  if (user.auth.twoFA) {
    return 'two-fa-required'
  }
  if (result.type === 'Student') {
    const student = await prisma.student.upsert({
      create: {
        ...(pick(result, Object.keys(prisma.student.fields)) as typeof result),
        User: { connect: { username } },
        username: undefined,
      },
      update: {
        ...(pick(result, Object.keys(prisma.student.fields)) as typeof result),
        User: { connect: { username } },
        username: undefined,
      },
      where: { username },
    })
    return { Student: student, ...user }
  }
  if (result.type === 'Professor') {
    const prof = await prisma.prof.upsert({
      create: {
        ...(pick(result, Object.keys(prisma.prof.fields)) as typeof result),
        User: { connect: { username } },
        username: undefined,
      },
      update: {
        ...(pick(result, Object.keys(prisma.prof.fields)) as typeof result),
        User: { connect: { username } },
        username: undefined,
      },
      where: { username },
    })
    return { ...prof, ...user }
  }
  return undefined
}

const getConfiguration = once(() => {
  if (!process.env.LDAP_URL || !process.env.LDAP_BASE_DN) {
    throw new Error('LDAP_URL and LDAP_BASE_DN has to be set for LDAP to work')
  }
  return { baseDn: process.env.LDAP_BASE_DN, url: process.env.LDAP_URL }
})
