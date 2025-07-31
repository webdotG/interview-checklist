import { questionsData, warningItems } from './questionsData.js'

export const questionsStructure = Object.entries(questionsData).map(
  ([sectionTitle, subsections]) => ({
    title: sectionTitle,
    subsections: Object.entries(subsections).map(
      ([subsectionTitle, questions]) => ({
        title: subsectionTitle,
        questions: questions,
      }),
    ),
  }),
)

export function generateQuestionId(section, subsection, question) {
  return `${section.substring(0, 3)}_${subsection.substring(0, 3)}_${question
    .substring(0, 15)
    .replace(/\s+/g, '_')}`
}

export function renderQuestions() {
  const container = document.getElementById('questions-container')

  questionsStructure.forEach((section) => {
    const sectionEl = document.createElement('div')
    sectionEl.innerHTML = `<h2>${section.title}</h2>`

    section.subsections.forEach((subsection) => {
      const subsectionEl = document.createElement('div')
      subsectionEl.innerHTML = `<h3>${subsection.title}</h3>`

      subsection.questions.forEach((question) => {
        const questionId = generateQuestionId(
          section.title,
          subsection.title,
          question,
        )
        const questionEl = document.createElement('div')
        questionEl.className = 'question'
        questionEl.innerHTML = `
          <label>
            <input type="checkbox" id="check-${questionId}">
            ${question}
          </label>
          <input type="text" id="input-${questionId}" placeholder="Ответ подробнее">
        `

        subsectionEl.appendChild(questionEl)
      })

      sectionEl.appendChild(subsectionEl)
    })

    container.appendChild(sectionEl)
  })

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
  container.appendChild(warningsSection)

  return new Promise((resolve) => {
    // для гарантии завершения рендеринга
    requestAnimationFrame(resolve)
  })
}
