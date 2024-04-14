<template>
  <v-footer class="custom-footer">
    <v-row justify="center" no-gutters>
      <v-btn
        :key="link"
        class="mx-2"
        color="black"
        rounded="xl"
        variant="text"
        href="https://www.tha.de/Service/Impressum.html"
        target="_blank" 
      >
        Impressum
      </v-btn>
    </v-row>
  </v-footer>
</template>


<style scoped>
.custom-footer {
    background-color: lightgrey; 
    max-height: 50px;
    bottom: 0;
    width: 100%;
    margin-top: 80px;
}
</style>