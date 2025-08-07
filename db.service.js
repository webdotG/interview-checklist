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

// Единый объект настроек Firebase для всего приложения
const firebaseConfig = {
  apiKey: 'AIzaSyAQCgDpHF9u2i6swE0j0lNxiZmRp9j42oE',
  authDomain: 'interview-checklist.firebaseapp.com',
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
      //нициализация Firebase происходит всегда,
      const firebaseApp = initializeApp(firebaseConfig)
      firestore = getFirestore(firebaseApp)
      auth = getAuth(firebaseApp)
      firebaseInitialized = true
      console.log('Firebase успешно инициализирован')
    } catch (error) {
      console.warn(
        'Ошибка инициализации Firebase, приложение работает в локальном режиме:',
        error,
      )
      firebaseInitialized = false
    }
    if (!firebaseInitialized) {
      console.log(
        'Приложение работает в локальном режиме, Firebase не инициализирован',
      )
    }

    return { firestore, auth }
  },

  async loadInterviews() {
    if (!firebaseInitialized || !firestore) {
      throw new Error('OFFLINE_MODE')
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

  async saveInterview(company, position, salary, answers) {
    try {
      const interviewData = {
        company,
        position,
        salary,
        answers,
        timestamp: new Date().toISOString(),
        userId: auth?.currentUser?.uid || null,
      }

      if (firebaseInitialized && auth?.currentUser) {
        try {
          const userDisplayName =
            auth.currentUser.displayName || auth.currentUser.email
          const dataToSave = {
            ...interviewData,
            timestamp: serverTimestamp(),
            userAgent: navigator.userAgent.substring(0, 100),
            createdAt: new Date().toISOString(),
            userName: userDisplayName,
          }

          const docRef = await addDoc(
            collection(firestore, 'interviews'),
            dataToSave,
          )
          console.log('Сохранено в Firebase с ID:', docRef.id)
          notificationService.show(
            'Интервью сохранено в общую базу и локально!',
            'success',
          )
        } catch (firebaseError) {
          console.warn(
            'Не удалось сохранить в общую базу. Сохраняю только локально.',
            firebaseError,
          )
          notificationService.show(
            'Сохраняю только локально. Войдите, чтобы сохранить в базу.',
            'error',
          )
        }
      }

      this.saveToJson(interviewData)
      return true
    } catch (error) {
      console.error('Ошибка сохранения:', error)
      notificationService.show('Произошла ошибка при сохранении.', 'error')
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

      console.log('JSON-файл скачан')
    } catch (error) {
      console.error('Ошибка при сохранении JSON:', error)
    }
  },
}
