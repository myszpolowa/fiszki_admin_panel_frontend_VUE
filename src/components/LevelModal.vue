<template>
  <div class="modal">
    <div class="modal__backdrop" @click="close"></div>
    <div class="modal__content modal__content--large">
      <button @click="close" class="modal__close">×</button>

      <h3 class="modal__header">Level: {{ levelName }}</h3>
      <p class="modal__hint">
        each question must have at least one correct and one incorrect answer to appear in the level
      </p>

      <!-- список вопросов -->
      <div class="questions-list">
        <div v-if="loading">Loading questions...</div>
        <div v-else-if="!questions.length">
          <p>No questions yet.</p>
        </div>

        <QuestionCard
          v-else
          v-for="question in questions"
          :key="question.question_id"
          :question="question"
          @refresh="loadQuestions"
          @confirmDelete="handleConfirmDelete"
        />
      </div>

      <!-- форма добавления вопроса -->
      <div class="card card--inline">
        <div class="field">
          <label class="field__label">New question</label>
          <input
            v-model="newQuestionText"
            class="field__input"
            placeholder="question text"
            @keyup.enter="addQuestion"
          />
          <p v-if="questionError" class="field__error">{{ questionError }}</p>
        </div>
        <button @click="addQuestion" class="btn btn--primary">add question</button>
      </div>
    </div>

    <!-- модалка подтверждения внутри LevelModal -->
    <ConfirmModal
      v-if="showConfirm"
      :title="confirmTitle"
      :showWarning="confirmWarning"
      @confirm="handleConfirm"
      @cancel="showConfirm = false"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '@/api'
import QuestionCard from './QuestionCard.vue'
import ConfirmModal from './ConfirmModal.vue'

const props = defineProps({
  levelId: Number,
  levelName: String
})

const emit = defineEmits(['close', 'refresh'])

const questions = ref([])
const newQuestionText = ref('')
const loading = ref(false)
const questionError = ref('')

// модалка подтверждения
const showConfirm = ref(false)
const confirmTitle = ref('')
const confirmWarning = ref(true)
const confirmAction = ref(null)

const loadQuestions = async () => {
  loading.value = true

  try {
    questions.value = await api.getQuestions(props.levelId)
  } catch (err) {
    questions.value = []
  } finally {
    loading.value = false
  }
}

const addQuestion = async () => {
  questionError.value = ''

  const text = newQuestionText.value.trim()
  if (!text) {
    questionError.value = 'question text cannot be empty'
    return
  }

  // проверка на дубликат
  const exists = questions.value.some(
    q => q.question.toLowerCase() === text.toLowerCase()
  )
  if (exists) {
    questionError.value = 'this question already exists'
    return
  }

  try {
    await api.createQuestion(props.levelId, text)
    newQuestionText.value = ''
    questionError.value = ''
    await loadQuestions()
    emit('refresh')
  } catch (err) {
    questionError.value = 'failed to create question'
  }
}

const handleConfirmDelete = (data) => {
  confirmTitle.value = data.title
  confirmWarning.value = true
  confirmAction.value = data.action
  showConfirm.value = true
}

const handleConfirm = async () => {
  showConfirm.value = false
  if (confirmAction.value) {
    await confirmAction.value()
  }
}

const close = () => {
  newQuestionText.value = ''
  questionError.value = ''
  emit('close')
}

onMounted(() => {
  loadQuestions()
})
</script>
