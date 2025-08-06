import {
  signInWithPopup,
  GithubAuthProvider,
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js'
import { auth } from './db.service.js'

export class AuthService {
  constructor() {
    this.provider = new GithubAuthProvider()
  }

  // Оставил его пустым, чтобы не было ошибок, не помнб пока где в коде его вызывают
  async initializeAuth() {
    console.log('Используем уже инициализированный Firebase Auth')
  }

  async signInWithGitHub() {
    try {
      // Используем импортированный экземпляр auth
      const result = await signInWithPopup(auth, this.provider)
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
        await this.auth.signOut()
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
