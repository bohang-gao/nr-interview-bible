import DefaultTheme from 'vitepress/theme'
import QuestionBank from '../components/QuestionBank.vue'
import DailyQuestion from '../components/DailyQuestion.vue'
import SelfTest from '../components/SelfTest.vue'
import MockInterview from '../components/MockInterview.vue'
import PrintExport from '../components/PrintExport.vue'
import Layout from '../components/Layout.vue'

import './custom.css'

export default {
  // 扩展默认主题布局：doc-footer-before 插槽注入题目页笔记面板
  extends: DefaultTheme,
  Layout,
  enhanceApp({ app }) {
    app.component('QuestionBank', QuestionBank)
    app.component('DailyQuestion', DailyQuestion)
    app.component('SelfTest', SelfTest)
    app.component('MockInterview', MockInterview)
    app.component('PrintExport', PrintExport)
  },
  setup() {
    if (typeof window !== 'undefined') {
      import('virtual:pwa-register').then(({ registerSW }) => registerSW({ immediate: true }))
    }
  }
}
