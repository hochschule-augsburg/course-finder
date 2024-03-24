import { LdapService } from './LdapService'
import profsMock from './example-responses/profs.json'

export class LdapServiceMock implements LdapService {
  public success = true
  authenticate(): Promise<boolean> {
    return Promise.resolve(!!this.success)
  }

  listProfs(): Promise<string[]> {
    return Promise.resolve(profsMock.searchEntries.map((entry) => entry.dn))
  }
}
