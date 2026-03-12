<template>
  <div
    :class="[
      'block-text w-full outline-none text-gray-800 leading-relaxed min-h-[1.5rem]',
      block.type === 'QUOTE' ? 'border-l-4 border-gray-300 pl-4 italic text-gray-600' : '',
      block.type === 'CALLOUT' ? 'bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-2' : '',
    ]"
    :contenteditable="true"
    :data-placeholder="placeholder"
    @input="onInput"
    @keydown="onKeydown"
    @focus="$emit('focus')"
    @blur="$emit('blur')"
    ref="el"
  ></div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, nextTick } from 'vue'
import type { Block } from '@/stores/pages.store'

const props = defineProps<{ block: Block; isFocused: boolean }>()
const emit = defineEmits(['update', 'focus', 'blur', 'enter', 'backspace-empty', 'slash', 'arrow-up', 'arrow-down'])

const el = ref<HTMLDivElement | null>(null)
const placeholder = 'Type \'/\' for commands…'

onMounted(() => {
  if (el.value && props.block.content.text) {
    el.value.textContent = props.block.content.text as string
  }
})

watch(() => props.isFocused, (focused) => {
  if (focused) nextTick(() => el.value?.focus())
})

watch(() => props.block.content.text, (text) => {
  if (el.value && el.value.textContent !== text) {
    el.value.textContent = text as string
  }
})

function onInput() {
  const text = el.value?.textContent || ''
  emit('update', { ...props.block.content, text })
}

function onKeydown(e: KeyboardEvent) {
  const text = el.value?.textContent || ''

  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    const sel = window.getSelection()
    const offset = sel?.focusOffset || text.length
    const textAfter = text.slice(offset)
    emit('enter', textAfter)
    return
  }

  if (e.key === 'Backspace' && text === '') {
    e.preventDefault()
    emit('backspace-empty')
    return
  }

  if (e.key === '/' && text === '') {
    emit('slash')
    return
  }

  if (e.key === 'ArrowUp') emit('arrow-up')
  if (e.key === 'ArrowDown') emit('arrow-down')
}
</script>

<style scoped>
[contenteditable]:empty:before {
  content: attr(data-placeholder);
  color: #d1d5db;
  pointer-events: none;
}
</style>
