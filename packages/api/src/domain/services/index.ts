import { ServiceContainer } from 'ioc-service-container'

import { UserServiceMock } from '../user/UserServiceMock'
import { UserServiceLdap } from '../user/ldap/UserServiceLdap'

export function setupServices() {
  if (process.env.MOCK_SERVICES) {
    setupMockedService()
    return
  }
  ServiceContainer.set('UserService', () => new UserServiceLdap())
}

function setupMockedService() {
  ServiceContainer.set('UserService', () => new UserServiceMock())
}
