/* eslint-disable perfectionist/sort-objects */

export const fieldsOfStudy: Record<
  string,
  { abbr: string; degree: 'Bachelor' | 'Master' }
> = {
  'Informatik (Bachelor)': { abbr: 'IN', degree: 'Bachelor' },
  'Wirtschaftsinformatik (Bachelor)': { abbr: 'WI', degree: 'Bachelor' },
  'Technische Informatik (Bachelor)': { abbr: 'TI', degree: 'Bachelor' },
  'International Information Systems (Bachelor)': {
    abbr: 'IIS',
    degree: 'Bachelor',
  },
  // 'Interaktive Medien (Bachelor)': { abbr: 'IA', academicRank: 'Bachelor' },
  'Applied Research (Master)': { abbr: 'MAPR', degree: 'Master' },
  'Informatik (Master)': { abbr: 'MIN', degree: 'Master' },
  'Business Information Systems (Master)': {
    abbr: 'BIS',
    degree: 'Master',
  },
  'Interaktive Mediensysteme (Master)': { abbr: 'IMS', degree: 'Master' },
  'Industrielle Sicherheit': { abbr: 'INS', degree: 'Master' },
}

export const fieldsOfStudyAbbrMap = Object.fromEntries(
  Object.entries(fieldsOfStudy).map(([study, { abbr }]) => [study, abbr]),
)

export const abbrFieldsOfStudyMap = Object.fromEntries(
  Object.entries(fieldsOfStudy).map(([study, { abbr }]) => [abbr, study]),
)
