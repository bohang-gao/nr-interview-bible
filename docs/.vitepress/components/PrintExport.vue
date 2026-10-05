<script setup>
function print() {
  window.print()
}
</script>

<template>
  <div class="print-export">
    <h2>打印 / 导出 PDF 步骤</h2>
    <ol class="steps">
      <li>
        本页已收录全部题目（共 300 题），直接使用当前页即可，无需逐题打开
      </li>
      <li>
        按 <kbd>Ctrl</kbd> + <kbd>P</kbd>（macOS 为 <kbd>⌘</kbd> + <kbd>P</kbd>）
        打开浏览器打印对话框，或点击下方按钮
      </li>
      <li>目标打印机选择「另存为 PDF」</li>
      <li>
        在「更多设置」中勾选<b>背景图形</b>，保证徽标与配色正常输出
      </li>
    </ol>
    <p class="actions">
      <button type="button" class="btn primary" @click="print">
        打印 / 导出 PDF
      </button>
    </p>
  </div>
</template>

<style scoped>
.print-export {
  margin: 1rem 0 2rem;
  padding: 1.25rem 1.5rem;
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  background: var(--vp-c-bg-soft);
}
.print-export h2 {
  border: none;
  margin: 0 0 0.75rem;
  font-size: 1.1rem;
}
.steps {
  padding-left: 1.25rem;
  margin: 0 0 1rem;
}
.steps li {
  margin: 0.3rem 0;
}
kbd {
  padding: 0.1rem 0.4rem;
  border: 1px solid var(--vp-c-divider);
  border-bottom-width: 2px;
  border-radius: 4px;
  background: var(--vp-c-bg);
  font-size: 0.85em;
}
.actions {
  margin: 0;
}
.btn {
  padding: 0.35rem 1.1rem;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  transition: border-color 0.25s, color 0.25s;
}
.btn:hover {
  border-color: var(--vp-c-brand-1);
  color: var(--vp-c-brand-1);
}
.btn.primary {
  background: var(--vp-c-brand-1);
  border-color: var(--vp-c-brand-1);
  color: var(--vp-c-white);
}
.btn.primary:hover {
  opacity: 0.9;
  color: var(--vp-c-white);
}
@media print {
  .print-export {
    display: none;
  }
}
</style>
