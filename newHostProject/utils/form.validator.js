export class FormValidator {
  constructor() {
    // Обязательные поля помечены *
    this.requiredFields = new Set(['company', 'position', 'salary'])

    this.validators = {
      company: {
        pattern: /^[a-zA-Zа-яА-ЯёЁ0-9\s\-.,()"'/:;\\|&]{2,}$/u,
        errorMessage: 'Название компании должно содержать минимум 2 символа',
        sanitize: (value) => value.replace(/[<>]/g, ''), // Запрещаем теги
      },
      position: {
        pattern: /^[a-zA-Zа-яА-ЯёЁ0-9\s\-.,()"'/:;\\|&]{2,}$/u,
        errorMessage: 'Должность должна содержать минимум 2 символа',
        sanitize: (value) => value.replace(/[<>]/g, ''),
      },
      salary: {
        pattern: /^[0-9\s]{3,}$/,
        errorMessage: 'Зарплата должна содержать только цифры (минимум 3)',
        sanitize: (value) => value.replace(/\D/g, ''), // Оставляем только цифры
      },
      'company-url': {
        pattern: /^(|https?:\/\/[^\s]+|[^\s]+\.[^\s]+)$/i,
        errorMessage: 'Введите корректный URL (можно без https://)',
        sanitize: (value) => {
          if (!value) return ''
          // Добавляем https:// если нет схемы и есть точка
          if (!value.match(/^https?:\/\//i) && value.includes('.')) {
            return `https://${value.replace(/^\/\/|^https?:\/\//i, '')}`
          }
          return value
        },
      },
      'vacancy-url': {
        pattern: /^(|https?:\/\/[^\s]+|[^\s]+\.[^\s]+)$/i,
        errorMessage: 'Введите корректный URL (можно без https://)',
        sanitize: (value) => {
          if (!value) return ''
          if (!value.match(/^https?:\/\//i) && value.includes('.')) {
            return `https://${value.replace(/^\/\/|^https?:\/\//i, '')}`
          }
          return value
        },
      },
      interviewer: {
        pattern: /^.{0,100}$/,
        errorMessage: 'Максимум 100 символов',
        sanitize: (value) => value.replace(/[<>]/g, ''),
      },
    }

    this.activeFields = new Set()
  }

  init(formSelector = '#interview-form') {
    const form = document.querySelector(formSelector)
    if (!form) {
      console.error('Форма не найдена:', formSelector)
      return
    }

    form.querySelectorAll('input').forEach((field) => {
      this.setupFieldValidation(field)
    })
  }

  setupFieldValidation(field) {
    const fieldName = field.id
    const validator = this.validators[fieldName]
    if (!validator) return

    this.createHintContainer(field, validator)

    field.addEventListener('focus', () => this.showHint(field))
    field.addEventListener('blur', () => this.hideHint(field))
    field.addEventListener('input', () => {
      // Санитизация вводимых данных
      field.value = validator.sanitize(field.value)
      this.validateField(field)
    })
  }

  createHintContainer(field, validator) {
    if (field.parentElement.querySelector('.validation-hint')) return

    const hint = document.createElement('div')
    hint.className = 'validation-hint'
    hint.textContent = this.requiredFields.has(field.id)
      ? `${validator.errorMessage} (обязательное поле)`
      : validator.errorMessage

    field.insertAdjacentElement('afterend', hint)
  }

  showHint(field) {
    const hint = field.parentElement.querySelector('.validation-hint')
    if (hint) {
      hint.classList.add('visible')
      this.activeFields.add(field.id)
    }
  }

  hideHint(field) {
    setTimeout(() => {
      const hint = field.parentElement.querySelector('.validation-hint')
      if (hint && !field.matches(':focus')) {
        hint.classList.remove('visible')
        this.activeFields.delete(field.id)
      }
    }, 200)
  }

  validateField(field) {
    const fieldName = field.id
    const validator = this.validators[fieldName]
    const value = field.value.trim()

    if (!validator) return true

    // Проверка обязательных полей
    if (this.requiredFields.has(fieldName) && value === '') {
      this.setFieldState(
        field,
        'invalid',
        'Это поле обязательно для заполнения'
      )
      return false
    }

    // Необязательные пустые поля - валидны
    if (value === '' && !this.requiredFields.has(fieldName)) {
      this.setFieldState(field, 'normal')
      return true
    }

    // Проверка по регулярному выражению
    const isValid = validator.pattern.test(value)
    this.setFieldState(
      field,
      isValid ? 'valid' : 'invalid',
      isValid ? '' : validator.errorMessage
    )

    return isValid
  }

  setFieldState(field, state, message = '') {
    const hint = field.parentElement.querySelector('.validation-hint')

    field.classList.remove('valid', 'invalid')
    if (hint) hint.classList.remove('error', 'success')

    switch (state) {
      case 'valid':
        field.classList.add('valid')
        if (hint && this.activeFields.has(field.id)) {
          hint.classList.add('success')
          hint.textContent = '✓ Корректно'
        }
        break

      case 'invalid':
        field.classList.add('invalid')
        if (hint) {
          hint.classList.add('error', 'visible')
          hint.textContent = message
        }
        break

      case 'normal':
        if (hint && this.activeFields.has(field.id)) {
          hint.textContent = this.requiredFields.has(field.id)
            ? `${this.validators[field.id].errorMessage} (обязательное поле)`
            : this.validators[field.id].errorMessage
        }
        break
    }
  }

  validateForm(formSelector = '#interview-form') {
    const form = document.querySelector(formSelector)
    if (!form) return false

    let isFormValid = true
    form.querySelectorAll('input').forEach((field) => {
      if (!this.validateField(field)) {
        isFormValid = false
      }
    })

    return isFormValid
  }

  getFormData(formSelector = '#interview-form') {
    if (!this.validateForm(formSelector)) {
      return { valid: false, data: null }
    }

    const form = document.querySelector(formSelector)
    const data = {}

    form.querySelectorAll('input').forEach((field) => {
      const validator = this.validators[field.id]
      data[field.id] = validator
        ? validator.sanitize(field.value.trim())
        : field.value.trim()

      // Пустые необязательные поля -> null
      if (!this.requiredFields.has(field.id) && data[field.id] === '') {
        data[field.id] = null
      }
    })

    return { valid: true, data }
  }

  clearForm(formSelector = '#interview-form') {
    const form = document.querySelector(formSelector)
    if (!form) return

    form.querySelectorAll('input').forEach((field) => {
      field.value = ''
      this.setFieldState(field, 'normal')
    })
  }

  destroy() {
    this.activeFields.clear()
    document
      .querySelectorAll('.validation-hint')
      .forEach((hint) => hint.remove())
  }
}