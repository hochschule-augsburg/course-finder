<script setup lang="ts">
import { useUserStore } from '@/stores/UserStore'
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  VBtn,
  VCard,
  VCardActions,
  VCardText,
  VCardTitle,
  VForm,
  VSpacer,
  VTextField,
} from 'vuetify/components'

const emit = defineEmits<{
  success: []
}>()

const { t } = useI18n()

const userStore = useUserStore()

const username = ref('')
const password = ref('')

const isValid = computed(() => !!(username.value && password.value))
const pending = ref(false)
const error = ref<string>()

async function login() {
  pending.value = true
  let result: 'unknown-error' | Awaited<ReturnType<typeof userStore.login>>
  try {
    result = await userStore.login(username.value, password.value)
  } catch (e) {
    console.error(e)
    error.value = 'global.unknown-error'
    return
  } finally {
    pending.value = false
  }
  if (typeof result === 'object') {
    error.value = undefined
    emit('success')
    return
  }
  error.value = `error.${result}`
}

function validUsername(input: string) {
  return (
    !/[*().&[\]`|%^?{}! ,\\#+<>;"=']/.test(input) ||
    t('error.invalid-characters')
  )
}
</script>

<template>
  <VCard class="login-dialog-host">
    <VCardTitle>Login</VCardTitle>
    <VCardText>
      <VForm @submit="login">
        <VTextField
          v-model="username"
          :error="!!error"
          :label="t('username')"
          :rules="[validUsername]"
          autofocus
          required
          @update:model-value="error = undefined"
        />
        <VTextField
          v-model="password"
          :error-messages="error ? t(error) : undefined"
          :label="t('password')"
          type="password"
          required
          @keyup.enter="login"
          @update:model-value="error = undefined"
        />
      </VForm>
    </VCardText>
    <VCardActions>
      <VSpacer />
      <VBtn
        :disabled="!isValid"
        :loading="pending"
        color="primary"
        variant="tonal"
        @click="login()"
      >
        {{ t('login') }}
      </VBtn>
    </VCardActions>
  </VCard>
</template>

<style scoped lang="scss">
.login-dialog-host {
  min-width: 20rem;
}
</style>

<i18n lang="yaml">
en:
  login: Login
  username: Username
  password: Password
  error:
    service-not-available: Service not available
    invalid-credentials: Invalid credentials
    already-logged-in: Already logged in
    invalid-characters: Invalid characters
    tow-fa:
      code-invalid: Invalid code
      code-expired: Code expired
de:
  login: Einloggen
  username: Benutzername
  password: Passwort
  error:
    service-not-available: Dienst nicht verfügbar
    invalid-credentials: Ungültige Anmeldeinformationen
    already-logged-in: Bereits angemeldet
    invalid-characters: Ungültige Zeichen
    tow-fa:
      code-invalid: Ungültiger Code
      code-expired: Code abgelaufen
</i18n>
