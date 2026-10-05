import { defineConfig } from 'vitepress'
import { withMermaid } from 'vitepress-plugin-mermaid'

// 8 个章节目录名（与 PLAN.md 第 5 节一致）
const chapters = [
  '01-无线基础与演进',
  '02-物理层',
  '03-MIMO与波束管理',
  '04-空口协议栈',
  '05-关键信令流程',
  '06-组网与架构',
  '07-射频与网优',
  '08-场景与软技能',
  '09-NTN卫星通信'
]

export default withMermaid(defineConfig({
  lang: 'zh-CN',
  title: 'NR通信面试宝典',
  description: '5G NR 通信面试知识库：8 大知识域、300+ 题，覆盖物理层、MIMO、空口协议栈、信令流程、组网架构、射频网优等高频面试考点',

  themeConfig: {
    nav: [
      { text: '首页', link: '/' },
      { text: '题库', link: '/bank' },
      { text: '每日一题', link: '/daily' },
      { text: '自测', link: '/selftest' },
      { text: '打印/PDF', link: '/print' }
    ],
    sidebar: [
      {
        text: '开始',
        items: [
          { text: '首页', link: '/' },
          { text: '题库', link: '/bank' },
          { text: '每日一题', link: '/daily' },
          { text: '自测', link: '/selftest' },
          { text: '打印/PDF', link: '/print' }
        ]
      },
      ...chapters.map((dir) => ({
        text: dir.slice(3),
        link: `/${dir}/index`
      }))
    ],
    search: {
      provider: 'local',
      options: {
        translations: {
          button: { buttonText: '搜索文档', buttonAriaLabel: '搜索文档' },
          modal: {
            noResultsText: '未找到相关结果',
            resetButtonTitle: '清除查询条件',
            displayDetails: '显示详细列表',
            hideDetails: '隐藏详细列表',
            footer: {
              selectText: '选择',
              navigateText: '切换',
              closeText: '关闭'
            }
          }
        },
        // 中文按 CJK 单字切分，保证子串可命中
        miniSearch: {
          options: {
            tokenize: (text) =>
              text
                .toLowerCase()
                .match(/[\u4e00-\u9fa5]|[a-z0-9]+/g) ?? []
          },
          searchOptions: {
            tokenize: (text) =>
              text
                .toLowerCase()
                .match(/[\u4e00-\u9fa5]|[a-z0-9]+/g) ?? []
          }
        }
      }
    },
    mermaidPlugin: {
      class: 'mermaid'
    }
  }
}))

