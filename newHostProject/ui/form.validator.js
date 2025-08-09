export class FormValidator {
  constructor(requiredFields = []) {
    this.validators = {
      company: {
        pattern: /^.+$/,
        message: 'Название компании (обязательно).',
        errorMessage: 'Название компании не может быть пустым',
      },
      position: {
        pattern: /^[a-zA-Zа-яА-ЯёЁ\s\-.,()"'/:;\\|&]+$/u,
        message: 'Название должности (обязательно).',
        errorMessage: 'Используйте только буквы и знаки препинания',
      },
      salary: {
        pattern: /^[0-9]+([0-9\s\-\.])*[0-9]*$/,
        message: 'Ожидаемая зарплата: только цифры (обязательно).',
        errorMessage: 'Используйте только цифры, пробелы, дефисы и точки',
      },
      'company-url': {
        pattern: /^(https?:\/\/.+)?$/,
        message: 'Ссылка на компанию (необязательно).',
        errorMessage: 'Введите корректный URL, начинающийся с http:// или https://',
      },
      'vacancy-url': {
        pattern: /^(https?:\/\/.+)?$/,
        message: 'Ссылка на вакансию (необязательно).',
        errorMessage: 'Введите корректный URL, начинающийся с http:// или https://',
      },
      interviewer: {
        pattern: /^.*$/,
        message: 'Имя или ссылка на интервьюера (необязательно).',
        errorMessage: 'Некорректный ввод',
      },
    };
    this.activeFields = new Set();
    this.requiredFields = new Set(requiredFields);
  }

  init(formSelector = '#interview-form') {
    const form = document.querySelector(formSelector);
    if (!form) {
      console.error('Форма не найдена:', formSelector);
      return;
    }

    // все поля ввода
    const fields = form.querySelectorAll('input');

    fields.forEach((field) => {
      this.setupFieldValidation(field);
    });
  }

  setupFieldValidation(field) {
    const fieldName = field.id;
    const validator = this.validators[fieldName];
    if (!validator) return;

    this.createHintContainer(field, validator);

    field.addEventListener('focus', () => this.showHint(field));
    field.addEventListener('blur', () => this.hideHint(field));
    field.addEventListener('input', () => this.validateField(field));
  }

  createHintContainer(field, validator) {
    const container = field.parentElement;
    if (container.querySelector('.validation-hint')) return;

    const hint = document.createElement('div');
    hint.className = 'validation-hint';
    hint.textContent = validator.message;

    field.insertAdjacentElement('afterend', hint);
  }

  showHint(field) {
    const hint = field.parentElement.querySelector('.validation-hint');
    if (hint) {
      hint.classList.add('visible');
      this.activeFields.add(field.id);
    }
  }

  hideHint(field) {
    setTimeout(() => {
      const hint = field.parentElement.querySelector('.validation-hint');
      if (hint && !field.matches(':focus')) {
        hint.classList.remove('visible');
        this.activeFields.delete(field.id);
      }
    }, 200);
  }

  validateField(field) {
    const fieldName = field.id;
    const validator = this.validators[fieldName];
    const value = field.value.trim();

    if (!validator) return true;

    // поле обязательное и пустое, оно не валидно
    if (this.requiredFields.has(fieldName) && value === '') {
      this.setFieldState(field, 'invalid', 'Это поле обязательно для заполнения.');
      return false;
    }
    
    // поле не обязательное и пустое, оно валидно
    if (value === '' && !this.requiredFields.has(fieldName)) {
      this.setFieldState(field, 'normal');
      return true;
    }
    
    const isValid = validator.pattern.test(value);
    
    if (isValid) {
      this.setFieldState(field, 'valid');
    } else {
      this.setFieldState(field, 'invalid', validator.errorMessage);
    }

    return isValid;
  }

  setFieldState(field, state, message = '') {
    const hint = field.parentElement.querySelector('.validation-hint');

    field.classList.remove('valid', 'invalid');
    if (hint) {
      hint.classList.remove('error', 'success');
    }

    switch (state) {
      case 'valid':
        field.classList.add('valid');
        if (hint && this.activeFields.has(field.id)) {
          hint.classList.add('success');
          hint.textContent = '✓ Поле заполнено корректно';
        }
        break;

      case 'invalid':
        field.classList.add('invalid');
        if (hint) {
          hint.classList.add('error', 'visible');
          hint.textContent = message || 'Некорректные данные';
        }
        break;

      case 'normal':
      default:
        if (hint && this.activeFields.has(field.id)) {
          const validator = this.validators[field.id];
          hint.textContent = validator ? validator.message : '';
          hint.classList.remove('error', 'success');
        }
        break;
    }
  }

  validateForm(formSelector = '#interview-form') {
    const form = document.querySelector(formSelector);
    if (!form) return false;

    const fields = form.querySelectorAll('input');
    let isFormValid = true;

    fields.forEach((field) => {
      const isFieldValid = this.validateField(field);
      if (!isFieldValid) {
        isFormValid = false;
      }
    });

    return isFormValid;
  }

  getFormData(formSelector = '#interview-form') {
    const isValid = this.validateForm(formSelector);
    if (!isValid) {
      return { valid: false, data: null };
    }

    const form = document.querySelector(formSelector);

    return {
      valid: true,
      data: {
        company: form.querySelector('#company').value.trim(),
        position: form.querySelector('#position').value.trim(),
        salary: form.querySelector('#salary').value.trim(),
        'company-url': form.querySelector('#company-url').value.trim() || null,
        'vacancy-url': form.querySelector('#vacancy-url').value.trim() || null,
        interviewer: form.querySelector('#interviewer').value.trim() || null,
      },
    };
  }

  clearForm(formSelector = '#interview-form') {
    const form = document.querySelector(formSelector);
    if (!form) return;

    const fields = form.querySelectorAll('input');
    fields.forEach((field) => {
      field.value = '';
      this.setFieldState(field, 'normal');
    });
  }

  destroy() {
    this.activeFields.clear();
    document.querySelectorAll('.validation-hint').forEach((hint) => {
      hint.remove();
    });
  }
}