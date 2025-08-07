import {
  getAuth,
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
    this.onAuthStateChangedCallback = () => {}

    setPersistence(this.auth, browserLocalPersistence)
      .then(() => {
        onAuthStateChanged(this.auth, (user) => {
          this.onAuthStateChangedCallback(user)
        })
      })
      .catch((error) => {
        console.error('Ошибка установки постоянства сессии:', error)
      })
  }

  setOnAuthStateChangedCallback(callback) {
    this.onAuthStateChangedCallback = callback
  }

  async signInWithGitHub() {
    try {
      await signInWithRedirect(this.auth, this.provider)
    } catch (error) {
      console.error('Ошибка входа через GitHub:', error)
      return null
    }
  }

  async signOut() {
    try {
      if (this.auth) {
        await signOut(this.auth)
      }
    } catch (error) {
      console.error('Ошибка при выходе:', error)
    }
  }

  async handleRedirectResult() {
    try {
      const result = await getRedirectResult(this.auth)
      return result ? result.user : null
    } catch (error) {
      console.error('Ошибка при редирект-аутентификации:', error)
      return null
    }
  }

  getCurrentUser() {
    return this.auth ? this.auth.currentUser : null
  }

  getUserDisplayName(user) {
    if (user) {
      return user.displayName || user.email || 'Пользователь'
    }
    return 'Пользователь'
  }
}
