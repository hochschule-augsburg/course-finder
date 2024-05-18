<script setup lang="ts">
import { useFiltersStore } from '@/stores/FiltersStore'
import { storeToRefs } from 'pinia'
import { defineModel } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  VBtn,
  VCard,
  VCardActions,
  VCardText,
  VChip,
  VChipGroup,
  VDialog,
  VDivider,
  VRangeSlider,
  VSpacer,
} from 'vuetify/components'

const showFilterDialog = defineModel<boolean>()
const filtersStore = useFiltersStore()
const { optionsFilters, rangeFilters } = storeToRefs(useFiltersStore())
const { t } = useI18n()

function resetFilters() {
  filtersStore.resetFilters()
  showFilterDialog.value = false
}
</script>

<template>
  <VDialog v-model:model-value="showFilterDialog" max-width="500">
    <VCard :title="t('filter.title')" prepend-icon="mdi-filter">
      <VCardText>
        <template v-for="rangeFilter in rangeFilters" :key="rangeFilter.name">
          <template v-if="!rangeFilter.hidden">
            <h2 class="text-h6 mb-2">
              {{ t(rangeFilter.name) }}
            </h2>
            <VRangeSlider
              v-model:model-value="rangeFilter.range"
              :max="rangeFilter.max"
              :min="rangeFilter.min"
              class="mt-2 mx-3"
              color="rgb(var(--v-theme-primary))"
              step="1"
              strict
              thumb-label
            />
          </template>
        </template>
        <template
          v-for="optionsFilter in optionsFilters.filter((e) => !e.hidden)"
          :key="optionsFilter.name"
        >
          <template v-if="!optionsFilter.hidden">
            <h2 class="text-h6 mb-2">
              {{ t(optionsFilter.name) }}
            </h2>

            <VChipGroup class="mb-4" column multiple>
              <VChip
                v-for="option in optionsFilter.options"
                :class="option.selected ? 'text-primary' : ''"
                :key="option.option"
                @click="option.selected = !option.selected"
              >
                {{ t(option.option) }}
              </VChip>
            </VChipGroup>
          </template>
        </template>
        <VDivider />
      </VCardText>

      <VCardActions class="mx-4">
        <VBtn :text="t('global.reset')" variant="plain" @click="resetFilters" />
        <VSpacer />
        <VBtn
          :text="t('global.close')"
          color="primary"
          variant="tonal"
          @click="showFilterDialog = false"
        />
      </VCardActions>
    </VCard>
  </VDialog>
</template>
