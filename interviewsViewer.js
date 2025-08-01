export class InterviewsViewer {
  constructor() {
    this.interviews = []
    this.firestore = null
    this.firebaseInitialized = false
    this.filters = null
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

  // фильтр
  setFilters(filtersInstance) {
    this.filters = filtersInstance

    this.filters.onChange((result) => {
      this.interviews = result.data
      this.renderInterviews()

      console.log('Фильтры работают:', result.stats)
    })

    return this
  }

  async init() {
    if (!window.location.hostname.includes('github.io')) {
      this.showLocalModeWarning()
      return
    }

    this.loadBtn.addEventListener('click', () => this.loadInterviews())

    if (window.location.hostname.includes('github.io')) {
      await this.loadInterviews()
    }
  }

  showLocalModeWarning() {
    const warningHTML = `
    <div class="warning-banner">
      <h3>Локальный режим</h3>
      <p>Для сохранения и загрузки интервью из базы данных, пожалуйста, перейдите на 
      <a href="https://webdotG.github.io/interview-checklist/" target="_blank">
      GitHub Pages версию
      </a> этого приложения.</p>
      <p>В локальном режиме Вы можете только экспортировать результаты собеса в JSON к себе на машину</p>
    </div>
  `
    this.localModeWarning.innerHTML = warningHTML
    this.localModeWarning.classList.remove('hidden')
  }

  async initFirebase() {
    try {
      console.log('Инициализируем Firebase...')

      const { initializeApp } = await import(
        'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js'
      )
      const { getFirestore } = await import(
        'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js'
      )

      const firebaseConfig = await import('./firebase-config.js')
      const firebaseApp = initializeApp(firebaseConfig.default)
      this.firestore = getFirestore(firebaseApp)
      this.firebaseInitialized = true

      console.log('Firebase успешно инициализирован')
      return true
    } catch (error) {
      console.error('Ошибка инициализации Firebase:', error)
      this.showError(`Не удалось подключиться к Firebase: ${error.message}`)
      return false
    }
  }

  async loadInterviews() {
    this.showLoading(true)
    this.hideError()
    this.hideNoInterviews()
    this.clearInterviews()

    if (this.filters) {
      this.filters.setLoading(true)
    }

    // инициализируем Firebase (если еще не сделано)
    if (!this.firebaseInitialized) {
      const success = await this.initFirebase()
      if (!success) {
        this.showLoading(false)

        if (this.filters) {
          this.filters.setLoading(false)
        }

        return
      }
    }

    try {
      console.log('Загружаем интервью из Firestore...')

      const { collection, getDocs, orderBy, query } = await import(
        'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js'
      )

      // запрос с сортировкой по дате (новые сначала)
      const interviewsQuery = query(
        collection(this.firestore, 'interviews'),
        orderBy('timestamp', 'desc'),
      )

      const querySnapshot = await getDocs(interviewsQuery)

      this.interviews = []
      querySnapshot.forEach((doc) => {
        const data = doc.data()
        this.interviews.push({
          id: doc.id,
          ...data,
        })
      })

      console.log(`Загружено ${this.interviews.length} интервью`)

      if (this.interviews.length === 0) {
        this.showOfflineWarning()
      } else {
        this.renderInterviews()

        if (this.filters) {
          this.filters.setData(this.interviews)
          // this.filters.show()
        }
      }
    } catch (error) {
      console.error('Ошибка при загрузке интервью:', error)
      // ПРОВЕРКА, НА ОФЛАЙН РЕЖИМ (ЗАЩИТА НА ПЕРЕГРУЗ В ФАЕРБЭЙС)
      if (
        error.code === 'unavailable' ||
        error.message.includes('offline') ||
        error.message.includes('backend')
      ) {
        this.showOfflineWarning()
      } else {
        this.showError(`Ошибка загрузки данных: ${error.message}`)
      }
    } finally {
      this.showLoading(false)

      if (this.filters) {
        this.filters.setLoading(false)
      }
    }
  }
  // ДЛЯ ПОКАЗА OFFLINE ПРЕДУПРЕЖДЕНИЯ
  showOfflineWarning() {
    const warningHTML = `
    <div class="offline-warning-banner">
      <h3>Защищенный режим</h3>
      <p><strong>База данных временно недоступна</strong> из-за мер защиты от спама и автоматических атак.</p>
      
      <div class="offline-details">
        <p><strong>Что происходит:</strong></p>
        <ul>
          <li>Firestore автоматически ограничивает доступ при подозрительной активности</li>
          <li>Это нормальная защитная мера Google для предотвращения злоупотреблений</li>
          <li>Ваши данные в безопасности</li>
        </ul>
        
        <p><strong>Что делать:</strong></p>
        <ul>
          <li>Подождите немного и попробуйте снова</li>
          <li>Проверьте стабильность интернет-соединения</li>
          <li>Вы все еще можете создавать новые интервью локально</li>
        </ul>
      </div>
      
      <button onclick="location.reload()" class="retry-btn">
        Попробовать снова
      </button>
    </div>
  `

    // В КОНТЕЙНЕРЕ ДЛЯ ИНТЕРВЬЮ
    this.interviewsContainer.innerHTML = warningHTML
  }

  renderInterviews() {
    this.interviewsContainer.innerHTML = ''

    this.interviews.forEach((interview, index) => {
      const card = this.createInterviewCard(interview, index)
      this.interviewsContainer.appendChild(card)
    })
  }

  createInterviewCard(interview, index) {
    const card = document.createElement('div')
    card.className = 'interview-card'

    // форматирование даты
    const date = this.formatDate(interview.timestamp)
    const answeredQuestions = this.countAnsweredQuestions(interview)

    card.innerHTML = `
    <div class="interview-header">
      <div class="interview-company">${this.escapeHtml(
        interview.company || 'Без названия',
      )}</div>
      <div class="interview-position">${this.escapeHtml(
        interview.position || 'Без должности',
      )}</div>
    </div>
    
    <div class="interview-meta">
      <div class="interview-salary">
        ${
          interview.salary
            ? this.formatSalary(interview.salary)
            : 'Зарплата не указана'
        }
      </div>
      <div class="interview-date">${date}</div>
    </div>
    
    <div class="interview-stats">
      Отвечено вопросов: <strong>${answeredQuestions}</strong>
    </div>
  
    <div class="interview-content">
      ${this.renderAnswers(interview.answers)}
    </div>
  `

    return card
  }

  renderAnswers(answers) {
    if (!answers || typeof answers !== 'object') {
      return '<p>Нет данных об ответах</p>'
    }

    let html = ''

    Object.entries(answers).forEach(([sectionTitle, subsections]) => {
      html += `<div class="section-title">${this.escapeHtml(
        sectionTitle,
      )}</div>`

      if (subsections && typeof subsections === 'object') {
        Object.entries(subsections).forEach(([subsectionTitle, questions]) => {
          // есть ли отмеченные вопросы в этой подсекции
          const hasCheckedQuestions = Object.values(questions || {}).some(
            (q) => q && q.checked,
          )

          if (hasCheckedQuestions) {
            html += `<div class="subsection-title">${this.escapeHtml(
              subsectionTitle,
            )}</div>`

            Object.entries(questions || {}).forEach(
              ([questionText, questionData]) => {
                if (questionData && questionData.checked) {
                  html += `
                <div class="question-item">
                  <div class="question-text question-checked">
                    ${this.escapeHtml(questionText)}
                  </div>
                  ${
                    questionData.note
                      ? `<div class="question-note">${this.escapeHtml(
                          questionData.note,
                        )}</div>`
                      : ''
                  }
                </div>
              `
                }
              },
            )
          }
        })
      }
    })

    return html || '<p>Нет отмеченных вопросов</p>'
  }

  countAnsweredQuestions(interview) {
    let count = 0
    if (!interview.answers) return 0

    Object.values(interview.answers).forEach((subsections) => {
      if (subsections && typeof subsections === 'object') {
        Object.values(subsections).forEach((questions) => {
          if (questions && typeof questions === 'object') {
            Object.values(questions).forEach((questionData) => {
              if (questionData && questionData.checked) {
                count++
              }
            })
          }
        })
      }
    })

    return count
  }

  formatDate(timestamp) {
    if (!timestamp) return 'Дата неизвестна'

    try {
      let date

      // разные форматы даты
      if (timestamp.seconds) {
        // Firebase Timestamp
        date = new Date(timestamp.seconds * 1000)
      } else if (typeof timestamp === 'string') {
        // ISO строка
        date = new Date(timestamp)
      } else {
        // обычный timestamp
        date = new Date(timestamp)
      }

      if (isNaN(date.getTime())) {
        return 'Некорректная дата'
      }

      return date.toLocaleString('ru-RU', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    } catch (error) {
      console.error('Ошибка форматирования даты:', error)
      return 'Ошибка даты'
    }
  }

  formatSalary(salary) {
    if (!salary) return 'Не указана'

    // разделители тысяч
    const formatted = salary.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
    return `${formatted} ₽`
  }

  escapeHtml(text) {
    if (!text) return ''
    const div = document.createElement('div')
    div.textContent = text
    return div.innerHTML
  }

  showLoading(show) {
    this.loadBtn.disabled = show
    this.loadBtn.textContent = show ? 'Загружаем...' : 'Загрузить интервью'

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
}
