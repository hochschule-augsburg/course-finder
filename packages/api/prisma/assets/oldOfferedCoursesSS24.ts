import type { OfferedCourse } from '@prisma/client'

// TODO Interaktive Mediensysteme (Master)

export const data: OfferedCourse[] = [
  {
    appointments: {
      dates: [{ from: '2024-04-02T08:00:00', to: '2024-04-02T13:10:00' }],
      type: 'weekly',
    },
    externalRegistration: false,
    extraInfo:
      'max. 59 Teilnehmer / es ist kein größerer Raum verfügbar zu dieser Zeit',
    for: [
      'Informatik (Bachelor)',
      'Wirtschaftsinformatik (Bachelor)',
      'Technische Informatik (Bachelor)',
      'International Information Systems (Bachelor)',
    ],
    maxParticipants: 59,
    minParticipants: 0,
    moduleCode: 'KI6.WP',
    moodleCourse: null,
    phaseId: 2,
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
    extraInfo: null,
    for: [
      'Informatik (Bachelor)',
      'Wirtschaftsinformatik (Bachelor)',
      'Technische Informatik (Bachelor)',
      'International Information Systems (Bachelor)',
    ],
    maxParticipants: 40,
    minParticipants: 0,
    moduleCode: 'SDMDT4.WP',
    moodleCourse: null,
    phaseId: 2,
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
    extraInfo: null,
    for: [
      'Informatik (Bachelor)',
      'Wirtschaftsinformatik (Bachelor)',
      'Technische Informatik (Bachelor)',
      'International Information Systems (Bachelor)',
    ],
    maxParticipants: 80,
    minParticipants: 0,
    moduleCode: 'FSWD6.WP',
    moodleCourse: null,
    phaseId: 2,
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
    extraInfo: 'weitere Teilnehmer aus Data Science',
    for: [
      'Informatik (Bachelor)',
      'Wirtschaftsinformatik (Bachelor)',
      'Technische Informatik (Bachelor)',
      'International Information Systems (Bachelor)',
    ],
    maxParticipants: 35,
    minParticipants: 0,
    moduleCode: 'NoSQL4.WP',
    moodleCourse: null,
    phaseId: 2,
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
    maxParticipants: 80,
    minParticipants: 0,
    moduleCode: 'LINUX6.WP',
    moodleCourse: null,
    phaseId: 2,
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
    maxParticipants: 40,
    minParticipants: 0,
    moduleCode: 'MCODK4.WP',
    moodleCourse: null,
    phaseId: 2,
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
    extraInfo: 'findet online statt - Beginn 04.04.2024',
    for: [
      'Informatik (Bachelor)',
      'Wirtschaftsinformatik (Bachelor)',
      'Technische Informatik (Bachelor)',
      'International Information Systems (Bachelor)',
    ],
    maxParticipants: null,
    minParticipants: 0,
    moduleCode: 'BEINF4.WP',
    moodleCourse: null,
    phaseId: 2,
  },
  {
    appointments: {
      dates: [
        {
          from: '2024-04-05T09:50:00',
          to: '2024-04-05T13:10:00',
        },
        {
          from: '2024-04-19T09:50:00',
          to: '2024-04-19T13:10:00',
        },
        {
          from: '2024-05-03T09:50:00',
          to: '2024-05-03T13:10:00',
        },
        {
          from: '2024-05-24T09:50:00',
          to: '2024-05-24T13:10:00',
        },
        {
          from: '2024-06-14T09:50:00',
          to: '2024-06-14T13:10:00',
        },
        {
          from: '2024-06-21T09:50:00',
          to: '2024-06-21T13:10:00',
        },
      ],
      type: 'irregular',
    },
    externalRegistration: false,
    extraInfo: 'Ein weitere Termin wird noch vereinbart',
    for: [
      'Informatik (Bachelor)',
      'Wirtschaftsinformatik (Bachelor)',
      'Technische Informatik (Bachelor)',
      'International Information Systems (Bachelor)',
    ],
    maxParticipants: 40,
    minParticipants: 0,
    moduleCode: 'SUCHMA.WP',
    moodleCourse: null,
    phaseId: 2,
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
    extraInfo: null,
    for: [
      'Informatik (Bachelor)',
      'Wirtschaftsinformatik (Bachelor)',
      'Technische Informatik (Bachelor)',
      'International Information Systems (Bachelor)',
    ],
    maxParticipants: 40,
    minParticipants: 0,
    moduleCode: 'DEVOPS4.WP',
    moodleCourse: null,
    phaseId: 2,
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
    extraInfo: 'M2.02 und zoom',
    for: [
      'Informatik (Bachelor)',
      'Wirtschaftsinformatik (Bachelor)',
      'Technische Informatik (Bachelor)',
      'International Information Systems (Bachelor)',
    ],
    maxParticipants: 30,
    minParticipants: 0,
    moduleCode: 'INDBV4.WP',
    moodleCourse: null,
    phaseId: 2,
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
    extraInfo: 'Am Ende des Semesters',
    for: [
      'Informatik (Bachelor)',
      'International Information Systems (Bachelor)',
    ],
    maxParticipants: 10,
    minParticipants: 0,
    moduleCode: 'DBANW3.WP',
    moodleCourse: null,
    phaseId: 2,
  },
  {
    appointments: {
      dates: [
        {
          from: '2024-04-26T14:00:00',
          to: '2024-04-26T17:10:00',
        },
        {
          from: '2024-05-03T14:00:00',
          to: '2024-05-03T17:10:00',
        },
        {
          from: '2024-05-17T14:00:00',
          to: '2024-05-17T17:10:00',
        },
        {
          from: '2024-05-24T14:00:00',
          to: '2024-05-24T17:10:00',
        },
        {
          from: '2024-06-14T14:00:00',
          to: '2024-06-14T17:10:00',
        },
        {
          from: '2024-06-21T14:00:00',
          to: '2024-06-21T17:10:00',
        },
        {
          from: '2024-06-28T14:00:00',
          to: '2024-06-28T17:10:00',
        },
      ],
      type: 'irregular',
    },
    externalRegistration: false,
    extraInfo: '21\\. Juni Exkursion',
    for: [
      'Informatik (Bachelor)',
      'Wirtschaftsinformatik (Bachelor)',
      'Technische Informatik (Bachelor)',
      'International Information Systems (Bachelor)',
    ],
    maxParticipants: 5,
    minParticipants: 0,
    moduleCode: '__ISB.WP',
    moodleCourse: null,
    phaseId: 2,
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
    extraInfo: 'findet für IA6 (Gestaltung) statt',
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
    moduleCode: 'IACOGR6.WP',
    moodleCourse: null,
    phaseId: 2,
  },
  {
    appointments: {
      dates: [
        {
          from: '2024-04-05T14:00:00',
          to: '2024-04-05T17:10:00',
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
    moduleCode: 'ITSICH6.WP',
    moodleCourse: null,
    phaseId: 2,
  },
  {
    appointments: {
      dates: [
        {
          from: '2024-04-05T15:40:00',
          to: '2024-04-05T18:50:00',
        },
      ],
      type: 'weekly',
    },
    externalRegistration: false,
    extraInfo: 'weitere Teilnehmer aus anderen Fakultäten',
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
    moduleCode: 'START4.WP',
    moodleCourse: null,
    phaseId: 2,
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
    maxParticipants: 30,
    minParticipants: 0,
    moduleCode: 'SCRUM4.WP',
    moodleCourse: null,
    phaseId: 2,
  },
  // TODO entweder oder
  {
    appointments: { dates: [], type: 'irregular' },
    externalRegistration: false,
    extraInfo: 'Entweder ECommerce oder Digital Business Leadership Skills',
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
    moduleCode: 'ECOMM6.WP',
    moodleCourse: null,
    phaseId: 2,
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
    extraInfo: 'im SoSe 2024 keine Teilnehmer über die Fakultät für Gestaltung',
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
    moduleCode: 'DIBUS.WP',
    moodleCourse: null,
    phaseId: 2,
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
    maxParticipants: 30,
    minParticipants: 0,
    moduleCode: 'AEKDS4.WP',
    moodleCourse: null,
    phaseId: 2,
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
    moduleCode: 'IFPP4.WP',
    moodleCourse: null,
    phaseId: 2,
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
    extraInfo: 'Vorlesung in Englisch',
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
    maxParticipants: 50,
    minParticipants: 0,
    moduleCode: 'ITSCT4.WP',
    moodleCourse: null,
    phaseId: 2,
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
    moduleCode: 'NETP.WP',
    moodleCourse: null,
    phaseId: 2,
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
    moduleCode: 'OSSWE4.WP',
    moodleCourse: null,
    phaseId: 2,
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
    maxParticipants: null,
    minParticipants: 0,
    moduleCode: 'KLPRO.WP',
    moodleCourse: null,
    phaseId: 2,
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
    maxParticipants: 38,
    minParticipants: 0,
    moduleCode: 'PRRO.WP',
    moodleCourse: null,
    phaseId: 2,
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
    extraInfo: '20 Extra Plätze für die Fakultät Gestaltung',
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
    maxParticipants: 60,
    minParticipants: 0,
    moduleCode: 'EMSV4.WP',
    moodleCourse: null,
    phaseId: 2,
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
    maxParticipants: 38,
    minParticipants: 0,
    moduleCode: 'INUM4.WP',
    moodleCourse: null,
    phaseId: 2,
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
    maxParticipants: 50,
    minParticipants: 0,
    moduleCode: 'DTO4.WP',
    moodleCourse: null,
    phaseId: 2,
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
    extraInfo: 'Pflichtfach für den Studiengang Data Science',
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
    maxParticipants: 60,
    minParticipants: 0,
    moduleCode: 'NNDL4.WP',
    moodleCourse: null,
    phaseId: 2,
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
    extraInfo: 'weitere Teilnehmer über die Fakultät für Gestaltung',
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
    maxParticipants: 50,
    minParticipants: 0,
    moduleCode: 'PYTHON4.WP',
    moodleCourse: null,
    phaseId: 2,
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
    maxParticipants: 30,
    minParticipants: 0,
    moduleCode: 'MEDIBI.WP',
    moodleCourse: null,
    phaseId: 2,
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
      '30 Teilnehmer hochschulübergreifend (Unis Hohenheim und Bayreuth), 10 Plätze für die Fakultät für Informatik Augsburg',
    for: [
      'Applied Research (Master)',
      'Informatik (Master)',
      'Business Information Systems (Master)',
      'Industrielle Sicherheit',
    ],
    maxParticipants: 10,
    minParticipants: 0,
    moduleCode: 'S3G2.WP',
    moodleCourse: null,
    phaseId: 2,
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
      'Interessenten können sich direkt per E-Mail an Helia.Hollmann@hs-augsburg.de wenden',
    for: [
      'Applied Research (Master)',
      'Informatik (Master)',
      'Business Information Systems (Master)',
      'Industrielle Sicherheit',
    ],
    maxParticipants: 10,
    minParticipants: 0,
    moduleCode: '__CAS.WP',
    moodleCourse: null,
    phaseId: 2,
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
      'Business Information Systems (Master)',
      'Industrielle Sicherheit',
    ],
    maxParticipants: 20,
    minParticipants: 0,
    moduleCode: 'WSH2.WP',
    moodleCourse: null,
    phaseId: 2,
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
    for: ['Applied Research (Master)'],
    maxParticipants: null,
    minParticipants: 0,
    moduleCode: '__PRT.WP',
    moodleCourse: null,
    phaseId: 2,
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
    extraInfo: 'Plus weitere Teilnehmer von IMS',
    for: [
      'Applied Research (Master)',
      'Informatik (Master)',
      'Business Information Systems (Master)',
      'Industrielle Sicherheit',
    ],
    maxParticipants: 25,
    minParticipants: 0,
    moduleCode: 'WEBTEC4.WP',
    moodleCourse: null,
    phaseId: 2,
  },
]
