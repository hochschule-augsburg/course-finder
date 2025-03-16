<script setup lang="ts">
import { useUserStore } from '@/stores/UserStore'
import { useI18n } from 'vue-i18n'
import { VSheet } from 'vuetify/components'

const { locale, t } = useI18n()
const userStore = useUserStore()
</script>

<template>
  <VSheet
    class="px-4 py-3"
    color="secondary"
    id="enrollment-overview"
    rounded="lg"
  >
    <h2>{{ t('welcome-title') }} {{ userStore.user?.name }}</h2>
    <p>{{ t('welcome-text') }}</p>
    <p v-if="!userStore.user">{{ t('login-text') }}</p>
    <p v-else-if="userStore.user.Student">
      <i18n-t keypath="student-more-info">
        <template #link>
          <a
            :href="
              locale === 'de'
                ? 'https://www.tha.de/Informatik/Studiengaenge-Informatik.html'
                : 'https://www.tha.de/en/Computer-Science/Programs.html'
            "
          >
            {{ t('study-programs-link') }}
          </a>
        </template>
      </i18n-t>
    </p>
    <p
      v-if="
        userStore.user?.Student?.fieldOfStudy ===
        'Interaktive Medien (Bachelor)'
      "
    >
      {{ t('ia-no-reg') }}
    </p>
    <p v-else-if="userStore.user?.Student && !userStore.mayEnroll">
      {{ t('may-enroll-info') }}
    </p>
  </VSheet>
</template>

<i18n lang="yaml">
en:
  welcome-title: Welcome
  welcome-text: |
    Welcome to the registration page for elective courses 
    at the Faculty of Computer Science at Augsburg University of Applied Sciences.
  login-text: |
    Log in with your RZ-Account to register for courses. You can view courses
    without logging in.
  student-more-info: |
    This page provides all the information you need to plan your semester.
    You can find more details on the pages of the {link}.
  study-programs-link: study programs
  may-enroll-info: |
    Since you are still in the orientation phase, you cannot yet
    register for courses. However, you are welcome to inform yourself
    about the courses offered.
  ia-no-reg: |
    Since you are studying Interactive Media, you cannot register for courses here.
    However, you can contact the lecturers directly by email to enroll.

de:
  welcome-title: Willkommen
  welcome-text: |
    Willkommen auf der Anmeldeseite für Wahlpflichtfächer 
    der Fakultät für Informatik an der Technischen Hochschule Augsburg.
  login-text: |
    Melde dich mit deinem RZ-Account an, um dich für Kurse zu registrieren. Die
    Kursübersicht ist auch ohne Anmeldung verfügbar.
  student-more-info: |
    Diese Seite bietet alle Informationen für die Planung deines Semesters.
    Du kannst dich aber noch genauer auf den Seiten der {link} informieren.
  study-programs-link: Studiengänge
  may-enroll-info: |
    Da du dich noch in der Orientierungsphase befindest, kannst du dich
    noch nicht für Kurse anmelden. Du kannst dich jedoch gerne schon
    über die angebotenen Kurse informieren.
  ia-no-reg: |
    Da du Interaktive Medien studierst, kannst du dich hier nicht für Kurse
    anmelden. Du kannst aber die Dozenten direkt per E-Mail kontaktieren, um
    dich einzuschreiben.
</i18n>
