<template>
  <div class="page page--gray">
    <header class="topbar">
      <button @click="logout" class="btn btn--ghost topbar__logout">
        log out
      </button>
    </header>

    <main class="shell shell--wide">
      <!-- tabs -->
      <div class="tabs">
        <button
          @click="activeTab = 'users'"
          :class="['tabs__item', { 'tabs__item--active': activeTab === 'users' }]"
        >
          users
        </button>
        <button
          @click="activeTab = 'levels'"
          :class="['tabs__item', { 'tabs__item--active': activeTab === 'levels' }]"
        >
          levels
        </button>
      </div>

      <!-- показываем нужную страницу -->
      <UsersPage v-if="activeTab === 'users'" />
      <LevelsPage v-else />
    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import UsersPage from './UsersPage.vue'
import LevelsPage from './LevelsPage.vue'

const router = useRouter()
const authStore = useAuthStore()
const activeTab = ref('users')

const logout = () => {
  authStore.clearToken()
  router.push('/')
}
</script>
