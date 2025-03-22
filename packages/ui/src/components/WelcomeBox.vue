<script setup lang="ts">
import { useUserStore } from '@/stores/UserStore'
import { useI18n } from 'vue-i18n'
import { VSheet } from 'vuetify/components'

const { t } = useI18n()
const userStore = useUserStore()
</script>

<template>
  <VSheet
    id="enrollment-overview"
    class="px-4 py-3"
    color="secondary"
    rounded="lg"
  >
    <h2>{{ t('welcome-title') }} {{ userStore.user?.name }}</h2>
    <p>{{ t('welcome-text') }}</p>
    <p v-if="!userStore.user">{{ t('login-text') }}</p>
    <p v-if="userStore.user?.Student && !userStore.mayEnroll">
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
  login-text:
    Log in to register for courses. You can view courses without logging in.
  may-enroll-info: |
    Since you are still in the orientation phase, you cannot yet
    register for courses. However, you are welcome to inform yourself
    about the courses offered.
de:
  welcome-title: Willkommen
  welcome-text: |
    Willkommen auf der Anmeldeseite für Wahlpflichtfächer 
    der Fakultät für Informatik an der Technischen Hochschule Augsburg.
  login-text:
    Melde dich an, um dich für Kurse zu registrieren. Die Kursübersicht ist auch
    ohne Anmeldung verfügbar.
  may-enroll-info: |
    Da du dich noch in der Orientierungsphase befindest, kannst du dich
    noch nicht für Kurse anmelden. Du kannst dich jedoch gerne schon
    über die angebotenen Kurse informieren.
</i18n>
