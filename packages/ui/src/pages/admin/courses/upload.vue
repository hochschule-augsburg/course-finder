<script lang="ts" setup>
import { VCol, VFileInput, VRow } from 'vuetify/components'
</script>

<template>
  <div class="mx-15">
    <VContainer>
      <VRow justify="center">
        <VCol>
          <VFileInput
            accept=".pdf"
            label="Select file"
            placeholder="Select file"
            outlined
          />
        </VCol>
      </VRow>
    </VContainer>
  </div>
</template>
