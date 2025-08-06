let firebaseInitialized = false
let firebaseApp
let firestore
let auth

export const db = {
  async init() {
    // проверка на GitHub Pages
    if (window.location.hostname.includes('github.io')) {
      try {
        const { initializeApp } = await import(
          'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js'
        )
        const { getFirestore } = await import(
          'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js'
        )
        const { getAuth } = await import(
          'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js'
        )

        const firebaseConfig = await import('./firebase-config.js')
        firebaseApp = initializeApp(firebaseConfig.default)
        firestore = getFirestore(firebaseApp)
        auth = getAuth(firebaseApp)
        firebaseInitialized = true

        console.log('Firebase initialized for GitHub Pages')
      } catch (error) {
        console.warn(
          'Firebase initialization failed, falling back to local mode',
          error,
        )
        firebaseInitialized = false
      }
    } else {
      console.log('Running in local mode, Firebase not initialized')
      firebaseInitialized = false
    }
    // return true
    return auth
  },

  async saveInterview(company, position, salary, answers) {
    try {
      const interviewData = {
        company,
        position,
        salary,
        answers,
        timestamp: new Date().toISOString(),
        // userId, если он есть
        userId: auth.currentUser ? auth.currentUser.uid : null,
      }

      // сохранить в Firebase только если он инициализирован
      if (firebaseInitialized && auth.currentUser) {
        try {
          const { collection, addDoc, serverTimestamp } = await import(
            'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js'
          )

          // дополнительные поля для лучшей организации данных
          const dataToSave = {
            ...interviewData,
            timestamp: serverTimestamp(),
            userAgent: navigator.userAgent.substring(0, 100), // для статистики
            createdAt: new Date().toISOString(), // для надежности
          }

          const docRef = await addDoc(
            collection(firestore, 'interviews'),
            dataToSave,
          )
          console.log('Saved to Firebase with ID:', docRef.id)

          // показываем успешное сохранение
          this.showSaveSuccess('Интервью сохранено в общую базу и локально!')
        } catch (firebaseError) {
          console.warn(
            'Не удалось сохранить в общую базу. Сохраняю локально.',
            firebaseError,
          )
          this.showSaveError(
            'Сохраняю только локально. Войдите, чтобы сохранить в базу.',
          )
        }
      }

      // ВСЕГДА СОХРАНЯЕТ ЛОКАЛЬНО
      this.saveToJson(interviewData)
      return true
    } catch (error) {
      console.error('Ошибка сохранения:', error)
      return false
    }
  },

  saveToJson(data) {
    try {
      const filename =
        `Интервью_${data.company}_${data.position}_${data.salary}.json`
          .replace(/\s+/g, '_')
          .replace(/[<>:"\/\\|?*]/g, '')

      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: 'application/json',
      })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      console.log('JSON файл скачан')
    } catch (error) {
      console.error('Ошибка при сохранении JSON:', error)
    }
  },

  // вспомогательные методы для уведомлений
  showSaveSuccess(message) {
    this.showNotification(message, 'success')
  },

  showSaveError(message) {
    this.showNotification(message, 'error')
  },

  showNotification(message, type) {
    // простое уведомление
    const notification = document.createElement('div')
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 15px 20px;
      border-radius: 5px;
      color: white;
      font-weight: bold;
      z-index: 10000;
      max-width: 300px;
      background: ${type === 'success' ? '#4CAF50' : '#f44336'};
    `
    notification.textContent = message

    document.body.appendChild(notification)

    // удаление через 3 секунды
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification)
      }
    }, 3000)
  },
}
