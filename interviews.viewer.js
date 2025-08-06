import { questionUtils } from './questions.stats.js'
import { questionsData } from './questions.data.js'

import {
  collection,
  getDocs,
  orderBy,
  query,
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js'

export class InterviewsViewer {
  constructor() {
    this.interviews = []
    this.filters = null
    this.totalQuestions = questionUtils.countQuestions(questionsData)

    this.loadingElement = document.getElementById('loading-message')
    this.errorElement = document.getElementById('error-message')
    this.errorText = document.getElementById('error-text')
    this.noInterviewsElement = document.getElementById('no-interviews')
    this.containerElement = document.getElementById('interviews-container')
    this.loadButton = document.getElementById('load-interviews-btn')
    this.localWarning = document.getElementById('local-mode-warning')

    this.authService = null
    this.notificationService = null
    this.firestore = null
    this.isGitHubPages = false

    this.setupEventListeners()
  }

  setFilters(filtersInstance) {
    this.filters = filtersInstance
    this.filters.onChange((result) => {
      this.interviews = result.data
      this.renderInterviews()
      console.log('Фильтры работают:', result.stats)
    })
    return this
  }

  setDependencies({
    authService,
    notificationService,
    firestore,
    isGitHubPages,
  }) {
    this.authService = authService
    this.notificationService = notificationService
    this.firestore = firestore
    this.isGitHubPages = isGitHubPages
  }

  async init() {
    try {
      this.showLoading()

      if (!this.isGitHubPages) {
        this.showLocalMode()
        return
      }

      if (this.isGitHubPages && this.firestore) {
        await this.loadInterviews()
      } else {
        this.showError('Ошибка подключения к Firebase')
      }
    } catch (error) {
      console.error('Ошибка инициализации viewer:', error)
      this.showError('Ошибка подключения к базе данных')
    }
  }

  async loadInterviews() {
    try {
      // Используем уже импортированные Firebase функции
      const interviewsRef = collection(this.firestore, 'interviews')
      const q = query(interviewsRef, orderBy('timestamp', 'desc'))
      const querySnapshot = await getDocs(q)

      if (querySnapshot.empty) {
        this.showNoInterviews()
        return
      }

      this.interviews = []
      querySnapshot.forEach((doc) => {
        this.interviews.push({ id: doc.id, ...doc.data() })
      })

      console.log(`Загружено ${this.interviews.length} интервью`)
      this.renderInterviews()
      this.setupFilters()
      this.hideLoading()

      if (this.notificationService) {
        this.notificationService.show(
          `Загружено ${this.interviews.length} интервью`,
          'success',
        )
      }
    } catch (error) {
      console.error('Ошибка загрузки интервью:', error)
      this.showError('Не удалось загрузить интервью из базы данных')
    }
  }

  renderInterviews() {
    const html = this.interviews
      .map((interview) => this.createInterviewCard(interview))
      .join('')
    this.containerElement.innerHTML = html
  }

  setupFilters() {
    if (this.filters) {
      this.filters.setData(this.interviews)
    }
  }

  createInterviewCard(interview) {
    const date = this.formatDate(interview.createdAt || interview.timestamp)
    const answeredCount = this.countAnsweredQuestions(interview)
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
      if (this.notificationService) {
        this.notificationService.show('Функция просмотра в разработке', 'info')
      }
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

      if (this.notificationService) {
        this.notificationService.show('Интервью скачано!', 'success')
      }
    } catch (error) {
      console.error('Ошибка скачивания:', error)
      if (this.notificationService) {
        this.notificationService.show('Ошибка при скачивании', 'error')
      }
    }
  }

  showLoading() {
    this.loadingElement?.classList.remove('hidden')
    this.errorElement?.classList.add('hidden')
    this.noInterviewsElement?.classList.add('hidden')
    this.localWarning?.classList.add('hidden')
    if (this.containerElement) this.containerElement.innerHTML = ''
  }

  hideLoading() {
    this.loadingElement?.classList.add('hidden')
  }

  showError(message) {
    this.hideLoading()
    if (this.errorText) this.errorText.textContent = message
    this.errorElement?.classList.remove('hidden')
  }

  showNoInterviews() {
    this.hideLoading()
    this.noInterviewsElement?.classList.remove('hidden')
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
