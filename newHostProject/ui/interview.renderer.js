import { InterviewFormatter } from '../utils/interview.formatter.js'
import { questionUtils } from '../utils/questions.stats.js'

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

    // наличие имени и ссылки на GitHub
    const userHtml = interview.githubUsername
      ? `<a href="${
          interview.githubProfileUrl
        }" target="_blank" rel="noopener noreferrer" class="github-link">${InterviewFormatter.escapeHtml(
          interview.githubUsername
        )}</a>`
      : ''

    // о компании и интервьюере
    const companyInfoHtml = interview.companyUrl
      ? `<a href="${
          interview.companyUrl
        }" target="_blank" rel="noopener noreferrer" class="company-link">${InterviewFormatter.escapeHtml(
          interview.company
        )}</a>`
      : InterviewFormatter.escapeHtml(interview.company)

    const interviewerInfoHtml = interview.interviewer
      ? `<div class="interview-interviewer">Интервьюер: ${InterviewFormatter.escapeHtml(
          interview.interviewer
        )}</div>`
      : ''

    card.innerHTML = `
      <div class="interview-header">
        <div class="interview-company">${companyInfoHtml}</div>
        <div class="interview-position">${InterviewFormatter.escapeHtml(
          InterviewFormatter.formatPosition(interview.position)
        )}</div>
      </div>
      
      <div class="interview-meta">
        <div class="interview-salary">
          ${InterviewFormatter.formatSalaryDisplay(interview.salary)}
        </div>
        <div class="interview-date">${date}</div>
        ${interviewerInfoHtml}
      </div>
      <div class="interview-user"> ${userHtml}</div>
      <div class="interview-stats">
        Отвечено ${questionUtils.getQuestionWord(answeredQuestions)}: 
          <strong>
            ${answeredQuestions} из ${totalQuestions}
          </strong>
      </div>
    
      <div class="interview-content">
        ${this.renderAnswers(interview.answers)}
      </div>

      <div class="interview-actions">
        <button data-action="view" data-id="${
          interview.id
        }" class="btn btn--small">
          Просмотреть
        </button>
        <button data-action="download" data-id="${
          interview.id
        }" class="btn btn--small btn--secondary">
          Скачать
        </button>
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
        sectionTitle
      )}</div>`

      if (subsections && typeof subsections === 'object') {
        Object.entries(subsections).forEach(([subsectionTitle, questions]) => {
          // отмеченные вопросы в этой подсекции
          const hasCheckedQuestions = Object.values(questions || {}).some(
            (q) => q && q.checked
          )

          if (hasCheckedQuestions) {
            html += `<div class="subsection-title">${InterviewFormatter.escapeHtml(
              subsectionTitle
            )}</div>`

            Object.entries(questions || {}).forEach(
              ([questionText, questionData]) => {
                if (questionData && questionData.checked) {
                  html += this.renderQuestionItem(questionText, questionData)
                }
              }
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
                questionData.note
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