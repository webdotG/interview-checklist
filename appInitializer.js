import { db } from './db.service.js'
import { AuthService } from './auth.service.js'
import { AuthUI } from './auth.ui.js'
import { NotificationService } from './notification.service.js'
import { InterviewManager } from './interview.manager.js'
import { FormValidator } from './form.validator.js'
import { renderQuestions } from './questions.renderer.js'
import { questionUtils } from './questions.stats.js'
import { questionsData } from './questions.data.js'
import { InterviewsViewer } from './interviews.viewer.js'

export async function initializeApp() {
  try {
    const { auth } = await db.init()

    const authService = new AuthService(auth)

    const manager = new InterviewManager()
    await manager.init()
    manager.loadFromURL()

    const notificationService = new NotificationService()
    const isGitHubPages = window.location.hostname.includes('github.io')

    // Передаём все зависимости в AuthUI
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

export async function initializeInterviewsPage() {
  try {
    const { auth, firestore } = await db.init()
    const authService = new AuthService(auth)
    const notificationService = new NotificationService()
    const isGitHubPages = window.location.hostname.includes('github.io')

    // viewer для интервью
    const viewer = new InterviewsViewer()

    // зависимости
    viewer.setDependencies({
      authService,
      notificationService,
      firestore,
      isGitHubPages,
      db,
    })

    await viewer.init()

    notificationService.show('Страница интервью загружена', 'success', 2000)
  } catch (error) {
    console.error('Ошибка инициализации страницы интервью:', error)
    const notificationService = new NotificationService()
    notificationService.show('Ошибка загрузки страницы интервью', 'error', 5000)
  }
}

//  какую страницу инициализировать
export async function initializeCurrentPage() {
  const currentPage = window.location.pathname

  if (currentPage.includes('interviews.html')) {
    await initializeInterviewsPage()
  } else {
    await initializeApp()
  }
}
