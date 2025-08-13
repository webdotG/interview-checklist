import { CurrencyValidator } from './form.currency.validator.js'

export class FormValidator {
  constructor() {
    // Обязательные поля помечены *
    this.requiredFields = new Set(['company', 'position', 'salary'])

    // Инициализация валидатора валют
    this.currencyValidator = new CurrencyValidator()

    this.validators = {
      company: {
        pattern: /^[a-zA-Zа-яА-ЯёЁ0-9\s\-.,()"'/:;\\|&№]{2,}$/u,
        errorMessage: 'Название компании должно содержать минимум 2 символа',
        sanitize: (value) => this.sanitizeText(value),
      },
      position: {
        pattern: /^[a-zA-Zа-яА-ЯёЁ0-9\s\-.,()"'/:;\\|&№+]{2,}$/u,
        errorMessage: 'Должность должна содержать минимум 2 символа',
        sanitize: (value) => this.sanitizeText(value),
      },
      salary: {
        pattern: /^[0-9\s]{3,}$/,
        errorMessage: 'Введите сумму',
        sanitize: (value) => this.sanitizeSalary(value),
      },
      'company-url': {
        pattern:
          /^(|https?:\/\/[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}[^\s]*|[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}[^\s]*)$/i,
        errorMessage:
          'Введите корректный URL (например: ya.ru или https://test.com)',
        sanitize: (value) => this.sanitizeUrl(value),
      },
      'vacancy-url': {
        pattern:
          /^(|https?:\/\/[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}[^\s]*|[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}[^\s]*)$/i,
        errorMessage:
          'Введите корректный URL (например: ya.ru или https://test.com)',
        sanitize: (value) => this.sanitizeUrl(value),
      },
      interviewer: {
        pattern:
          /^([a-zA-Zа-яА-ЯёЁ0-9\s\-.,()"']{1,100}|(https?:\/\/|www\.)[^\s]+)$/u,
        errorMessage: 'Максимум 100 символов для имени или корректный URL',
        sanitize: (value) => this.sanitizeInterviewer(value),
      },
    }

    this.activeFields = new Set()
  }

  setCurrency(currencyCode) {
    this.currencyValidator.setCurrency(currencyCode)
  }

  /**
   * Метод для санитизации зарплаты
   */
  sanitizeSalary(value) {
    if (!value || typeof value !== 'string') return ''

    // Оставляем только цифры и пробелы
    const cleanAmount = value
      .replace(/[^0-9\s]/g, '')
      .replace(/\s+/g, ' ')
      .trim()
      .substring(0, 20)

    return cleanAmount
  }

  /**
   * Универсальная санитизация текста - защита от XSS и инъекций
   */
  sanitizeText(value) {
    if (!value || typeof value !== 'string') return ''

    return (
      value
        // Удаляем все HTML теги
        .replace(/<[^>]*>/g, '')
        // Удаляем JavaScript события
        .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
        // Удаляем javascript: протокол
        .replace(/javascript\s*:/gi, '')
        // Удаляем data: протокол
        .replace(/data\s*:/gi, '')
        // Удаляем vbscript: протокол
        .replace(/vbscript\s*:/gi, '')
        // Удаляем потенциально опасные символы (но оставляем допустимые спецсимволы)
        .replace(/[<>'"&\x00-\x1f\x7f-\x9f]/g, '')
        // Удаляем множественные пробелы
        .replace(/\s+/g, ' ')
        // Обрезаем пробелы по краям
        .trim()
        // Ограничиваем максимальную длину
        .substring(0, 500)
    )
  }

  /**
   * Санитизация чисел - только цифры и пробелы
   */
  sanitizeNumber(value) {
    if (!value || typeof value !== 'string') return ''

    return (
      value
        // Оставляем только цифры и пробелы
        .replace(/[^0-9\s]/g, '')
        // Удаляем множественные пробелы
        .replace(/\s+/g, ' ')
        .trim()
        // Ограничиваем длину
        .substring(0, 20)
    )
  }

  /**
   * Санитизация URL - безопасная обработка ссылок
   */
  sanitizeUrl(value) {
    if (!value || typeof value !== 'string') return ''

    // Базовая очистка
    let cleanValue = value
      .replace(/[<>'"&\x00-\x1f\x7f-\x9f]/g, '')
      .replace(/\s+/g, '')
      .trim()
      .substring(0, 500)

    if (!cleanValue) return ''

    // Удаляем опасные протоколы
    if (cleanValue.match(/^(javascript|data|vbscript|file|ftp):/i)) {
      return ''
    }

    // Если это простой домен (например ya.ru, google.com)
    if (cleanValue.match(/^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}[^\s]*$/)) {
      // Проверяем что это реальный домен
      if (this.isValidDomain(cleanValue.split('/')[0])) {
        return `https://${cleanValue}`
      }
    }

    // Если уже есть протокол http/https
    if (cleanValue.match(/^https?:\/\//i)) {
      return cleanValue
    }

    // Если начинается с //, добавляем https:
    if (cleanValue.startsWith('//')) {
      return `https:${cleanValue}`
    }

    return cleanValue
  }

  /**
   * Специальная санитизация для поля интервьюера
   */
  sanitizeInterviewer(value) {
    if (!value) return ''

    // Если это похоже на URL
    if (value.match(/^(https?:\/\/|www\.)/i)) {
      return this.sanitizeUrl(value)
    }

    // Обычный текст
    return this.sanitizeText(value).substring(0, 100) // Ограничиваем 100 символами
  }

  /**
   * Проверка валидности домена
   */
  isValidDomain(domain) {
    if (!domain || typeof domain !== 'string') return false

    // Убираем путь после домена для проверки
    const domainOnly = domain.split('/')[0]

    // Базовые правила для домена
    return /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/.test(
      domainOnly
    )
  }

  /**
   * Инициализация валидатора
   */
  init(formSelector = '#interview-form') {
    const form = document.querySelector(formSelector)
    if (!form) {
      console.error('Форма не найдена:', formSelector)
      return
    }

    form.querySelectorAll('input').forEach((field) => {
      this.setupFieldValidation(field)
    })

    // Инициализация валютного селектора
    this.currencyValidator.initCurrencySelector()

    // Защита от автозаполнения потенциально опасных данных
    form.addEventListener('paste', (e) => {
      setTimeout(() => {
        form.querySelectorAll('input').forEach((field) => {
          const validator = this.validators[field.id]
          if (validator) {
            const sanitized = validator.sanitize(field.value)
            if (field.value !== sanitized) {
              field.value = sanitized
              this.validateField(field)
            }
          }
        })
      }, 10)
    })
  }

  /**
   * Настройка валидации для конкретного поля
   */
  setupFieldValidation(field) {
    const fieldName = field.id
    const validator = this.validators[fieldName]
    if (!validator) return

    this.createHintContainer(field, validator)

    // Дополнительные атрибуты безопасности
    field.setAttribute('autocomplete', 'off')
    field.setAttribute('spellcheck', 'false')

    // События для показа/скрытия подсказок
    field.addEventListener('focus', () => this.showHint(field))
    field.addEventListener('blur', () => this.hideHint(field))

    // Обработка ввода с санитизацией в реальном времени
    field.addEventListener('input', () => {
      const originalValue = field.value
      const sanitizedValue = validator.sanitize(originalValue)

      if (originalValue !== sanitizedValue) {
        // Сохраняем позицию курсора
        const cursorPos = field.selectionStart
        field.value = sanitizedValue
        // Восстанавливаем позицию курсора
        const newPos = Math.min(cursorPos, sanitizedValue.length)
        field.setSelectionRange(newPos, newPos)
      }

      this.validateField(field)
    })
  }

  /**
   * Создание контейнера для подсказки
   */
  createHintContainer(field, validator) {
    if (field.parentElement.querySelector('.validation-hint')) return

    const hint = document.createElement('div')
    hint.className = 'validation-hint'
    hint.textContent = this.requiredFields.has(field.id)
      ? `${validator.errorMessage} (обязательное поле)`
      : validator.errorMessage

    field.insertAdjacentElement('afterend', hint)
  }

  /**
   * Показать подсказку
   */
  showHint(field) {
    const hint = field.parentElement.querySelector('.validation-hint')
    if (hint) {
      hint.classList.add('visible')
      this.activeFields.add(field.id)
    }
  }

  /**
   * Скрыть подсказку
   */
  hideHint(field) {
    setTimeout(() => {
      const hint = field.parentElement.querySelector('.validation-hint')
      if (hint && !field.matches(':focus')) {
        hint.classList.remove('visible')
        this.activeFields.delete(field.id)
      }
    }, 200)
  }

  /**
   * Валидация конкретного поля
   */
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

    // Дополнительная проверка на потенциально опасное содержимое
    if (this.containsDangerousContent(value)) {
      this.setFieldState(
        field,
        'invalid',
        'Обнаружено потенциально опасное содержимое'
      )
      return false
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

  /**
   * Проверка на потенциально опасное содержимое
   */
  containsDangerousContent(value) {
    if (!value || typeof value !== 'string') return false

    const dangerousPatterns = [
      /<script[^>]*>/i,
      /javascript\s*:/i,
      /vbscript\s*:/i,
      /data\s*:/i,
      /on\w+\s*=/i,
      /<iframe[^>]*>/i,
      /<object[^>]*>/i,
      /<embed[^>]*>/i,
      /<link[^>]*>/i,
      /<meta[^>]*>/i,
      /document\./i,
      /window\./i,
      /eval\s*\(/i,
      /setTimeout\s*\(/i,
      /setInterval\s*\(/i,
      /<svg[^>]*>/i,
      /expression\s*\(/i,
    ]

    return dangerousPatterns.some((pattern) => pattern.test(value))
  }

  /**
   * Установка состояния поля
   */
  setFieldState(field, state, message = '') {
    const hint = field.parentElement.querySelector('.validation-hint')

    // Очищаем предыдущие состояния
    field.classList.remove('valid', 'invalid')
    if (hint) {
      hint.classList.remove('error', 'success')
    }

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
          const validator = this.validators[field.id]
          hint.textContent = this.requiredFields.has(field.id)
            ? `${validator.errorMessage} (обязательное поле)`
            : validator.errorMessage
        }
        break
    }
  }

  /**
   * Валидация всей формы
   */
  validateForm(formSelector = '#interview-form') {
    const form = document.querySelector(formSelector)
    if (!form) {
      console.error('Форма не найдена:', formSelector)
      return false
    }

    let isFormValid = true
    form.querySelectorAll('input').forEach((field) => {
      if (!this.validateField(field)) {
        isFormValid = false
      }
    })

    return isFormValid
  }

  /**
   * Получение данных формы
   */
  getFormData(formSelector = '#interview-form') {
    if (!this.validateForm(formSelector)) {
      return { valid: false, data: null }
    }

    const form = document.querySelector(formSelector)
    if (!form) {
      return { valid: false, data: null }
    }

    const data = {}

    form.querySelectorAll('input').forEach((field) => {
      const validator = this.validators[field.id]
      let fieldValue = validator
        ? validator.sanitize(field.value.trim())
        : this.sanitizeText(field.value.trim())

      // Дополнительная санитизация перед сохранением
      fieldValue = this.finalSanitize(fieldValue)

      // Пустые необязательные поля -> null
      if (!this.requiredFields.has(field.id) && fieldValue === '') {
        data[field.id] = null
      } else {
        data[field.id] = fieldValue
      }

      // Добавляем валюту для поля зарплаты
      if (field.id === 'salary' && fieldValue) {
        data['salary-currency'] = this.currencyValidator.currentCurrency.code
      }
    })

    return { valid: true, data }
  }

  /**
   * Финальная санитизация перед сохранением
   */
  finalSanitize(value) {
    if (!value || typeof value !== 'string') return ''

    // Последняя проверка на опасное содержимое
    if (this.containsDangerousContent(value)) {
      console.warn(
        'Обнаружено и удалено потенциально опасное содержимое:',
        value
      )
      return ''
    }

    return value
  }

  /**
   * Очистка формы
   */
  clearForm(formSelector = '#interview-form') {
    const form = document.querySelector(formSelector)
    if (!form) return

    form.querySelectorAll('input').forEach((field) => {
      field.value = ''
      this.setFieldState(field, 'normal')
    })

    // Очищаем активные поля
    this.activeFields.clear()
  }

  /**
   * Уничтожение валидатора
   */
  destroy() {
    this.activeFields.clear()
    document
      .querySelectorAll('.validation-hint')
      .forEach((hint) => hint.remove())

    // Уничтожаем валидатор валют
    this.currencyValidator = null
  }
}
