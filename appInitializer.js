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
    // 💡 ЭТО КРИТИЧЕСКИ ВАЖНЫЙ ШАГ
    // ТЕСТ
    authService.provider.setCustomParameters({
      redirect_uri: 'https://webdotg.github.io/interview-checklist/',
    })
    // Проверяем, возвращаемся ли мы после redirect авторизации
    // if (authService.isReturningFromRedirect()) {
    //   console.log('Обрабатываем возврат после redirect авторизации...')
    //   // Флаг будет очищен автоматически после обработки getRedirectResult в initAuth
    //   setTimeout(() => {
    //     authService.clearRedirectFlag()
    //   }, 2000)
    // }

    const manager = new InterviewManager()
    await manager.init()
    manager.loadFromURL()

    const notificationService = new NotificationService()

    // AuthUI для главной страницы
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

    // AuthUI устанавливает все обработчики
    authUI.setupEventListeners()
    // UI обновляется через onAuthStateChanged

    // Показываем уведомление о статусе авторизации
    authService.setOnAuthStateChangedCallback((user) => {
      if (user) {
        const displayName = authService.getUserDisplayName()
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

    // Проверяем redirect на странице интервью
    // if (authService.isReturningFromRedirect()) {
    //   console.log('Обрабатываем возврат после redirect на странице интервью...')
    //   setTimeout(() => {
    //     authService.clearRedirectFlag()
    //   }, 2000)
    // }

    const notificationService = new NotificationService()
    const filters = new InterviewFilters()
    const viewer = new InterviewsViewer()
    // InterviewManager здесь не нужен.

    // AuthUI для страницы интервью
    const authUI = new AuthUI(
      authService,
      notificationService,
      null, // manager не используется на этой странице
      isGitHubPages,
    )
    authUI.setupEventListeners()
    // UI обновляется через onAuthStateChanged

    // Показываем статус авторизации
    authService.setOnAuthStateChangedCallback((user) => {
      if (user) {
        const displayName = authService.getUserDisplayName()
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

    // зависимости для viewer
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

// какую страницу инициализировать
export async function initializeCurrentPage() {
  const currentPage = window.location.pathname

  if (currentPage.includes('interviews.html')) {
    await initializeInterviewsPage()
  } else {
    await initializeApp()
  }
}

// Дополнительная диагностика для отладки
window.addEventListener('load', () => {
  console.log('=== Диагностика браузера ===')
  console.log('User Agent:', navigator.userAgent)
  console.log('Popup support:', !navigator.userAgent.includes('Mobile'))
  console.log('Local Storage support:', !!window.localStorage)
  console.log('Current URL:', window.location.href)
  console.log('Referrer:', document.referrer)

  // Проверка popup блокировки
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
