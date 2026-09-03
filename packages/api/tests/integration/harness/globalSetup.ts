import { execSync } from 'node:child_process'
import crypto from 'node:crypto'
import { fileURLToPath } from 'node:url'

let containerName: string | null = null
let cleanedUp = false

function cleanup() {
  if (cleanedUp || !containerName) return
  cleanedUp = true
  try {
    execSync(`docker rm -f ${containerName}`, { stdio: 'ignore' })
  } catch {
    // Ignore errors if container is already deleted
  }
}

export async function setup() {
  // Generate collision-free container name
  containerName = `cf-test-pg-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`
  const image = process.env.TEST_POSTGRES_IMAGE || 'postgres:17-alpine'

  // Register exit hooks to prevent orphaned containers on interrupt/exit
  process.on('exit', cleanup)
  process.on('SIGINT', () => {
    cleanup()
    process.exit(130)
  })
  process.on('SIGTERM', () => {
    cleanup()
    process.exit(143)
  })

  try {
    // Start container with random mapped port (port 0) to avoid any port collisions
    execSync(
      `docker run -d --rm --name ${containerName} -e POSTGRES_USER=user -e POSTGRES_PASSWORD=password -e POSTGRES_DB=course_finder_test -p 127.0.0.1:0:5432 ${image}`,
      { stdio: ['ignore', 'pipe', 'pipe'] },
    )

    // Inspect mapped host port
    const portOutput = execSync(`docker port ${containerName} 5432`, {
      encoding: 'utf8',
    }).trim()
    const match = portOutput.match(/:(\d+)/)
    if (!match) {
      throw new Error(
        `Failed to parse mapped port from docker port output: "${portOutput}"`,
      )
    }
    const port = match[1]

    // Wait until postgres accepts connections
    const timeoutMs = 30_000
    const start = Date.now()
    let isReady = false

    while (Date.now() - start < timeoutMs) {
      try {
        execSync(
          `docker exec ${containerName} pg_isready -U user -d course_finder_test`,
          { stdio: 'ignore' },
        )
        isReady = true
        break
      } catch {
        await new Promise((resolve) => setTimeout(resolve, 200))
      }
    }

    if (!isReady) {
      throw new Error(
        `Postgres container ${containerName} did not become ready within ${timeoutMs}ms`,
      )
    }

    const databaseUrl = `postgresql://user:password@127.0.0.1:${port}/course_finder_test`
    process.env.DATABASE_URL = databaseUrl

    // Deploy prisma migrations to initialize schema
    const apiDir = fileURLToPath(new URL('../../..', import.meta.url))
    execSync('pnpm exec prisma migrate deploy', {
      cwd: apiDir,
      env: {
        ...process.env,
        DATABASE_URL: databaseUrl,
      },
      stdio: 'inherit',
    })
  } catch (error) {
    cleanup()
    throw error
  }

  return () => {
    cleanup()
  }
}

export function teardown() {
  cleanup()
}
