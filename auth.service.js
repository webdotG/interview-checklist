import {
  signInWithPopup,
  GithubAuthProvider,
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js'

export class AuthService {
  constructor(auth) {
    this.auth = auth
    this.provider = new GithubAuthProvider()
  }

  async signInWithGitHub() {
    try {
      if (this.auth?.currentUser) {
        console.log('Пользователь уже авторизован')
        return this.auth.currentUser
      }
      // Используем объект auth, переданный в конструктор
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
