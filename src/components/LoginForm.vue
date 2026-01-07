<template>
  <div class="page page--gray">
    <div class="shell">
      <div class="card card--login">
        <h2 class="card__title">Admin login</h2>

        <form @submit.prevent="handleLogin">
          <div class="field">
            <label class="field__label">Login</label>
            <input
              v-model="username"
              class="field__input"
              placeholder="login"
              autocomplete="off"
            />
          </div>

          <div class="field">
            <label class="field__label">Password</label>
            <input
              v-model="password"
              type="password"
              class="field__input"
              placeholder="password"
              autocomplete="new-password"
            />
          </div>

          <p v-if="error" class="status error">{{ error }}</p>
          <p v-if="success" class="status ok">{{ success }}</p>

          <button type="submit" class="btn btn--primary btn--full">
            Log in
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import api from '@/api'

const router = useRouter()
const authStore = useAuthStore()

const username = ref('')
const password = ref('')
const error = ref('')
const success = ref('')

const handleLogin = async () => {
  error.value = ''
  success.value = ''

  if (!username.value || !password.value) {
    error.value = 'please enter login and password'
    return
  }

  try {
    const data = await api.login(username.value, password.value)

    authStore.setToken(data.access_token)
    success.value = 'login successful'

    setTimeout(() => {
      router.push('/control')
    }, 300)
  } catch (err) {
    error.value = 'invalid login or password'
  }
}
</script>
