import { Client, InvalidCredentialsError } from 'ldapts'
import { once, pick } from 'lodash-es'
import { ZodError } from 'zod'

import type { AuthResult } from '../UserService'

import { prisma } from '../../../prisma/prisma'
import {
  type ResultType as UserDataType,
  resultSpec as userDataSpec,
} from './LdapUserDataSpec'

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
      return { cause: 'invalid-credentials', success: false }
    }
    result = userDataSpec.parse(searchEntries[0])
  } catch (e) {
    if (e instanceof InvalidCredentialsError || e instanceof ZodError) {
      return { cause: 'invalid-credentials', success: false }
    }
    return { cause: 'service-not-available', success: false }
  }

  const userInput = {
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    ...(pick(result, Object.keys(prisma.user.fields)) as typeof result),
    auth: {
      method: 'ldap',
    },
  } as const
  const user = await prisma.user.upsert({
    create: userInput,
    update: userInput,
    where: { username: result.username },
  })
  const clientUser = { ...user, auth: { twoFA: user.auth.twoFA } }
  if (user.auth.twoFA) {
    return { success: true, twoFA: true, user: clientUser }
  }
  if (result.type === 'Student') {
    const studentInput = {
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      ...(pick(result, Object.keys(prisma.student.fields)) as typeof result),
      Faculty: {
        connectOrCreate: {
          create: {
            name: result.facultyName,
            translatedName: { de: result.facultyName },
          },
          where: { name: result.facultyName },
        },
      },
      User: { connect: { username } },
      facultyName: undefined,
      username: undefined,
    }
    const student = await prisma.student.upsert({
      create: studentInput,
      update: studentInput,
      where: { username },
    })
    return {
      success: true,
      twoFA: false,
      user: { Student: student, ...clientUser },
    }
  }
  return { success: true, twoFA: false, user: clientUser }
}

const getConfiguration = once(() => {
  if (!process.env.LDAP_URL || !process.env.LDAP_BASE_DN) {
    throw new Error('LDAP_URL and LDAP_BASE_DN has to be set for LDAP to work')
  }
  return { baseDn: process.env.LDAP_BASE_DN, url: process.env.LDAP_URL }
})
