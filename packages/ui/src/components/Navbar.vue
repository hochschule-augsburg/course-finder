<template>
  
<v-app-bar app >
      <v-toolbar-title>
        <span>FWP Anmeldung - Fakultät Informatik</span>
      </v-toolbar-title>

      <v-spacer></v-spacer>

      <v-btn icon>
        <v-icon size="28">mdi-account-circle</v-icon>
        <v-tooltip activator="parent" location="bottom">
          Administrator
        </v-tooltip>
      </v-btn>

      <v-btn icon>
        <v-icon size="28">mdi-help-circle-outline</v-icon>
        <v-tooltip activator="parent" location="bottom">
          Hilfe
        </v-tooltip>
      </v-btn>

      <v-btn icon @click="handleLogout"> 
        <v-icon size="28">mdi-logout-variant</v-icon>
        <v-tooltip activator="parent" location="bottom">
          Logout
        </v-tooltip>
      </v-btn>

</v-app-bar>
  
</template>


<script>
import { defineComponent } from 'vue';
import { useUserStore } from '@/stores/UserStore';

export default defineComponent({
  methods: {
    async handleLogout() {
      await useUserStore().logout(); // Funktioniert noch nicht !!!!
    }
  }
});
</script>

