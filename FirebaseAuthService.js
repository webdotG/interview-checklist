import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js'
import {
  getAuth,
  signInWithPopup,
  GithubAuthProvider,
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js'

export class AuthService {
  constructor() {
    this.auth = null
    this.provider = new GithubAuthProvider()
    this.firebaseConfig = {
      apiKey: 'AIzaSyAQCgDpHF9u2i6swE0j0lNxiZmRp9j42oE', // API ключ
      authDomain: 'interview-checklist.firebaseapp.com', // домен
      projectId: 'interview-checklist', // ID проекта
    }
  }

  async initializeAuth() {
    try {
      const firebaseApp = initializeApp(this.firebaseConfig)
      this.auth = getAuth(firebaseApp)
      console.log('Firebase Auth успешно инициализирован')
    } catch (error) {
      console.error('Ошибка инициализации Firebase Auth:', error)
    }
  }

  async signInWithGitHub() {
    try {
      const result = await signInWithPopup(this.auth, this.provider)
      // токен доступа GitHub, можно использовать для доступа к GitHub API
      const credential = GithubAuthProvider.credentialFromResult(result)
      const token = credential.accessToken

      // залогиненный пользователь
      const user = result.user

      console.log('Пользователь успешно вошел через GitHub:', user)
      return user
    } catch (error) {
      // ошибки
      const errorCode = error.code
      console.log('errorCode', errorCode)
      const errorMessage = error.message
      // E-mail аккаунта, который использовался
      const email = error.customData.email
      // тип credential
      const credential = GithubAuthProvider.credentialFromError(error)

      console.error('Ошибка входа через GitHub:', errorMessage)
      return null
    }
  }

  getCurrentUser() {
    return this.auth ? this.auth.currentUser : null
  }
}
