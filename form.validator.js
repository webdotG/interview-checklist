export class FormValidator {
  constructor(requiredFields = []) {
    this.validators = {
      company: {
        pattern: /^.+$/, // Любые символы, не пустое
        message: 'Можно что угодно но не может быть пустым.',
        errorMessage: 'Название компании не может быть пустым',
      },
      position: {
        pattern: /^[a-zA-Zа-яА-ЯёЁ\s\-.,()"'/:;\\|&]+$/u, // Буквы и разрешённые символы (без цифр)
        message:
          'Разрешены буквы и знаки препинания (дефис, точка, запятая, скобки, кавычки, /, , |, &, :, ;)',
        errorMessage: 'Используйте только буквы и разрешённые знаки препинания',
      },
      salary: {
        pattern: /^[0-9]+([0-9\s\-\.])*[0-9]*$/, // Цифры, пробелы, дефисы, точки
        message:
          'Разрешены только цифры, пробелы, дефисы и точки. Начните с цифры.',
        errorMessage: 'Используйте только цифры, пробелы, дефисы и точки',
      },
    }
    this.activeFields = new Set()
    this.requiredFields = new Set(requiredFields)
  }

  // валидации для формы
  init(formSelector = '#interview-form') {
    const form = document.querySelector(formSelector)
    if (!form) {
      console.error('Форма не найдена:', formSelector)
      return
    }

    const fields = form.querySelectorAll('input[type="text"]')

    fields.forEach((field) => {
      this.setupFieldValidation(field)
    })
  }

  // валидации для конкретного поля
  setupFieldValidation(field) {
    const fieldName = field.id
    const validator = this.validators[fieldName]

    if (!validator) return

    this.createHintContainer(field, validator)

    field.addEventListener('focus', () => this.showHint(field))
    field.addEventListener('blur', () => this.hideHint(field))
    field.addEventListener('input', () => this.validateField(field))
  }

  // контейнер подсказок
  createHintContainer(field, validator) {
    const container = field.parentElement

    // проверка не создан ли уже
    if (container.querySelector('.validation-hint')) return

    const hint = document.createElement('div')
    hint.className = 'validation-hint'
    hint.textContent = validator.message

    field.insertAdjacentElement('afterend', hint)
  }

  // показать
  showHint(field) {
    const hint = field.parentElement.querySelector('.validation-hint')
    if (hint) {
      hint.classList.add('visible')
      this.activeFields.add(field.id)
    }
  }

  // скрыть
  hideHint(field) {
    setTimeout(() => {
      const hint = field.parentElement.querySelector('.validation-hint')
      if (hint && !field.matches(':focus')) {
        hint.classList.remove('visible')
        this.activeFields.delete(field.id)
      }
    }, 200)
  }

  // валидация поля
  validateField(field) {
    const fieldName = field.id
    const validator = this.validators[fieldName]
    const value = field.value.trim()

    if (!validator) return true

    // пустое поле всегда валидно
    if (this.requiredFields.has(fieldName) && value === '') {
      this.setFieldState(
        field,
        'invalid',
        'Это поле обязательно для заполнения.',
      )
      return false
    }

    // если поле не обязательное и пустое, оно валидно
    if (value === '') {
      this.setFieldState(field, 'normal')
      return true
    }

    const isValid = validator.pattern.test(value)

    if (isValid) {
      this.setFieldState(field, 'valid')
    } else {
      this.setFieldState(field, 'invalid', validator.errorMessage)
    }

    return isValid
  }

  // установка состояния
  setFieldState(field, state, message = '') {
    const hint = field.parentElement.querySelector('.validation-hint')

    // очистка состояний
    field.classList.remove('valid', 'invalid')
    if (hint) {
      hint.classList.remove('error', 'success')
    }

    switch (state) {
      case 'valid':
        field.classList.add('valid')
        if (hint && this.activeFields.has(field.id)) {
          hint.classList.add('success')
          hint.textContent = '✓ Поле заполнено корректно'
        }
        break

      case 'invalid':
        field.classList.add('invalid')
        if (hint) {
          hint.classList.add('error', 'visible')
          hint.textContent = message || 'Некорректные данные'
        }
        break

      case 'normal':
      default:
        if (hint && this.activeFields.has(field.id)) {
          const validator = this.validators[field.id]
          hint.textContent = validator ? validator.message : ''
          hint.classList.remove('error', 'success')
        }
        break
    }
  }

  // всея форма
  validateForm(formSelector = '#interview-form') {
    const form = document.querySelector(formSelector)
    if (!form) return false

    const fields = form.querySelectorAll('input[type="text"]')
    let isFormValid = true

    fields.forEach((field) => {
      // Добавим проверку на обязательность
      if (this.requiredFields.has(field.id) && !field.value.trim()) {
        this.setFieldState(
          field,
          'invalid',
          'Это поле обязательно для заполнения.',
        )
        isFormValid = false
      } else {
        const isFieldValid = this.validateField(field)
        if (!isFieldValid) {
          isFormValid = false
        }
      }
    })

    return isFormValid
  }

  // данные формы с валидацией
  getFormData(formSelector = '#interview-form') {
    const isValid = this.validateForm(formSelector)

    if (!isValid) {
      return { valid: false, data: null }
    }

    const form = document.querySelector(formSelector)
    const formData = new FormData(form)

    return {
      valid: true,
      data: {
        company: form.querySelector('#company').value.trim(),
        position: form.querySelector('#position').value.trim(),
        salary: form.querySelector('#salary').value.trim(),
      },
    }
  }

  clearForm(formSelector = '#interview-form') {
    const form = document.querySelector(formSelector)
    if (!form) return

    const fields = form.querySelectorAll('input')
    fields.forEach((field) => {
      field.value = ''
      this.setFieldState(field, 'normal')
    })
  }

  destroy() {
    this.activeFields.clear()

    document.querySelectorAll('.validation-hint').forEach((hint) => {
      hint.remove()
    })
  }
}
