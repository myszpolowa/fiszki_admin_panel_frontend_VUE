<template>
  <section class="stack">
    <!-- поиск пользователя -->
    <div class="card card--inline">
      <div class="field field--inline">
        <label class="field__label">Search user</label>
        <input
          v-model="searchQuery"
          class="field__input"
          placeholder="enter login"
        />
      </div>
      <button @click="handleSearch" class="btn btn--primary">search</button>
    </div>

    <!-- список пользователей -->
    <article class="card card--item">
      <button @click="loadUsers" class="btn btn--primary" style="margin-bottom:8px;">
        refresh users
      </button>

      <div v-if="loading">Loading...</div>
      <div v-else-if="error" class="status error">{{ error }}</div>
      <div v-else-if="!filteredUsers.length">No users found.</div>

      <div v-else>
        <div
          v-for="user in filteredUsers"
          :key="user.user_id"
          class="item-card"
        >
          <div class="item-card__text">
            <p class="item-card__line">
              <span class="item-card__label">login:</span>
              <span class="item-card__value">{{ user.login }}</span>
            </p>
            <p class="item-card__line">
              <span class="item-card__label">password:</span>
              <span class="item-card__value">{{ user.password }}</span>
            </p>
            <p class="item-card__line">
              <span class="item-card__label">progress:</span>
              <span class="item-card__value">{{ user.progress }}</span>
            </p>
          </div>
          <div class="item-card__actions">
            <button
              @click="resetProgress(user.user_id, user.login)"
              class="btn btn--primary btn--small"
            >
              reset progress
            </button>
            <button
              @click="deleteUser(user.user_id, user.login)"
              class="btn btn--small btn--danger"
            >
              delete user
            </button>
          </div>
        </div>
      </div>
    </article>

    <!-- модалка подтверждения -->
    <ConfirmModal
      v-if="showConfirm"
      :title="confirmTitle"
      :showWarning="confirmWarning"
      @confirm="handleConfirm"
      @cancel="showConfirm = false"
    />
  </section>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import api from '@/api'
import ConfirmModal from './ConfirmModal.vue'

const users = ref([])
const searchQuery = ref('')
const loading = ref(false)
const error = ref('')

// модалка подтверждения
const showConfirm = ref(false)
const confirmTitle = ref('')
const confirmWarning = ref(true)
const confirmAction = ref(null)

const filteredUsers = computed(() => {
  if (!searchQuery.value) return users.value

  const query = searchQuery.value.toLowerCase()
  return users.value.filter(u =>
    u.login.toLowerCase().includes(query)
  )
})

const loadUsers = async () => {
  loading.value = true
  error.value = ''

  try {
    users.value = await api.getUsers()
  } catch (err) {
    error.value = 'Failed to load users'
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  if (!searchQuery.value) {
    loadUsers()
  }
}

const resetProgress = (userId, login) => {
  confirmTitle.value = `reset progress for user "${login}"?`
  confirmWarning.value = true
  confirmAction.value = async () => {
    try {
      await api.resetUserProgress(userId)
      await loadUsers()
    } catch (err) {
      alert('Failed to reset progress')
    }
  }
  showConfirm.value = true
}

const deleteUser = (userId, login) => {
  confirmTitle.value = `delete user "${login}"?`
  confirmWarning.value = true
  confirmAction.value = async () => {
    try {
      await api.deleteUser(userId)
      await loadUsers()
    } catch (err) {
      alert('Failed to delete user')
    }
  }
  showConfirm.value = true
}

const handleConfirm = async () => {
  showConfirm.value = false
  if (confirmAction.value) {
    await confirmAction.value()
  }
}

onMounted(() => {
  loadUsers()
})
</script>
