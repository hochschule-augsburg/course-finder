<script setup lang="ts">
import type { RangeFilter } from '@/stores/FiltersStore'

import { useFiltersStore } from '@/stores/FiltersStore'
import { mdiFilter, mdiMagnify } from '@mdi/js'
import { storeToRefs } from 'pinia'
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { VChip, VChipGroup, VIcon, VTextField } from 'vuetify/components'

const { t } = useI18n()
const { search } = storeToRefs(useFiltersStore())
const filtersStore = useFiltersStore()
const showFilterDialog = ref(false)

function getRangeChipLabel(filter: RangeFilter) {
  const lowChanged = filter.range[0] !== filter.min
  const highChanged = filter.range[1] !== filter.max
  if (lowChanged && highChanged) {
    return `${filter.range[0]} < ${t(filter.name)} < ${filter.range[1]}`
  } else if (lowChanged) {
    return `${t(filter.name)} > ${filter.range[0]}`
  } else if (highChanged) {
    return `${t(filter.name)} < ${filter.range[1]}`
  }
}
</script>

<template>
  <div id="filter-section">
    <VTextField
      v-model:model-value="search"
      :label="t('global.search')"
      :on-click:clear="filtersStore.resetSearch"
      :prepend-inner-icon="mdiMagnify"
      bg-color="secondary"
      color="primary"
      type="text"
      clearable
      hide-details
      single-line
    />

    <VChipGroup>
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
        {{ t(option.option) }}
      </VChip>
      <VChip @click="showFilterDialog = true">
        <VIcon :icon="mdiFilter" />
      </VChip>
    </VChipGroup>

    <FilterDialog v-model="showFilterDialog" />
  </div>
</template>
