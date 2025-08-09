import { FormValidator } from './form.validator.js'

export class AuthUI {
  constructor(authService, notificationService, manager, isGitHubPages) {
    this.authService = authService
    this.notificationService = notificationService
    this.manager = manager
    this.isGitHubPages = isGitHubPages
    this.authContainer = document.getElementById('auth-container')
    this.loginButton = document.getElementById('github-login-btn')
    this.logoutButton = document.getElementById('github-logout-btn')
    this.authLink = document.getElementById('auth-link')
    this.authWarning = document.getElementById('auth-warning')
    this.submitButton = document.getElementById('submit-btn')
    this.userInfo = document.createElement('div')
    this.isLoggingIn = false

    // колбэк для AuthUI.
    this.authService.setOnAuthStateChangedCallback((user) => {
      this.updateUI(user)
    })
  }

  async handleLogin() {
    try {
      if (this.isLoggingIn) {
        console.log('Вход уже выполняется, игнорируем повторный вызов')
        return
      }

      this.notificationService.show('Выполняется вход...', 'info')
      const user = await this.authService.signInWithGitHub()

      if (user) {
        this.notificationService.show(
          `Добро пожаловать, ${user.displayName || user.email}!`,
          'success',
        )
        // колбэк (setOnAuthStateChangedCallback) сделает всё сам
      }
    } catch (error) {
      this.notificationService.show(
        'Ошибка при входе. Попробуйте снова.',
        'error',
      )
      console.error('Login error:', error)
    }
  }

  updateUI(user) {
    if (user) {
      this.showAuthorizedState(user)
    } else {
      this.showUnauthorizedState()
    }
  }

  async handleLogout() {
    await this.authService.signOut()
    // колбэк сделает всё сам после signOut
    this.notificationService.show('Вы вышли из аккаунта.', 'info')
    // для правильного отоброжения после Logout
    // this.showLoginButton()
    this.showUnauthorizedState()
  }

  showLoginButton() {
    // 💡 ТЕСТ Явно показываем кнопку входа
    if (this.loginButton) {
      this.loginButton.classList.remove('hidden')
    }
    if (this.authWarning) {
      this.authWarning.classList.remove('hidden')
      this.authWarning.classList.add('auth-warning--visible')
    }
    if (this.logoutButton) {
      this.logoutButton.classList.add('hidden')
    }
    if (this.userInfo.parentNode) {
      this.userInfo.remove()
    }
  }

  showLocalMode() {
    if (this.authContainer) {
      this.authContainer.classList.add('hidden')
    }
    //  на всякий случай
    if (this.loginButton) this.loginButton.classList.add('hidden')
    if (this.logoutButton) this.logoutButton.classList.add('hidden')
    if (this.authWarning) this.authWarning.classList.add('hidden')
    if (this.userInfo.parentNode) this.userInfo.remove()
  }

  showAuthorizedState(user) {
    if (this.authWarning) {
      this.authWarning.classList.add('hidden')
      this.authWarning.classList.remove('auth-warning--visible')
    }
    if (this.loginButton) this.loginButton.classList.add('hidden')
    if (this.logoutButton) this.logoutButton.classList.remove('hidden')
    if (this.userInfo.parentNode) this.userInfo.remove()
    this.userInfo.innerHTML = `
      <div class="user-info">
        <span>✓ Привет: <strong>${
          user.displayName || user.email
        }</strong></span>
      </div>
    `
    if (this.authContainer) {
      this.authContainer.prepend(this.userInfo)
    }
  }
  showUnauthorizedState() {
    if (this.logoutButton) this.logoutButton.classList.add('hidden')
    if (this.userInfo.parentNode) this.userInfo.remove()
    if (this.authWarning) this.authWarning.classList.remove('hidden')
    if (this.loginButton) this.loginButton.classList.remove('hidden')
  }

  setupEventListeners() {
    // вход
    if (this.loginButton) {
      this.loginButton.addEventListener('click', () => this.handleLogin())
    }
    if (this.authLink) {
      this.authLink.addEventListener('click', (e) => {
        e.preventDefault()
        this.handleLogin()
      })
    }

    // выход
    if (this.logoutButton) {
      this.logoutButton.addEventListener('click', () => this.handleLogout())
    }

    // отправка формы
    if (this.submitButton) {
      this.submitButton.addEventListener('click', (e) => {
        e.preventDefault()
        this.handleSubmit(e)
      })
    }
  }

  async handleSubmit(e) {
    const currentUser = this.authService.getCurrentUser()
    const isLocalSaveAllowed = !this.isGitHubPages || currentUser

    const formValidator = new FormValidator(['company', 'position'])
    const isFormValid = formValidator.validateForm()

    if (!isFormValid) {
      this.notificationService.show(
        'Пожалуйста, заполните обязательные поля.',
        'error',
      )
      return false
    }

    if (isLocalSaveAllowed) {
      this.notificationService.show('Сохраняем ответы...', 'info')
      await this.manager.saveToDatabase()
      return true
    } else {
      this.notificationService.show(
        'Для сохранения в общую базу необходимо войти через GitHub',
        'warning',
      )
      this.highlightAuthWarning()
      return false
    }
  }

  highlightAuthWarning() {
    if (this.authWarning) {
      this.authWarning.classList.add('auth-warning--highlighted')
      setTimeout(() => {
        if (this.authWarning) {
          this.authWarning.classList.remove('auth-warning--highlighted')
        }
      }, 3000)
    }
  }
}
