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

    // установка постоянства сессии в localStorage.
    setPersistence(this.auth, browserLocalPersistence)
      .then(() => {
        // подписка на изменения статуса авторизации.
        onAuthStateChanged(this.auth, (user) => {
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

  async signInWithGitHub() {
    try {
      // Firebase сам проверит наличие сессии лишняя проверка не нужна.
      const result = await signInWithPopup(this.auth, this.provider)
      const user = result.user
      console.log('Пользователь успешно вошел через GitHub:', user)
      return user
    } catch (error) {
      console.error('Ошибка входа через GitHub:', error)
      return null
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
    // Firebase всегда будет возвращать текущего пользователя setPersistence и onAuthStateChanged.
    return this.auth ? this.auth.currentUser : null
  }
}
