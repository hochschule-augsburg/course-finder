/* eslint-disable perfectionist/sort-objects */

export const fieldsOfStudy: Array<[ldap: string, abbr: string]> = [
  ['Informatik (Bachelor)', 'IN'],
  ['Wirtschaftsinformatik (Bachelor)', 'WI'],
  ['Technische Informatik (Bachelor)', 'TI'],
  ['International Information Systems (Bachelor)', 'IIS'],
  //   'Interaktive Medien (Bachelor)', 'IA', don't choose subject here yet
  ['Applied Research (Master)', 'MAPR'],
  ['Informatik (Master)', 'MIN'],
  ['Business Information Systems (Master)', 'BIS'],
  ['Interaktive Mediensysteme (Master)', 'IMS'],
  ['Industrielle Sicherheit', 'INS'],
]

export const fieldsOfStudyAbbrMap = Object.fromEntries(fieldsOfStudy)
export const abbrFieldsOfStudyMap = Object.fromEntries(
  fieldsOfStudy.map((e) => [e[1], e[0]]),
)
