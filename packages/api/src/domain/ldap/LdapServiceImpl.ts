import { Client } from 'ldapts'

import { LdapService } from './LdapService'

export class LdapServiceImpl implements LdapService {
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

  async authenticate(username: string, password: string): Promise<boolean> {
    try {
      await this.client.bind(`uid=${username},${this.baseDn}`, password)
      await this.client.unbind()
    } catch {
      return false
    }
    return true
  }

  async listProfs(): Promise<string[]> {
    const response = await this.client.search(this.baseDn, {
      filter: '(employeeType=Professoren)',
    })
    return response.searchEntries.map((entry) => entry.dn)
  }
}
