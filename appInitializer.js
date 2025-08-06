import { AuthService } from './auth.service.js'
import { AuthUI } from './auth.ui.js'
import { NotificationService } from './notification.service.js'
import { InterviewManager } from './interview.manager.js'
import { FormValidator } from './form.validator.js'
import { renderQuestions } from './questions.renderer.js'
import { questionUtils } from './questions.stats.js'
import { questionsData } from './questions.data.js'
import { db } from './db.service.js'

export async function initializeApp() {
  try {
    const authService = new AuthService()
    await authService.initializeAuth()

    const manager = new InterviewManager()
    await manager.init()
    manager.loadFromURL()

    const notificationService = new NotificationService()
    const isGitHubPages = window.location.hostname.includes('github.io')

    // ВСЕ зависимости в AuthUI
    const authUI = new AuthUI(
      authService,
      notificationService,
      manager,
      isGitHubPages,
    )

    const formValidator = new FormValidator()
    formValidator.init('#interview-form')

    questionUtils.addCounterToHeader(questionsData)
    await renderQuestions()
    await db.init()

    const stats = questionUtils.getDetailedStats(questionsData)
    console.log('Interview stats:', stats)

    // AuthUI устанавливает все обработчики
    authUI.setupEventListeners()
    authUI.updateUI()

    notificationService.show('Приложение загружено', 'success', 2000)
  } catch (error) {
    console.error('Ошибка инициализации приложения:', error)
    const notificationService = new NotificationService()
    notificationService.show('Ошибка загрузки приложения', 'error', 5000)
  }
}
