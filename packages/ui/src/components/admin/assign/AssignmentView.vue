<script lang="ts" setup>
import { useI18n } from 'vue-i18n'
import { VBtn, VCol, VContainer, VIcon, VRow, VTable } from 'vuetify/components'

const props = defineProps<{ phaseId: number }>()
const { t } = useI18n()
</script>

<template>
  <VContainer>
    <VCol :cols="3">
      <VRow justify-md="space-around">
        <VBtn v-if="true">Close</VBtn>
        <VBtn v-if="true /*else*/">Assign</VBtn>
        <VBtn>Edit</VBtn>
      </VRow>
    </VCol>
    <VTable>
      <thead>
        <tr>
          <th class="text-left">{{ t('no.') }}</th>
          <th class="text-left">{{ t('name') }}</th>
          <th class="text-left">{{ t('lecturer') }}</th>
          <th>CP</th>
          <th>SWS</th>
          <th>
            <VBtn @click="openNewDialog">
              New &nbsp; <VIcon>mdi-invoice-text-plus</VIcon>
            </VBtn>
          </th>
        </tr>
      </thead>
      <tbody />
    </VTable>
  </VContainer>
</template>

<style lang="scss" scoped></style>
