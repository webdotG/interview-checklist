import { questionStats } from '../utils/questions.utils.js'

export class InterviewFilters {
  constructor(containerSelector = '#filters-container') {
    this.container = document.querySelector(containerSelector)
    this.originalData = []
    this.filteredData = []
    this.onFilterChange = null
    this.totalQuestions = questionStats.countQuestions()

    this.initElements()
    this.bindEvents()
  }

  initElements() {
    if (!this.container) {
      console.error('Контейнер для фильтров не найден')
      return
    }

    // HTML структура фильтров
    this.container.innerHTML = this.createFiltersHTML()

    // ссылки на элементы
    this.salaryFilter = this.container.querySelector('#salary-filter')
    this.questionsFilter = this.container.querySelector('#questions-filter')
    this.clearFiltersBtn = this.container.querySelector('#clear-filters-btn')
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
          <label class="filter-label" for="questions-filter">По кол-ву ответов:</label>
          <select id="questions-filter" class="filter-select">
            <option value="">Без сортировки</option>
            <option value="questions-desc">От большего к меньшему</option>
            <option value="questions-asc">От меньшего к большему</option>
          </select>
        </div>
      </div>

      <div class="filters-actions">
        <button id="clear-filters-btn" class="clear-filters-btn">
          Сбросить
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
  }

  setData(interviews) {
    this.originalData = [...interviews]
    this.filteredData = [...interviews]
    this.updateResultCounter()
    return this
  }

  onChange(callback) {
    this.onFilterChange = callback
    return this
  }

  applyFilters() {
    let result = [...this.originalData]

    // сортировка по зарплате
    const salarySort = this.salaryFilter.value
    if (salarySort) {
      result = this.sortBySalary(result, salarySort.split('-')[1])
    }

    // сортировка по вопросам
    const questionsSort = this.questionsFilter.value
    if (questionsSort) {
      result = this.sortByQuestions(result, questionsSort.split('-')[1])
    }

    this.filteredData = result
    this.updateResultCounter()
    this.notifyChange()
  }

  clearFilters() {
    this.salaryFilter.value = ''
    this.questionsFilter.value = ''
    this.filteredData = [...this.originalData]
    this.updateResultCounter()
    this.notifyChange()
  }

  getFilteredData() {
    return this.filteredData
  }

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

  sortBySalary(interviews, order = 'desc') {
    return [...interviews].sort((a, b) => {
      const salaryA = this.parseSalary(a.salary)
      const salaryB = this.parseSalary(b.salary)

      return order === 'desc' ? salaryB - salaryA : salaryA - salaryB
    })
  }

  sortByQuestions(interviews, order = 'desc') {
    return [...interviews].sort((a, b) => {
      const questionsA = questionStats.countAnsweredQuestions(a)
      const questionsB = questionStats.countAnsweredQuestions(b)

      return order === 'desc'
        ? questionsB - questionsA
        : questionsA - questionsB
    })
  }

  parseSalary(salary) {
    if (!salary && salary !== 0) return 0

    const cleaned = salary.toString().replace(/[^\d.,]/g, '')
    const parsed = parseFloat(cleaned.replace(',', '.'))

    return isNaN(parsed) ? 0 : parsed
  }

  updateResultCounter() {
    if (this.resultCounter) {
      const count = this.filteredData.length
      this.resultCounter.textContent = `Найдено: ${count}`

      this.resultCounter.classList.add('updating')
      setTimeout(() => {
        this.resultCounter.classList.remove('updating')
      }, 500)
    }
  }

  notifyChange() {
    if (this.onFilterChange) {
      this.onFilterChange({
        data: this.filteredData,
        stats: this.getFilterStats(),
      })
    }
  }

  setLoading(loading = true) {
    this.container.classList.toggle('loading', loading)
  }

  getState() {
    return {
      salary: this.salaryFilter.value,
      questions: this.questionsFilter.value,
    }
  }

  setState(state) {
    if (state.salary !== undefined) {
      this.salaryFilter.value = state.salary
    }

    if (state.questions !== undefined) {
      this.questionsFilter.value = state.questions
    }

    this.applyFilters()
  }

  destroy() {
    this.salaryFilter?.removeEventListener('change', this.applyFilters)
    this.questionsFilter?.removeEventListener('change', this.applyFilters)
    this.clearFiltersBtn?.removeEventListener('click', this.clearFilters)
  }
}
