<template>
  <div class="question-card">
    <!-- заголовок вопроса -->
    <div v-if="!editingQuestion" class="question-card__header">
      <span class="question-card__text">{{ question.question }}</span>
      <div class="question-card__actions">
        <button @click="startEditQuestion" class="btn btn--primary btn--small">edit</button>
        <button @click="deleteQuestion" class="btn btn--danger btn--small">delete</button>
      </div>
    </div>

    <!-- форма редактирования вопроса -->
    <div v-else style="margin-bottom:12px;">
      <input
        v-model="editQuestionText"
        class="field__input"
        placeholder="question text"
      />
      <div style="display:flex;gap:8px;margin-top:8px;justify-content:center;">
        <button @click="saveQuestion" class="btn btn--primary btn--small">save</button>
        <button @click="cancelEditQuestion" class="btn btn--ghost btn--small">cancel</button>
      </div>
      <p v-if="questionError" class="field__error">{{ questionError }}</p>
    </div>

    <!-- список ответов -->
    <div class="answers-list">
      <div v-if="!question.answers || !question.answers.length">
        <p style="font-size:12px;color:#6b7280;">No answers yet.</p>
      </div>

      <div
        v-else
        v-for="answer in question.answers"
        :key="answer.answer_id"
        :class="['answer-item', answer.is_good ? 'answer-item--correct' : 'answer-item--incorrect']"
      >
        <span>{{ answer.is_good ? '✓' : '✗' }}</span>
        <span class="answer-text">{{ answer.answer }}</span>
        <button @click="startEditAnswer(answer)" class="btn btn--small">edit</button>
        <button @click="deleteAnswer(answer.answer_id)" class="btn btn--danger btn--small">delete</button>
      </div>
    </div>

    <!-- форма добавления ответа -->
    <div v-if="addingAnswer" style="margin-top:8px;">
      <input
        v-model="newAnswerText"
        class="field__input"
        placeholder="answer text"
      />
      <div style="display:flex;gap:8px;margin-top:8px;align-items:center;justify-content:center;">
        <label style="font-size:13px;">
          <input v-model="newAnswerIsGood" type="checkbox"> correct answer
        </label>
        <button @click="saveNewAnswer" class="btn btn--primary btn--small">save</button>
        <button @click="cancelAddAnswer" class="btn btn--ghost btn--small">cancel</button>
      </div>
      <p v-if="answerError" class="field__error">{{ answerError }}</p>
    </div>

    <!-- форма редактирования ответа -->
    <div v-else-if="editingAnswer" style="margin-top:8px;">
      <input
        v-model="editAnswerText"
        class="field__input"
        placeholder="answer text"
      />
      <div style="display:flex;gap:8px;margin-top:8px;align-items:center;justify-content:center;">
        <label style="font-size:13px;">
          <input v-model="editAnswerIsGood" type="checkbox"> correct answer
        </label>
        <button @click="saveEditedAnswer" class="btn btn--primary btn--small">save</button>
        <button @click="cancelEditAnswer" class="btn btn--ghost btn--small">cancel</button>
      </div>
      <p v-if="answerError" class="field__error">{{ answerError }}</p>
    </div>

    <!-- кнопка добавления ответа -->
    <button
      v-if="!addingAnswer && !editingAnswer && !editingQuestion"
      @click="startAddAnswer"
      class="btn btn--primary btn--small"
      style="margin-top:8px;"
    >
      add answer
    </button>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import api from '@/api'

const props = defineProps({
  question: Object
})

const emit = defineEmits(['refresh', 'confirmDelete'])

// редактирование вопроса
const editingQuestion = ref(false)
const editQuestionText = ref('')
const questionError = ref('')

// добавление ответа
const addingAnswer = ref(false)
const newAnswerText = ref('')
const newAnswerIsGood = ref(false)
const answerError = ref('')

// редактирование ответа
const editingAnswer = ref(false)
const editAnswerId = ref(null)
const editAnswerText = ref('')
const editAnswerIsGood = ref(false)

// ---- ВОПРОС ----

const startEditQuestion = () => {
  editQuestionText.value = props.question.question
  editingQuestion.value = true
  addingAnswer.value = false
  editingAnswer.value = false
}

const saveQuestion = async () => {
  questionError.value = ''

  const text = editQuestionText.value.trim()
  if (!text) {
    questionError.value = 'question text cannot be empty'
    return
  }

  try {
    await api.updateQuestion(props.question.question_id, text)
    editingQuestion.value = false
    emit('refresh')
  } catch (err) {
    questionError.value = 'failed to update question'
  }
}

const cancelEditQuestion = () => {
  editingQuestion.value = false
  questionError.value = ''
}

const deleteQuestion = () => {
  emit('confirmDelete', {
    title: 'delete this question?',
    action: async () => {
      try {
        await api.deleteQuestion(props.question.question_id)
        emit('refresh')
      } catch (err) {
        alert('Failed to delete question')
      }
    }
  })
}

// ---- ОТВЕТЫ ----

const startAddAnswer = () => {
  newAnswerText.value = ''
  newAnswerIsGood.value = false
  answerError.value = ''
  addingAnswer.value = true
  editingAnswer.value = false
  editingQuestion.value = false
}

const saveNewAnswer = async () => {
  answerError.value = ''

  const text = newAnswerText.value.trim()
  if (!text) {
    answerError.value = 'answer text cannot be empty'
    return
  }

  // проверка на дубликат
  const exists = props.question.answers?.some(
    a => a.answer.toLowerCase() === text.toLowerCase()
  )
  if (exists) {
    answerError.value = 'this answer already exists'
    return
  }

  try {
    await api.createAnswer(
      props.question.question_id,
      text,
      newAnswerIsGood.value ? 1 : 0
    )
    addingAnswer.value = false
    emit('refresh')
  } catch (err) {
    answerError.value = 'failed to create answer'
  }
}

const cancelAddAnswer = () => {
  addingAnswer.value = false
  answerError.value = ''
}

const startEditAnswer = (answer) => {
  editAnswerId.value = answer.answer_id
  editAnswerText.value = answer.answer
  editAnswerIsGood.value = answer.is_good === 1
  answerError.value = ''
  editingAnswer.value = true
  addingAnswer.value = false
  editingQuestion.value = false
}

const saveEditedAnswer = async () => {
  answerError.value = ''

  const text = editAnswerText.value.trim()
  if (!text) {
    answerError.value = 'answer text cannot be empty'
    return
  }

  // проверка на дубликат (исключая текущий)
  const exists = props.question.answers?.some(
    a => a.answer_id !== editAnswerId.value &&
         a.answer.toLowerCase() === text.toLowerCase()
  )
  if (exists) {
    answerError.value = 'this answer already exists'
    return
  }

  try {
    await api.updateAnswer(
      editAnswerId.value,
      text,
      editAnswerIsGood.value ? 1 : 0
    )
    editingAnswer.value = false
    emit('refresh')
  } catch (err) {
    answerError.value = 'failed to update answer'
  }
}

const cancelEditAnswer = () => {
  editingAnswer.value = false
  answerError.value = ''
}

const deleteAnswer = (answerId) => {
  emit('confirmDelete', {
    title: 'delete this answer?',
    action: async () => {
      try {
        await api.deleteAnswer(answerId)
        emit('refresh')
      } catch (err) {
        alert('Failed to delete answer')
      }
    }
  })
}

const close = () => {
  newQuestionText.value = ''
  questionError.value = ''
  emit('close')
}

</script>
