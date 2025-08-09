import { questionsData } from './questions.data.js'

/**
 * Генерирует уникальный ID для вопроса на основе его иерархии.
 */
export const generateQuestionId = (sectionTitle, subsectionTitle, questionText) => {
  const normalize = (str) =>
    str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
  return `q-${normalize(sectionTitle)}-${normalize(subsectionTitle)}-${normalize(questionText)}`
}

/**
 * Итерирует по всем вопросам, вызывая колбэк для каждого.
 */
export const forEachQuestion = (callback) => {
  Object.entries(questionsData).forEach(([sectionTitle, section]) => {
    Object.entries(section).forEach(([subsectionTitle, questions]) => {
      if (Array.isArray(questions)) {
        questions.forEach((question) => {
          const questionId = generateQuestionId(sectionTitle, subsectionTitle, question)
          callback(sectionTitle, subsectionTitle, question, questionId)
        })
      }
    })
  })
}

/**
 * Утилиты для работы со статистикой вопросов
 */
export const questionStats = {
  // Подсчитывает общее количество вопросов используя forEachQuestion
  countQuestions() {
    let totalCount = 0
    forEachQuestion(() => {
      totalCount++
    })
    return totalCount
  },

  // Подсчитывает отвеченные вопросы
  countAnsweredQuestions(interview) {
    let count = 0
    if (!interview?.answers) return 0

    Object.values(interview.answers).forEach((subsections) => {
      if (subsections && typeof subsections === 'object') {
        Object.values(subsections).forEach((questions) => {
          if (questions && typeof questions === 'object') {
            Object.values(questions).forEach((questionData) => {
              if (questionData?.checked) {
                count++
              }
            })
          }
        })
      }
    })
    return count
  },

  // Правильное окончание для слова "вопрос"
  getQuestionWord(count) {
    const lastDigit = count % 10
    const lastTwoDigits = count % 100

    if (lastTwoDigits >= 11 && lastTwoDigits <= 14) {
      return 'вопросов'
    }

    if (lastDigit === 1) {
      return 'вопрос'
    } else if (lastDigit >= 2 && lastDigit <= 4) {
      return 'вопроса'
    } else {
      return 'вопросов'
    }
  },

  // Получает текст с количеством вопросов
  getQuestionsCountText() {
    const count = this.countQuestions()
    const word = this.getQuestionWord(count)
    return `В списке ${count} ${word}`
  },

  // Добавляет счетчик в заголовок
  addCounterToHeader() {
    const headerNav = document.querySelector('.header-nav')
    const existingCounter = document.querySelector('.questions-counter')
    
    if (existingCounter) {
      existingCounter.remove()
    }

    const counter = document.createElement('div')
    counter.className = 'questions-counter'
    counter.textContent = this.getQuestionsCountText()
    
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

  // Детальная статистика по категориям используя forEachQuestion
  getDetailedStats() {
    const stats = {}
    let total = 0

    forEachQuestion((sectionTitle, subsectionTitle) => {
      // Инициализируем категорию если еще нет
      if (!stats[sectionTitle]) {
        stats[sectionTitle] = {
          total: 0,
          subcategories: {}
        }
      }

      // Инициализируем подкатегорию если еще нет
      if (!stats[sectionTitle].subcategories[subsectionTitle]) {
        stats[sectionTitle].subcategories[subsectionTitle] = 0
      }

      // Увеличиваем счетчики
      stats[sectionTitle].subcategories[subsectionTitle]++
      stats[sectionTitle].total++
      total++
    })

    return {
      total: total,
      categories: stats,
    }
  }
}