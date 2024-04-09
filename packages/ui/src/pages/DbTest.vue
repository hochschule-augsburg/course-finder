<script setup lang="ts">
import { trpc } from '@/api/trpc'
const courses = await trpc.course.getCourses.query()
console.log(courses)
</script>
<template>
  <div>check console</div>
</template>
