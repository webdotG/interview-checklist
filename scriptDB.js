let firebaseInitialized = false
let firebaseApp
let firestore

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
        const firebaseConfig = await import('./firebase-config.js')
        firebaseApp = initializeApp(firebaseConfig.default)
        firestore = getFirestore(firebaseApp)
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
    return true
  },

  async saveInterview(company, position, salary, answers) {
    try {
      const interviewData = {
        company,
        position,
        salary,
        answers,
        timestamp: new Date().toISOString(),
      }

      // сохранить в Firebase только если он инициализирован
      if (firebaseInitialized) {
        try {
          const { collection, addDoc, serverTimestamp } = await import(
            'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js'
          )
          await addDoc(collection(firestore, 'interviews'), {
            ...interviewData,
            timestamp: serverTimestamp(),
          })
          console.log('Saved to Firebase')
        } catch (firebaseError) {
          console.warn(
            'Failed to save to Firebase, saving locally only',
            firebaseError,
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
        `Интервью ${data.company} ${data.position} ${data.salary}.json`
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
    } catch (error) {
      console.error('Ошибка при сохранении JSON:', error)
    }
  },
}
