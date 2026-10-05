import DefaultTheme from 'vitepress/theme'
import QuestionBank from '../components/QuestionBank.vue'
import DailyQuestion from '../components/DailyQuestion.vue'

import './custom.css'

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component('QuestionBank', QuestionBank)
    app.component('DailyQuestion', DailyQuestion)
  }
}
