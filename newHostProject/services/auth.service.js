import {
  getAuth,
  signInWithPopup, // 💡 ИСПОЛЬЗУЕМ POPUP
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

    // 💡 ВОЗВРАЩАЕМ: Явно указываем домен для попапа
    this.provider.setCustomParameters({
      redirect_uri: 'https://webdotg.github.io/interview-checklist/',
    })

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
      const result = await signInWithPopup(this.auth, this.provider)
      const user = result.user
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
      }
    } catch (error) {
      console.error('Ошибка при выходе:', error)
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
