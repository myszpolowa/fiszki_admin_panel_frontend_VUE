// src/api/index.js
import axios from 'axios'

const API_BASE = 'http://127.0.0.1:8002'

// создаём axios instance
const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json'
  }
})

// добавляем токен ко всем запросам автоматически
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// экспортируем методы API
export default {
  // авторизация
  async login(username, password) {
    const formData = new URLSearchParams()
    formData.append('username', username)
    formData.append('password', password)

    const response = await axios.post(`${API_BASE}/admin/login`, formData, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    })
    return response.data
  },

  // пользователи
  async getUsers() {
    return (await api.get('/admin/users')).data
  },

  async deleteUser(userId) {
    return (await api.delete(`/admin/users/${userId}`)).data
  },

  async resetUserProgress(userId) {
    return (await api.put(`/admin/users/${userId}/reset-progress`)).data
  },

  // уровни
  async getLevels() {
    return (await api.get('/admin/levels')).data
  },

  async createLevel(levelName) {
    return (await api.post('/admin/levels', { level_name: levelName })).data
  },

  async deleteLevel(levelId) {
    return (await api.delete(`/admin/levels/${levelId}`)).data
  },

  // вопросы
  async getQuestions(levelId) {
    return (await api.get(`/levels/${levelId}/questions`)).data
  },

  async createQuestion(levelId, questionText) {
    return (await api.post('/admin/questions', {
      level_id: levelId,
      question: questionText
    })).data
  },

  async updateQuestion(questionId, questionText) {
    return (await api.put(`/admin/questions/${questionId}`, {
      question: questionText
    })).data
  },

  async deleteQuestion(questionId) {
    return (await api.delete(`/admin/questions/${questionId}`)).data
  },

  // ответы
  async createAnswer(questionId, answerText, isGood) {
    return (await api.post('/admin/answers', {
      question_id: questionId,
      answer: answerText,
      is_good: isGood
    })).data
  },

  async updateAnswer(answerId, answerText, isGood) {
    return (await api.put(`/admin/answers/${answerId}`, {
      answer: answerText,
      is_good: isGood
    })).data
  },

  async deleteAnswer(answerId) {
    return (await api.delete(`/admin/answers/${answerId}`)).data
  }
}
