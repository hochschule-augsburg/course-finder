import { User } from '@prisma/client'

/* eslint-disable perfectionist/sort-objects */
export const UserRoles = {
  Logout: 0,
  Student: 100,
  Professor: 200,
  Admin: 1000,
}

export function userHasPermission(
  user: User | undefined,
  role: keyof typeof UserRoles,
) {
  return (
    (UserRoles as Record<string, number>)[user?.type ?? 'Logout'] >=
    UserRoles[role]
  )
}
