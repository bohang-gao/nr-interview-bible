import DefaultTheme from 'vitepress/theme'
import QuestionBank from '../components/QuestionBank.vue'
import DailyQuestion from '../components/DailyQuestion.vue'
import SelfTest from '../components/SelfTest.vue'
import PrintExport from '../components/PrintExport.vue'

import './custom.css'

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component('QuestionBank', QuestionBank)
    app.component('DailyQuestion', DailyQuestion)
    app.component('SelfTest', SelfTest)
    app.component('PrintExport', PrintExport)
  }
}
