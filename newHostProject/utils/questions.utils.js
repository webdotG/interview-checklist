import { questionsData } from './questions.data.js'

/**
 * Генерирует уникальный ID для вопроса на основе его иерархии.
 * @param {string} sectionTitle Заголовок секции.
 * @param {string} subsectionTitle Заголовок подсекции.
 * @param {string} questionText Текст вопроса.
 * @returns {string} Уникальный ID.
 */
export const generateQuestionId = (sectionTitle, subsectionTitle, questionText) => {
  const normalize = (str) =>
    str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

  return `q-${normalize(sectionTitle)}-${normalize(subsectionTitle)}-${normalize(
    questionText
  )}`
}

/**
 * Итерирует по всем вопросам, вызывая колбэк для каждого.
 * @param {function(string, string, string, string): void} callback Функция, которая будет вызвана для каждого вопроса.
 */
export const forEachQuestion = (callback) => {
  Object.entries(questionsData).forEach(([sectionTitle, section]) => {
    Object.entries(section).forEach(([subsectionTitle, questions]) => {
      questions.forEach((question) => {
        const questionId = generateQuestionId(sectionTitle, subsectionTitle, question)
        callback(sectionTitle, subsectionTitle, question, questionId)
      })
    })
  })
}