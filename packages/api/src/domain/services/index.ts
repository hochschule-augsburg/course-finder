export function setupServices() {
  if (process.env.MOCK_SERVICES) {
    setupMockedService()
  }
}

function setupMockedService() {}
