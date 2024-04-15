<script setup lang="ts"></script>

<template>
  <VFooter class="custom-footer">
    <VRow justify="center" no-gutters>
      <VBtn
        :key="link"
        class="mx-2"
        color="black"
        href="https://www.tha.de/Service/Impressum.html"
        rounded="xl"
        target="_blank"
        variant="text"
      >
        Impressum
      </VBtn>
    </VRow>
  </VFooter>
</template>

<style scoped lang="scss">
.custom-footer {
  background-color: lightgrey;
  max-height: 50px;
  bottom: 0;
  width: 100%;
  margin-top: 80px;
}
</style>
