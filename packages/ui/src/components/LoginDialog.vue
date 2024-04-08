<script setup lang="ts">
import { trpc } from '@/api/trpc'
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { VBtn, VForm, VProgressCircular, VTextField } from 'vuetify/components'

const emit = defineEmits<{
  success: []
}>()

const { t } = useI18n()

const username = ref('')
const password = ref('')
const pending = ref(false)

const isValid = computed(() => !!(username.value && password.value))
const error = ref<string>()
const twoFANeeded = ref(false)
const otp = ref('')

async function twoFALogin() {
  const result = await trpc.auth.twoFA.mutate({
    otp: otp.value,
    username: username.value,
  })
  if (result) {
    error.value = `error.two-fa.${result}`
    return
  }
  emit('success')
}

async function login() {
  pending.value = true
  let result
  try {
    result = await trpc.auth.login.mutate({
      password: password.value,
      username: username.value,
    })
  } catch (e) {
    console.error(e)
    result = 'unknown-error'
  } finally {
    pending.value = false
  }
  if (typeof result === 'object') {
    error.value = undefined
    return
  }
  if (result === 'two-fa-required') {
    twoFANeeded.value = true
    return
  }
  error.value = `error.${result}`
}
</script>
<template>
  <VCard>
    <VCardTitle>Login</VCardTitle>
    <VCardText>
      <VForm v-if="!twoFANeeded" @submit="login">
        <VTextField
          v-model="username"
          :error="!!error"
          :label="t('username')"
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
      <VTextField
        v-if="twoFANeeded"
        v-model="otp"
        :label="t('two-fa-code')"
        type="number"
        hide-spin-buttons
        @keyup.enter="twoFALogin"
      />
    </VCardText>
    <VCardActions>
      <VSpacer />
      <VBtn
        :disabled="!isValid"
        color="primary"
        @click="!twoFANeeded ? login() : twoFALogin()"
      >
        {{ t('login') }}
        <template v-if="pending" #prepend>
          <VProgressCircular indeterminate />
        </template>
      </VBtn>
    </VCardActions>
  </VCard>
</template>

<i18n lang="yaml">
en:
  login: Login
  username: Username
  password: Password
  error:
    service-not-available: Service not available
    two-fa-required: Two-factor authentication required
    invalid-credentials: Invalid credentials
    unknown-error: Unknown error
    already-logged-in: Already logged in
    tow-fa:
      code-invalid: Invalid code
      code-expired: Code expired
de:
  login: Einloggen
  username: Benutzername
  password: Passwort
  error:
    service-not-available: Dienst nicht verfügbar
    two-fa-required: Zwei-Faktor-Authentifizierung erforderlich
    invalid-credentials: Ungültige Anmeldeinformationen
    unknown-error: Unbekannter Fehler
    already-logged-in: Bereits angemeldet
    tow-fa:
      code-invalid: Ungültiger Code
      code-expired: Code abgelaufen
</i18n>
