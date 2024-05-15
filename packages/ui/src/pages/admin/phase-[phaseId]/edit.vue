<script setup lang="ts">
import { useRoute } from 'vue-router'

const route = useRoute()
const phaseId = Number(route.params.phaseId)
</script>

<template>
  <AdminCreateEnroll :phase-id />
</template>
