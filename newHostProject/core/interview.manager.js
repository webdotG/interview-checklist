import { db } from '../services/db.service.js'
import { QuestionsRenderer } from '../ui/questions.renderer.js'

export class InterviewManager {
  constructor() {
    this.DEFAULT_CURRENCY = 'RUB' // Установите код валюты по умолчанию
    this.VALID_CURRENCIES = new Set([
      'RUB',
      'USD',
      'EUR',
      'GBP',
      'JPY',
      'CNY',
      'BTC',
      'ETH',
      'USDT',
      'TON',
    ])

    this.questionsRenderer = new QuestionsRenderer()
    this.questionsUtils = this.questionsRenderer.getQuestionsUtils()
    this.formValidator = null
    this.initElements()
    this.listenersSetup = false
  }

  setFormValidator(formValidator) {
    this.formValidator = formValidator
    // Устанавливаем дефолтную валюту при связывании
    if (this.formValidator && this.formValidator.currencyValidator) {
      this.formValidator.currencyValidator.setCurrency(this.DEFAULT_CURRENCY)
    }
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
    this.errorMessage = document.getElementById('error-message')
    this.questionsContainer = document.getElementById('questions-container')
  }

  async init() {
    try {
      this.questionsUtils.checkIdUniqueness()
      await this.questionsRenderer.renderQuestions()
      await this.setupEventListeners()
      this.loadFromURL()
    } catch (error) {
      console.error('Ошибка инициализации InterviewManager:', error)
      this.showError('Ошибка инициализации формы')
    }
  }

  loadFromURL() {
    try {
      const params = new URLSearchParams(window.location.search)

      // Загрузка основных полей
      this.companyInput.value = params.get('company') || ''
      this.positionInput.value = params.get('position') || ''
      this.salaryInput.value = params.get('salary') || ''
      this.companyUrlInput.value = params.get('company-url') || ''
      this.vacancyUrlInput.value = params.get('vacancy-url') || ''
      this.interviewerInput.value = params.get('interviewer') || ''

      // Загрузка и валидация валюты
      const currency = params.get('salary-currency')
      if (
        currency &&
        this.VALID_CURRENCIES.has(currency) &&
        this.formValidator
      ) {
        this.formValidator.currencyValidator.setCurrency(currency)
      }

      // Загрузка вопросов
      this.questionsUtils.forEachQuestion(
        (sectionTitle, subsectionTitle, question, questionId) => {
          const checked = params.get(`check-${questionId}`) === 'true'
          const inputValue = params.get(`input-${questionId}`) || ''

          const checkbox = document.getElementById(`check-${questionId}`)
          const input = document.getElementById(`input-${questionId}`)

          if (checkbox && input) {
            checkbox.checked = checked
            input.value = inputValue
          }
        }
      )
    } catch (error) {
      console.error('Ошибка загрузки данных из URL:', error)
    }
  }

  saveToURL() {
    try {
      const params = new URLSearchParams()

      // Основные поля
      params.set('company', this.companyInput.value)
      params.set('position', this.positionInput.value)
      params.set('salary', this.salaryInput.value)
      params.set('company-url', this.companyUrlInput.value)
      params.set('vacancy-url', this.vacancyUrlInput.value)
      params.set('interviewer', this.interviewerInput.value)

      // Сохранение валюты
      if (this.formValidator?.currencyValidator?.currentCurrency?.code) {
        params.set(
          'salary-currency',
          this.formValidator.currencyValidator.currentCurrency.code
        )
      }

      // Сохранение вопросов
      this.questionsUtils.forEachQuestion(
        (sectionTitle, subsectionTitle, question, questionId) => {
          const checkbox = document.getElementById(`check-${questionId}`)
          const input = document.getElementById(`input-${questionId}`)

          if (checkbox && input) {
            params.set(`check-${questionId}`, checkbox.checked)
            params.set(`input-${questionId}`, input.value)
          }
        }
      )

      window.history.replaceState({}, '', `?${params.toString()}`)
    } catch (error) {
      console.error('Ошибка сохранения данных в URL:', error)
    }
  }

  clearData() {
    try {
      window.history.replaceState({}, '', window.location.pathname)

      // Очистка полей
      this.companyInput.value = ''
      this.positionInput.value = ''
      this.salaryInput.value = ''
      this.companyUrlInput.value = ''
      this.vacancyUrlInput.value = ''
      this.interviewerInput.value = ''

      // Сброс валюты
      if (this.formValidator?.currencyValidator) {
        this.formValidator.currencyValidator.setCurrency(this.DEFAULT_CURRENCY)
      }

      // Очистка вопросов
      this.questionsUtils.forEachQuestion(
        (sectionTitle, subsectionTitle, question, questionId) => {
          const checkbox = document.getElementById(`check-${questionId}`)
          const input = document.getElementById(`input-${questionId}`)

          if (checkbox && input) {
            checkbox.checked = false
            input.value = ''
          }
        }
      )
    } catch (error) {
      console.error('Ошибка очистки данных:', error)
    }
  }

  async setupEventListeners() {
    if (this.listenersSetup) return

    // Слушатели полей формы
    const fieldsToWatch = [
      this.companyInput,
      this.positionInput,
      this.salaryInput,
      this.companyUrlInput,
      this.vacancyUrlInput,
      this.interviewerInput,
    ]

    fieldsToWatch.forEach((field) => {
      if (field) {
        field.addEventListener('input', () => this.saveToURL())
      }
    })

    // Слушатели вопросов
    this.questionsUtils.forEachQuestion(
      (sectionTitle, subsectionTitle, question, questionId) => {
        const checkbox = document.getElementById(`check-${questionId}`)
        const input = document.getElementById(`input-${questionId}`)

        if (checkbox && input) {
          checkbox.addEventListener('change', () => this.saveToURL())
          input.addEventListener('input', () => this.saveToURL())
        }
      }
    )

    // Обработчик отправки
    if (this.submitBtn) {
      this.submitBtn.addEventListener('click', async (e) => {
        e.preventDefault()
        await this.saveToDatabase()
      })
    }

    this.listenersSetup = true
  }

  async saveToDatabase() {
    if (!this.formValidator) {
      this.showError('Системная ошибка валидации')
      return
    }

    const formData = this.formValidator.getFormData()
    if (!formData.valid) {
      this.showError('Пожалуйста, заполните все обязательные поля правильно')
      return
    }

    try {
      const interviewData = {
        company: formData.data.company,
        position: formData.data.position,
        salary: formData.data.salary,
        salaryCurrency:
          this.formValidator.currencyValidator?.currentCurrency?.code ||
          this.DEFAULT_CURRENCY,
        companyUrl: formData.data['company-url'] || null,
        vacancyUrl: formData.data['vacancy-url'] || null,
        interviewer: formData.data.interviewer || null,
        answers: this.prepareAnswers(),
        createdAt: new Date().toISOString(),
      }

      console.log('Сохранение интервью:', {
        ...interviewData,
        salary: `${interviewData.salary} ${interviewData.salaryCurrency}`,
      })

      const success = await db.saveInterview(interviewData)

      if (success) {
        this.showSuccessMessage()
        this.clearData()
      } else {
        this.showError('Не удалось сохранить данные')
      }
    } catch (error) {
      console.error('Ошибка сохранения:', error)
      this.showError(error.message || 'Ошибка при сохранении в базу данных')
    }
  }

  prepareAnswers() {
    const answers = {}
    this.questionsUtils.forEachQuestion(
      (sectionTitle, subsectionTitle, question, questionId) => {
        const checkbox = document.getElementById(`check-${questionId}`)
        const input = document.getElementById(`input-${questionId}`)

        if (checkbox && input) {
          if (!answers[sectionTitle]) answers[sectionTitle] = {}
          if (!answers[sectionTitle][subsectionTitle]) {
            answers[sectionTitle][subsectionTitle] = {}
          }

          answers[sectionTitle][subsectionTitle][question] = {
            checked: checkbox.checked,
            note: input.value.trim() || null,
          }
        }
      }
    )
    return answers
  }

  showSuccessMessage() {
    if (!this.successMessage) return
    this.successMessage.classList.remove('hidden')
    this.errorMessage?.classList.add('hidden')
    setTimeout(() => {
      this.successMessage.classList.add('hidden')
    }, 3000)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  showError(message) {
    if (!this.errorMessage) return
    this.errorMessage.textContent = message
    this.errorMessage.classList.remove('hidden')
    this.successMessage?.classList.add('hidden')
    setTimeout(() => {
      this.errorMessage.classList.add('hidden')
    }, 5000)
  }
}