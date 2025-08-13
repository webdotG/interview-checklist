export class CurrencyValidator {
  constructor() {
    // Расширенная система валют
    this.currentCurrency = { code: 'RUB', symbol: '₽', type: 'fiat' }
    
    // Предустановленные валюты с группировкой
    this.currencies = {
      fiat: {
        'RUB': { symbol: '₽', name: 'Russian Ruble' },
        'USD': { symbol: '$', name: 'US Dollar' },
        'EUR': { symbol: '€', name: 'Euro' },
        'GBP': { symbol: '£', name: 'British Pound' },
        'JPY': { symbol: '¥', name: 'Japanese Yen' },
        'CNY': { symbol: '¥', name: 'Chinese Yuan' },
        'KRW': { symbol: '₩', name: 'South Korean Won' },
        'INR': { symbol: '₹', name: 'Indian Rupee' },
        'CHF': { symbol: 'CHF', name: 'Swiss Franc' },
        'CAD': { symbol: 'C$', name: 'Canadian Dollar' },
        'AUD': { symbol: 'A$', name: 'Australian Dollar' },
        'SEK': { symbol: 'kr', name: 'Swedish Krona' },
        'NOK': { symbol: 'kr', name: 'Norwegian Krone' },
        'DKK': { symbol: 'kr', name: 'Danish Krone' },
        'PLN': { symbol: 'zł', name: 'Polish Złoty' },
        'CZK': { symbol: 'Kč', name: 'Czech Koruna' },
        'HUF': { symbol: 'Ft', name: 'Hungarian Forint' },
        'TRY': { symbol: '₺', name: 'Turkish Lira' },
        'BRL': { symbol: 'R$', name: 'Brazilian Real' },
        'MXN': { symbol: '$', name: 'Mexican Peso' },
        'ARS': { symbol: '$', name: 'Argentine Peso' },
        'CLP': { symbol: '$', name: 'Chilean Peso' },
        'COP': { symbol: '$', name: 'Colombian Peso' },
        'PEN': { symbol: 'S/', name: 'Peruvian Sol' },
        'UYU': { symbol: '$U', name: 'Uruguayan Peso' },
        'ZAR': { symbol: 'R', name: 'South African Rand' },
        'EGP': { symbol: 'E£', name: 'Egyptian Pound' },
        'ILS': { symbol: '₪', name: 'Israeli Shekel' },
        'AED': { symbol: 'د.إ', name: 'UAE Dirham' },
        'SAR': { symbol: 'ر.س', name: 'Saudi Riyal' },
        'QAR': { symbol: 'ر.ق', name: 'Qatari Riyal' },
        'KWD': { symbol: 'د.ك', name: 'Kuwaiti Dinar' },
        'BHD': { symbol: '.د.ب', name: 'Bahraini Dinar' },
        'OMR': { symbol: 'ر.ع.', name: 'Omani Rial' },
        'JOD': { symbol: 'د.ا', name: 'Jordanian Dinar' },
        'LBP': { symbol: 'ل.ل', name: 'Lebanese Pound' }
      },
      crypto: {
        'BTC': { symbol: '₿', name: 'Bitcoin' },
        'ETH': { symbol: 'Ξ', name: 'Ethereum' },
        'USDT': { symbol: 'USDT', name: 'Tether' },
        'USDC': { symbol: 'USDC', name: 'USD Coin' },
        'BNB': { symbol: 'BNB', name: 'Binance Coin' },
        'XRP': { symbol: 'XRP', name: 'Ripple' },
        'ADA': { symbol: 'ADA', name: 'Cardano' },
        'SOL': { symbol: 'SOL', name: 'Solana' },
        'DOT': { symbol: 'DOT', name: 'Polkadot' },
        'MATIC': { symbol: 'MATIC', name: 'Polygon' },

      }
    }

    // Пользовательские валюты (добавляемые динамически)
    this.customCurrencies = new Map()
  }

  /**
   * Получение валюты по коду
   */
  getCurrency(code) {
    // Поиск в фиатных валютах
    if (this.currencies.fiat[code]) {
      return { ...this.currencies.fiat[code], code, type: 'fiat' }
    }
    
    // Поиск в криптовалютах
    if (this.currencies.crypto[code]) {
      return { ...this.currencies.crypto[code], code, type: 'crypto' }
    }
    
    // Поиск в пользовательских валютах
    if (this.customCurrencies.has(code)) {
      return { ...this.customCurrencies.get(code), code, type: 'custom' }
    }
    
    return null
  }

  /**
   * Добавление пользовательской валюты
   */
  addCustomCurrency(code, symbol, name = '') {
    if (!code || !symbol) return false
    
    // Проверяем, что код не занят
    if (this.getCurrency(code)) {
      console.warn(`Валюта с кодом ${code} уже существует`)
      return false
    }
    
    // Валидация кода валюты
    const cleanCode = code.toUpperCase().replace(/[^A-Z0-9]/g, '').substring(0, 10)
    const cleanSymbol = symbol.trim().substring(0, 10)
    const cleanName = name.trim().substring(0, 50)
    
    if (cleanCode.length < 2) {
      console.warn('Код валюты должен содержать минимум 2 символа')
      return false
    }
    
    this.customCurrencies.set(cleanCode, {
      symbol: cleanSymbol,
      name: cleanName || `Custom Currency (${cleanCode})`
    })
    
    return true
  }

  /**
   * Генерация HTML для валютного селектора
   */
  generateCurrencyDropdownHTML() {
    let html = ''
    
    // Популярные фиатные валюты
    const popularFiat = ['RUB', 'USD', 'EUR', 'GBP', 'JPY', 'CNY']
    html += '<div class="currency-group">'
    html += '<div class="currency-group-title">Популярные валюты</div>'
    popularFiat.forEach(code => {
      const currency = this.currencies.fiat[code]
      if (currency) {
        html += `<div class="currency-option" data-currency="${code}" data-type="fiat">${code} (${currency.symbol})</div>`
      }
    })
    html += '</div>'
    
    // Все остальные фиатные валюты
    const otherFiat = Object.keys(this.currencies.fiat).filter(code => !popularFiat.includes(code))
    if (otherFiat.length > 0) {
      html += '<div class="currency-group">'
      html += '<div class="currency-group-title">Другие валюты</div>'
      otherFiat.forEach(code => {
        const currency = this.currencies.fiat[code]
        html += `<div class="currency-option" data-currency="${code}" data-type="fiat">${code} (${currency.symbol})</div>`
      })
      html += '</div>'
    }
    
    // Криптовалюты
    html += '<div class="currency-group crypto-group">'
    html += '<div class="currency-group-title crypto-toggle">Криптовалюты ▼</div>'
    html += '<div class="crypto-submenu">'
    Object.keys(this.currencies.crypto).forEach(code => {
      const currency = this.currencies.crypto[code]
      html += `<div class="currency-option" data-currency="${code}" data-type="crypto">${code} (${currency.symbol})</div>`
    })
    html += '<div class="currency-option" data-currency="custom-crypto" data-type="custom">Добавить криптовалюту...</div>'
    html += '</div>'
    html += '</div>'
    
    // Пользовательские валюты
    if (this.customCurrencies.size > 0) {
      html += '<div class="currency-group">'
      html += '<div class="currency-group-title">Пользовательские валюты</div>'
      this.customCurrencies.forEach((currency, code) => {
        html += `<div class="currency-option" data-currency="${code}" data-type="custom">${code} (${currency.symbol})</div>`
      })
      html += '</div>'
    }
    
    // Опция добавления пользовательской валюты
    html += '<div class="currency-group">'
    html += '<div class="currency-option add-custom" data-currency="custom-fiat" data-type="custom">+ Добавить валюту</div>'
    html += '</div>'
    
    return html
  }

  /**
   * Обновление содержимого dropdown
   */
  updateCurrencyDropdown() {
    const currencyDropdown = document.querySelector('.currency-dropdown')
    if (!currencyDropdown) return

    currencyDropdown.innerHTML = this.generateCurrencyDropdownHTML()
  }

  /**
   * Диалог добавления новой валюты
   */
  showAddCurrencyDialog(isCrypto = false) {
    const type = isCrypto ? 'криптовалюты' : 'валюты'
    const code = prompt(`Введите код ${type} (например: ${isCrypto ? 'DOGE' : 'PLN'}):`)
    if (!code || !code.trim()) return

    const symbol = prompt(`Введите символ для ${code} (например: ${isCrypto ? 'Ð' : 'zł'}):`)
    if (!symbol || !symbol.trim()) return

    const name = prompt(`Введите название ${code} (необязательно):`) || ''

    const cleanCode = code.trim().toUpperCase()
    const cleanSymbol = symbol.trim()
    const cleanName = name.trim()

    if (this.addCustomCurrency(cleanCode, cleanSymbol, cleanName)) {
      // Если валюта добавлена успешно, обновляем dropdown и устанавливаем её
      this.updateCurrencyDropdown()
      this.setCurrency(cleanCode)
      
      // Показываем уведомление об успехе
      this.showNotification(`Валюта ${cleanCode} (${cleanSymbol}) успешно добавлена!`, 'success')
    } else {
      this.showNotification(`Ошибка при добавлении валюты ${cleanCode}`, 'error')
    }
  }

  /**
   * Показ уведомлений
   */
  showNotification(message, type = 'info') {
    // Создаем уведомление
    const notification = document.createElement('div')
    notification.className = `currency-notification ${type}`
    notification.textContent = message
    
    // Добавляем стили если их нет
    if (!document.getElementById('currency-notification-styles')) {
      const styles = document.createElement('style')
      styles.id = 'currency-notification-styles'
      styles.textContent = `
        .currency-notification {
          position: fixed;
          top: 20px;
          right: 20px;
          padding: 12px 20px;
          border-radius: 4px;
          color: white;
          font-size: 14px;
          z-index: 10000;
          animation: slideIn 0.3s ease-out;
        }
        .currency-notification.success { background: #4CAF50; }
        .currency-notification.error { background: #f44336; }
        .currency-notification.info { background: #2196F3; }
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `
      document.head.appendChild(styles)
    }
    
    document.body.appendChild(notification)
    
    // Удаляем уведомление через 3 секунды
    setTimeout(() => {
      notification.style.animation = 'slideIn 0.3s ease-out reverse'
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification)
        }
      }, 300)
    }, 3000)
  }

  /**
   * Установка текущей валюты
   */
  setCurrency(currencyCode) {
    if (!currencyCode) return

    const currency = this.getCurrency(currencyCode)
    if (!currency) {
      console.warn(`Валюта с кодом ${currencyCode} не найдена`)
      return
    }

    this.currentCurrency = currency
    this.updateCurrencyDisplay()
  }

  /**
   * Обновление отображения валюты
   */
  updateCurrencyDisplay() {
    const currencyToggle = document.querySelector('.currency-toggle')
    if (!currencyToggle) return

    const { code, symbol } = this.currentCurrency
    currencyToggle.textContent = symbol
    currencyToggle.dataset.currency = code
    currencyToggle.title = `${code} - ${this.currentCurrency.name || code}`
  }

  /**
   * Инициализация валютного селектора
   */
  initCurrencySelector() {
    const currencyToggle = document.querySelector('.currency-toggle')
    let currencyDropdown = document.querySelector('.currency-dropdown')
    
    if (!currencyToggle) {
      console.warn('Элемент выбора валюты не найден')
      return
    }

    // Создаем dropdown если его нет
    if (!currencyDropdown) {
      currencyDropdown = document.createElement('div')
      currencyDropdown.className = 'currency-dropdown'
      currencyToggle.parentElement.appendChild(currencyDropdown)
    }

    // Генерируем содержимое dropdown
    this.updateCurrencyDropdown()

    // Устанавливаем начальное значение
    this.updateCurrencyDisplay()

    // Открытие/закрытие основного dropdown
    currencyToggle.addEventListener('click', (e) => {
      e.preventDefault()
      e.stopPropagation()
      currencyDropdown.classList.toggle('active')
      
      const cryptoSubmenu = currencyDropdown.querySelector('.crypto-submenu')
      if (cryptoSubmenu) cryptoSubmenu.classList.remove('active')
    })

    // Закрытие при клике вне элемента
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.currency-selector')) {
        currencyDropdown.classList.remove('active')
        const cryptoSubmenu = currencyDropdown.querySelector('.crypto-submenu')
        if (cryptoSubmenu) cryptoSubmenu.classList.remove('active')
      }
    })

    // Делегирование событий для опций валют
    currencyDropdown.addEventListener('click', (e) => {
      const option = e.target.closest('.currency-option')
      if (!option) return

      e.stopPropagation()
      
      const currency = option.dataset.currency
      const type = option.dataset.type

      if (currency === 'custom-fiat' || currency === 'custom-crypto') {
        this.showAddCurrencyDialog(currency === 'custom-crypto')
      } else if (option.classList.contains('crypto-toggle')) {
        const cryptoSubmenu = currencyDropdown.querySelector('.crypto-submenu')
        if (cryptoSubmenu) {
          cryptoSubmenu.classList.toggle('active')
        }
      } else if (currency) {
        this.setCurrency(currency)
        currencyDropdown.classList.remove('active')
        const cryptoSubmenu = currencyDropdown.querySelector('.crypto-submenu')
        if (cryptoSubmenu) cryptoSubmenu.classList.remove('active')
      }
    })

    // Обработка криптовалютного подменю
    const cryptoToggle = currencyDropdown.querySelector('.crypto-toggle')
    if (cryptoToggle) {
      cryptoToggle.addEventListener('click', (e) => {
        e.stopPropagation()
        const cryptoSubmenu = currencyDropdown.querySelector('.crypto-submenu')
        if (cryptoSubmenu) {
          cryptoSubmenu.classList.toggle('active')
        }
      })
    }
  }
}