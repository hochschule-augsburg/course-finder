/* eslint-disable perfectionist/sort-objects */
export const UserRoles = Object.freeze({
  Logout: 0,
  User: 50,
  Student: 100,
  Professor: 200,
  Admin: 1000,
})

export function userHasPermission(
  user: undefined | { type: string },
  role: keyof typeof UserRoles,
) {
  return (
    (UserRoles as Record<string, number>)[user?.type ?? 'Logout'] >=
    UserRoles[role]
  )
}
