<template>
  <div class="rounded-xl bg-gray-900 my-2 overflow-hidden">
    <!-- Header -->
    <div class="flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700">
      <select
        v-model="language"
        @change="onLanguageChange"
        class="bg-transparent text-gray-400 text-xs border-none outline-none cursor-pointer"
      >
        <option v-for="lang in languages" :key="lang" :value="lang">{{ lang }}</option>
      </select>
      <button
        @click="copyCode"
        class="text-xs text-gray-400 hover:text-white transition-colors flex items-center gap-1"
      >
        {{ copied ? '✓ Copied' : 'Copy' }}
      </button>
    </div>

    <!-- Code area -->
    <pre
      class="block-code text-sm text-gray-100 font-mono p-4 outline-none overflow-x-auto min-h-[2.5rem] leading-relaxed"
      :contenteditable="true"
      :data-placeholder="'// Write your code here…'"
      @input="onInput"
      @keydown="onKeydown"
      @focus="$emit('focus')"
      @blur="$emit('blur')"
      ref="el"
    ></pre>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, nextTick } from 'vue'
import type { Block } from '@/stores/pages.store'

const props = defineProps<{ block: Block; isFocused: boolean }>()
const emit = defineEmits(['update', 'focus', 'blur', 'enter', 'backspace-empty', 'slash', 'arrow-up', 'arrow-down'])

const el = ref<HTMLPreElement | null>(null)
const copied = ref(false)
const language = ref((props.block.content.language as string) || 'javascript')

const languages = ['javascript', 'typescript', 'python', 'html', 'css', 'json', 'bash', 'sql', 'go', 'rust']

onMounted(() => {
  if (el.value && props.block.content.text) el.value.textContent = props.block.content.text as string
})

watch(() => props.isFocused, (f) => { if (f) nextTick(() => el.value?.focus()) })

function onInput() {
  emit('update', { ...props.block.content, text: el.value?.textContent || '', language: language.value })
}

function onLanguageChange() {
  emit('update', { ...props.block.content, language: language.value })
}

function onKeydown(e: KeyboardEvent) {
  // Tab inserts spaces in code blocks
  if (e.key === 'Tab') {
    e.preventDefault()
    document.execCommand('insertText', false, '  ')
    return
  }
  if (e.key === 'ArrowUp') emit('arrow-up')
  if (e.key === 'ArrowDown') emit('arrow-down')
}

async function copyCode() {
  const text = el.value?.textContent || ''
  await navigator.clipboard.writeText(text)
  copied.value = true
  setTimeout(() => copied.value = false, 2000)
}
</script>

<style scoped>
[contenteditable]:empty:before {
  content: attr(data-placeholder);
  color: #4b5563;
  pointer-events: none;
}
.block-code { white-space: pre; }
</style>
