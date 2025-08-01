export class FirebaseService {
  constructor() {
    this.firestore = null
    this.initialized = false
  }

  async initialize() {
    if (this.initialized) {
      return true
    }

    try {
      console.log('Инициализируем Firebase...')

      const { initializeApp } = await import(
        'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js'
      )
      const { getFirestore } = await import(
        'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js'
      )

      const firebaseConfig = await import('./firebase-config.js')
      const firebaseApp = initializeApp(firebaseConfig.default)
      this.firestore = getFirestore(firebaseApp)
      this.initialized = true

      console.log('Firebase успешно инициализирован')
      return true
    } catch (error) {
      console.error('Ошибка инициализации Firebase:', error)
      throw new Error(`Не удалось подключиться к Firebase: ${error.message}`)
    }
  }

  async loadInterviews() {
    if (!this.initialized) {
      await this.initialize()
    }

    try {
      console.log('Загружаем интервью из Firestore...')

      const { collection, getDocs, orderBy, query } = await import(
        'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js'
      )

      const interviewsQuery = query(
        collection(this.firestore, 'interviews'),
        orderBy('timestamp', 'desc'),
      )

      const querySnapshot = await getDocs(interviewsQuery)
      const interviews = []

      querySnapshot.forEach((doc) => {
        const data = doc.data()
        interviews.push({
          id: doc.id,
          ...data,
        })
      })

      console.log(`Загружено ${interviews.length} интервью`)
      return interviews
    } catch (error) {
      console.error('Ошибка при загрузке интeрвью:', error)

      // проверка на офлайн режим
      if (
        error.code === 'unavailable' ||
        error.message.includes('offline') ||
        error.message.includes('backend')
      ) {
        throw new Error('OFFLINE_MODE')
      } else {
        throw new Error(`Ошибка загрузки данных: ${error.message}`)
      }
    }
  }

  isInitialized() {
    return this.initialized
  }
}
