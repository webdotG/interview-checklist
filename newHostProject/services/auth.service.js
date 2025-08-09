import {
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
      // Запрашиваем базовые данные
      this.provider.addScope('read:user')
      this.provider.addScope('user:email')

      const result = await signInWithPopup(this.auth, this.provider)

      const user = result.user
      const providerProfile = user.providerData[0] || {}
      const profile = result.additionalUserInfo?.profile || {}

      const githubData = {
        firebaseUid: user.uid || null,
        githubLogin: profile.login || null,
        githubProfileUrl: profile.html_url || null,
        githubAvatarUrl: profile.avatar_url || providerProfile.photoURL || null,
        fullName: profile.name || user.displayName || null,
        email: profile.email || user.email || null,
      }

      console.log('GitHub user data:', githubData)

      return githubData
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
