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

    // Колбэк для изменений состояния авторизации
    this.onAuthStateChangedCallback = () => {}

    // Добавляем scope если нужен доступ к репозиториям (опционально)
    // this.provider.addScope('repo')

    // УБИРАЕМ redirect_uri - Firebase сам управляет редиректами!
    // Вместо этого можно добавить другие GitHub параметры если нужно:
    // this.provider.setCustomParameters({
    //   'allow_signup': 'true'
    // })

    this.initAuth()
  }

  async initAuth() {
    try {
      // Установка постоянства сессии
      await setPersistence(this.auth, browserLocalPersistence)

      // Проверяем результат редиректа (если использовался signInWithRedirect)
      const result = await getRedirectResult(this.auth)
      if (result) {
        console.log('Пользователь вошел через редирект:', result.user)
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
    }
  }

  // Метод для установки колбэка
  setOnAuthStateChangedCallback(callback) {
    this.onAuthStateChangedCallback = callback
  }

  // Вход через popup (рекомендуется для десктопа)
  async signInWithGitHub() {
    try {
      const result = await signInWithPopup(this.auth, this.provider)
      const credential = GithubAuthProvider.credentialFromResult(result)
      const token = credential?.accessToken // GitHub access token если нужен
      const user = result.user

      console.log('Успешный вход через GitHub:', user.displayName || user.email)
      return user
    } catch (error) {
      console.error('Ошибка входа через GitHub (popup):', error)

      // Обработка специфичных ошибок
      if (error.code === 'auth/popup-blocked') {
        console.log('Попап заблокирован браузером, попробуйте редирект')
        return this.signInWithGitHubRedirect()
      }

      return null
    }
  }

  // Альтернативный метод через редирект (для мобильных устройств)
  async signInWithGitHubRedirect() {
    try {
      await signInWithRedirect(this.auth, this.provider)
      // После редиректа результат будет получен в initAuth() через getRedirectResult()
    } catch (error) {
      console.error('Ошибка входа через GitHub (redirect):', error)
    }
  }

  async signOut() {
    try {
      if (this.auth) {
        await signOut(this.auth)
        console.log('Выход выполнен успешно')
      }
    } catch (error) {
      console.error('Ошибка при выходе:', error)
    }
  }

  getCurrentUser() {
    return this.auth ? this.auth.currentUser : null
  }
}
