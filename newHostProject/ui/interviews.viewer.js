import { questionUtils } from '../questions.stats.js'
import { questionsData } from '../utils/questions.data.js'
import { InterviewRenderer } from './interview.renderer.js'
import { db } from '../services/db.service.js'

export class InterviewsViewer {
  constructor() {
    this.interviews = []
    this.filters = null
    this.dependencies = null
    this.renderer = new InterviewRenderer(
      questionUtils.countQuestions(questionsData),
    )
    // InterviewRenderer
    this.totalQuestions = questionUtils.countQuestions(questionsData)
    this.renderer = new InterviewRenderer(this.totalQuestions)

    // UI элементы
    this.loadingElement = document.getElementById('loading-message')
    this.errorElement = document.getElementById('error-message')
    this.errorText = document.getElementById('error-text')
    this.noInterviewsElement = document.getElementById('no-interviews')
    this.containerElement = document.getElementById('interviews-container')
    this.loadButton = document.getElementById('load-interviews-btn')
    this.localWarning = document.getElementById('local-mode-warning')

    // модальное окно
    this.modalBackdrop = document.getElementById('modal-backdrop')
    this.modalContent = document.getElementById('interview-modal')
    this.modalHeader = document.getElementById('modal-company')
    this.modalBody = document.getElementById('modal-body')
    this.modalCloseBtn = document.getElementById('modal-close-btn')
    this.modalDownloadBtn = document.getElementById('modal-download-btn')

    this.setupEventListeners()
  }

  setDependencies(deps) {
    this.dependencies = deps
    if (deps.filters) {
      this.setFilters(deps.filters)
    }
  }

  // 💡 Исправленная и единственная версия setFilters
  setFilters(filtersInstance) {
    this.filters = filtersInstance
    this.filters.onChange((result) => {
      this.interviews = result.data
      this.renderInterviews()
      console.log('Фильтры работают:', result.stats)
    })
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

  // использует InterviewRenderer
  renderInterviews() {
    this.containerElement.innerHTML = ''
    this.interviews.forEach((interview) => {
      const card = this.renderer.createInterviewCard(interview)
      this.containerElement.appendChild(card)
    })
  }

  setupEventListeners() {
    if (this.loadButton) {
      this.loadButton.addEventListener('click', () => this.loadInterviews())
    }

    // для карточек интервью и модального окна
    this.containerElement.addEventListener('click', (e) => {
      const target = e.target
      const action = target.dataset.action
      const interviewId = target.dataset.id

      if (action === 'view') {
        this.showInterviewModal(interviewId)
      } else if (action === 'download') {
        const interview = this.interviews.find((i) => i.id === interviewId)
        if (interview) {
          this.downloadInterviewJson(interview)
        }
      }
    })

    if (this.modalCloseBtn) {
      this.modalCloseBtn.addEventListener('click', () =>
        this.closeInterviewModal(),
      )
    }

    // закрытие модального окна по клику вне области
    if (this.modalBackdrop) {
      this.modalBackdrop.addEventListener('click', (e) => {
        if (e.target.id === 'modal-backdrop') {
          this.closeInterviewModal()
        }
      })
    }
  }

  showInterviewModal(id) {
    const interview = this.interviews.find((i) => i.id === id)
    if (!interview) {
      return
    }

    // наполнение модального окно данными
    if (this.modalHeader) {
      this.modalHeader.textContent = interview.company || 'Неизвестная компания'
    }
    if (this.modalBody) {
      // правильное количество вопросов для рендерера
      this.modalBody.innerHTML = this.renderer.renderAnswers(
        interview.answers,
        questionUtils.countQuestions(questionsData),
      )
    }

    // обновляет кнопку "Скачать" в модалке
    if (this.modalDownloadBtn) {
      this.modalDownloadBtn.onclick = () =>
        this.downloadInterviewJson(interview)
    }

    // модальное окно
    this.modalBackdrop?.classList.remove('hidden')
    document.body.classList.add('no-scroll')
  }

  closeInterviewModal() {
    this.modalBackdrop?.classList.add('hidden')
    document.body.classList.remove('no-scroll')
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

  // ... (остальные вспомогательные методы)
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

  // showLocalMode() {
  //   this.hideLoading()
  //   if (this.localWarning) {
  //     this.localWarning.innerHTML = `
  //       <div class="warning">
  //         <p>Вы работаете в локальном режиме. Для просмотра интервью (хотя это скоро пофиксится) из общей базы откройте приложение на GitHub Pages.</p>
  //       </div>
  //     `
  //     this.localWarning.classList.remove('hidden')
  //   }
  // }

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
