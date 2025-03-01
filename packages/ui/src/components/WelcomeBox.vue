<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { VSheet } from 'vuetify/components'

const props = defineProps<{ loggedIn: boolean }>()
const { t } = useI18n()
</script>

<template>
  <VSheet
    class="px-4 py-3"
    color="secondary"
    id="enrollment-overview"
    rounded="lg"
  >
    <h2>{{ t('welcome-title') }}</h2>
    <p>{{ t('welcome-text') }}</p>
    <v-if> </v-if>
    <p v-if="!props.loggedIn">{{ t('login-text') }}</p>
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
de:
  welcome-title: Willkommen
  welcome-text: |
    Willkommen auf der Anmeldeseite für Wahlpflichtfächer 
    der Fakultät für Informatik an der Technischen Hochschule Augsburg.
  login-text:
    Melde dich an, um dich für Kurse zu registrieren. Die Kursübersicht ist auch
    ohne Anmeldung verfügbar.
</i18n>
