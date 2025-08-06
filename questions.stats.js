export const questionUtils = {
  // подсчитывает общее количество вопросов
  countQuestions(questionsData) {
    let totalCount = 0

    // проходим по всем категориям
    Object.values(questionsData).forEach((category) => {
      // проходим по всем подкатегориям в категории
      Object.values(category).forEach((subcategory) => {
        if (Array.isArray(subcategory)) {
          totalCount += subcategory.length
        }
      })
    })

    return totalCount
  },

  // правильное окончание для слова "вопрос"
  getQuestionWord(count) {
    const lastDigit = count % 10
    const lastTwoDigits = count % 100

    // исключения для 11-14
    if (lastTwoDigits >= 11 && lastTwoDigits <= 14) {
      return 'вопросов'
    }

    // правила для последней цифры
    if (lastDigit === 1) {
      return 'вопрос'
    } else if (lastDigit >= 2 && lastDigit <= 4) {
      return 'вопроса'
    } else {
      return 'вопросов'
    }
  },

  getQuestionsCountText(questionsData) {
    const count = this.countQuestions(questionsData)
    const word = this.getQuestionWord(count)
    return `В списке ${count} ${word}`
  },

  addCounterToHeader(questionsData) {
    const headerNav = document.querySelector('.header-nav')
    const existingCounter = document.querySelector('.questions-counter')

    if (existingCounter) {
      existingCounter.remove()
    }

    const counter = document.createElement('div')
    counter.className = 'questions-counter'
    counter.textContent = this.getQuestionsCountText(questionsData)

    // стили для счетчика
    counter.style.cssText = `
      color: rgba(255, 255, 255, 0.8);
      font-size: 0.9rem;
      font-weight: 400;
      text-align: center;
      margin-top: 0.5rem;
      letter-spacing: 0.5px;
    `
    const title = headerNav.querySelector('h1')
    if (title) {
      title.insertAdjacentElement('afterend', counter)
    }
  },

  // детальная статистика по категориям
  getDetailedStats(questionsData) {
    const stats = {}
    let total = 0

    Object.entries(questionsData).forEach(([categoryName, category]) => {
      let categoryCount = 0
      const subcategories = {}

      Object.entries(category).forEach(([subcategoryName, questions]) => {
        if (Array.isArray(questions)) {
          const count = questions.length
          subcategories[subcategoryName] = count
          categoryCount += count
        }
      })

      stats[categoryName] = {
        total: categoryCount,
        subcategories: subcategories,
      }
      total += categoryCount
    })

    return {
      total: total,
      categories: stats,
    }
  },
}
