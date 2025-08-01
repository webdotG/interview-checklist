// InterviewFilters.js - Класс для фильтрации и сортировки интервью

export class InterviewFilters {
  constructor(containerSelector = '#filters-container') {
    this.container = document.querySelector(containerSelector)
    this.originalData = []
    this.filteredData = []
    this.onFilterChange = null
    this.isVisible = true

    this.initElements()
    this.bindEvents()
  }

  initElements() {
    if (!this.container) {
      console.error('Контейнер для фильтров не найден')
      return
    }

    // создаем HTML структуру фильтров
    this.container.innerHTML = this.createFiltersHTML()

    // получаем ссылки на элементы
    this.salaryFilter = this.container.querySelector('#salary-filter')
    this.questionsFilter = this.container.querySelector('#questions-filter')
    this.clearFiltersBtn = this.container.querySelector('#clear-filters-btn')
    this.toggleFiltersBtn = this.container.querySelector('#toggle-filters-btn')
    this.filtersWrapper = this.container.querySelector('.filters-wrapper')
    this.resultCounter = this.container.querySelector('#results-counter')
  }

  createFiltersHTML() {
    return `
      <div class="filters-wrapper">
        <div class="filter-group">
          <label class="filter-label" for="salary-filter">Сортировка по зарплате:</label>
          <select id="salary-filter" class="filter-select">
            <option value="">Без сортировки</option>
            <option value="salary-desc">От большей к меньшей</option>
            <option value="salary-asc">От меньшей к большей</option>
          </select>
        </div>

        <div class="filter-group">
          <label class="filter-label" for="questions-filter">Сортировка по вопросам:</label>
          <select id="questions-filter" class="filter-select">
            <option value="">Без сортировки</option>
            <option value="questions-desc">От большего к меньшему</option>
            <option value="questions-asc">От меньшего к большему</option>
          </select>
        </div>
      </div>

      <div class="filters-actions">
        <button id="clear-filters-btn" class="clear-filters-btn">
          🗑️ Сбросить
        </button>
        <button id="toggle-filters-btn" class="toggle-filters-btn">
          👁️ Скрыть
        </button>
        <div id="results-counter" class="results-counter">
          Найдено: 0
        </div>
      </div>
    `
  }

  bindEvents() {
    if (!this.salaryFilter || !this.questionsFilter) return

    this.salaryFilter.addEventListener('change', () => this.applyFilters())
    this.questionsFilter.addEventListener('change', () => this.applyFilters())
    this.clearFiltersBtn.addEventListener('click', () => this.clearFilters())
    this.toggleFiltersBtn.addEventListener('click', () =>
      this.toggleVisibility(),
    )
  }

  // Основной метод для установки данных
  setData(interviews) {
    this.originalData = [...interviews]
    this.filteredData = [...interviews]
    this.updateResultCounter()
    return this
  }

  // Установка колбэка для уведомления об изменениях
  onChange(callback) {
    this.onFilterChange = callback
    return this
  }

  // Применение фильтров
  applyFilters() {
    let result = [...this.originalData]

    // Применяем сортировку по зарплате
    const salarySort = this.salaryFilter.value
    if (salarySort) {
      result = this.sortBySalary(result, salarySort.split('-')[1])
    }

    // Применяем сортировку по вопросам
    const questionsSort = this.questionsFilter.value
    if (questionsSort) {
      result = this.sortByQuestions(result, questionsSort.split('-')[1])
    }

    this.filteredData = result
    this.updateResultCounter()
    this.notifyChange()
  }

  // Сброс всех фильтров
  clearFilters() {
    this.salaryFilter.value = ''
    this.questionsFilter.value = ''
    this.filteredData = [...this.originalData]
    this.updateResultCounter()
    this.notifyChange()
  }

  // Переключение видимости фильтров
  toggleVisibility() {
    this.isVisible = !this.isVisible

    if (this.isVisible) {
      this.filtersWrapper.style.display = 'flex'
      this.toggleFiltersBtn.textContent = '👁️ Скрыть'
    } else {
      this.filtersWrapper.style.display = 'none'
      this.toggleFiltersBtn.textContent = '👁️ Показать'
    }
  }

  // Получение текущих отфильтрованных данных
  getFilteredData() {
    return this.filteredData
  }

  // Получение статистики фильтров
  getFilterStats() {
    const salaryActive = this.salaryFilter.value !== ''
    const questionsActive = this.questionsFilter.value !== ''

    return {
      totalOriginal: this.originalData.length,
      totalFiltered: this.filteredData.length,
      filtersActive: salaryActive || questionsActive,
      activeFilters: {
        salary: salaryActive
          ? this.salaryFilter.options[this.salaryFilter.selectedIndex].text
          : null,
        questions: questionsActive
          ? this.questionsFilter.options[this.questionsFilter.selectedIndex]
              .text
          : null,
      },
    }
  }

  // Утилита: подсчет отвеченных вопросов
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

  // Утилита: сортировка по зарплате
  sortBySalary(interviews, order = 'desc') {
    return [...interviews].sort((a, b) => {
      const salaryA = this.parseSalary(a.salary)
      const salaryB = this.parseSalary(b.salary)

      if (order === 'desc') {
        return salaryB - salaryA
      } else {
        return salaryA - salaryB
      }
    })
  }

  // Утилита: сортировка по количеству вопросов
  sortByQuestions(interviews, order = 'desc') {
    return [...interviews].sort((a, b) => {
      const questionsA = this.countAnsweredQuestions(a)
      const questionsB = this.countAnsweredQuestions(b)

      if (order === 'desc') {
        return questionsB - questionsA
      } else {
        return questionsA - questionsB
      }
    })
  }

  // Утилита: парсинг зарплаты из строки
  parseSalary(salary) {
    if (!salary) return 0

    // Убираем все нецифровые символы кроме точки и запятой
    const cleaned = salary.toString().replace(/[^\d.,]/g, '')

    // Конвертируем в число
    const parsed = parseFloat(cleaned.replace(',', '.'))

    return isNaN(parsed) ? 0 : parsed
  }

  // Обновление счетчика результатов
  updateResultCounter() {
    if (this.resultCounter) {
      const count = this.filteredData.length
      this.resultCounter.textContent = `Найдено: ${count}`

      // Добавляем анимацию обновления
      this.resultCounter.classList.add('updating')
      setTimeout(() => {
        this.resultCounter.classList.remove('updating')
      }, 500)
    }
  }

  // Уведомление об изменениях
  notifyChange() {
    if (this.onFilterChange && typeof this.onFilterChange === 'function') {
      this.onFilterChange({
        data: this.filteredData,
        stats: this.getFilterStats(),
      })
    }
  }

  // Метод для показа/скрытия контейнера фильтров
  show() {
    this.container.classList.remove('hidden')
  }

  hide() {
    this.container.classList.add('hidden')
  }

  // Установка состояния загрузки
  setLoading(loading = true) {
    if (loading) {
      this.container.classList.add('loading')
    } else {
      this.container.classList.remove('loading')
    }
  }

  // Получение текущего состояния фильтров (для сохранения в localStorage)
  getState() {
    return {
      salary: this.salaryFilter.value,
      questions: this.questionsFilter.value,
      isVisible: this.isVisible,
    }
  }

  // Восстановление состояния фильтров
  setState(state) {
    if (state.salary !== undefined) {
      this.salaryFilter.value = state.salary
    }

    if (state.questions !== undefined) {
      this.questionsFilter.value = state.questions
    }

    if (state.isVisible !== undefined) {
      this.isVisible = state.isVisible
      if (!this.isVisible) {
        this.toggleVisibility()
      }
    }

    // Применяем фильтры с восстановленным состоянием
    this.applyFilters()
  }

  // Деструктор для очистки обработчиков событий
  destroy() {
    if (this.salaryFilter) {
      this.salaryFilter.removeEventListener('change', this.applyFilters)
    }
    if (this.questionsFilter) {
      this.questionsFilter.removeEventListener('change', this.applyFilters)
    }
    if (this.clearFiltersBtn) {
      this.clearFiltersBtn.removeEventListener('click', this.clearFilters)
    }
    if (this.toggleFiltersBtn) {
      this.toggleFiltersBtn.removeEventListener('click', this.toggleVisibility)
    }
  }
}
