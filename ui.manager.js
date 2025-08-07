export class UIManager {
  constructor() {
    this.initElements()
  }

  initElements() {
    this.loadBtn = document.getElementById('load-interviews-btn')
    this.loadingMessage = document.getElementById('loading-message')
    this.errorMessage = document.getElementById('error-message')
    this.errorText = document.getElementById('error-text')
    this.noInterviewsMessage = document.getElementById('no-interviews')
    this.interviewsContainer = document.getElementById('interviews-container')
    this.localModeWarning = document.getElementById('local-mode-warning')
  }

  showLoading(show) {
    this.loadBtn.disabled = show
    this.loadBtn.textContent = show ? 'Загружаю...' : 'Загрузить интервью'

    if (show) {
      this.loadingMessage.classList.remove('hidden')
    } else {
      this.loadingMessage.classList.add('hidden')
    }
  }

  showError(message) {
    this.errorText.textContent = message
    this.errorMessage.classList.remove('hidden')
  }

  hideError() {
    this.errorMessage.classList.add('hidden')
  }

  showNoInterviews() {
    this.noInterviewsMessage.classList.remove('hidden')
  }

  hideNoInterviews() {
    this.noInterviewsMessage.classList.add('hidden')
  }

  clearInterviews() {
    this.interviewsContainer.innerHTML = ''
  }

  showLocalModeWarning() {
    const warningHTML = `
      <div class="warning-banner">
        <h3>Локальный режим</h3>
        <p>Для сохранения и загрузки интервью в базу данных, пожалуйста, перейдите на 
        <a href="https://webdotG.github.io/interview-checklist/" target="_blank">
        GitHub Pages версию
        </a> этого приложения.</p>
        <p>В локальном режиме Вы можете только экспортировать результаты собеса в JSON к себе на машину</p>
      </div>
    `
    this.localModeWarning.innerHTML = warningHTML
    this.localModeWarning.classList.remove('hidden')
  }

  showOfflineWarning() {
    const warningHTML = `
      <div class="offline-warning-banner">
        <h3>Защищенный режим</h3>
        <p><strong>База данных временно недоступна</strong> из-за мер защиты от спама и автоматических атак.</p>
        <p>Проще говоря слишком много запросов в моменте</p>
        <div class="offline-details">
          <p><strong>Что происходит:</strong></p>
          <ul>
            <li>Firestore автоматически ограничивает доступ при подозрительной активности</li>
            <li>Это нормальная защитная мера Google для предотвращения злоупотреблений</li>
          </ul>
          
          <p><strong>Что делать:</strong></p>
          <ul>
            <li>Подождите немного и попробуйте снова</li>
            <li>Вы все еще можете создавать новые интервью локально</li>
          </ul>
        </div>
      </div>
    `
    this.interviewsContainer.innerHTML = warningHTML
  }

  onLoadButtonClick(callback) {
    this.loadBtn.addEventListener('click', callback)
  }

  getInterviewsContainer() {
    return this.interviewsContainer
  }

  isLocalMode() {
    return !window.location.hostname.includes('github.io')
  }

  isGitHubPages() {
    return window.location.hostname.includes('github.io')
  }
}
