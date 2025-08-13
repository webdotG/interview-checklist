export class CurrencyValidator {
  constructor() {
    // Константы для изображений валют

    this.CURRENCY_IMAGES = {
      fiat: {
        RUB: 'https://flagcdn.com/w40/ru.png',
        USD: 'https://flagcdn.com/w40/us.png',
        EUR: 'https://flagcdn.com/w40/eu.png',
        GBP: 'https://flagcdn.com/w40/gb.png',
        JPY: 'https://flagcdn.com/w40/jp.png',
        CNY: 'https://flagcdn.com/w40/cn.png',
        KRW: 'https://flagcdn.com/w40/kr.png',
        INR: 'https://flagcdn.com/w40/in.png',
        CHF: 'https://flagcdn.com/w40/ch.png',
        CAD: 'https://flagcdn.com/w40/ca.png',
        AUD: 'https://flagcdn.com/w40/au.png',
        SEK: 'https://flagcdn.com/w40/se.png',
        NOK: 'https://flagcdn.com/w40/no.png',
        DKK: 'https://flagcdn.com/w40/dk.png',
        PLN: 'https://flagcdn.com/w40/pl.png',
        CZK: 'https://flagcdn.com/w40/cz.png',
        HUF: 'https://flagcdn.com/w40/hu.png',
        TRY: 'https://flagcdn.com/w40/tr.png',
        BRL: 'https://flagcdn.com/w40/br.png',
        MXN: 'https://flagcdn.com/w40/mx.png',
        ARS: 'https://flagcdn.com/w40/ar.png',
        CLP: 'https://flagcdn.com/w40/cl.png',
        COP: 'https://flagcdn.com/w40/co.png',
        PEN: 'https://flagcdn.com/w40/pe.png',
        UYU: 'https://flagcdn.com/w40/uy.png',
        ZAR: 'https://flagcdn.com/w40/za.png',
        EGP: 'https://flagcdn.com/w40/eg.png',
        ILS: 'https://flagcdn.com/w40/il.png',
        AED: 'https://flagcdn.com/w40/ae.png',
        SAR: 'https://flagcdn.com/w40/sa.png',
        QAR: 'https://flagcdn.com/w40/qa.png',
        KWD: 'https://flagcdn.com/w40/kw.png',
        BHD: 'https://flagcdn.com/w40/bh.png',
        OMR: 'https://flagcdn.com/w40/om.png',
        JOD: 'https://flagcdn.com/w40/jo.png',
        LBP: 'https://flagcdn.com/w40/lb.png',
      },
      crypto: {
        BTC: 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png',
        ETH: 'https://assets.coingecko.com/coins/images/279/large/ethereum.png',
        USDT: 'https://assets.coingecko.com/coins/images/325/large/Tether.png',
        USDC: 'https://assets.coingecko.com/coins/images/6319/large/USD_Coin_icon.png',
        BNB: 'https://assets.coingecko.com/coins/images/825/large/bnb-icon2_2x.png',
        XRP: 'https://assets.coingecko.com/coins/images/44/large/xrp-symbol-white-128.png',
        ADA: 'https://assets.coingecko.com/coins/images/975/large/cardano.png',
        SOL: 'https://assets.coingecko.com/coins/images/4128/large/solana.png',
        DOT: 'https://assets.coingecko.com/coins/images/12171/large/polkadot.png',
        MATIC:
          'https://assets.coingecko.com/coins/images/4713/large/matic-token-icon.png',
      },
    }

    // Расширенная система валют с поддержкой изображений
    this.currentCurrency = {
      code: 'RUB',
      symbol: '₽',
      type: 'fiat',
      image: this.CURRENCY_IMAGES.fiat['RUB'],
      name: 'Russian Ruble',
    }

    // Обновленные предустановленные валюты
    this.currencies = {
      fiat: {
        RUB: {
          symbol: '₽',
          name: 'Russian Ruble',
          image: this.CURRENCY_IMAGES.fiat['RUB'],
        },
        USD: {
          symbol: '$',
          name: 'US Dollar',
          image: this.CURRENCY_IMAGES.fiat['USD'],
        },
        EUR: {
          symbol: '€',
          name: 'Euro',
          image: this.CURRENCY_IMAGES.fiat['EUR'],
        },
        GBP: {
          symbol: '£',
          name: 'British Pound',
          image: this.CURRENCY_IMAGES.fiat['GBP'],
        },
        CNY: {
          symbol: '¥',
          name: 'Chinese Yuan',
          image: this.CURRENCY_IMAGES.fiat['CNY'],
        },
        INR: {
          symbol: '₹',
          name: 'Indian Rupee',
          image: this.CURRENCY_IMAGES.fiat['INR'],
        },
        CHF: {
          symbol: 'CHF',
          name: 'Swiss Franc',
          image: this.CURRENCY_IMAGES.fiat['CHF'],
        },
        SEK: {
          symbol: 'kr',
          name: 'Swedish Krona',
          image: this.CURRENCY_IMAGES.fiat['SEK'],
        },
        CZK: {
          symbol: 'Kč',
          name: 'Czech Koruna',
          image: this.CURRENCY_IMAGES.fiat['CZK'],
        },
        TRY: {
          symbol: '₺',
          name: 'Turkish Lira',
          image: this.CURRENCY_IMAGES.fiat['TRY'],
        },
      },
      crypto: {
        BTC: {
          symbol: '₿',
          name: 'Bitcoin',
          image: this.CURRENCY_IMAGES.crypto['BTC'],
        },
        ETH: {
          symbol: 'Ξ',
          name: 'Ethereum',
          image: this.CURRENCY_IMAGES.crypto['ETH'],
        },
        USDT: {
          symbol: 'USDT',
          name: 'Tether',
          image: this.CURRENCY_IMAGES.crypto['USDT'],
        },
        USDC: {
          symbol: 'USDC',
          name: 'USD Coin',
          image: this.CURRENCY_IMAGES.crypto['USDC'],
        },
      },
    }

    // Пользовательские валюты (добавляемые динамически)
    this.customCurrencies = new Map()
    this.currentCurrency = this.getCurrency('USD') || this.getDefaultCurrency()

    // Удаляем ошибочные console.log с несуществующими переменными
    console.log('Current currency:', this.currentCurrency)
  }

  getDefaultCurrency() {
    return {
      code: 'USD',
      symbol: '$',
      name: 'US Dollar',
      type: 'fiat',
      image: 'https://flagcdn.com/us.svg',
    }
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
      return {
        ...this.customCurrencies.get(code),
        code,
        type: 'custom',
        image: null,
      }
    }

    return null
  }

  /**
   * Обновление отображения текущей валюты
   */
  updateCurrencyDisplay() {
    const currencyToggle = document.querySelector('.currency-toggle')
    if (!currencyToggle) return

    const { code, symbol, image, type } = this.currentCurrency
    currencyToggle.innerHTML = ''

    // Создаем контейнер для содержимого
    const contentWrapper = document.createElement('div')
    contentWrapper.className = 'currency-toggle-content'
    contentWrapper.style.display = 'flex'
    contentWrapper.style.alignItems = 'center'
    contentWrapper.style.gap = '8px'

    if (image) {
      const img = document.createElement('img')
      img.onerror = () => {
        console.error('Failed to load currency image:', image)
        // Запасной вариант - отображаем только символ
        img.style.display = 'none'
        symbolSpan.style.marginLeft = '0'
      }
      img.src = image
      img.crossOrigin = 'Anonymous'
      img.alt = code
      img.className =
        type === 'crypto'
          ? 'currency-flag crypto-flag'
          : 'currency-flag currency-toggle-flag'
      img.style.width = type === 'crypto' ? '20px' : '20px'
      img.style.height = type === 'crypto' ? '20px' : '15px'
      img.style.borderRadius = type === 'crypto' ? '50%' : '2px'
      img.style.objectFit = 'contain'
      contentWrapper.appendChild(img)
    }

    // Добавляем символ валюты
    const symbolSpan = document.createElement('span')
    symbolSpan.className = 'currency-toggle-symbol'
    symbolSpan.textContent = symbol
    contentWrapper.appendChild(symbolSpan)

    currencyToggle.appendChild(contentWrapper)
    currencyToggle.dataset.currency = code
    currencyToggle.title = `${code} - ${this.currentCurrency.name || code}`
  }

  /**
   * Генерация HTML для одной опции валюты
   */
  generateCurrencyOptionHTML(currency, code, type) {
    const isFiat = type === 'fiat'
    const isCrypto = type === 'crypto'

    const imgClass = isCrypto ? 'currency-flag crypto-flag' : 'currency-flag'
    const placeholderClass = isCrypto
      ? 'currency-flag-placeholder crypto-placeholder'
      : 'currency-flag-placeholder'

    const img = currency.image
      ? `<img src="${currency.image}" alt="${code}" class="${imgClass}">`
      : `<div class="${placeholderClass}"></div>`

    // Для криптовалют показываем только код, символ и название
    if (isCrypto) {
      return `
        <div class="currency-option" data-currency="${code}" data-type="${type}">
          ${img}
          <span class="currency-code">${code}</span>
          <span class="currency-symbol">${currency.symbol}</span>
          <span class="currency-name">${currency.name}</span>
        </div>
      `
    }

    // Для фиатных валют стандартная структура
    return `
      <div class="currency-option" data-currency="${code}" data-type="${type}">
        ${img}
        <span class="currency-code">${code}</span>
        <span class="currency-symbol">${currency.symbol}</span>
        ${
          currency.name
            ? `<span class="currency-name">${currency.name}</span>`
            : ''
        }
      </div>
    `
  }

  /**
   * Генерация HTML для валютного селектора
   */
  generateCurrencyDropdownHTML() {
    let html = ''

    // Популярные фиатные валюты
    const popularFiat = ['USD', 'EUR', 'GBP', 'JPY', 'CNY', 'RUB']
    html += '<div class="currency-group">'
    html += '<div class="currency-group-title">Популярные</div>'

    popularFiat.forEach((code) => {
      const currency = this.currencies.fiat[code]
      if (currency) {
        html += this.generateCurrencyOptionHTML(currency, code, 'fiat')
      }
    })
    html += '</div>'

    // Все остальные фиатные валюты
    const otherFiat = Object.keys(this.currencies.fiat).filter(
      (code) => !popularFiat.includes(code)
    )
    if (otherFiat.length > 0) {
      html += '<div class="currency-group">'
      html += '<div class="currency-group-title">Другие</div>'
      otherFiat.forEach((code) => {
        const currency = this.currencies.fiat[code]
        html += this.generateCurrencyOptionHTML(currency, code, 'fiat')
      })
      html += '</div>'
    }

    // Криптовалюты
    html += '<div class="currency-group crypto-group">'
    html +=
      '<div class="currency-group-title crypto-toggle" data-toggle="crypto">'
    html += '<span>Крипто</span><span class="dropdown-arrow">▼</span>'
    html += '</div>'
    html += '<div class="crypto-submenu">'
    Object.keys(this.currencies.crypto).forEach((code) => {
      const currency = this.currencies.crypto[code]
      html += this.generateCurrencyOptionHTML(currency, code, 'crypto')
    })
    html +=
      '<div class="currency-option add-option" data-currency="custom-crypto" data-type="custom">'
    html += '<div class="currency-flag-placeholder crypto-placeholder"></div>'
    html += '<span>Добавить крипто ...</span>'
    html += '</div>'
    html += '</div>'
    html += '</div>'

    // Пользовательские валюты
    if (this.customCurrencies.size > 0) {
      html += '<div class="currency-group">'
      html += '<div class="currency-group-title">Пользовательские валюты</div>'
      this.customCurrencies.forEach((currency, code) => {
        html += this.generateCurrencyOptionHTML(currency, code, 'custom')
      })
      html += '</div>'
    }

    // Опция добавления пользовательской валюты
    html += '<div class="currency-group">'
    html +=
      '<div class="currency-option add-option" data-currency="custom-fiat" data-type="custom">'
    html += '<div class="currency-flag-placeholder"></div>'
    html += '<span>+ Добавить валюту</span>'
    html += '</div>'
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

    // Переустанавливаем обработчики после обновления HTML
    this.setupDropdownHandlers()
  }

  /**
   * Настройка обработчиков для dropdown
   */
  setupDropdownHandlers() {
    const currencyDropdown = document.querySelector('.currency-dropdown')
    if (!currencyDropdown) return

    // Обработчик для переключения криптовалютного подменю
    const cryptoToggle = currencyDropdown.querySelector('.crypto-toggle')
    if (cryptoToggle) {
      cryptoToggle.addEventListener('click', (e) => {
        e.preventDefault()
        e.stopPropagation()

        const cryptoGroup = cryptoToggle.closest('.crypto-group')
        const cryptoSubmenu = cryptoGroup.querySelector('.crypto-submenu')

        if (cryptoSubmenu) {
          cryptoGroup.classList.toggle('active')
          cryptoSubmenu.classList.toggle('active')
        }
      })
    }
  }

  /**
   * Добавление пользовательской валюты
   */
  addCustomCurrency(code, symbol, name = '', imageUrl = null) {
    if (!code || !symbol) return false

    // Проверяем, что код не занят
    if (this.getCurrency(code)) {
      console.warn(`Валюта с кодом ${code} уже существует`)
      return false
    }

    // Валидация кода валюты
    const cleanCode = code
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '')
      .substring(0, 10)
    const cleanSymbol = symbol.trim().substring(0, 10)
    const cleanName = name.trim().substring(0, 50)

    if (cleanCode.length < 2) {
      console.warn('Код валюты должен содержать минимум 2 символа')
      return false
    }

    this.customCurrencies.set(cleanCode, {
      symbol: cleanSymbol,
      name: cleanName || `Custom Currency (${cleanCode})`,
      image: imageUrl,
    })

    return true
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
    this.updateCurrencyDropdown()
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

    // Открытие/закрытие dropdown
    currencyToggle.addEventListener('click', (e) => {
      e.preventDefault()
      e.stopPropagation()
      currencyDropdown.classList.toggle('active')
    })

    // Закрытие при клике вне элемента
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.currency-selector')) {
        currencyDropdown.classList.remove('active')
        // Также закрываем криптовалютное подменю
        const cryptoGroup = currencyDropdown.querySelector('.crypto-group')
        const cryptoSubmenu = currencyDropdown.querySelector('.crypto-submenu')
        if (cryptoGroup && cryptoSubmenu) {
          cryptoGroup.classList.remove('active')
          cryptoSubmenu.classList.remove('active')
        }
      }
    })

    // Обработка выбора валюты
    currencyDropdown.addEventListener('click', (e) => {
      // Проверяем, не является ли клик по заголовку криптовалют
      if (e.target.closest('.crypto-toggle')) {
        return // Обработка уже настроена в setupDropdownHandlers
      }

      const option = e.target.closest('.currency-option')
      if (!option) return

      const currency = option.dataset.currency
      if (currency === 'custom-fiat' || currency === 'custom-crypto') {
        // Обработка добавления пользовательской валюты
        console.log('Добавление новой валюты')
      } else if (currency) {
        this.setCurrency(currency)
        currencyDropdown.classList.remove('active')
        // Закрываем криптовалютное подменю
        const cryptoGroup = currencyDropdown.querySelector('.crypto-group')
        const cryptoSubmenu = currencyDropdown.querySelector('.crypto-submenu')
        if (cryptoGroup && cryptoSubmenu) {
          cryptoGroup.classList.remove('active')
          cryptoSubmenu.classList.remove('active')
        }
      }
    })
  }
}