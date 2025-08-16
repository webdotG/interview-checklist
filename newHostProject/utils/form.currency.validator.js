/**
 * @fileoverview Класс для отображением валют и токенов
 */

export class CurrencyValidator {
  constructor() {
    // Константы для изображений валют
    this.CURRENCY_IMAGES = {
      fiat: {
        RUB: 'https://flagcdn.com/w40/ru.png',
        USD: 'https://flagcdn.com/w40/us.png',
        EUR: 'https://flagcdn.com/w40/eu.png',
        GBP: 'https://flagcdn.com/w40/gb.png',
        CNY: 'https://flagcdn.com/w40/cn.png',
      },
      crypto: {
        BTC: 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png',
        ETH: 'https://assets.coingecko.com/coins/images/279/large/ethereum.png',
        TON: 'https://assets.coingecko.com/coins/images/17980/large/TON_token_logo.png',
        USDT: 'https://assets.coingecko.com/coins/images/325/large/Tether.png',
      },
    };

    // Упрощенный список валют с изображениями
    this.currencies = {
      fiat: {
        RUB: {
          symbol: '₽',
          name: 'Russian Ruble',
          image: this.CURRENCY_IMAGES.fiat.RUB,
        },
        USD: {
          symbol: '$',
          name: 'US Dollar',
          image: this.CURRENCY_IMAGES.fiat.USD,
        },
        EUR: {
          symbol: '€',
          name: 'Euro',
          image: this.CURRENCY_IMAGES.fiat.EUR,
        },
        GBP: {
          symbol: '£',
          name: 'British Pound',
          image: this.CURRENCY_IMAGES.fiat.GBP,
        },
        CNY: {
          symbol: '¥',
          name: 'Chinese Yuan',
          image: this.CURRENCY_IMAGES.fiat.CNY,
        },
      },
      crypto: {
        BTC: {
          symbol: '₿',
          name: 'Bitcoin',
          image: this.CURRENCY_IMAGES.crypto.BTC,
        },
        ETH: {
          symbol: 'Ξ',
          name: 'Ethereum',
          image: this.CURRENCY_IMAGES.crypto.ETH,
        },
        TON: {
          symbol: 'TON',
          name: 'Toncoin', 
          image: this.CURRENCY_IMAGES.crypto.TON,
        },
        USDT: {
          symbol: 'USDT',
          name: 'Tether',
          image: this.CURRENCY_IMAGES.crypto.USDT,
        },
      },
    };

    // Установка валюты по умолчанию.
    this.currentCurrency = this.getDefaultCurrency();
    console.log('Current currency:', this.currentCurrency);
  }

  /**
   * Возвращает валюту по умолчанию.
   * @returns {object} Объект валюты по умолчанию.
   */
  getDefaultCurrency() {
    return {
      code: 'USD',
      symbol: '$',
      name: 'US Dollar',
      type: 'fiat',
      image: this.CURRENCY_IMAGES.fiat.USD,
    };
  }

  /**
   * Получает валюту по коду.
   * @param {string} code Код валюты (например, 'USD').
   * @returns {object|null} Объект валюты или null, если не найдена.
   */
  getCurrency(code) {
    if (this.currencies.fiat[code]) {
      return { ...this.currencies.fiat[code], code, type: 'fiat' };
    }
    if (this.currencies.crypto[code]) {
      return { ...this.currencies.crypto[code], code, type: 'crypto' };
    }
    return null;
  }

  /**
   * Обновляет отображение текущей валюты на кнопке.
   */
  updateCurrencyDisplay() {
    const currencyToggle = document.querySelector('.currency-toggle');
    if (!currencyToggle) return;

    const { code } = this.currentCurrency;
    currencyToggle.innerHTML = '';

    const symbolSpan = document.createElement('span');
    symbolSpan.className = 'currency-toggle-symbol';
    // На кнопке будет отображаться код валюты (например, 'USD').
    symbolSpan.textContent = code;
    currencyToggle.appendChild(symbolSpan);

    currencyToggle.dataset.currency = code;
    currencyToggle.title = `${code} - ${this.currentCurrency.name || code}`;
  }

  /**
   * Генерирует HTML для одной опции валюты.
   * @param {object} currency Объект валюты.
   * @param {string} code Код валюты.
   * @param {string} type Тип валюты ('fiat' или 'crypto').
   * @returns {string} HTML-разметка опции.
   */
  generateCurrencyOptionHTML(currency, code, type) {
    // Используем изображение в выпадающем списке
    const isCrypto = type === 'crypto';
    const imgClass = isCrypto ? 'currency-flag crypto-flag' : 'currency-flag';

    const imgTag = `<img src="${currency.image}" alt="${code}" class="${imgClass}">`;

    return `
      <div class="currency-option" data-currency="${code}" data-type="${type}">
        ${imgTag}
        <span class="currency-code">${code}</span>
        <span class="currency-symbol">${currency.symbol}</span>
        ${
          currency.name
            ? `<span class="currency-name">${currency.name}</span>`
            : ''
        }
      </div>
    `;
  }

  /**
   * Генерирует HTML для выпадающего списка валют.
   * @returns {string} HTML-разметка списка.
   */
  generateCurrencyDropdownHTML() {
    let html = '';

    html += '<div class="currency-group">';
    html += '<div class="currency-group-title">Фиат</div>';
    Object.keys(this.currencies.fiat).forEach((code) => {
      const currency = this.currencies.fiat[code];
      html += this.generateCurrencyOptionHTML(currency, code, 'fiat');
    });
    html += '</div>';

    html += '<div class="currency-group">';
    html += '<div class="currency-group-title">Крипто</div>';
    Object.keys(this.currencies.crypto).forEach((code) => {
      const currency = this.currencies.crypto[code];
      html += this.generateCurrencyOptionHTML(currency, code, 'crypto');
    });
    html += '</div>';

    return html;
  }

  /**
   * Обновляет содержимое выпадающего списка.
   */
  updateCurrencyDropdown() {
    const currencyDropdown = document.querySelector('.currency-dropdown');
    if (!currencyDropdown) return;
    currencyDropdown.innerHTML = this.generateCurrencyDropdownHTML();
  }

  /**
   * Устанавливает текущую валюту.
   * @param {string} currencyCode Код валюты для установки.
   */
  setCurrency(currencyCode) {
    if (!currencyCode) return;
    const currency = this.getCurrency(currencyCode);
    if (!currency) {
      console.warn(`Валюта с кодом ${currencyCode} не найдена`);
      return;
    }
    this.currentCurrency = currency;
    this.updateCurrencyDisplay();
    this.updateCurrencyDropdown();


    // console.log(`Выбрана новая валюта: ${this.currentCurrency.code}`);
  }

  /**
   * Инициализирует функционал селектора валюты.
   */
  initCurrencySelector() {
    const currencyToggle = document.querySelector('.currency-toggle');
    let currencyDropdown = document.querySelector('.currency-dropdown');

    if (!currencyToggle) {
      console.warn('Элемент выбора валюты не найден');
      return;
    }

    if (!currencyDropdown) {
      currencyDropdown = document.createElement('div');
      currencyDropdown.className = 'currency-dropdown';
      currencyToggle.parentElement.appendChild(currencyDropdown);
    }

    this.updateCurrencyDropdown();
    this.updateCurrencyDisplay();

    currencyToggle.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      currencyDropdown.classList.toggle('active');
    });

    document.addEventListener('click', (e) => {
      if (!e.target.closest('.currency-selector')) {
        currencyDropdown.classList.remove('active');
      }
    });

    currencyDropdown.addEventListener('click', (e) => {
      const option = e.target.closest('.currency-option');
      if (!option) return;

      const currency = option.dataset.currency;
      if (currency) {
        this.setCurrency(currency);
        currencyDropdown.classList.remove('active');
      }
    });
  }
}
