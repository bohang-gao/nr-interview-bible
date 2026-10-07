<script setup>
import { computed } from 'vue'
import DefaultTheme from 'vitepress/theme'
import { useData } from 'vitepress'
import QuestionNotes from './QuestionNotes.vue'

const { page } = useData()

// 仅题目页（docs 下 chNN-qMMM 模式的 .md）注入笔记面板
const isQuestionPage = computed(() => /ch\d{2}-q\d{3}\.md$/.test(page.value.filePath || ''))
</script>

<template>
  <DefaultTheme.Layout>
    <template #doc-footer-before>
      <QuestionNotes v-if="isQuestionPage" />
    </template>
  </DefaultTheme.Layout>
</template>
