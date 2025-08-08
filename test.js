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
