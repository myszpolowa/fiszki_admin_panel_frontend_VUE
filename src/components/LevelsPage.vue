<template>
  <section class="stack">
    <!-- форма создания уровня -->
    <div class="card card--inline">
      <div class="field field--inline">
        <label class="field__label">New level</label>
        <input
          v-model="newLevelName"
          class="field__input"
          placeholder="level name"
          @keyup.enter="createLevel"
        />
        <p v-if="createError" class="field__error">{{ createError }}</p>
      </div>
      <button @click="createLevel" class="btn btn--primary">add level</button>
    </div>

    <!-- список уровней -->
    <article class="card card--item">
      <div v-if="loading">Loading...</div>
      <div v-else-if="error" class="status error">{{ error }}</div>
      <div v-else-if="!levels.length">No levels yet.</div>

      <div v-else>
        <div
          v-for="level in levels"
          :key="level.level_id"
          class="item-card"
        >
          <div class="item-card__text">
            <p class="item-card__line">
              <span class="item-card__label">level name:</span>
              <span class="item-card__value">{{ level.level_name }}</span>
            </p>
            <p class="item-card__line">
              <span class="item-card__label">number of questions:</span>
              <span class="item-card__value">{{ level.questions_count }}</span>
            </p>
          </div>
          <div class="item-card__actions">
            <button
              @click="openLevelModal(level.level_id, level.level_name)"
              class="btn btn--primary btn--small"
            >
              see more
            </button>
            <button
              @click="deleteLevel(level.level_id, level.level_name)"
              class="btn btn--small btn--danger"
            >
              delete level
            </button>
          </div>
        </div>
      </div>
    </article>

    <!-- модалка редактирования уровня -->
    <LevelModal
      v-if="showModal"
      :levelId="selectedLevelId"
      :levelName="selectedLevelName"
      @close="closeModal"
      @refresh="loadLevels"
    />

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
import { ref, onMounted } from 'vue'
import api from '@/api'
import LevelModal from './LevelModal.vue'
import ConfirmModal from './ConfirmModal.vue'

const levels = ref([])
const newLevelName = ref('')
const loading = ref(false)
const error = ref('')
const createError = ref('')

// модалка редактирования уровня
const showModal = ref(false)
const selectedLevelId = ref(null)
const selectedLevelName = ref('')

// модалка подтверждения
const showConfirm = ref(false)
const confirmTitle = ref('')
const confirmWarning = ref(true)
const confirmAction = ref(null)

const loadLevels = async () => {
  loading.value = true
  error.value = ''

  try {
    levels.value = await api.getLevels()
  } catch (err) {
    error.value = 'Failed to load levels'
  } finally {
    loading.value = false
  }
}

const createLevel = async () => {
  createError.value = ''

  const name = newLevelName.value.trim()
  if (!name) {
    createError.value = 'level name cannot be null'
    return
  }

  // проверка на дубликат
  const exists = levels.value.some(
    l => l.level_name.toLowerCase() === name.toLowerCase()
  )
  if (exists) {
    createError.value = 'level with this name already exists'
    return
  }

  // подтверждение
  confirmTitle.value = `create level "${name}"?`
  confirmWarning.value = false
  confirmAction.value = async () => {
    try {
      await api.createLevel(name)
      newLevelName.value = ''
      createError.value = ''
      await loadLevels()
    } catch (err) {
      createError.value = 'failed to create level'
    }
  }
  showConfirm.value = true
}

const deleteLevel = (levelId, levelName) => {
  confirmTitle.value = `delete level "${levelName}"?`
  confirmWarning.value = true
  confirmAction.value = async () => {
    try {
      await api.deleteLevel(levelId)
      await loadLevels()
    } catch (err) {
      alert('Failed to delete level')
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

const openLevelModal = (levelId, levelName) => {
  selectedLevelId.value = levelId
  selectedLevelName.value = levelName
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  selectedLevelId.value = null
  selectedLevelName.value = ''
}

onMounted(() => {
  loadLevels()
})
</script>
