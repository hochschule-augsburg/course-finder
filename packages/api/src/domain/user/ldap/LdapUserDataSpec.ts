import { parse } from 'date-fns'
import { z } from 'zod'

const commonData = z.object({
  cn: z.string(),
  mail: z.string(),
  ou: z.string(),
  uid: z.string(),
})

const studentData = commonData.extend({
  carLicense: z.string(),
  dfnEduPersonFieldOfStudyString: z.string(),
  dfnEduPersonTermsOfStudy: z.string(),
  employeeType: z.literal('Studenten'),
  schacDateOfBirth: z.string(),
})

const profData = commonData.extend({
  employeeType: z.literal('Professoren'),
  facsimileTelephoneNumber: z.string(),
  physicalDeliveryOfficeName: z.string(),
})

export const resultSpec = z
  .discriminatedUnion('employeeType', [studentData, profData])
  .transform((data) => {
    const common = {
      email: data.mail,
      facultyName: data.ou,
      name: data.cn,
      username: data.uid,
    }
    switch (data.employeeType) {
      case 'Studenten':
        return {
          ...common,
          birthDate: parse(data.schacDateOfBirth, 'yyyyMMdd', new Date()),
          fieldOfStudy: data.dfnEduPersonFieldOfStudyString,
          name: data.cn,
          regNumber: data.carLicense,
          term: Number(data.dfnEduPersonTermsOfStudy.split('$')[1]),
          type: 'Student',
        } as const
      case 'Professoren':
        return {
          ...common,
          office: data.physicalDeliveryOfficeName,
          telephone: data.facsimileTelephoneNumber,
          type: 'Professor',
        } as const
    }
  })

export type ResultType = z.infer<typeof resultSpec>
