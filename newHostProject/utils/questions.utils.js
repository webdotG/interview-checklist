import { questionsData } from './questions.data.js'

export class QuestionsUtils {
  constructor() {
    this.questionsData = questionsData
  }

  /**
   * Генерирует короткий уникальный ID для вопроса (для URL).
   */
  generateQuestionId(sectionTitle, subsectionTitle, questionText) {
    // Создаем уникальную строку из всех компонентов
    const fullString = `${sectionTitle}|${subsectionTitle}|${questionText}`

    // Генерируем короткий хеш
    const hash = this.simpleHash(fullString)

    // Возвращаем просто "q" + хеш (максимум 8 символов)
    return `q${hash}`
  }

  /**
   * Простая хеш-функция для создания коротких уникальных ID
   */
  simpleHash(str) {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = (hash << 5) - hash + char
      hash = hash & hash // Convert to 32-bit integer
    }
    // Возвращаем короткий хеш (6 символов максимум)
    return Math.abs(hash).toString(36).substring(0, 6)
  }

  /**
   * Итерирует по всем вопросам, вызывая колбэк для каждого.
   */
  forEachQuestion(callback) {
    let questionIndex = 0

    Object.entries(this.questionsData).forEach(([sectionTitle, section]) => {
      Object.entries(section).forEach(([subsectionTitle, questions]) => {
        if (Array.isArray(questions)) {
          questions.forEach((question, idx) => {
            const questionId = this.generateQuestionId(
              sectionTitle,
              subsectionTitle,
              question
            )

            callback(sectionTitle, subsectionTitle, question, questionId)
            questionIndex++
          })
        } else {
          console.warn(
            `Ожидался массив вопросов для "${sectionTitle}" -> "${subsectionTitle}", получен:`,
            questions
          )
        }
      })
    })
  }

  /**
   * Функция для проверки уникальности ID
   */
  checkIdUniqueness() {
    const ids = new Set()
    const duplicates = []

    this.forEachQuestion(
      (sectionTitle, subsectionTitle, question, questionId) => {
        if (ids.has(questionId)) {
          duplicates.push({
            id: questionId,
            section: sectionTitle,
            subsection: subsectionTitle,
            question: question,
          })
        } else {
          ids.add(questionId)
        }
      }
    )

    if (duplicates.length > 0) {
      console.error('Найдены дублирующиеся ID:', duplicates)
      return false
    } else {
      console.log('✅ Все ID уникальны')
      return true
    }
  }

  /**
   * Подсчитывает общее количество вопросов используя forEachQuestion
   */
  countQuestions() {
    let totalCount = 0
    this.forEachQuestion(() => {
      totalCount++
    })
    return totalCount
  }

  /**
   * Подсчитывает отвеченные вопросы из структуры данных
   */
  countAnsweredQuestions(interview) {
    let count = 0
    if (!interview?.answers) return 0

    // Проходим по структуре ответов
    Object.values(interview.answers).forEach((subsections) => {
      if (subsections && typeof subsections === 'object') {
        Object.values(subsections).forEach((questions) => {
          if (questions && typeof questions === 'object') {
            Object.values(questions).forEach((questionData) => {
              if (questionData?.checked === true) {
                count++
              }
            })
          }
        })
      }
    })
    return count
  }

  /**
   * Подсчитывает отвеченные вопросы из DOM
   */
  countAnsweredQuestionsFromDOM() {
    let count = 0
    this.forEachQuestion(
      (sectionTitle, subsectionTitle, question, questionId) => {
        const checkbox = document.getElementById(`check-${questionId}`)
        if (checkbox && checkbox.checked) {
          count++
        }
      }
    )
    return count
  }

  /**
   * Правильное окончание для слова "вопрос"
   */
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
  }

  /**
   * Получает текст с количеством вопросов
   */
  getQuestionsCountText() {
    const count = this.countQuestions()
    const word = this.getQuestionWord(count)
    return `В списке ${count} ${word}`
  }

  /**
   * Добавляет счетчик в заголовок
   */
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

    const title = headerNav?.querySelector('h1')
    if (title) {
      title.insertAdjacentElement('afterend', counter)
    }
  }

  /**
   * Детальная статистика по категориям используя forEachQuestion
   */
  getDetailedStats() {
    const stats = {}
    let total = 0

    this.forEachQuestion((sectionTitle, subsectionTitle) => {
      // Инициализируем категорию если еще нет
      if (!stats[sectionTitle]) {
        stats[sectionTitle] = {
          total: 0,
          subcategories: {},
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

  /**
   * Получает общую статистику по вопросам (без учета отвеченных)
   */
  getTotalStats() {
    const stats = {}
    let total = 0

    this.forEachQuestion((sectionTitle, subsectionTitle) => {
      if (!stats[sectionTitle]) {
        stats[sectionTitle] = {
          total: 0,
          subcategories: {},
        }
      }

      if (!stats[sectionTitle].subcategories[subsectionTitle]) {
        stats[sectionTitle].subcategories[subsectionTitle] = 0
      }

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

// Создаем экземпляр утилит для использования как объект
const questionsUtilsInstance = new QuestionsUtils()

// Экспортируем объект questionStats для совместимости с существующим кодом
export const questionStats = {
  countAnsweredQuestions: (interview) =>
    questionsUtilsInstance.countAnsweredQuestions(interview),
  getQuestionWord: (count) => questionsUtilsInstance.getQuestionWord(count),
  countAnsweredQuestionsFromDOM: () =>
    questionsUtilsInstance.countAnsweredQuestionsFromDOM(),
  getTotalQuestions: () => questionsUtilsInstance.countQuestions(),
  getDetailedStats: () => questionsUtilsInstance.getDetailedStats(),
  addCounterToHeader: () => questionsUtilsInstance.addCounterToHeader(),
  getQuestionsCountText: () => questionsUtilsInstance.getQuestionsCountText(),
  checkIdUniqueness: () => questionsUtilsInstance.checkIdUniqueness(),
  forEachQuestion: (callback) =>
    questionsUtilsInstance.forEachQuestion(callback),
  generateQuestionId: (sectionTitle, subsectionTitle, questionText) =>
    questionsUtilsInstance.generateQuestionId(
      sectionTitle,
      subsectionTitle,
      questionText
    ),
  getTotalStats: () => questionsUtilsInstance.getTotalStats(),
}