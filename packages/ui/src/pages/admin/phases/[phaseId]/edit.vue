<script setup lang="ts">
import { useRoute } from 'vue-router'

const route = useRoute()
//@ts-expect-error auto type not working
const phaseId = Number(route.params.phaseId)
</script>

<template>
  <AdminCreateEnroll :phase-id="phaseId ? phaseId : undefined" />
</template>
