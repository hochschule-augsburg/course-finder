import { z } from 'zod'

const commonData = z.object({
  cn: z.string(),
  mail: z.string(),
  uid: z.string(),
})

const studentData = commonData.extend({
  carLicense: z.string(),
  dfnEduPersonFieldOfStudyString: z.string(),
  dfnEduPersonFinalDegree: z.coerce.number(),
  dfnEduPersonTermsOfStudy: z.string(),
  employeeType: z.literal('Studenten'),
  ou: z.string(),
  schacDateOfBirth: z.string(),
})

const otherData = commonData.extend({
  employeeType: z.union([
    z.literal('Professoren'),
    z.literal('Angestellte'),
    z.literal('Wissenschaftliche Mitarbeiter'),
    z.literal('MAPR'),
    z.array(z.string()),
  ]),
})

const employeeTypeToUserRole: Record<string, 'Professor' | 'User'> = {
  Angestellte: 'User',
  MAPR: 'User',
  Professoren: 'Professor',
  'Wissenschaftliche Mitarbeiter': 'User',
}

export const resultSpec = z
  .union([studentData, otherData])
  .transform((data) => {
    const common = {
      email: data.mail,
      name: data.cn,
      username: data.uid,
    }
    if (data.employeeType === 'Studenten') {
      const finalDegree =
        data.dfnEduPersonFinalDegree === 84 ? 'Bachelor' : 'Master'
      return {
        ...common,
        faculty: data.ou,
        fieldOfStudy: data.dfnEduPersonFieldOfStudyString,
        finalDegree: finalDegree,
        name: data.cn,
        regNumber: data.carLicense,
        term: Number(data.dfnEduPersonTermsOfStudy.split('$')[1]),
        type: 'Student',
      } as const
    }
    return {
      ...common,

      type:
        employeeTypeToUserRole[
          typeof data.employeeType === 'object'
            ? data.employeeType[0]
            : data.employeeType
        ] ?? 'User',
    }
  })

export type ResultType = z.infer<typeof resultSpec>
