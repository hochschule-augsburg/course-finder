<script setup lang="ts">
import { useFiltersStore } from '@/stores/filters'
import { storeToRefs } from 'pinia'
import { defineModel } from 'vue'

const showFilterDialog = defineModel<boolean>()
const filtersStore = useFiltersStore()
const { optionsFilters, rangeFilters } = storeToRefs(useFiltersStore())

function resetFilters() {
  filtersStore.resetFilters()
  showFilterDialog.value = false
}
</script>

<template>
  <VDialog v-model:model-value="showFilterDialog" max-width="500">
    <VCard prepend-icon="mdi-filter" title="Filter">
      <VCardText>
        <template v-for="rangeFilter in rangeFilters" :key="rangeFilter.name">
          <h2 class="text-h6 mb-2">
            {{ rangeFilter.name }}
          </h2>
          <VRangeSlider
            v-model:model-value="rangeFilter.range"
            :max="rangeFilter.max"
            :min="rangeFilter.min"
            class="mt-2 mx-3"
            step="1"
            strict
            thumb-label
          />
        </template>
        <template
          v-for="optionsFilter in optionsFilters"
          :key="optionsFilter.name"
        >
          <h2 class="text-h6 mb-2">
            {{ optionsFilter.name }}
          </h2>

          <VChipGroup class="mb-4" column multiple>
            <VChip
              v-for="option in optionsFilter.options"
              :class="option.selected ? 'text-primary' : ''"
              :key="option.option"
              @click="option.selected = !option.selected"
            >
              {{ option.option }}
            </VChip>
          </VChipGroup>
        </template>
        <VDivider />
      </VCardText>

      <VCardActions class="mx-4">
        <VBtn text="Reset" variant="plain" @click="resetFilters" />
        <VSpacer />
        <VBtn
          color="primary"
          text="Close"
          variant="tonal"
          @click="showFilterDialog = false"
        />
      </VCardActions>
    </VCard>
  </VDialog>
</template>