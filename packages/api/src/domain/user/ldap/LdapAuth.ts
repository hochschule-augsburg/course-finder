import { Client, InvalidCredentialsError } from 'ldapts'
import { once, pick } from 'lodash-es'
import { ZodError } from 'zod'

import type { AuthResult } from '../UserService'

import { env } from '../../../env'
import { prisma } from '../../../prisma/prisma'
import {
  resultSpec as userDataSpec,
  type ResultType as UserDataType,
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

  // https://ldapwiki.com/wiki/Wiki.jsp?page=DN%20Escape%20Values
  if (/[ *().&[\]`|%^?{}! ,\\#+<>;"=']/.test(username)) {
    return { cause: 'invalid-credentials', success: false }
  }

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
      facultyName: undefined,
      User: { connect: { username } },
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
  return { baseDn: env.LDAP_BASE_DN, url: env.LDAP_URL }
})
