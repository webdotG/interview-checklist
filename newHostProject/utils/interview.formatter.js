export class InterviewFormatter {
  static formatDate(timestamp) {
    if (!timestamp) return 'Дата неизвестна'

    try {
      let date

      // форматы даты
      if (timestamp.seconds) {
        // Firebase Timestamp
        date = new Date(timestamp.seconds * 1000)
      } else if (typeof timestamp === 'string') {
        // ISO строка
        date = new Date(timestamp)
      } else {
        // обычный timestamp
        date = new Date(timestamp)
      }

      if (isNaN(date.getTime())) {
        return 'Некорректная дата'
      }

      return date.toLocaleString('ru-RU', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    } catch (error) {
      console.error('Ошибка форматирования даты:', error)
      return 'Ошибка даты'
    }
  }

  static formatSalary(salary) {
    if (!salary) return 'Не указана'

    // разделители тысяч
    const formatted = salary.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
    return `${formatted} ₽`
  }

  static escapeHtml(text) {
    if (!text) return ''
    const div = document.createElement('div')
    div.textContent = text
    return div.innerHTML
  }

  static getSafeValue(value, fallback = '') {
    return value || fallback
  }

  static formatCompanyName(company) {
    return this.getSafeValue(company, 'Без названия')
  }

  static formatPosition(position) {
    return this.getSafeValue(position, 'Без должности')
  }

  static formatSalaryDisplay(salary) {
    return salary ? this.formatSalary(salary) : 'Зарплата не указана'
  }
}
