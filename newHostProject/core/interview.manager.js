import { db } from '../services/db.service.js'
import { forEachQuestion } from '../utils/questions.utils.js'

export class InterviewManager {
  constructor() {
    this.initElements()
  }

  initElements() {
    this.companyInput = document.getElementById('company')
    this.positionInput = document.getElementById('position')
    this.salaryInput = document.getElementById('salary')
    this.companyUrlInput = document.getElementById('company-url')
    this.vacancyUrlInput = document.getElementById('vacancy-url')
    this.interviewerInput = document.getElementById('interviewer')
    this.submitBtn = document.getElementById('submit-btn')
    this.successMessage = document.getElementById('success-message')
    this.questionsContainer = document.getElementById('questions-container')
  }

  async init() {
    await this.setupEventListeners()
  }

  loadFromURL() {
    const params = new URLSearchParams(window.location.search)

    // Загрузка основных полей
    this.companyInput.value = params.get('company') || ''
    this.positionInput.value = params.get('position') || ''
    this.salaryInput.value = params.get('salary') || ''
    this.companyUrlInput.value = params.get('company-url') || ''
    this.vacancyUrlInput.value = params.get('vacancy-url') || ''
    this.interviewerInput.value = params.get('interviewer') || ''

    // Загрузка состояний вопросов
    forEachQuestion((sectionTitle, subsectionTitle, question, questionId) => {
      const checked = params.get(`check-${questionId}`) === 'true'
      const inputValue = params.get(`input-${questionId}`) || ''

      const checkbox = document.getElementById(`check-${questionId}`)
      const input = document.getElementById(`input-${questionId}`)

      if (checkbox && input) {
        checkbox.checked = checked
        input.value = inputValue
      }
    })
  }

  saveToURL() {
    const params = new URLSearchParams()

    // Сохранение основных полей
    params.set('company', this.companyInput.value)
    params.set('position', this.positionInput.value)
    params.set('salary', this.salaryInput.value)
    params.set('company-url', this.companyUrlInput.value)
    params.set('vacancy-url', this.vacancyUrlInput.value)
    params.set('interviewer', this.interviewerInput.value)

    // Сохранение состояний вопросов
    forEachQuestion((sectionTitle, subsectionTitle, question, questionId) => {
      const checkbox = document.getElementById(`check-${questionId}`)
      const input = document.getElementById(`input-${questionId}`)

      if (checkbox && input) {
        params.set(`check-${questionId}`, checkbox.checked)
        params.set(`input-${questionId}`, input.value)
      }
    })

    window.history.replaceState({}, '', `?${params.toString()}`)
  }

  clearData() {
    window.history.replaceState({}, '', window.location.pathname)

    // Очистка основных полей
    this.companyInput.value = ''
    this.positionInput.value = ''
    this.salaryInput.value = ''
    this.companyUrlInput.value = ''
    this.vacancyUrlInput.value = ''
    this.interviewerInput.value = ''

    // Очистка состояний вопросов
    forEachQuestion((sectionTitle, subsectionTitle, question, questionId) => {
      const checkbox = document.getElementById(`check-${questionId}`)
      const input = document.getElementById(`input-${questionId}`)

      if (checkbox && input) {
        checkbox.checked = false
        input.value = ''
      }
    })
  }

  async setupEventListeners() {
    // Слушатели для основных полей
    this.companyInput.addEventListener('input', () => this.saveToURL())
    this.positionInput.addEventListener('input', () => this.saveToURL())
    this.salaryInput.addEventListener('input', () => this.saveToURL())
    this.companyUrlInput.addEventListener('input', () => this.saveToURL())
    this.vacancyUrlInput.addEventListener('input', () => this.saveToURL())
    this.interviewerInput.addEventListener('input', () => this.saveToURL())

    // Слушатели для вопросов
    forEachQuestion((sectionTitle, subsectionTitle, question, questionId) => {
      const checkbox = document.getElementById(`check-${questionId}`)
      const input = document.getElementById(`input-${questionId}`)

      if (checkbox && input) {
        checkbox.addEventListener('change', () => this.saveToURL())
        input.addEventListener('input', () => this.saveToURL())
      }
    })
  }

  async saveToDatabase() {
    const company = this.companyInput.value
    const position = this.positionInput.value
    const salary = this.salaryInput.value
    const companyUrl = this.companyUrlInput.value.trim() || null
    const vacancyUrl = this.vacancyUrlInput.value.trim() || null
    const interviewer = this.interviewerInput.value.trim() || null

    const answers = {}

    // Построение структуры ответов
    forEachQuestion((sectionTitle, subsectionTitle, question, questionId) => {
      const checkbox = document.getElementById(`check-${questionId}`)
      const input = document.getElementById(`input-${questionId}`)

      if (checkbox && input) {
        if (!answers[sectionTitle]) {
          answers[sectionTitle] = {}
        }
        if (!answers[sectionTitle][subsectionTitle]) {
          answers[sectionTitle][subsectionTitle] = {}
        }

        answers[sectionTitle][subsectionTitle][question] = {
          checked: checkbox.checked,
          note: input.value || null,
        }
      }
    })

    try {
      const success = await db.saveInterview(
        company,
        position,
        salary,
        answers,
        companyUrl,
        vacancyUrl,
        interviewer
      )

      if (success) {
        this.successMessage.classList.remove('hidden')
        setTimeout(() => this.successMessage.classList.add('hidden'), 3000)
        this.clearData()
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }
    } catch (error) {
      console.error('Ошибка при сохранении:', error)
    }
  }
}