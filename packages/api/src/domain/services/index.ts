import { ServiceContainer } from 'ioc-service-container'

import { LdapServiceImpl } from '../ldap/LdapServiceImpl'
import { LdapServiceMock } from '../ldap/LdapServiceMock'

export function setupServices() {
  if (process.env.MOCK_SERVICES) {
    setupMockedService()
    return
  }
  ServiceContainer.set('LdapService', () => new LdapServiceImpl())
}

function setupMockedService() {
  ServiceContainer.set('LdapService', () => new LdapServiceMock())
}
