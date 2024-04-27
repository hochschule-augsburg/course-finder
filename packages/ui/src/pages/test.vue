<script setup lang="ts">
import type { Subject } from '@/stores/enrollment'

import { ref } from 'vue'

const showSubjectDialog = ref(false)
const selectedSubject = ref<Subject>({
  Lecturers: [],
  allLecturers: ['Dieter Thalmayr'],
  creditPoints: 2,
  description: {
    de: 'Die Inhalte von Linux LPIC Teil 2 sind ebenfalls an die Themen angelehnt, die das Linux\nProfessional Institute veröffentlicht:\n\t• Paketverwaltung\n\t• GNU- und UNIX-Kommandos\n\t• Shells und Grundlagen der Skriptprogrammierung\n\t• Administrative Aufgaben\n\t• Netzwerk-Grundlagen\n\t• Einrichten eines Netzwerkdienstes\n\t• Sicherheit',
    en: '',
  },
  examType: { content: [], for: 'Klausur, 60 Minuten, keine Hilfsmittel' },
  examinationNumbers: [
    'IN 3970336, 2970820',
    'TI 3976547, 2976593',
    'WI 3975741',
    'IIS 9775138',
  ],
  externLecturers: ['Dieter Thalmayr'],
  facultyName: 'Informatik',
  language: 'Deutsch',
  learningGoals: {
    de: 'Die Teilnehmer sollen sowohl Einblicke in die Funktionsweise von GNU/Linux bekommen, als auch die fortgeschrittene Bedienung und die grundlegende Administration von\nLinux-Rechnern lernen. Am Ende des Blocks können die Teilnehmer optional eine "Linux Professional Institute"(LPI) Prüfung ablegen, um sich ihr Wissen mit einem in der\nWirtschaft angesehenen „LPIC“ Zertifikat bestätigen zu lassen.',
    en: '',
  },
  literature: [
    'Schulungsmaterial der Firma tuxcademy:',
    'www.tuxcademy.org (kostenlos)',
    'Harald Maassen, LPIC-1. Sicher zur erfolgreichen Linux Zertifizierung, Galileo Computing, jeweils neuste Auflage.',
    '(wird in der Vorlesung bekannt gegeben',
    'Weitere Informationen:',
    'http://hhoegl.informatik.hs-augsburg.de/hhweb/lpic',
    'http://www.lpice.eu/de',
  ],
  moduleCode: '../src/pages/DIBUS.WP',
  moodleCourse: null,
  offeredCourse: {
    appointments: {
      dates: [
        {
          from: new Date('2024-02-22T01:00:00.000'),

          to: new Date('2024-02-24T01:00:00.000'),
        },
      ],
      type: 'block',
    },
    extraInfo: 'ausgebucht',
    maxParticipants: 25,
    minParticipants: 0,
    moduleCode: '../src/pages/DIBUS.WP',
    phaseId: 1,
  },
  points: 0,
  published: true,
  requirements: ['Keine'],
  selected: false,
  semesterHours: 2,
  timeDistribution: null,
  title: { de: 'Linux LPIC Advanced', en: 'Linux LPIC Advanced' },
  website: null,
})
</script>

<template>
  <div>
    <h2>for mobile testing</h2>
    <VBtn text="show dialog" @click="showSubjectDialog = true" />
    <SubjectDialog v-model="showSubjectDialog" :subject="selectedSubject" />
  </div>
</template>
