<script setup lang="ts">
import { useUserStore } from '@/stores/UserStore'
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { VBtn, VForm, VProgressCircular, VTextField } from 'vuetify/components'

const emit = defineEmits<{
  success: []
}>()

const { t } = useI18n()

const { login: storeLogin } = useUserStore()

const username = ref('')
const password = ref('')
const otp = ref('')

const isValid = computed(() => !!(username.value && password.value))
const twoFANeeded = ref(false)
const pending = ref(false)
const error = ref<string>()

async function twoFALogin() {
  pending.value = true
  let result: 'unknown-error' | Awaited<ReturnType<typeof storeLogin>>
  try {
    result = await storeLogin(username.value, password.value, otp.value)
  } catch (e) {
    console.error(e)
    error.value = 'unknown-error'
    return
  } finally {
    pending.value = false
  }
  if (typeof result === 'object') {
    emit('success')
    return
  }
  error.value = `error.two-fa.${result}`
}

async function login() {
  pending.value = true
  let result: 'unknown-error' | Awaited<ReturnType<typeof storeLogin>>
  try {
    result = await storeLogin(username.value, password.value)
  } catch (e) {
    console.error(e)
    error.value = 'unknown-error'
    return
  } finally {
    pending.value = false
  }
  if (typeof result === 'object') {
    error.value = undefined
    emit('success')
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
  two-fa-code: Two-factor code
  error:
    service-not-available: Service not available
    two-fa-required: Two-factor authentication required
    invalid-credentials: Invalid credentials
    already-logged-in: Already logged in
    tow-fa:
      code-invalid: Invalid code
      code-expired: Code expired
de:
  login: Einloggen
  username: Benutzername
  password: Passwort
  two-fa-code: Zwei-Faktor-Code
  error:
    service-not-available: Dienst nicht verfügbar
    two-fa-required: Zwei-Faktor-Authentifizierung erforderlich
    invalid-credentials: Ungültige Anmeldeinformationen
    already-logged-in: Bereits angemeldet
    tow-fa:
      code-invalid: Ungültiger Code
      code-expired: Code abgelaufen
</i18n>