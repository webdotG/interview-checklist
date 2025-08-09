import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js'
import { getAuth } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js'
import {
  getFirestore,
  collection,
  addDoc,
  serverTimestamp,
  query,
  orderBy,
  getDocs,
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js'
import { NotificationService } from './notification.service.js'
import { GitHubUserFormatter } from '../utils/formatGithubUserData.js'

const firebaseConfig = {
  apiKey: 'AIzaSyAQCgDpHF9u2i6swE0j0lNxiZmRp9j42oE',
  authDomain: 'interview-checklist.web.app',
  projectId: 'interview-checklist',
  storageBucket: 'interview-checklist.appspot.com',
  messagingSenderId: '1038665174709',
  appId: '1:1038665174709:web:4920e8a7edd6a9c2c938fc',
}

export let firestore
export let auth

let firebaseInitialized = false

const notificationService = new NotificationService()

export const db = {
  async init() {
    if (firebaseInitialized) {
      console.log('Firebase уже инициализирован')
      if (auth?.currentUser) {
        console.log('Пользователь уже авторизован:', auth.currentUser.email)
      }
      return { firestore, auth }
    }

    try {
      const firebaseApp = initializeApp(firebaseConfig)
      firestore = getFirestore(firebaseApp)
      auth = getAuth(firebaseApp)
      firebaseInitialized = true
      console.log('Firebase успешно инициализирован')
    } catch (error) {
      console.warn(
        'Ошибка инициализации Firebase, приложение работает в локальном режиме:',
        error
      )
      firebaseInitialized = false
    }

    if (!firebaseInitialized) {
      console.log(
        'Приложение работает в локальном режиме, Firebase не инициализирован'
      )
    }

    return { firestore, auth }
  },

  async loadInterviews() {
    if (!firebaseInitialized || !firestore) {
      console.log('Локальный режим: загрузка интервью из Firebase невозможна.')
      return []
    }
    try {
      const interviewsRef = collection(firestore, 'interviews')
      const q = query(interviewsRef, orderBy('timestamp', 'desc'))
      const querySnapshot = await getDocs(q)
      const interviews = []
      querySnapshot.forEach((doc) => {
        interviews.push({ id: doc.id, ...doc.data() })
      })
      return interviews
    } catch (error) {
      console.error('Ошибка загрузки из Firebase:', error)
      throw new Error('Не удалось загрузить интервью из базы данных')
    }
  },

  async saveInterview(interviewData) {
    try {
      // Валидация обязательных полей
      if (
        !interviewData.company ||
        !interviewData.position ||
        !interviewData.salary
      ) {
        throw new Error('Обязательные поля не заполнены')
      }

      // Форматируем данные пользователя (GitHub или пустой объект)
      const userData = GitHubUserFormatter.format(auth?.currentUser || null)

      // Собираем данные для записи в Firestore
      const dataToSave = {
        company: interviewData.company || '',
        position: interviewData.position || '',
        salary: interviewData.salary || '',
        answers: interviewData.answers || {},
        companyUrl: interviewData.companyUrl || null,
        vacancyUrl: interviewData.vacancyUrl || null,
        interviewer: interviewData.interviewer || null,
        ...userData,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent.substring(0, 100),
        createdAt: new Date().toISOString(),
      }

      if (firebaseInitialized && auth?.currentUser) {
        try {
          const docRef = await addDoc(
            collection(firestore, 'interviews'),
            dataToSave
          )
          console.log('Сохранено в Firebase, ID:', docRef.id)
          notificationService.show('Интервью сохранено!', 'success')
        } catch (firebaseError) {
          console.warn('Ошибка сохранения в Firebase:', firebaseError)
          notificationService.show(
            'Ошибка сохранения в Firebase. Данные не сохранены.',
            'error'
          )
          return false
        }
      } else {
        // Локальный режим — сохраняем в файл JSON
        this.saveToLocalFile(dataToSave)
        notificationService.show(
          'Интервью сохранено локально (без Firebase)',
          'info'
        )
      }
      return true
    } catch (error) {
      console.error('Ошибка при сохранении интервью:', error)
      notificationService.show(`Ошибка сохранения: ${error.message}`, 'error')
      return false
    }
  },

  saveToLocalFile(data) {
    try {
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: 'application/json',
      })

      const filenameBase = data.company
        ? data.company
            .replace(/[^\w\s-]/g, '')
            .trim()
            .replace(/\s+/g, '_')
        : 'interview'
      const timestamp = new Date()
        .toISOString()
        .replace(/:/g, '-')
        .replace(/\..+/, '')
      const filename = `${filenameBase}_${timestamp}.json`

      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = filename
      document.body.appendChild(link)
      link.click()
      link.remove()
      URL.revokeObjectURL(link.href)
      console.log('Файл сохранён локально:', filename)
    } catch (error) {
      console.error('Ошибка при сохранении локального файла:', error)
      notificationService.show('Ошибка сохранения локального файла', 'error')
    }
  },
}
