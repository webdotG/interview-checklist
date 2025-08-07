// import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js'
// import { getAuth } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js'
// import {
//   getFirestore,
//   collection,
//   addDoc,
//   serverTimestamp,
//   query,
//   orderBy,
//   getDocs,
// } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js'
// import { NotificationService } from './notification.service.js'

// // Единый объект настроек Firebase для всего приложения
// const firebaseConfig = {
//   apiKey: 'AIzaSyAQCgDpHF9u2i6swE0j0lNxiZmRp9j42oE',
//   authDomain: 'interview-checklist.firebaseapp.com',
//   projectId: 'interview-checklist',
//   storageBucket: 'interview-checklist.appspot.com',
//   messagingSenderId: '1038665174709',
//   appId: '1:1038665174709:web:4920e8a7edd6a9c2c938fc',
// }

// export let firestore
// export let auth

// let firebaseInitialized = false

// const notificationService = new NotificationService()

// export const db = {
//   async init() {
//     if (firebaseInitialized) {
//       console.log('Firebase уже инициализирован')
//       if (auth?.currentUser) {
//         console.log('Пользователь уже авторизован:', auth.currentUser.email)
//       }
//       return { firestore, auth }
//     }

//     try {
//       //нициализация Firebase происходит всегда,
//       const firebaseApp = initializeApp(firebaseConfig)
//       firestore = getFirestore(firebaseApp)
//       auth = getAuth(firebaseApp)
//       firebaseInitialized = true
//       console.log('Firebase успешно инициализирован')
//     } catch (error) {
//       console.warn(
//         'Ошибка инициализации Firebase, приложение работает в локальном режиме:',
//         error,
//       )
//       firebaseInitialized = false
//     }
//     if (!firebaseInitialized) {
//       console.log(
//         'Приложение работает в локальном режиме, Firebase не инициализирован',
//       )
//     }

//     return { firestore, auth }
//   },

//   async loadInterviews() {
//     if (!firebaseInitialized || !firestore) {
//       throw new Error('OFFLINE_MODE')
//     }

//     try {
//       const interviewsRef = collection(firestore, 'interviews')
//       const q = query(interviewsRef, orderBy('timestamp', 'desc'))
//       const querySnapshot = await getDocs(q)

//       const interviews = []
//       querySnapshot.forEach((doc) => {
//         interviews.push({ id: doc.id, ...doc.data() })
//       })

//       return interviews
//     } catch (error) {
//       console.error('Ошибка загрузки из Firebase:', error)
//       throw new Error('Не удалось загрузить интервью из базы данных')
//     }
//   },

//   async saveInterview(company, position, salary, answers) {
//     try {
//       const interviewData = {
//         company,
//         position,
//         salary,
//         answers,
//         timestamp: new Date().toISOString(),
//         userId: auth?.currentUser?.uid || null,
//       }

//       if (firebaseInitialized && auth?.currentUser) {
//         try {
//           const userDisplayName =
//             auth.currentUser.displayName || auth.currentUser.email
//           const dataToSave = {
//             ...interviewData,
//             timestamp: serverTimestamp(),
//             userAgent: navigator.userAgent.substring(0, 100),
//             createdAt: new Date().toISOString(),
//             userName: userDisplayName,
//           }

//           const docRef = await addDoc(
//             collection(firestore, 'interviews'),
//             dataToSave,
//           )
//           console.log('Сохранено в Firebase с ID:', docRef.id)
//           notificationService.show(
//             'Интервью сохранено в общую базу и локально!',
//             'success',
//           )
//         } catch (firebaseError) {
//           console.warn(
//             'Не удалось сохранить в общую базу. Сохраняю только локально.',
//             firebaseError,
//           )
//           notificationService.show(
//             'Сохраняю только локально. Войдите, чтобы сохранить в базу.',
//             'error',
//           )
//         }
//       }

//       this.saveToJson(interviewData)
//       return true
//     } catch (error) {
//       console.error('Ошибка сохранения:', error)
//       notificationService.show('Произошла ошибка при сохранении.', 'error')
//       return false
//     }
//   },

//   saveToJson(data) {
//     try {
//       const filename =
//         `Интервью_${data.company}_${data.position}_${data.salary}.json`
//           .replace(/\s+/g, '_')
//           .replace(/[<>:"\/\\|?*]/g, '')

//       const blob = new Blob([JSON.stringify(data, null, 2)], {
//         type: 'application/json',
//       })
//       const url = URL.createObjectURL(blob)
//       const a = document.createElement('a')
//       a.href = url
//       a.download = filename
//       document.body.appendChild(a)
//       a.click()
//       document.body.removeChild(a)
//       URL.revokeObjectURL(url)

//       console.log('JSON-файл скачан')
//     } catch (error) {
//       console.error('Ошибка при сохранении JSON:', error)
//     }
//   },
// }

//----------------------------------------------------------------------------------------------------------

// import {
//   getAuth,
//   signInWithPopup,
//   GithubAuthProvider,
//   signOut,
//   onAuthStateChanged,
//   setPersistence,
//   browserLocalPersistence,
// } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js'

// export class AuthService {
//   constructor(auth) {
//     this.auth = auth

//     this.provider = new GithubAuthProvider()

//     // для хранения колбэка AUTH

//     this.onAuthStateChangedCallback = () => {}

//     // установка постоянства сессии в localStorage.

//     setPersistence(this.auth, browserLocalPersistence)
//       .then(() => {
//         // подписка на изменения статуса авторизации.

//         onAuthStateChanged(this.auth, (user) => {
//           // колбэк здесь AUTH

//           this.onAuthStateChangedCallback(user)

//           if (user) {
//             console.log(
//               'Пользователь авторизован:',

//               user.displayName || user.email,
//             )
//           } else {
//             console.log('Пользователь не авторизован.')
//           }
//         })
//       })

//       .catch((error) => {
//         console.error('Ошибка установки постоянства сессии:', error)
//       })
//   }

//   // метод для установки колбэка AUTH

//   setOnAuthStateChangedCallback(callback) {
//     this.onAuthStateChangedCallback = callback
//   }

//   async signInWithGitHub() {
//     try {
//       // Firebase сам проверит наличие сессии лишняя проверка не нужна.

//       const result = await signInWithPopup(this.auth, this.provider)

//       const user = result.user

//       return user
//     } catch (error) {
//       console.error('Ошибка входа через GitHub:', error)

//       return null
//     }
//   }

//   async signOut() {
//     try {
//       if (this.auth) {
//         await signOut(this.auth)

//         console.log('Выход выполнен успешно')
//       }
//     } catch (error) {
//       console.error('Ошибка при выходе:', error)
//     }
//   }

//   getCurrentUser() {
//     // Firebase всегда будет возвращать текущего пользователя setPersistence и onAuthStateChanged.

//     return this.auth ? this.auth.currentUser : null
//   }
// }

// import {
//   getAuth,
//   signInWithPopup,
//   signInWithRedirect,
//   getRedirectResult,
//   GithubAuthProvider,
//   signOut,
//   onAuthStateChanged,
//   setPersistence,
//   browserLocalPersistence,
// } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js'

// export class AuthService {
//   constructor(auth) {
//     this.auth = auth
//     this.provider = new GithubAuthProvider()

//     // Добавляем дополнительные права доступа
//     this.provider.addScope('user:email')

//     // Колбэк для изменений состояния авторизации
//     this.onAuthStateChangedCallback = () => {}

//     // Флаг для отслеживания попыток авторизации
//     this.isAuthenticating = false

//     this.initAuth()
//   }

//   async initAuth() {
//     try {
//       // Установка постоянства сессии
//       await setPersistence(this.auth, browserLocalPersistence)

//       // Проверяем результат редиректа (если использовался signInWithRedirect)
//       const result = await getRedirectResult(this.auth)
//       if (result) {
//         console.log(
//           'Пользователь вошел через редирект:',
//           result.user.displayName || result.user.email,
//         )
//         this.isAuthenticating = false
//       }

//       // Подписка на изменения статуса авторизации
//       onAuthStateChanged(this.auth, (user) => {
//         this.onAuthStateChangedCallback(user)
//         if (user) {
//           console.log(
//             'Пользователь авторизован:',
//             user.displayName || user.email,
//           )
//         } else {
//           console.log('Пользователь не авторизован.')
//         }
//       })
//     } catch (error) {
//       console.error('Ошибка инициализации авторизации:', error)
//       this.isAuthenticating = false
//     }
//   }

//   // Метод для установки колбэка
//   setOnAuthStateChangedCallback(callback) {
//     this.onAuthStateChangedCallback = callback
//   }

//   // Умный вход с fallback'ом на redirect
//   async signInWithGitHub() {
//     if (this.isAuthenticating) {
//       console.log('Авторизация уже в процессе...')
//       return null
//     }

//     this.isAuthenticating = true

//     try {
//       // Сначала пробуем popup
//       console.log('Попытка входа через GitHub popup...')
//       const result = await signInWithPopup(this.auth, this.provider)

//       const credential = GithubAuthProvider.credentialFromResult(result)
//       const token = credential?.accessToken
//       const user = result.user

//       console.log(
//         'Успешный вход через GitHub popup:',
//         user.displayName || user.email,
//       )
//       this.isAuthenticating = false
//       return user
//     } catch (error) {
//       console.error('Popup не сработал:', error.code, error.message)

//       // Если popup заблокирован или закрыт пользователем, пробуем redirect
//       if (this.shouldUseRedirect(error)) {
//         console.log('Переходим к redirect авторизации...')

//         try {
//           // Сохраняем флаг в localStorage для отслеживания redirect'а
//           localStorage.setItem('auth-redirect-pending', 'true')
//           await signInWithRedirect(this.auth, this.provider)
//           // После redirect произойдет перезагрузка страницы
//           return null
//         } catch (redirectError) {
//           console.error('Ошибка redirect авторизации:', redirectError)
//           this.isAuthenticating = false
//           throw redirectError
//         }
//       } else {
//         // Другие ошибки (нет интернета, проблемы с GitHub и т.д.)
//         this.isAuthenticating = false
//         this.logDetailedError(error)
//         throw error
//       }
//     }
//   }

//   // Определяем, нужно ли использовать redirect
//   shouldUseRedirect(error) {
//     const redirectCodes = [
//       'auth/popup-blocked',
//       'auth/popup-closed-by-user',
//       'auth/cancelled-popup-request',
//       'auth/operation-not-allowed',
//     ]

//     return (
//       redirectCodes.includes(error.code) ||
//       error.message.includes('popup') ||
//       error.message.includes('blocked')
//     )
//   }

//   // Детальное логирование ошибок
//   logDetailedError(error) {
//     console.error('Детали ошибки авторизации:')
//     console.error('Code:', error.code)
//     console.error('Message:', error.message)

//     if (error.customData) {
//       console.error('Email:', error.customData.email)
//     }

//     // Дополнительная диагностика
//     console.error('User Agent:', navigator.userAgent)
//     console.error('Popup blocked by browser:', this.isPopupBlocked())
//   }

//   // Проверка блокировки popup'ов
//   isPopupBlocked() {
//     try {
//       const popup = window.open('', '_blank', 'width=1,height=1')
//       if (!popup || popup.closed) {
//         return true
//       }
//       popup.close()
//       return false
//     } catch (e) {
//       return true
//     }
//   }

//   // Проверяем, возвращаемся ли мы после redirect'а
//   isReturningFromRedirect() {
//     return localStorage.getItem('auth-redirect-pending') === 'true'
//   }

//   // Очищаем флаг redirect'а
//   clearRedirectFlag() {
//     localStorage.removeItem('auth-redirect-pending')
//   }

//   // Альтернативный метод через редирект (для прямого вызова)
//   async signInWithGitHubRedirect() {
//     try {
//       console.log('Принудительный вход через redirect...')
//       localStorage.setItem('auth-redirect-pending', 'true')
//       await signInWithRedirect(this.auth, this.provider)
//     } catch (error) {
//       console.error('Ошибка входа через GitHub (redirect):', error)
//       localStorage.removeItem('auth-redirect-pending')
//     }
//   }

//   async signOut() {
//     try {
//       if (this.auth) {
//         await signOut(this.auth)
//         console.log('Выход выполнен успешно')

//         // Очищаем все связанные флаги
//         this.clearRedirectFlag()
//         this.isAuthenticating = false
//       }
//     } catch (error) {
//       console.error('Ошибка при выходе:', error)
//     }
//   }

//   getCurrentUser() {
//     return this.auth ? this.auth.currentUser : null
//   }

//   // Проверка состояния авторизации
//   isAuthenticated() {
//     return !!this.getCurrentUser()
//   }

//   // Получение отображаемого имени пользователя
//   getUserDisplayName() {
//     const user = this.getCurrentUser()
//     return user ? user.displayName || user.email || 'Пользователь' : null
//   }
// }

//=============================================================================================

//   /**
//    * общее количество вопросов
//    * @returns {number} Общее количество вопросов
//    */
//   _countTotalQuestions() {
//     let count = 0
//     questionsStructure.forEach((section) => {
//       section.subsections.forEach((subsection) => {
//         count += subsection.questions.length
//       })
//     })
//     return count
//   }

//   /**
//    * количество отвеченных вопросов
//    * @param {Object} answers Ответы
//    * @returns {number} Количество отвеченных вопросов
//    */
//   _countAnsweredQuestions(answers) {
//     let count = 0

//     Object.values(answers).forEach((section) => {
//       Object.values(section).forEach((subsection) => {
//         Object.values(subsection).forEach((answer) => {
//           if (answer.checked || (answer.note && answer.note.length > 0)) {
//             count++
//           }
//         })
//       })
//     })

//     return count
//   }

//   /**
//    * статистика заполнения формы
//    * @returns {Object} Статистика
//    */
//   getCompletionStats() {
//     const data = this.collectFormData()

//     return {
//       totalQuestions: data.totalQuestions,
//       answeredQuestions: data.answeredQuestions,
//       completionPercentage: Math.round(
//         (data.answeredQuestions / data.totalQuestions) * 100,
//       ),
//       hasRequiredFields: !!(data.company && data.position),
//       canSubmit: data.answeredQuestions > 0 && data.company && data.position,
//     }
//   }
// }
