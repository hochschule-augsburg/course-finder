export interface LdapService {
  authenticate(username: string, password: string): Promise<boolean>
  listProfs(): Promise<string[]>
}
