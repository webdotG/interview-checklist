import { db } from '../services/db.service.js'
import {
  questionsStructure,
  generateQuestionId,
} from '../ui/questions.renderer.js'

export class InterviewManager {
  constructor() {
    this.initElements()
  }

  initElements() {
    this.companyInput = document.getElementById('company')
    this.positionInput = document.getElementById('position')
    this.salaryInput = document.getElementById('salary')
    this.submitBtn = document.getElementById('submit-btn')
    this.successMessage = document.getElementById('success-message')
    this.questionsContainer = document.getElementById('questions-container')
  }

  async init() {
    await this.setupEventListeners()
  }

  loadFromURL() {
    const params = new URLSearchParams(window.location.search)

    this.companyInput.value = params.get('company') || ''
    this.positionInput.value = params.get('position') || ''
    this.salaryInput.value = params.get('salary') || ''

    questionsStructure.forEach((section) => {
      section.subsections.forEach((subsection) => {
        subsection.questions.forEach((question) => {
          const questionId = generateQuestionId(
            section.title,
            subsection.title,
            question,
          )
          const checked = params.get(`check-${questionId}`) === 'true'
          const inputValue = params.get(`input-${questionId}`) || ''

          const checkbox = document.getElementById(`check-${questionId}`)
          const input = document.getElementById(`input-${questionId}`)

          if (checkbox && input) {
            checkbox.checked = checked
            input.value = inputValue
          }
        })
      })
    })
  }

  saveToURL() {
    const params = new URLSearchParams()

    params.set('company', this.companyInput.value)
    params.set('position', this.positionInput.value)
    params.set('salary', this.salaryInput.value)

    questionsStructure.forEach((section) => {
      section.subsections.forEach((subsection) => {
        subsection.questions.forEach((question) => {
          const questionId = generateQuestionId(
            section.title,
            subsection.title,
            question,
          )
          const checkbox = document.getElementById(`check-${questionId}`)
          const input = document.getElementById(`input-${questionId}`)

          if (checkbox && input) {
            params.set(`check-${questionId}`, checkbox.checked)
            params.set(`input-${questionId}`, input.value)
          }
        })
      })
    })

    window.history.replaceState({}, '', `?${params.toString()}`)
  }

  clearData() {
    window.history.replaceState({}, '', window.location.pathname)

    this.companyInput.value = ''
    this.positionInput.value = ''
    this.salaryInput.value = ''

    questionsStructure.forEach((section) => {
      section.subsections.forEach((subsection) => {
        subsection.questions.forEach((question) => {
          const questionId = generateQuestionId(
            section.title,
            subsection.title,
            question,
          )
          const checkbox = document.getElementById(`check-${questionId}`)
          const input = document.getElementById(`input-${questionId}`)

          if (checkbox && input) {
            checkbox.checked = false
            input.value = ''
          }
        })
      })
    })
  }

  async setupEventListeners() {
    this.companyInput.addEventListener('input', () => this.saveToURL())
    this.positionInput.addEventListener('input', () => this.saveToURL())
    this.salaryInput.addEventListener('input', () => this.saveToURL())

    questionsStructure.forEach((section) => {
      section.subsections.forEach((subsection) => {
        subsection.questions.forEach((question) => {
          const questionId = generateQuestionId(
            section.title,
            subsection.title,
            question,
          )
          const checkbox = document.getElementById(`check-${questionId}`)
          const input = document.getElementById(`input-${questionId}`)

          if (checkbox && input) {
            checkbox.addEventListener('change', () => this.saveToURL())
            input.addEventListener('input', () => this.saveToURL())
          }
        })
      })
    })
  }

  async saveToDatabase() {
    const company = this.companyInput.value
    const position = this.positionInput.value
    const salary = this.salaryInput.value

    const answers = {}

    questionsStructure.forEach((section) => {
      answers[section.title] = {}

      section.subsections.forEach((subsection) => {
        answers[section.title][subsection.title] = {}

        subsection.questions.forEach((question) => {
          const questionId = generateQuestionId(
            section.title,
            subsection.title,
            question,
          )
          const checkbox = document.getElementById(`check-${questionId}`)
          const input = document.getElementById(`input-${questionId}`)

          if (checkbox && input) {
            answers[section.title][subsection.title][question] = {
              checked: checkbox.checked,
              note: input.value || null,
            }
          }
        })
      })
    })

    try {
      const success = await db.saveInterview(company, position, salary, answers)

      if (success) {
        this.successMessage.classList.remove('hidden')
        setTimeout(() => this.successMessage.classList.add('hidden'), 3000)
        this.clearData()
      }
    } catch (error) {
      console.error('Ошибка при сохранении:', error)
    }
  }
}
