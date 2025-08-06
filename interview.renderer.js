import { InterviewFormatter } from './interviewFormatter.js'
import { questionUtils } from './questions.stats.js'

export class InterviewRenderer {
  constructor(totalQuestions) {
    this.totalQuestions = totalQuestions
  }

  createInterviewCard(interview, index) {
    const card = document.createElement('div')
    card.className = 'interview-card'

    const date = InterviewFormatter.formatDate(interview.timestamp)
    const answeredQuestions =
      InterviewFormatter.countAnsweredQuestions(interview)
    const totalQuestions = this.totalQuestions

    card.innerHTML = `
      <div class="interview-header">
        <div class="interview-company">${InterviewFormatter.escapeHtml(
          InterviewFormatter.formatCompanyName(interview.company),
        )}</div>
        <div class="interview-position">${InterviewFormatter.escapeHtml(
          InterviewFormatter.formatPosition(interview.position),
        )}</div>
      </div>
      
      <div class="interview-meta">
        <div class="interview-salary">
          ${InterviewFormatter.formatSalaryDisplay(interview.salary)}
        </div>
        <div class="interview-date">${date}</div>
      </div>
      
      <div class="interview-stats">
        Отвечено ${questionUtils.getQuestionWord(answeredQuestions)}: 
          <strong>
            ${answeredQuestions} из ${totalQuestions}
          </strong>
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
      html += `<div class="section-title">${InterviewFormatter.escapeHtml(
        sectionTitle,
      )}</div>`

      if (subsections && typeof subsections === 'object') {
        Object.entries(subsections).forEach(([subsectionTitle, questions]) => {
          // отмеченные вопросы в этой подсекции
          const hasCheckedQuestions = Object.values(questions || {}).some(
            (q) => q && q.checked,
          )

          if (hasCheckedQuestions) {
            html += `<div class="subsection-title">${InterviewFormatter.escapeHtml(
              subsectionTitle,
            )}</div>`

            Object.entries(questions || {}).forEach(
              ([questionText, questionData]) => {
                if (questionData && questionData.checked) {
                  html += this.renderQuestionItem(questionText, questionData)
                }
              },
            )
          }
        })
      }
    })

    return html || '<p>Нет отмеченных вопросов</p>'
  }

  renderQuestionItem(questionText, questionData) {
    return `
      <div class="question-item">
        <div class="question-text question-checked">
          ${InterviewFormatter.escapeHtml(questionText)}
        </div>
        ${
          questionData.note
            ? `<div class="question-note">${InterviewFormatter.escapeHtml(
                questionData.note,
              )}</div>`
            : ''
        }
      </div>
    `
  }

  renderInterviews(interviews, container) {
    container.innerHTML = ''

    interviews.forEach((interview, index) => {
      const card = this.createInterviewCard(interview, index)
      container.appendChild(card)
    })
  }
}
