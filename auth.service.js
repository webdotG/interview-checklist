import {
  getAuth,
  signInWithPopup,
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
    // для хранения колбэка AUTH
    this.onAuthStateChangedCallback = () => {}

    // 💡 Явно указываем домен для редиректа.
    // Это нужно, чтобы Firebase знал, куда перенаправлять пользователя
    // после авторизации с GitHub. Если этого не сделать, он будет
    // использовать домен firebaseapp.com, что вызовет ошибку 404.
    this.provider.setCustomParameters({
      redirect_uri: 'https://webdotg.github.io/interview-checklist/',
    })

    // Установка постоянства сессии в localStorage.
    setPersistence(this.auth, browserLocalPersistence)
      .then(() => {
        // Подписка на изменения статуса авторизации.
        onAuthStateChanged(this.auth, (user) => {
          // Вызов колбэка
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
      })
      .catch((error) => {
        console.error('Ошибка установки постоянства сессии:', error)
      })
  }

  // Метод для установки колбэка
  setOnAuthStateChangedCallback(callback) {
    this.onAuthStateChangedCallback = callback
  }

  // Вход через popup (рекомендуется для десктопа)
  async signInWithGitHub() {
    try {
      const result = await signInWithPopup(this.auth, this.provider)
      const user = result.user
      console.log('Успешный вход через GitHub:', user.displayName || user.email)
      return user
    } catch (error) {
      console.error('Ошибка входа через GitHub:', error)
      console.error('Error code:', error.code)
      console.error('Error message:', error.message)
      return null
    }
  }

  // Выход из аккаунта
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
