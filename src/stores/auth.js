// src/stores/auth.js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  // токен из localStorage или пустая строка
  const token = ref(localStorage.getItem('admin_token') || '')

  // проверка авторизации
  const isAuthenticated = computed(() => !!token.value)

  // сохранить токен
  function setToken(newToken) {
    token.value = newToken
    localStorage.setItem('admin_token', newToken)
  }

  // удалить токен (logout)
  function clearToken() {
    token.value = ''
    localStorage.removeItem('admin_token')
  }

  // вернуть публичное API
  return {
    token,
    isAuthenticated,
    setToken,
    clearToken
  }
})
