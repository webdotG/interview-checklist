import {
  getAuth,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  GithubAuthProvider,
  signOut,
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence,
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js'

export class AuthService {
  constructor(auth) {
    this.auth = auth
    this.provider = new GithubAuthProvider()

    // Добавляем дополнительные права доступа
    this.provider.addScope('user:email')

    // Колбэк для изменений состояния авторизации
    this.onAuthStateChangedCallback = () => {}

    // Флаг для отслеживания попыток авторизации
    this.isAuthenticating = false

    this.initAuth()
  }

  async initAuth() {
    try {
      // Установка постоянства сессии
      await setPersistence(this.auth, browserLocalPersistence)

      // Проверяем результат редиректа (если использовался signInWithRedirect)
      const result = await getRedirectResult(this.auth)
      if (result) {
        console.log(
          'Пользователь вошел через редирект:',
          result.user.displayName || result.user.email,
        )
        this.isAuthenticating = false
      }

      // Подписка на изменения статуса авторизации
      onAuthStateChanged(this.auth, (user) => {
        this.onAuthStateChangedCallback(user)
        if (user) {
          console.log(
            'Пользователь авторизован:',
            user.displayName || user.email,
          )
        } else {
          console.log('Пользователь не авторизован.')
        }
      })
    } catch (error) {
      console.error('Ошибка инициализации авторизации:', error)
      this.isAuthenticating = false
    }
  }

  // Метод для установки колбэка
  setOnAuthStateChangedCallback(callback) {
    this.onAuthStateChangedCallback = callback
  }

  // Умный вход с fallback'ом на redirect
  async signInWithGitHub() {
    if (this.isAuthenticating) {
      console.log('Авторизация уже в процессе...')
      return null
    }

    this.isAuthenticating = true

    try {
      // Сначала пробуем popup
      console.log('Попытка входа через GitHub popup...')
      const result = await signInWithPopup(this.auth, this.provider)

      const credential = GithubAuthProvider.credentialFromResult(result)
      const token = credential?.accessToken
      const user = result.user

      console.log(
        'Успешный вход через GitHub popup:',
        user.displayName || user.email,
      )
      this.isAuthenticating = false
      return user
    } catch (error) {
      console.error('Popup не сработал:', error.code, error.message)

      // Если popup заблокирован или закрыт пользователем, пробуем redirect
      if (this.shouldUseRedirect(error)) {
        console.log('Переходим к redirect авторизации...')

        try {
          // Сохраняем флаг в localStorage для отслеживания redirect'а
          localStorage.setItem('auth-redirect-pending', 'true')
          await signInWithRedirect(this.auth, this.provider)
          // После redirect произойдет перезагрузка страницы
          return null
        } catch (redirectError) {
          console.error('Ошибка redirect авторизации:', redirectError)
          this.isAuthenticating = false
          throw redirectError
        }
      } else {
        // Другие ошибки (нет интернета, проблемы с GitHub и т.д.)
        this.isAuthenticating = false
        this.logDetailedError(error)
        throw error
      }
    }
  }

  // Определяем, нужно ли использовать redirect
  shouldUseRedirect(error) {
    const redirectCodes = [
      'auth/popup-blocked',
      'auth/popup-closed-by-user',
      'auth/cancelled-popup-request',
      'auth/operation-not-allowed',
    ]

    return (
      redirectCodes.includes(error.code) ||
      error.message.includes('popup') ||
      error.message.includes('blocked')
    )
  }

  // Детальное логирование ошибок
  logDetailedError(error) {
    console.error('Детали ошибки авторизации:')
    console.error('Code:', error.code)
    console.error('Message:', error.message)

    if (error.customData) {
      console.error('Email:', error.customData.email)
    }

    // Дополнительная диагностика
    console.error('User Agent:', navigator.userAgent)
    console.error('Popup blocked by browser:', this.isPopupBlocked())
  }

  // Проверка блокировки popup'ов
  isPopupBlocked() {
    try {
      const popup = window.open('', '_blank', 'width=1,height=1')
      if (!popup || popup.closed) {
        return true
      }
      popup.close()
      return false
    } catch (e) {
      return true
    }
  }

  // Проверяем, возвращаемся ли мы после redirect'а
  isReturningFromRedirect() {
    return localStorage.getItem('auth-redirect-pending') === 'true'
  }

  // Очищаем флаг redirect'а
  clearRedirectFlag() {
    localStorage.removeItem('auth-redirect-pending')
  }

  // Альтернативный метод через редирект (для прямого вызова)
  async signInWithGitHubRedirect() {
    try {
      console.log('Принудительный вход через redirect...')
      localStorage.setItem('auth-redirect-pending', 'true')
      await signInWithRedirect(this.auth, this.provider)
    } catch (error) {
      console.error('Ошибка входа через GitHub (redirect):', error)
      localStorage.removeItem('auth-redirect-pending')
    }
  }

  async signOut() {
    try {
      if (this.auth) {
        await signOut(this.auth)
        console.log('Выход выполнен успешно')

        // Очищаем все связанные флаги
        this.clearRedirectFlag()
        this.isAuthenticating = false
      }
    } catch (error) {
      console.error('Ошибка при выходе:', error)
    }
  }

  getCurrentUser() {
    return this.auth ? this.auth.currentUser : null
  }

  // Проверка состояния авторизации
  isAuthenticated() {
    return !!this.getCurrentUser()
  }

  // Получение отображаемого имени пользователя
  getUserDisplayName() {
    const user = this.getCurrentUser()
    return user ? user.displayName || user.email || 'Пользователь' : null
  }
}
