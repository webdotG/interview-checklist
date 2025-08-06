import { FormValidator } from './form.validator.js'

export class AuthUI {
  constructor(authService, notificationService, manager, isGitHubPages) {
    this.authService = authService
    this.notificationService = notificationService
    this.manager = manager
    this.isGitHubPages = isGitHubPages

    this.loginButton = document.getElementById('github-login-btn')
    this.logoutButton = document.getElementById('github-logout-btn')
    this.authLink = document.getElementById('auth-link')
    this.authWarning = document.getElementById('auth-warning')
    this.submitButton = document.getElementById('submit-btn')
    this.userInfo = document.createElement('div')
    // this.setupEventListeners()
    this.isLoggingIn = false
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
        this.updateUI()
      }
    } catch (error) {
      this.notificationService.show(
        'Ошибка при входе. Попробуйте снова.',
        'error',
      )
      console.error('Login error:', error)
    }
  }

  async handleLogout() {
    await this.authService.signOut()
    this.notificationService.show('Вы вышли из аккаунта.', 'info')
    this.updateUI()
  }

  updateUI() {
    const currentUser = this.authService.getCurrentUser()

    if (this.isGitHubPages) {
      if (currentUser) {
        this.showAuthorizedState(currentUser)
        this.loginButton.style.display = 'none'
        if (this.authWarning) this.authWarning.classList.add('hidden')
      } else {
        this.showUnauthorizedState()
        this.loginButton.style.display = 'block'
        if (this.authWarning) this.authWarning.classList.remove('hidden')
      }
    } else {
      this.showLocalMode()
      this.loginButton.style.display = 'none'
      if (this.authWarning) this.authWarning.classList.add('hidden')
    }
  }

  showLocalMode() {
    if (this.loginButton) this.loginButton.style.display = 'none'
    if (this.logoutButton) this.logoutButton.style.display = 'none'
    if (this.authWarning) this.authWarning.classList.add('hidden')
    if (this.userInfo.parentNode) this.userInfo.remove()
  }

  showAuthorizedState(user) {
    if (this.loginButton) this.loginButton.style.display = 'none'
    if (this.logoutButton) this.logoutButton.style.display = 'block'
    if (this.authWarning) this.authWarning.classList.add('hidden')
    if (this.userInfo.parentNode) this.userInfo.remove()

    this.userInfo.innerHTML = `
      <div class="user-info">
        <span>Вы вошли как: ${user.displayName || user.email}</span>
        <button id="logout-btn" class="btn btn--small">Выйти</button>
      </div>
    `
    if (this.loginButton && this.loginButton.parentNode) {
      this.loginButton.parentNode.appendChild(this.userInfo)
    }
  }

  showUnauthorizedState() {
    if (this.loginButton) this.loginButton.style.display = 'block'
    if (this.logoutButton) this.logoutButton.style.display = 'none'
    if (this.authWarning) this.authWarning.classList.remove('hidden')
    if (this.userInfo.parentNode) this.userInfo.remove()
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
        'Для сохранения необходимо войти через GitHub',
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
