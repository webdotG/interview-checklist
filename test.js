// ├── newHost
// │   ├── index.html
// │   ├── style.css
// │   ├── interviews.html
// │   ├── interviews.css
// │   ├── assets
// │   │   └── KirillGrant.png
// │   ├── core
// │   │   ├── appInitializer.js
// │   │   └── interview.manager.js
// │   ├── services
// │   │   ├── auth.service.js
// │   │   ├── db.service.js
// │   │   └── notification.service.js
// │   ├── ui
// │   │   ├── auth.ui.css
// │   │   ├── auth.ui.js
// │   │   ├── form.validator.js
// │   │   ├── interview.filters.css
// │   │   ├── interview.filters.js
// │   │   ├── interview.renderer.css
// │   │   ├── interview.renderer.js
// │   │   ├── interviews.viewer.css
// │   │   ├── interviews.viewer.js
// │   │   ├── ui.manager.css
// │   │   └── ui.manager.js
// │   └── utils
// │       ├── interview.formatter.js
// │       ├── questions.data.js
// │       ├── questions.renderer.js
// │       └── questions.stats.js

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
