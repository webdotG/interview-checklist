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
import { InterviewFilters } from './interview.filters.js'

const isGitHubPages = window.location.hostname.includes('github.io')

export async function initializeApp() {
  try {
    const { auth } = await db.init()
    const authService = new AuthService(auth)
    const manager = new InterviewManager()
    await manager.init()
    manager.loadFromURL()

    const notificationService = new NotificationService()

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

    authUI.setupEventListeners()

    authService.setOnAuthStateChangedCallback((user) => {
      authUI.updateUI(user)
      if (user) {
        const displayName = authService.getUserDisplayName(user)
        notificationService.show(
          `Добро пожаловать, ${displayName}!`,
          'success',
          3000,
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
      isGitHubPages,
    )
    authUI.setupEventListeners()

    authService.setOnAuthStateChangedCallback((user) => {
      authUI.updateUI(user)
      if (user) {
        const displayName = authService.getUserDisplayName(user)
        notificationService.show(
          `Авторизован как ${displayName}`,
          'success',
          3000,
        )
      } else {
        notificationService.show(
          'Для полного доступа требуется авторизация',
          'warning',
          4000,
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

export async function initializeCurrentPage() {
  const currentPage = window.location.pathname

  if (currentPage.includes('interviews.html')) {
    await initializeInterviewsPage()
  } else {
    await initializeApp()
  }
}

window.addEventListener('load', () => {
  console.log('=== Диагностика браузера ===')
  console.log('User Agent:', navigator.userAgent)
  console.log('Popup support:', !navigator.userAgent.includes('Mobile'))
  console.log('Local Storage support:', !!window.localStorage)
  console.log('Current URL:', window.location.href)
  console.log('Referrer:', document.referrer)

  try {
    const popup = window.open('', '_blank', 'width=1,height=1')
    if (popup && !popup.closed) {
      console.log('Popup не заблокирован')
      popup.close()
    } else {
      console.log('Popup заблокирован браузером')
    }
  } catch (e) {
    console.log('Popup заблокирован (исключение):', e.message)
  }
})
