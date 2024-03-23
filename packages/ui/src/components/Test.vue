<!-- eslint-disable vue/multi-word-component-names -->
<!-- eslint-disable vue/valid-v-slot -->
<template>
  <v-card>
    <v-layout>
      <v-navigation-drawer
        expand-on-hover
        rail
      >
        <v-list>
          <v-list-item
            prepend-avatar="https://randomuser.me/api/portraits/women/85.jpg"
            subtitle="sandra_a88@gmailcom"
            title="Sandra Adams"
          />
        </v-list>

        <v-divider />

        <v-list
          density="compact"
          nav
        >
          <v-list-item
            prepend-icon="mdi-folder"
            title="My Files"
            value="myfiles"
          />
          <v-list-item
            prepend-icon="mdi-account-multiple"
            title="Shared with me"
            value="shared"
          />
          <v-list-item
            prepend-icon="mdi-star"
            title="Starred"
            value="starred"
          />
        </v-list>
      </v-navigation-drawer>

      <v-main style="height: 100vh">
        <v-stepper
          :items="['Step 1', 'Step 2', 'Step 3']"
          alt-labels
          hide-actions
        >
          <template #item.1 />

          <template #item.2>
            <v-card
              flat
              title="Step Two"
            >
              ...
            </v-card>
          </template>

          <template #item.3>
            <v-card
              flat
              title="Step Three"
            >
              ...
            </v-card>
          </template>
        </v-stepper>
      </v-main>
    </v-layout>
  </v-card>
</template>