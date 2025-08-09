import { warningItems } from '../utils/questions.data.js'
import { QuestionsUtils } from '../utils/questions.utils.js'

export class QuestionsRenderer {
  constructor() {
    this.questionsUtils = new QuestionsUtils()
    this.questionsStructure = this.buildQuestionsStructure()
  }

  /**
   * Строит структуру вопросов
   */
  buildQuestionsStructure() {
    return Object.entries(this.questionsUtils.questionsData).map(
      ([sectionTitle, subsections]) => ({
        title: sectionTitle,
        subsections: Object.entries(subsections).map(
          ([subsectionTitle, questions]) => ({
            title: subsectionTitle,
            questions: questions,
          })
        ),
      })
    )
  }

  /**
   * Рендерит все вопросы в DOM
   */
  async renderQuestions() {
    const container = document.getElementById('questions-container')
    if (!container) {
      throw new Error('Контейнер questions-container не найден')
    }

    // Очищаем контейнер
    container.innerHTML = ''

    // Рендерим секции вопросов
    this.questionsStructure.forEach((section) => {
      const sectionEl = this.createSectionElement(section)
      container.appendChild(sectionEl)
    })

    // Добавляем секцию предупреждений
    const warningsSection = this.createWarningsSection()
    container.appendChild(warningsSection)

    return new Promise((resolve) => {
      // для гарантии завершения рендеринга
      requestAnimationFrame(resolve)
    })
  }

  /**
   * Создает элемент секции
   */
  createSectionElement(section) {
    const sectionEl = document.createElement('div')
    sectionEl.innerHTML = `<h2>${section.title}</h2>`

    section.subsections.forEach((subsection) => {
      const subsectionEl = this.createSubsectionElement(section, subsection)
      sectionEl.appendChild(subsectionEl)
    })

    return sectionEl
  }

  /**
   * Создает элемент подсекции
   */
  createSubsectionElement(section, subsection) {
    const subsectionEl = document.createElement('div')
    subsectionEl.innerHTML = `<h3>${subsection.title}</h3>`

    subsection.questions.forEach((question) => {
      const questionEl = this.createQuestionElement(
        section,
        subsection,
        question
      )
      subsectionEl.appendChild(questionEl)
    })

    return subsectionEl
  }

  /**
   * Создает элемент вопроса
   */
  createQuestionElement(section, subsection, question) {
    const questionId = this.questionsUtils.generateQuestionId(
      section.title,
      subsection.title,
      question
    )

    const questionEl = document.createElement('div')
    questionEl.className = 'question'
    questionEl.innerHTML = `
      <label>
        <input type="checkbox" id="check-${questionId}">
        ${question}
      </label>
      <input type="text" id="input-${questionId}" placeholder="Комментарий ... ">
    `

    return questionEl
  }

  /**
   * Создает секцию предупреждений
   */
  createWarningsSection() {
    const warningsSection = document.createElement('div')
    warningsSection.innerHTML = '<h2>Насторожиться, если:</h2>'
    warningsSection.classList.add('warnings-section')

    const warningsList = document.createElement('ul')
    warningsList.classList.add('warnings-list')

    warningItems.forEach((warning) => {
      const item = document.createElement('li')
      item.textContent = warning
      warningsList.appendChild(item)
    })

    warningsSection.appendChild(warningsList)
    return warningsSection
  }

  /**
   * Получает утилиты для работы с вопросами
   */
  getQuestionsUtils() {
    return this.questionsUtils
  }
}
