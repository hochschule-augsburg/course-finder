<script setup lang="ts">
import type { RangeFilter } from '@/stores/filters'

import { useFiltersStore } from '@/stores/filters'
import { storeToRefs } from 'pinia'
import { ref } from 'vue'
import { VChip, VChipGroup, VIcon, VTextField } from 'vuetify/components'

const { search } = storeToRefs(useFiltersStore())
const filtersStore = useFiltersStore()
const showFilterDialog = ref(false)

function getRangeChipLabel(filter: RangeFilter) {
  const lowChanged = filter.range[0] !== filter.min
  const highChanged = filter.range[1] !== filter.max
  if (lowChanged && highChanged) {
    return `${filter.range[0]} < ${filter.name} < ${filter.range[1]}`
  } else if (lowChanged) {
    return `${filter.name} > ${filter.range[0]}`
  } else if (highChanged) {
    return `${filter.name} < ${filter.range[1]}`
  }
}
</script>

<template>
  <div class="my-4">
    <VTextField
      v-model:model-value="search"
      :on-click:clear="filtersStore.resetSearch"
      bg-color="rgb(var(--v-theme-secondary))"
      class="mx-3"
      color="rgb(var(--v-theme-primary))"
      label="Search"
      prepend-inner-icon="mdi-magnify"
      type="text"
      clearable
      hide-details
      single-line
    />

    <VChipGroup class="mx-3">
      <VChip
        v-for="activeRangeFilter in filtersStore.activeRangeFilters"
        :key="activeRangeFilter.name"
        class="text-primary"
        closable
        @click:close="() => filtersStore.resetFilter(activeRangeFilter.name)"
      >
        {{ getRangeChipLabel(activeRangeFilter) }}
      </VChip>
      <VChip
        v-for="option in filtersStore.activeOptions"
        :key="option.option"
        class="text-primary"
        closable
        @click:close="() => filtersStore.resetFilter(option.option)"
      >
        {{ option.option }}
      </VChip>
      <VChip @click="showFilterDialog = true">
        <VIcon icon="mdi-filter" />
      </VChip>
    </VChipGroup>

    <FilterDialog v-model="showFilterDialog" />
  </div>
</template>
