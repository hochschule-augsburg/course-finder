<script lang="ts" setup>
import type { AdminOfferedCourse } from '@/stores/admin/AdminCoursesStore'

import { trpc } from '@/api/trpc'
import { useAdminCoursesStore } from '@/stores/admin/AdminCoursesStore'
import { assign } from 'lodash-es'
import { onBeforeMount, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { VBtn, VIcon, VTable, VTooltip } from 'vuetify/components'

const props = defineProps<{ phaseId: number }>()

const { locale, t } = useI18n()

const editableCourse = ref<AdminOfferedCourse>()
const showEditDialog = ref(false)

function openEditDialog(course: AdminOfferedCourse) {
  editableCourse.value = course
  showEditDialog.value = true
}

async function submitEdit(formData: AdminOfferedCourse | undefined) {
  if (!formData) {
    //TODO delete
    showEditDialog.value = false
    return
  }
  await trpc.admin.enroll.offeredCourse.update.mutate({
    ...formData,
    phaseId: props.phaseId,
  })
  assign(
    adminCoursesStore.phaseOfferedCourses[props.phaseId].find(
      (e) => e.moduleCode === formData.moduleCode,
    ),
    formData,
  )
  showEditDialog.value = false
}

const adminCoursesStore = useAdminCoursesStore()
onBeforeMount(() => {
  void adminCoursesStore.fetchOfferedCourses(props.phaseId)
})
</script>

<template>
  <div>
    <VTable>
      <thead>
        <tr>
          <th>Module code</th>
          <th>Title</th>
          <th>Studiengänge</th>
          <th>min</th>
          <th>max</th>
          <th>info</th>
          <th />
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="course in adminCoursesStore.phaseOfferedCourses[phaseId]"
          :key="course.moduleCode"
        >
          <td>{{ course.moduleCode }}</td>
          <td>
            {{
              locale === 'en'
                ? course.Course.title?.en
                : course.Course.title?.de
            }}
          </td>
          <td>
            {{
              course.for.map((e) =>
                e
                  .replace('(', '')
                  .split(' ')
                  .map((e) => e[0])
                  .join(''),
              )
            }}
          </td>
          <td>
            {{ course.minParticipants }}
          </td>
          <td>
            {{ course.maxParticipants }}
          </td>
          <td>
            <div v-if="course.extraInfo" icon>
              <VIcon>mdi-information</VIcon>
              <VTooltip activator="parent" location="left">
                {{ course.extraInfo }}
              </VTooltip>
            </div>
          </td>
          <td>
            <VBtn class="float-right" @click="openEditDialog(course)">
              <VIcon size="25">mdi-pencil</VIcon>
            </VBtn>
          </td>
        </tr>
      </tbody>
    </VTable>
    <EditOfferedCourse
      :offered-course="editableCourse"
      :visible="showEditDialog"
      @cancel="showEditDialog = false"
      @submit="submitEdit"
    />
  </div>
</template>
