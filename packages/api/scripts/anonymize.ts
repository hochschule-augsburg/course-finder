import fs from 'fs'
import path from 'path'
import pg from 'pg'

const { Pool } = pg

const pool = new Pool({
  connectionString: 'postgresql://user:password@127.0.0.1:5432/ws2526',
})

async function main() {
  const phaseId = 3
  const tryNo = 3

  // 1. Fetch Enrollphase
  const phaseRes = await pool.query(
    'SELECT id, "start", "end", title, description, state FROM "Enrollphase" WHERE id = $1',
    [phaseId],
  )
  const phase = phaseRes.rows[0]

  // 2. Fetch OfferedCourses with Course info
  const coursesRes = await pool.query(
    `SELECT oc."phaseId", oc."moduleCode", oc."minParticipants", oc."maxParticipants", oc."hideMinParticipants",
            oc."externalRegistration", oc."for",
            c."creditPoints", c."title"
     FROM "OfferedCourse" oc
     JOIN "Course" c ON c."moduleCode" = oc."moduleCode"
     WHERE oc."phaseId" = $1
     ORDER BY oc."moduleCode"`,
    [phaseId],
  )

  const offeredCourses = coursesRes.rows.map((row) => ({
    phaseId: row.phaseId,
    moduleCode: row.moduleCode,
    minParticipants: row.minParticipants,
    maxParticipants: row.maxParticipants,
    hideMinParticipants: row.hideMinParticipants,
    externalRegistration: row.externalRegistration,
    for: row.for,
    Course: {
      creditPoints: row.creditPoints,
      title: row.title,
    },
  }))

  // 3. Fetch StudentPhase and StudentChoice
  const studentPhasesRes = await pool.query(
    `SELECT username, "phaseId", "creditsNeeded"
     FROM "StudentPhase"
     WHERE "phaseId" = $1
     ORDER BY username`,
    [phaseId],
  )

  const choicesRes = await pool.query(
    `SELECT username, "phaseId", "moduleCode", points
     FROM "StudentChoice"
     WHERE "phaseId" = $1
     ORDER BY username, points DESC, "moduleCode"`,
    [phaseId],
  )

  // 4. Fetch PhaseAssignment for tryNo=3
  const assignmentsRes = await pool.query(
    `SELECT username, "moduleCode", "phaseId", "tryNo"
     FROM "PhaseAssignment"
     WHERE "phaseId" = $1 AND "tryNo" = $2
     ORDER BY username, "moduleCode"`,
    [phaseId, tryNo],
  )

  // Map usernames to anonymized names deterministically
  const usernameMap = new Map<string, string>()
  const allUsernames = studentPhasesRes.rows.map((r: { username: string }) => r.username).sort()
  allUsernames.forEach((uname: string, idx: number) => {
    usernameMap.set(uname, `student_${String(idx + 1).padStart(4, '0')}`)
  })

  // Anonymize StudentPhase and StudentChoice
  const choicesByUser = new Map<string, Array<{ moduleCode: string; points: number }>>()
  for (const choice of choicesRes.rows) {
    const anonUser = usernameMap.get(choice.username)!
    if (!choicesByUser.has(anonUser)) {
      choicesByUser.set(anonUser, [])
    }
    choicesByUser.get(anonUser)!.push({
      moduleCode: choice.moduleCode,
      points: choice.points,
    })
  }

  const studentPhases = studentPhasesRes.rows.map((sp: { username: string; phaseId: number; creditsNeeded: number }) => {
    const anonUser = usernameMap.get(sp.username)!
    return {
      username: anonUser,
      phaseId: sp.phaseId,
      creditsNeeded: sp.creditsNeeded,
      StudentChoice: choicesByUser.get(anonUser) || [],
    }
  })

  // Anonymize PhaseAssignments
  const expectedAssignments: Record<string, string[]> = {}
  for (const sp of studentPhases) {
    expectedAssignments[sp.username] = []
  }
  for (const assign of assignmentsRes.rows) {
    const anonUser = usernameMap.get(assign.username)
    if (anonUser) {
      if (!expectedAssignments[anonUser]) {
        expectedAssignments[anonUser] = []
      }
      expectedAssignments[anonUser].push(assign.moduleCode)
    }
  }

  // Sort module codes for consistency
  for (const user of Object.keys(expectedAssignments)) {
    expectedAssignments[user].sort()
  }

  const anonymizedData = {
    phase,
    offeredCourses,
    studentPhases,
    expectedAssignments,
    meta: {
      studentCount: studentPhases.length,
      courseCount: offeredCourses.length,
      totalChoicesCount: choicesRes.rows.length,
      assignedCount: assignmentsRes.rows.length,
    },
  }

  const outDir = path.resolve('tests/domain/assign/fixtures')
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true })
  }
  const outPath = path.join(outDir, 'phase3AnonymizedData.json')
  fs.writeFileSync(outPath, JSON.stringify(anonymizedData, null, 2))

  console.log(`Successfully generated anonymized data: ${outPath}`)
  console.log(`Stats:`, anonymizedData.meta)

  await pool.end()
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
