import { questionUtils } from './questionUtils.js'
import { questionsData } from './questionsData.js'
import { FirebaseService } from './FirebaseService.js'
import { InterviewFormatter } from './interviewFormatter.js'
import { InterviewRenderer } from './interviewRenderer.js'
import { UIManager } from './UIManager.js'

export class InterviewsViewer {
  constructor() {
    this.interviews = []
    this.filters = null
    this.totalQuestions = questionUtils.countQuestions(questionsData)

    this.firebaseService = new FirebaseService()
    this.renderer = new InterviewRenderer(this.totalQuestions)
    this.uiManager = new UIManager()
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

  async init() {
    if (this.uiManager.isLocalMode()) {
      this.uiManager.showLocalModeWarning()
      return
    }

    this.uiManager.onLoadButtonClick(() => this.loadInterviews())

    if (this.uiManager.isGitHubPages()) {
      await this.loadInterviews()
    }
  }

  async loadInterviews() {
    this.setLoadingState(true)
    this.resetUI()

    try {
      this.interviews = await this.firebaseService.loadInterviews()

      console.log(`Загружено ${this.interviews.length} интервью`)

      if (this.interviews.length === 0) {
        this.uiManager.showOfflineWarning()
      } else {
        this.renderInterviews()
        this.setupFilters()
      }
    } catch (error) {
      this.handleLoadError(error)
    } finally {
      this.setLoadingState(false)
    }
  }

  renderInterviews() {
    const container = this.uiManager.getInterviewsContainer()
    this.renderer.renderInterviews(this.interviews, container)
  }

  setupFilters() {
    if (this.filters) {
      this.filters.setData(this.interviews)
    }
  }

  setLoadingState(isLoading) {
    this.uiManager.showLoading(isLoading)

    if (this.filters) {
      this.filters.setLoading(isLoading)
    }
  }

  resetUI() {
    this.uiManager.hideError()
    this.uiManager.hideNoInterviews()
    this.uiManager.clearInterviews()
  }

  handleLoadError(error) {
    console.error('Ошибка при загрузке интервью:', error)

    if (error.message === 'OFFLINE_MODE') {
      this.uiManager.showOfflineWarning()
    } else {
      this.uiManager.showError(error.message)
    }
  }

  // методы
  countTotalQuestions() {
    return this.totalQuestions
  }

  countAnsweredQuestions(interview) {
    return InterviewFormatter.countAnsweredQuestions(interview)
  }

  formatDate(timestamp) {
    return InterviewFormatter.formatDate(timestamp)
  }

  formatSalary(salary) {
    return InterviewFormatter.formatSalary(salary)
  }

  escapeHtml(text) {
    return InterviewFormatter.escapeHtml(text)
  }
}
