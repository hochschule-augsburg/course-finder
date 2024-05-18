<script setup lang="ts">
import { getDateFnsLocale } from '@/helper/LocaleDateFormat'
import { useFiltersStore } from '@/stores/FiltersStore'
import { startOfWeek } from 'date-fns'
import { range } from 'lodash-es'
import { storeToRefs } from 'pinia'
import { computed, defineModel } from 'vue'
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
const { locale, t } = useI18n()

const date = new Date()

const weekStartIndex = computed<number>(() =>
  startOfWeek(date, { locale: getDateFnsLocale(locale.value) }).getDay(),
)

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
              <template v-if="optionsFilter.name === 'filter.weekday'">
                <VChip
                  v-for="i in range(weekStartIndex, weekStartIndex + 7)"
                  :class="
                    optionsFilter.options[i % 7].selected ? 'text-primary' : ''
                  "
                  :key="optionsFilter.options[i % 7].option"
                  @click="
                    optionsFilter.options[i % 7].selected =
                      !optionsFilter.options[i % 7].selected
                  "
                >
                  {{ t(optionsFilter.options[i % 7].option) }}
                </VChip>
              </template>

              <VChip
                v-else
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
