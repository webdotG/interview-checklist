import { questionUtils } from './questions.stats.js'
import { questionsData } from './questions.data.js'
import { db } from './db.service.js'

export class InterviewsViewer {
  constructor() {
    this.interviews = []
    this.filters = null
    this.dependencies = null
    this.totalQuestions = questionUtils.countQuestions(questionsData)

    // UI элементы
    this.loadingElement = document.getElementById('loading-message')
    this.errorElement = document.getElementById('error-message')
    this.errorText = document.getElementById('error-text')
    this.noInterviewsElement = document.getElementById('no-interviews')
    this.containerElement = document.getElementById('interviews-container')
    this.loadButton = document.getElementById('load-interviews-btn')
    this.localWarning = document.getElementById('local-mode-warning')

    this.setupEventListeners()
  }

  // Фильтр
  setFilters(filtersInstance) {
    this.filters = filtersInstance
    this.filters.onChange((result) => {
      this.interviews = result.data
      this.renderInterviews()
      console.log('Фильтры работают:', result.stats)
    })
    return this
  }

  async init() {
    try {
      this.showLoading()
      await this.dependencies.db.init()
      await this.loadInterviews()
    } catch (error) {
      console.error('Ошибка инициализации viewer:', error)
      this.showError('Ошибка подключения к базе данных')
    }
  }

  setDependencies(deps) {
    this.dependencies = deps
    if (deps.filters) {
      this.setFilters(deps.filters)
    }
  }

  setFilters(filtersInstance) {
    this.filters = filtersInstance
    this.filters.onChange((result) => {
      this.interviews = result.data
      this.renderInterviews()
      console.log('Фильтры работают:', result.stats)
    })
  }

  async loadInterviews() {
    this.showLoading()
    this.resetUI()

    try {
      this.interviews = await db.loadInterviews()
      console.log(`Загружено ${this.interviews.length} интервью`)

      if (this.interviews.length === 0) {
        this.showNoInterviews()
      } else {
        this.renderInterviews()
        if (this.filters) {
          this.filters.setData(this.interviews)
          this.filters.container.classList.remove('hidden')
        }
      }
    } catch (error) {
      this.handleLoadError(error)
    } finally {
      this.hideLoading()
    }
  }

  renderInterviews() {
    const html = this.interviews
      .map((interview) => this.createInterviewCard(interview))
      .join('')
    this.containerElement.innerHTML = html
  }

  createInterviewCard(interview) {
    const date = this.formatDate(interview.createdAt || interview.timestamp)
    const answeredCount = questionUtils.countAnsweredQuestions(interview)
    const formattedSalary = this.formatSalary(interview.salary)

    return `
      <div class="interview-card">
        <div class="interview-header">
          <h3>${this.escapeHtml(
            interview.company || 'Неизвестная компания',
          )}</h3>
          <span class="interview-date">${date}</span>
        </div>
        <div class="interview-details">
          <p><strong>Позиция:</strong> ${this.escapeHtml(
            interview.position || 'Не указана',
          )}</p>
          <p><strong>Зарплата:</strong> ${formattedSalary}</p>
          <p><strong>Отвечено вопросов:</strong> ${answeredCount} из ${
      this.totalQuestions
    }</p>
          <div class="progress-bar">
            <div class="progress-fill" style="width: ${
              (answeredCount / this.totalQuestions) * 100
            }%"></div>
          </div>
        </div>
        <div class="interview-actions">
          <button onclick="window.viewInterview('${
            interview.id
          }')" class="btn btn--small">
            Просмотреть
          </button>
          <button onclick="window.downloadInterview('${
            interview.id
          }')" class="btn btn--small btn--secondary">
            Скачать
          </button>
        </div>
      </div>
    `
  }

  setupEventListeners() {
    if (this.loadButton) {
      this.loadButton.addEventListener('click', () => this.loadInterviews())
    }

    // Глобальные функции для интерфейса
    window.viewInterview = (id) => {
      console.log('Просмотр интервью:', id)
    }

    window.downloadInterview = (id) => {
      const interview = this.interviews.find((i) => i.id === id)
      if (interview) {
        this.downloadInterviewJson(interview)
      }
    }
  }

  downloadInterviewJson(interview) {
    try {
      const filename = `Интервью_${interview.company}_${interview.position}_${
        interview.salary || 'без_зп'
      }.json`
        .replace(/\s+/g, '_')
        .replace(/[<>:"\/\\|?*]/g, '')

      const blob = new Blob([JSON.stringify(interview, null, 2)], {
        type: 'application/json',
      })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Ошибка скачивания:', error)
    }
  }

  setupFilters() {
    if (this.filters) {
      this.filters.setData(this.interviews)
    }
  }

  resetUI() {
    this.hideError()
    this.hideNoInterviews()
    this.clearInterviews()
  }

  handleLoadError(error) {
    console.error('Ошибка при загрузке интервью:', error)

    if (error.message === 'OFFLINE_MODE') {
      this.showLocalMode()
    } else {
      this.showError(error.message)
    }
  }

  // UI методы
  showLoading() {
    this.loadingElement?.classList.remove('hidden')
    this.errorElement?.classList.add('hidden')
    this.noInterviewsElement?.classList.add('hidden')
    this.localWarning?.classList.add('hidden')
  }

  hideLoading() {
    this.loadingElement?.classList.add('hidden')
  }

  showError(message) {
    this.hideLoading()
    if (this.errorText) this.errorText.textContent = message
    this.errorElement?.classList.remove('hidden')
  }

  hideError() {
    this.errorElement?.classList.add('hidden')
  }

  showNoInterviews() {
    this.hideLoading()
    this.noInterviewsElement?.classList.remove('hidden')
  }

  hideNoInterviews() {
    this.noInterviewsElement?.classList.add('hidden')
  }

  showLocalMode() {
    this.hideLoading()
    if (this.localWarning) {
      this.localWarning.innerHTML = `
        <div class="warning">
          <p>Вы работаете в локальном режиме. Для просмотра интервью из общей базы откройте приложение на GitHub Pages.</p>
        </div>
      `
      this.localWarning.classList.remove('hidden')
    }
  }

  clearInterviews() {
    if (this.containerElement) this.containerElement.innerHTML = ''
  }

  isGitHubPages() {
    return window.location.hostname.includes('github.io')
  }

  // Методы форматирования данных
  countAnsweredQuestions(interview) {
    if (!interview.answers) return 0
    return Object.keys(interview.answers).filter((key) => {
      const answer = interview.answers[key]
      return answer && answer.trim() !== ''
    }).length
  }

  formatDate(timestamp) {
    if (!timestamp) return 'Неизвестна'
    try {
      return new Date(timestamp).toLocaleDateString('ru-RU', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    } catch {
      return 'Неизвестна'
    }
  }

  formatSalary(salary) {
    if (!salary) return 'Не указана'
    if (typeof salary === 'string') return salary
    if (typeof salary === 'number') {
      return new Intl.NumberFormat('ru-RU', {
        style: 'currency',
        currency: 'RUB',
        maximumFractionDigits: 0,
      }).format(salary)
    }
    return salary.toString()
  }

  escapeHtml(text) {
    if (!text) return ''
    const div = document.createElement('div')
    div.textContent = text
    return div.innerHTML
  }
}
