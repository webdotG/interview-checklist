import { db } from '../services/db.service.js'
import { forEachQuestion } from '../utils/questions.utils.js'
import { renderQuestions } from '../ui/questions.renderer.js'

export class InterviewManager {
  constructor() {
    this.initElements()
    this.listenersSetup = false 
  }

  initElements() {
    // Основные поля формы
    this.companyInput = document.getElementById('company')
    this.positionInput = document.getElementById('position')
    this.salaryInput = document.getElementById('salary')
    this.companyUrlInput = document.getElementById('company-url')
    this.vacancyUrlInput = document.getElementById('vacancy-url')
    this.interviewerInput = document.getElementById('interviewer')

    // Элементы UI
    this.submitBtn = document.getElementById('submit-btn')
    this.successMessage = document.getElementById('success-message')
    this.errorMessage = document.getElementById('error-message')
    this.questionsContainer = document.getElementById('questions-container')
  }

  async init() {
    try {
      await renderQuestions() // Сначала создаем элементы
      await this.setupEventListeners() // Потом устанавливаем слушатели
      this.loadFromURL() // Затем загружаем данные
    } catch (error) {
      console.error('Ошибка инициализации InterviewManager:', error)
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
    } catch (error) {
      console.error('Ошибка загрузки данных из URL:', error)
    }
  }

  saveToURL() {
    try {
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
    } catch (error) {
      console.error('Ошибка сохранения данных в URL:', error)
    }
  }

  clearData() {
    try {
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
    } catch (error) {
      console.error('Ошибка очистки данных:', error)
    }
  }

  async setupEventListeners() {
    try {
      // Проверяем, не установлены ли уже слушатели
      if (this.listenersSetup) {
        return
      }
      // Слушатели изменений для сохранения в URL
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
        } else {
          console.warn('Отсутствует поле для отслеживания изменений:', field)
        }
      })

      // Слушатели для вопросов
      forEachQuestion((sectionTitle, subsectionTitle, question, questionId) => {
        const checkbox = document.getElementById(`check-${questionId}`)
        const input = document.getElementById(`input-${questionId}`)

        if (checkbox && input) {
          checkbox.addEventListener('change', () => this.saveToURL())
          input.addEventListener('input', () => this.saveToURL())
        } else {
          console.warn(`Не найдены элементы для вопроса ${questionId}`)
        }
      })

      // Обработчик отправки формы
      if (this.submitBtn) {
        this.submitBtn.addEventListener('click', async (e) => {
          e.preventDefault()
          await this.saveToDatabase()
        })
      } else {
        console.warn('Кнопка отправки не найдена')
      }

      // Помечаем, что слушатели установлены
      this.listenersSetup = true
    } catch (error) {
      console.error('Ошибка установки слушателей:', error)
    }
  }

  async saveToDatabase() {
    try {
      // Валидация обязательных полей перед сохранением
      if (
        !this.companyInput.value.trim() ||
        !this.positionInput.value.trim() ||
        !this.salaryInput.value.trim()
      ) {
        this.showError('Заполните все обязательные поля')
        return
      }

      const interviewData = {
        company: this.companyInput.value.trim(),
        position: this.positionInput.value.trim(),
        salary: this.salaryInput.value.trim(),
        companyUrl: this.companyUrlInput.value.trim() || null,
        vacancyUrl: this.vacancyUrlInput.value.trim() || null,
        interviewer: this.interviewerInput.value.trim() || null,
        answers: this.prepareAnswers(),
        // не передаем timestamp, его ставит сервер
      }

      console.log('Попытка сохранения интервью:', interviewData)

      const success = await db.saveInterview(interviewData)

      if (success) {
        this.showSuccessMessage()
        this.clearData()
      } else {
        this.showError('Не удалось сохранить интервью')
      }
    } catch (error) {
      console.error('Ошибка при сохранении в БД:', error)
      this.showError(error.message || 'Ошибка при сохранении')
    }
  }

  prepareAnswers() {
    const answers = {}
    forEachQuestion((sectionTitle, subsectionTitle, question, questionId) => {
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
      } else {
        console.warn(
          `Элементы вопроса не найдены при подготовке ответов: ${questionId}`
        )
      }
    })
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
