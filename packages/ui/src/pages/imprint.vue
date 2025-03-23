<script lang="ts" setup>
import { mdiDomain, mdiGithub } from '@mdi/js';
import { useI18n } from 'vue-i18n';
import  logo  from '../../../docs/public/logo.svg';

const {t} = useI18n();



</script>

<template>
  <v-container class="text-center">
    <v-row justify="center">
      <v-col cols="12" md="8">
        <v-img
          :src="logo"
          alt="CourseFinder Logo"
          max-width="200"
          class="mx-auto my-4"
        />

        <h1 class="text-h5 font-weight-bold">{{ t('imprint.title') }}</h1>
        <p class="text-body-1">{{ t('imprint.developedBy') }}</p>

        <v-list dense>
          <v-list-item
            :href="'https://www.tha.de/impressum'"
            target="_blank"
          >
            <v-list-item>
              <v-icon :icon="mdiDomain" />
            </v-list-item>
            <v-list-item>
              {{ t('imprint.university') }}
            </v-list-item>
          </v-list-item>

          <v-list-item
            :href="'https://github.com/hochschule-augsburg/course-finder'"
            target="_blank"
          >
            <v-list-item>
              <v-icon :icon="mdiGithub" />
            </v-list-item>
            <v-list-item>
              {{ t('imprint.github') }}
            </v-list-item>
          </v-list-item>
        </v-list>
      </v-col>
    </v-row>
  </v-container>
</template>

<i18n lang="yaml">
de:
  imprint:
    title: "Impressum"
    developedBy: "CourseFinder ist eine App von Studierenden für Studierende."
    university: "Impressum der THA"
    github: "GitHub Repository"

en:
  imprint:
    title: "Imprint"
    developedBy: "CourseFinder is an app developed by students for students."
    university: "University Imprint"
    github: "GitHub Repository"
</i18n>

<style lang="scss" scoped></style>
