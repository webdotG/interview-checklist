import { db } from '../services/db.service.js'
import { AuthService } from '../services/auth.service.js'
import { NotificationService } from '../services/notification.service.js'
import { AuthUI } from '../ui/auth.ui.js'
import { InterviewManager } from './interview.manager.js'
import { FormValidator } from '../utils/form.validator.js'
import { questionStats } from '../utils/questions.utils.js'
import { InterviewsViewer } from '../ui/interviews.viewer.js'
import { InterviewFilters } from '../ui/interview.filters.js'
import { initializeTheme } from './toggle.theme.js'

const isGitHubPages = window.location.hostname.includes('github.io')

export async function initializeApp() {
  try {
    const { auth } = await db.init()
    const authService = new AuthService(auth)
    const notificationService = new NotificationService()

    // 1. FormValidator ПЕРВЫМ
    const formValidator = new FormValidator()
    // formValidator.init('#interview-form')
    formValidator.init()
    // 2. InterviewManager и связываем с FormValidator
    const manager = new InterviewManager()
    manager.setFormValidator(formValidator) // ← Связываем ПЕРЕД инициализацией

    // 3. manager теперь у него есть FormValidator
    await manager.init()
    manager.loadFromURL()

    // 4. остальное
    const authUI = new AuthUI(
      authService,
      notificationService,
      manager,
      isGitHubPages
    )

    questionStats.addCounterToHeader()
    authUI.setupEventListeners()

    authService.setOnAuthStateChangedCallback((user) => {
      authUI.updateUI(user)
      if (user) {
        const displayName = authService.getUserDisplayName(user)
        notificationService.show(
          `Добро пожаловать, ${displayName}!`,
          'success',
          3000
        )
      }
    })

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
    const filters = new InterviewFilters()
    const viewer = new InterviewsViewer()

    const authUI = new AuthUI(
      authService,
      notificationService,
      null,
      isGitHubPages
    )

    authUI.setupEventListeners()

    authService.setOnAuthStateChangedCallback((user) => {
      authUI.updateUI(user)
      if (user) {
        const displayName = authService.getUserDisplayName(user)
        notificationService.show(
          `Авторизован как ${displayName}`,
          'success',
          3000
        )
      } else {
        notificationService.show(
          'Для полного доступа требуется авторизация',
          'warning',
          4000
        )
      }
    })

    viewer.setDependencies({
      authService,
      notificationService,
      firestore,
      isGitHubPages,
      db,
      filters,
      authUI,
    })

    await viewer.init()
    notificationService.show('Страница интервью загружена', 'success', 2000)
  } catch (error) {
    console.error('Ошибка инициализации страницы интервью:', error)
    const notificationService = new NotificationService()
    notificationService.show('Ошибка загрузки страницы интервью', 'error', 5000)
  }
}

initializeTheme()

export async function initializeCurrentPage() {

  const currentPage = window.location.pathname
  if (currentPage.includes('interviews.html')) {
    await initializeInterviewsPage()
  } else {
    await initializeApp()
  }
}