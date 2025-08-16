export function initializeTheme() {
  const themeSelector = document.getElementById('theme-selector')
  const body = document.body

  /**
   * применяет выбранную тему к body и сохраняет ее в localStorage
   * @param {string} themeName - 'new-dark', 'old-light'
   */
  const applyTheme = (themeName) => {
    // удаляем все классы тем, чтобы избежать конфликтов
    body.classList.remove('new-dark-theme', 'old-light-theme', 'old-dark-theme')

    // если выбрана не тема по умолчанию, добавляем соответствующий класс
    if (themeName !== 'new-light') {
      body.classList.add(`${themeName}-theme`)
    }

    localStorage.setItem('theme', themeName)
  }

  // есть ли сохраненная тема в localStorage.
  const currentTheme = localStorage.getItem('theme') || 'new-light'
  applyTheme(currentTheme)
  
  // устанавливаем в выпадающем списке выбранную тему
  if (themeSelector) {
    themeSelector.value = currentTheme
  }

  // обработчик события на смену значения в селекторе
  if (themeSelector) {
    themeSelector.addEventListener('change', (event) => {
      const selectedTheme = event.target.value
      applyTheme(selectedTheme)
    })
  }
}
