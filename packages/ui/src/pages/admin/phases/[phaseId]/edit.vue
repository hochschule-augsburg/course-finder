<script setup lang="ts">
import { useRoute } from 'vue-router'
import { definePage } from 'vue-router/auto'

definePage({
  name: 'admin.phases.phaseId.edit',
})

const route = useRoute()
const phaseId = Number(route.params.phaseId)
</script>

<template>
  <AdminCreateEnroll :phase-id="phaseId ? phaseId : undefined" />
</template>
