<script setup lang="ts">
//
</script>

<template>
  <VContainer class="fill-height">
    <VResponsive class="align-centerfill-height mx-auto" max-width="900">
      <VImg class="mb-4" height="150" src="@/assets/logo.png" />

      <div class="text-center">
        <div class="text-body-2 font-weight-light mb-n1">Welcome to</div>

        <h1 class="text-h2 font-weight-bold">Vuetify</h1>
      </div>

      <div class="py-4" />

      <VRow>
        <VCol cols="12">
          <VCard
            class="py-4"
            color="surface-variant"
            image="https://cdn.vuetifyjs.com/docs/images/one/create/feature.png"
            prepend-icon="mdi-rocket-launch-outline"
            rounded="lg"
            variant="outlined"
          >
            <template #image>
              <VImg position="top right" />
            </template>

            <template #title>
              <h2 class="text-h5 font-weight-bold">Get started</h2>
            </template>

            <template #subtitle>
              <div class="text-subtitle-1">
                Replace this page by removing
                <VKbd>{{ `<HelloWorld />` }}</VKbd> in
                <VKbd>pages/index.vue</VKbd>.
              </div>
            </template>

            <VOverlay
              opacity=".12"
              scrim="primary"
              contained
              model-value
              persistent
            />
          </VCard>
        </VCol>

        <VCol cols="6">
          <VCard
            append-icon="mdi-open-in-new"
            class="py-4"
            color="surface-variant"
            href="https://vuetifyjs.com/"
            prepend-icon="mdi-text-box-outline"
            rel="noopener noreferrer"
            rounded="lg"
            subtitle="Learn about all things Vuetify in our documentation."
            target="_blank"
            title="Documentation"
            variant="text"
          >
            <VOverlay
              opacity=".06"
              scrim="primary"
              contained
              model-value
              persistent
            />
          </VCard>
        </VCol>

        <VCol cols="6">
          <VCard
            append-icon="mdi-open-in-new"
            class="py-4"
            color="surface-variant"
            href="https://vuetifyjs.com/introduction/why-vuetify/#feature-guides"
            prepend-icon="mdi-star-circle-outline"
            rel="noopener noreferrer"
            rounded="lg"
            subtitle="Explore available framework Features."
            target="_blank"
            title="Features"
            variant="text"
          >
            <VOverlay
              opacity=".06"
              scrim="primary"
              contained
              model-value
              persistent
            />
          </VCard>
        </VCol>

        <VCol cols="6">
          <VCard
            append-icon="mdi-open-in-new"
            class="py-4"
            color="surface-variant"
            href="https://vuetifyjs.com/components/all"
            prepend-icon="mdi-widgets-outline"
            rel="noopener noreferrer"
            rounded="lg"
            subtitle="Discover components in the API Explorer."
            target="_blank"
            title="Components"
            variant="text"
          >
            <VOverlay
              opacity=".06"
              scrim="primary"
              contained
              model-value
              persistent
            />
          </VCard>
        </VCol>

        <VCol cols="6">
          <VCard
            append-icon="mdi-open-in-new"
            class="py-4"
            color="surface-variant"
            href="https://discord.vuetifyjs.com"
            prepend-icon="mdi-account-group-outline"
            rel="noopener noreferrer"
            rounded="lg"
            subtitle="Connect with Vuetify developers."
            target="_blank"
            title="Community"
            variant="text"
          >
            <VOverlay
              opacity=".06"
              scrim="primary"
              contained
              model-value
              persistent
            />
          </VCard>
        </VCol>
      </VRow>
    </VResponsive>
  </VContainer>
</template>
