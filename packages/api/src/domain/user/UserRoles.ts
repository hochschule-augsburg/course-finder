/* eslint-disable perfectionist/sort-objects */
export const UserRoles = Object.freeze({
  Logout: 0,
  User: 50,
  Student: 100,
  Professor: 200,
  Admin: 1000,
})

export function userHasPermission(
  user: { type: string } | undefined,
  role: keyof typeof UserRoles,
) {
  return (
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    (UserRoles as Record<string, number>)[user?.type ?? 'Logout'] >=
    UserRoles[role]
  )
}
