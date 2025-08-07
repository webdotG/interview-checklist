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
    // явный указ домена для редиректа
    // чтобы Firebase знал куда перенаправлять юзера после авторизации с GitHub
    // если этого не сделать он будет использовать домен firebaseapp.com, что вызовет ошибку 404
    this.provider.setCustomParameters({
      redirect_uri: 'https://webdotg.github.io/interview-checklist/',
    })
    // установка постоянства сессии в localStorage.
    setPersistence(this.auth, browserLocalPersistence)
      .then(() => {
        // подписка на изменения статуса авторизации.
        onAuthStateChanged(this.auth, (user) => {
          // колбэк здесь AUTH
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

  // метод для установки колбэка AUTH
  setOnAuthStateChangedCallback(callback) {
    this.onAuthStateChangedCallback = callback
  }

  async signInWithGitHub() {
    try {
      // Firebase сам проверит наличие сессии лишняя проверка не нужна.
      const result = await signInWithPopup(this.auth, this.provider)
      const user = result.user
      return user
    } catch (error) {
      console.error('Подробности ошибки логина с GitHub:', error.message)
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
