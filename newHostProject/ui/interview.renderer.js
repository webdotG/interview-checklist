import { InterviewFormatter } from '../utils/interview.formatter.js'
import { questionStats } from '../utils/questions.utils.js'

export class InterviewRenderer {
  constructor(totalQuestions) {
    this.totalQuestions = totalQuestions
  }

  createInterviewCard(interview, index) {
    const card = document.createElement('div')
    card.className = 'interview-card'

    const date = InterviewFormatter.formatDate(interview.timestamp)
    const answeredQuestions = questionStats.countAnsweredQuestions(interview)
    const totalQuestions = this.totalQuestions

    // GitHub пользователь - используем githubLogin или fullName
    const userHtml = this.renderUserInfo(interview)

    // Информация о компании
    const companyInfoHtml = this.renderCompanyInfo(interview)

    // Информация об интервьюере
    const interviewerInfoHtml = this.renderInterviewerInfo(interview)

    // Ссылка на вакансию
    const vacancyLinkHtml = this.renderVacancyLink(interview)

    card.innerHTML = `
      <div class="interview-header">
        <div class="interview-company">${companyInfoHtml}</div>
        <div class="interview-position">${InterviewFormatter.escapeHtml(
          InterviewFormatter.formatPosition(interview.position)
        )}</div>
        ${vacancyLinkHtml}
      </div>
      
      <div class="interview-meta">
        <div class="interview-salary">
          ${InterviewFormatter.formatSalaryDisplay(interview.salary)}
        </div>
        <div class="interview-date">${date}</div>
        ${interviewerInfoHtml}
      </div>
      
      <div class="interview-user">${userHtml}</div>
      
      <div class="interview-stats">
        Отвечено ${questionStats.getQuestionWord(answeredQuestions)}: 
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

  renderUserInfo(interview) {
    // Приоритет: githubLogin -> fullName -> firebaseUid
    if (interview.githubLogin && interview.githubProfileUrl) {
      return `
        <div class="user-github">
          <a href="${
            interview.githubProfileUrl
          }" target="_blank" rel="noopener noreferrer" class="github-link">
            ${
              interview.githubAvatarUrl
                ? `<img src="${interview.githubAvatarUrl}" alt="Avatar" class="github-avatar">`
                : ''
            }
            <span class="github-username">${InterviewFormatter.escapeHtml(
              interview.githubLogin
            )}</span>
          </a>
        </div>
      `
    } else if (interview.fullName) {
      return `
<div class="user-local">
  ${
    interview.githubAvatarUrl
      ? `<img src="${interview.githubAvatarUrl}" alt="Avatar" class="github-avatar">`
      : ''
  }
  <div class="user-details">
    <span class="user-name">${InterviewFormatter.escapeHtml(
      interview.fullName
    )}</span>
    ${
      interview.email
        ? `<a href="mailto:${InterviewFormatter.escapeHtml(interview.email)}" 
            class="user-email"
            title="Написать письмо">
            ${InterviewFormatter.escapeHtml(interview.email)}
          </a>`
        : ''
    }
  </div>
</div>
      `
    } else if (interview.firebaseUid) {
      return `<div class="user-anonymous">Анонимный пользователь</div>`
    } else {
      return `<div class="user-local-save">Локальное сохранение</div>`
    }
  }

  renderCompanyInfo(interview) {
    if (interview.companyUrl) {
      return `<a href="${
        interview.companyUrl
      }" target="_blank" rel="noopener noreferrer" class="company-link">${InterviewFormatter.escapeHtml(
        interview.company
      )}</a>`
    }
    return InterviewFormatter.escapeHtml(interview.company)
  }

  renderInterviewerInfo(interview) {
    if (!interview.interviewer) {
      return `<div class="interview-interviewer empty">Интервьюер не указан</div>`
    }

    const interviewer = interview.interviewer.trim()

    // Проверка на URL
    const isUrl = interviewer.match(/^(https?:\/\/|www\.)/i)

    // Проверка на email
    const isEmail =
      interviewer.includes('@') && interviewer.includes('.') && !isUrl

    if (isUrl) {
      const url = interviewer.startsWith('www.')
        ? `https://${interviewer}`
        : interviewer

      return `
      <div class="interview-interviewer">
        <span class="interviewer-label">Интервьюер:</span>
        <a href="${InterviewFormatter.escapeHtml(url)}" 
           target="_blank" 
           rel="noopener noreferrer"
           class="interviewer-link">
          ${InterviewFormatter.escapeHtml(interviewer)}
        </a>
      </div>
    `
    }

    if (isEmail) {
      return `
      <div class="interview-interviewer">
        <span class="interviewer-label">Интервьюер:</span>
        <a href="mailto:${InterviewFormatter.escapeHtml(interviewer)}" 
           class="interviewer-link email">
          ${InterviewFormatter.escapeHtml(interviewer)}
        </a>
      </div>
    `
    }

    // Обычный текст
    return `
    <div class="interview-interviewer">
      <span class="interviewer-label">Интервьюер:</span>
      ${InterviewFormatter.escapeHtml(interviewer)}
    </div>
  `
  }

  renderVacancyLink(interview) {
    if (!interview.vacancyUrl) {
      return `<div class="vacancy-link vacancy-link--empty">Ссылка на вакансию не указана</div>`
    }
    return `
      <div class="vacancy-link">
        <a href="${interview.vacancyUrl}" target="_blank" rel="noopener noreferrer" class="vacancy-url">
          📋 Посмотреть вакансию
        </a>
      </div>
    `
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