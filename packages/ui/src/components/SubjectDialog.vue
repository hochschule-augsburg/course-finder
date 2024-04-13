<script setup lang="ts">
const { selectedSubject } = defineProps<{
  selectedSubject?: number
}>()
</script>

<template>
  <h1>This is the Subject Dialog {{ selectedSubject }}</h1>
</template>
