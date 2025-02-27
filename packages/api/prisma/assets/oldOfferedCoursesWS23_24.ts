import type { OfferedCourse } from '@prisma/client'

export const data: OfferedCourse[] = [
  {
    appointments: {
      dates: [{ from: '2024-04-02T08:00:00', to: '2024-04-02T13:10:00' }],
      type: 'weekly',
    },
    externalRegistration: false,
    extraInfo: 'Übungsgruppen mehrere Termine - siehe Stundenplan',
    for: [
      'Wirtschaftsinformatik (Bachelor)',
      'Technische Informatik (Bachelor)',
      'International Information Systems (Bachelor)',
    ],
    maxParticipants: 10,
    minParticipants: 0,
    moduleCode: 'PROGPY6.WP',
    moodleCourse: null,
    phaseId: 1,
  },
  {
    appointments: {
      dates: [
        {
          from: '2024-04-02T08:00:00',
          to: '2024-04-02T11:20:00',
        },
      ],
      type: 'weekly',
    },
    externalRegistration: false,
    extraInfo: 'Übungsgruppen mehrere Termine - siehe Stundenplan',
    for: [
      'Informatik (Bachelor)',
      'Technische Informatik (Bachelor)',
      'International Information Systems (Bachelor)',
    ],
    maxParticipants: 10,
    minParticipants: 0,
    moduleCode: 'ABAPGL6.WP',
    moodleCourse: null,
    phaseId: 1,
  },
  {
    appointments: {
      dates: [
        {
          from: '2024-04-02T09:50:00',
          to: '2024-04-02T15:30:00',
        },
      ],
      type: 'weekly',
    },
    externalRegistration: false,
    extraInfo: 'Übungsgruppen mehrere Termine - siehe Stundenplan',
    for: ['Technische Informatik (Bachelor)'],
    maxParticipants: 10,
    minParticipants: 0,
    moduleCode: 'SNP5.WP',
    moodleCourse: null,
    phaseId: 1,
  },
  {
    appointments: {
      dates: [
        {
          from: '2024-04-03T14:00:00',
          to: '2024-04-03T17:10:00',
        },
      ],
      type: 'weekly',
    },
    externalRegistration: false,
    extraInfo:
      'IA3-Studierende dürfen dieses Fach belegen. Die Anmeldung erfolgt über die Fakultät für Gestaltung.',
    for: [
      'Informatik (Bachelor)',
      'Wirtschaftsinformatik (Bachelor)',
      'Technische Informatik (Bachelor)',
      'International Information Systems (Bachelor)',
    ],
    maxParticipants: 30,
    minParticipants: 0,
    moduleCode: 'MKML4.WP',
    moodleCourse: null,
    phaseId: 1,
  },
  {
    appointments: {
      dates: [
        {
          from: '2024-04-05T09:50:00',
          to: '2024-04-05T13:10:00',
        },
      ],
      type: 'weekly',
    },
    externalRegistration: false,
    extraInfo: null,
    for: [
      'Informatik (Bachelor)',
      'Wirtschaftsinformatik (Bachelor)',
      'Technische Informatik (Bachelor)',
      'International Information Systems (Bachelor)',
    ],
    maxParticipants: 26,
    minParticipants: 0,
    moduleCode: 'SAPERP4.WP',
    moodleCourse: null,
    phaseId: 1,
  },
  {
    appointments: {
      dates: [
        {
          from: '2024-04-05T11:40:00',
          to: '2024-04-05T15:30:00',
        },
      ],
      type: 'weekly',
    },
    externalRegistration: false,
    extraInfo: null,
    for: [
      'Informatik (Bachelor)',
      'Wirtschaftsinformatik (Bachelor)',
      'Technische Informatik (Bachelor)',
      'International Information Systems (Bachelor)',
    ],
    maxParticipants: 36,
    minParticipants: 0,
    moduleCode: 'DIGINN4.WP',
    moodleCourse: null,
    phaseId: 1,
  },
  {
    appointments: {
      dates: [
        {
          from: '2023-11-03T14:00:00',
          to: '2024-11-03T18:00:00',
        },
        {
          from: '2024-11-04T08:00:00',
          to: '2024-11-04T17:10:00',
        },
        {
          from: '2023-11-24T14:00:00',
          to: '2024-11-24T18:00:00',
        },
        {
          from: '2024-11-25T08:00:00',
          to: '2024-11-25T17:10:00',
        },
      ],
      type: 'irregular',
    },
    externalRegistration: false,
    extraInfo: null,
    for: [
      'Informatik (Bachelor)',
      'Wirtschaftsinformatik (Bachelor)',
      'Technische Informatik (Bachelor)',
      'International Information Systems (Bachelor)',
    ],
    maxParticipants: 40,
    minParticipants: 0,
    moduleCode: 'SEENG.WP',
    moodleCourse: null,
    phaseId: 1,
  },
  {
    appointments: {
      dates: [
        {
          from: '2024-04-05T09:50:00',
          to: '2024-04-05T13:10:00',
        },
      ],
      type: 'weekly',
    },
    externalRegistration: false,
    extraInfo:
      'IA-Studierende dürfen dieses Fach belegen. Die Anmeldung erfolgt über die Fakultät für Gestaltung.',
    for: [
      'Informatik (Bachelor)',
      'Wirtschaftsinformatik (Bachelor)',
      'Technische Informatik (Bachelor)',
      'International Information Systems (Bachelor)',
      'Applied Research (Master)',
      'Informatik (Master)',
      'Business Information Systems (Master)',
      'Industrielle Sicherheit',
    ],
    maxParticipants: 20,
    minParticipants: 0,
    moduleCode: 'PYTHON4.WP',
    moodleCourse: null,
    phaseId: 1,
  },
  {
    appointments: {
      dates: [
        {
          from: '2024-04-03T09:50:00',
          to: '2024-04-03T13:10:00',
        },
      ],
      type: 'weekly',
    },
    externalRegistration: false,
    extraInfo: 'Das Modul wird in englischer Sprache unterrichtet.',
    for: [
      'Informatik (Bachelor)',
      'Wirtschaftsinformatik (Bachelor)',
      'Technische Informatik (Bachelor)',
      'Applied Research (Master)',
      'Informatik (Master)',
      'Business Information Systems (Master)',
      'Industrielle Sicherheit',
    ],
    maxParticipants: 20,
    minParticipants: 0,
    moduleCode: 'INTENG4.WP',
    moodleCourse: null,
    phaseId: 1,
  },
  {
    appointments: {
      dates: [
        {
          from: '2024-04-03T14:00:00',
          to: '2024-04-03T17:10:00',
        },
      ],
      type: 'weekly',
    },
    externalRegistration: false,
    extraInfo: null,
    for: [
      'Informatik (Bachelor)',
      'Wirtschaftsinformatik (Bachelor)',
      'Technische Informatik (Bachelor)',
      'International Information Systems (Bachelor)',
      'Applied Research (Master)',
      'Informatik (Master)',
      'Business Information Systems (Master)',
      'Industrielle Sicherheit',
    ],
    maxParticipants: 24,
    minParticipants: 0,
    moduleCode: 'SCRUM4.WP',
    moodleCourse: null,
    phaseId: 1,
  },
  {
    appointments: {
      dates: [
        {
          from: '2024-04-04T15:34:00',
          to: '2024-04-04T13:10:00',
        },
      ],
      type: 'weekly',
    },
    externalRegistration: false,
    extraInfo: null,
    for: [
      'Informatik (Bachelor)',
      'Wirtschaftsinformatik (Bachelor)',
      'Technische Informatik (Bachelor)',
      'International Information Systems (Bachelor)',
      'Applied Research (Master)',
      'Informatik (Master)',
      'Business Information Systems (Master)',
      'Industrielle Sicherheit',
    ],
    maxParticipants: 30,
    minParticipants: 0,
    moduleCode: 'ITSICH6.WP',
    moodleCourse: null,
    phaseId: 1,
  },
  {
    appointments: {
      dates: [
        {
          from: '2024-04-26T14:00:00',
          to: '2024-04-26T17:10:00',
        },
      ],
      type: 'weekly',
    },
    externalRegistration: false,
    extraInfo: null,
    for: [
      'Informatik (Bachelor)',
      'Wirtschaftsinformatik (Bachelor)',
      'Technische Informatik (Bachelor)',
      'International Information Systems (Bachelor)',
      'Applied Research (Master)',
      'Informatik (Master)',
      'Business Information Systems (Master)',
      'Industrielle Sicherheit',
    ],
    maxParticipants: 25,
    minParticipants: 0,
    moduleCode: 'ELHS4.WP',
    moodleCourse: null,
    phaseId: 1,
  },
  {
    appointments: {
      dates: [
        {
          from: '2024-04-05T08:00:00',
          to: '2024-04-05T11:20:00',
        },
      ],
      type: 'weekly',
    },
    externalRegistration: false,
    extraInfo: null,
    for: [
      'Informatik (Bachelor)',
      'Wirtschaftsinformatik (Bachelor)',
      'Technische Informatik (Bachelor)',
      'International Information Systems (Bachelor)',
      'Applied Research (Master)',
      'Informatik (Master)',
      'Business Information Systems (Master)',
      'Industrielle Sicherheit',
    ],
    maxParticipants: 36,
    minParticipants: 0,
    moduleCode: 'CES4.WP',
    moodleCourse: null,
    phaseId: 1,
  },
  {
    appointments: {
      dates: [
        {
          from: '2024-04-05T15:40:00',
          to: '2024-04-05T18:50:00',
        },
      ],
      type: 'irregular',
    },
    externalRegistration: false,
    extraInfo: null,
    for: [
      'Informatik (Bachelor)',
      'Wirtschaftsinformatik (Bachelor)',
      'Technische Informatik (Bachelor)',
      'International Information Systems (Bachelor)',
      'Applied Research (Master)',
      'Informatik (Master)',
      'Business Information Systems (Master)',
      'Industrielle Sicherheit',
    ],
    maxParticipants: 35,
    minParticipants: 0,
    moduleCode: 'UGES2.WP',
    moodleCourse: null,
    phaseId: 1,
  },
  {
    appointments: {
      dates: [
        {
          from: '2024-04-03T14:00:00',
          to: '2024-04-03T17:10:00',
        },
      ],
      type: 'irregular',
    },
    externalRegistration: false,
    extraInfo: null,
    for: [
      'Informatik (Bachelor)',
      'Wirtschaftsinformatik (Bachelor)',
      'Technische Informatik (Bachelor)',
      'International Information Systems (Bachelor)',
      'Applied Research (Master)',
      'Informatik (Master)',
      'Business Information Systems (Master)',
      'Industrielle Sicherheit',
    ],
    maxParticipants: 40,
    minParticipants: 0,
    moduleCode: 'NoSQL4.WP',
    moodleCourse: null,
    phaseId: 1,
  },
  {
    appointments: {
      dates: [
        {
          from: '2024-04-03T14:00:00',
          to: '2024-04-03T17:10:00',
        },
      ],
      type: 'weekly',
    },
    externalRegistration: false,
    extraInfo: null,
    for: [
      'Informatik (Bachelor)',
      'Wirtschaftsinformatik (Bachelor)',
      'Technische Informatik (Bachelor)',
      'International Information Systems (Bachelor)',
      'Applied Research (Master)',
      'Informatik (Master)',
      'Business Information Systems (Master)',
      'Industrielle Sicherheit',
    ],
    maxParticipants: 40,
    minParticipants: 0,
    moduleCode: 'KDBT4.WP',
    moodleCourse: null,
    phaseId: 1,
  },
  {
    appointments: {
      dates: [
        {
          from: '2024-04-03T14:00:00',
          to: '2024-04-03T17:10:00',
        },
      ],
      type: 'weekly',
    },
    externalRegistration: false,
    extraInfo: null,
    for: [
      'Informatik (Bachelor)',
      'Wirtschaftsinformatik (Bachelor)',
      'Technische Informatik (Bachelor)',
      'International Information Systems (Bachelor)',
      'Applied Research (Master)',
      'Informatik (Master)',
      'Business Information Systems (Master)',
      'Industrielle Sicherheit',
    ],
    maxParticipants: 40,
    minParticipants: 0,
    moduleCode: 'SWPJMG.WP',
    moodleCourse: null,
    phaseId: 1,
  },
  {
    appointments: {
      dates: [
        {
          from: '2024-04-03T14:00:00',
          to: '2024-04-03T17:10:00',
        },
      ],
      type: 'weekly',
    },
    externalRegistration: false,
    extraInfo: null,
    for: [
      'Informatik (Bachelor)',
      'Wirtschaftsinformatik (Bachelor)',
      'Technische Informatik (Bachelor)',
      'International Information Systems (Bachelor)',
      'Applied Research (Master)',
      'Informatik (Master)',
      'Business Information Systems (Master)',
      'Industrielle Sicherheit',
    ],
    maxParticipants: 40,
    minParticipants: 0,
    moduleCode: 'DBP4.WP',
    moodleCourse: null,
    phaseId: 1,
  },
  {
    appointments: {
      dates: [
        {
          from: '2024-04-03T14:00:00',
          to: '2024-04-03T17:10:00',
        },
      ],
      type: 'weekly',
    },
    externalRegistration: false,
    extraInfo: null,
    for: [
      'Informatik (Bachelor)',
      'Wirtschaftsinformatik (Bachelor)',
      'Technische Informatik (Bachelor)',
      'International Information Systems (Bachelor)',
      'Applied Research (Master)',
      'Informatik (Master)',
      'Business Information Systems (Master)',
      'Industrielle Sicherheit',
    ],
    maxParticipants: 40,
    minParticipants: 0,
    moduleCode: 'SRASYS2.WP',
    moodleCourse: null,
    phaseId: 1,
  },
  {
    appointments: {
      dates: [
        {
          from: '2024-04-03T14:00:00',
          to: '2024-04-03T17:10:00',
        },
      ],
      type: 'weekly',
    },
    externalRegistration: false,
    extraInfo: null,
    for: [
      'Informatik (Bachelor)',
      'Wirtschaftsinformatik (Bachelor)',
      'Technische Informatik (Bachelor)',
      'International Information Systems (Bachelor)',
      'Applied Research (Master)',
      'Informatik (Master)',
      'Business Information Systems (Master)',
      'Industrielle Sicherheit',
    ],
    maxParticipants: 40,
    minParticipants: 0,
    moduleCode: 'PRCINT4.WP',
    moodleCourse: null,
    phaseId: 1,
  },
  {
    appointments: {
      dates: [
        {
          from: '2024-04-03T14:00:00',
          to: '2024-04-03T17:10:00',
        },
      ],
      type: 'weekly',
    },
    externalRegistration: false,
    extraInfo: null,
    for: [
      'Applied Research (Master)',
      'Informatik (Master)',
      'Business Information Systems (Master)',
      'Industrielle Sicherheit',
    ],
    maxParticipants: 12,
    minParticipants: 0,
    moduleCode: 'EFRE.WP',
    moodleCourse: null,
    phaseId: 1,
  },
  {
    appointments: {
      dates: [
        {
          from: '2024-04-03T14:00:00',
          to: '2024-04-03T17:10:00',
        },
      ],
      type: 'weekly',
    },
    externalRegistration: false,
    extraInfo: null,
    for: [
      'Applied Research (Master)',
      'Informatik (Master)',
      'Business Information Systems (Master)',
      'Industrielle Sicherheit',
    ],
    maxParticipants: 40,
    minParticipants: 0,
    moduleCode: 'OOSD.WP',
    moodleCourse: null,
    phaseId: 1,
  },
  {
    appointments: {
      dates: [
        {
          from: '2024-04-03T14:00:00',
          to: '2024-04-03T17:10:00',
        },
      ],
      type: 'weekly',
    },
    externalRegistration: false,
    extraInfo: null,
    for: [
      'Applied Research (Master)',
      'Informatik (Master)',
      'Business Information Systems (Master)',
      'Industrielle Sicherheit',
    ],
    maxParticipants: 40,
    minParticipants: 0,
    moduleCode: 'MEDIBI.WP',
    moodleCourse: null,
    phaseId: 1,
  },
  {
    appointments: {
      dates: [
        {
          from: '2024-04-03T14:00:00',
          to: '2024-04-03T17:10:00',
        },
      ],
      type: 'weekly',
    },
    externalRegistration: false,
    extraInfo: null,
    for: [
      'Applied Research (Master)',
      'Informatik (Master)',
      'Business Information Systems (Master)',
      'Industrielle Sicherheit',
    ],
    maxParticipants: 40,
    minParticipants: 0,
    moduleCode: 'BPM3.WP',
    moodleCourse: null,
    phaseId: 1,
  },
  {
    appointments: {
      dates: [
        {
          from: '2024-04-03T14:00:00',
          to: '2024-04-03T17:10:00',
        },
      ],
      type: 'weekly',
    },
    externalRegistration: false,
    extraInfo:
      'Das Modul wird in englischer Sprache unterrichtet, wenn erforderlich auch in deutscher Sprache.',
    for: [
      'Applied Research (Master)',
      'Informatik (Master)',
      'Business Information Systems (Master)',
      'Industrielle Sicherheit',
    ],
    maxParticipants: 30,
    minParticipants: 0,
    moduleCode: 'DASC4.WP',
    moodleCourse: null,
    phaseId: 1,
  },
  // Moodle
  {
    appointments: {
      dates: [
        {
          from: '2024-04-03T14:00:00',
          to: '2024-04-03T17:10:00',
        },
      ],
      type: 'weekly',
    },
    externalRegistration: true,
    extraInfo:
      'Pflichtfach für den Studiengang Data Science / Anmeldung über moodle, da die erste Vorlesung am 20.03.2024 beginnt',
    for: [
      'Informatik (Bachelor)',
      'Wirtschaftsinformatik (Bachelor)',
      'Technische Informatik (Bachelor)',
      'International Information Systems (Bachelor)',
    ],
    maxParticipants: null,
    minParticipants: 0,
    moduleCode: 'OPPYTH4.WP',
    moodleCourse: null,
    phaseId: 1,
  },
  {
    appointments: {
      dates: [
        {
          from: '2024-04-03T14:00:00',
          to: '2024-04-03T17:10:00',
        },
      ],
      type: 'weekly',
    },
    externalRegistration: true,
    extraInfo: 'Anmeldung direkt über Herrn Prof. Dr. Kiefer (30 Plätze)',
    for: [
      'Informatik (Bachelor)',
      'Wirtschaftsinformatik (Bachelor)',
      'Technische Informatik (Bachelor)',
      'International Information Systems (Bachelor)',
    ],
    maxParticipants: 30,
    minParticipants: 0,
    moduleCode: 'FSD4.WP',
    moodleCourse: null,
    phaseId: 1,
  },
]
