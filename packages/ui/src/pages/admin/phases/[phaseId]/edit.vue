<script setup lang="ts">
import { useRoute } from 'vue-router'

const route = useRoute()
//@ts-ignore
const phaseId = Number(route.params.phaseId)
</script>

<template>
  <AdminCreateEnroll :phase-id="phaseId ? phaseId : undefined" />
</template>
