<template>
  <div class="flex items-start gap-3 py-0.5">
    <input
      type="checkbox"
      :checked="block.content.checked as boolean"
      @change="toggleCheck"
      class="mt-1 w-4 h-4 rounded border-gray-300 text-indigo-600 cursor-pointer flex-shrink-0 accent-indigo-600"
    />
    <div
      :class="[
        'flex-1 outline-none text-gray-800 leading-relaxed min-h-[1.5rem]',
        block.content.checked ? 'line-through text-gray-400' : ''
      ]"
      :contenteditable="true"
      data-placeholder="To-do…"
      @input="onInput"
      @keydown="onKeydown"
      @focus="$emit('focus')"
      @blur="$emit('blur')"
      ref="el"
    ></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, nextTick } from 'vue'
import type { Block } from '@/stores/pages.store'

const props = defineProps<{ block: Block; isFocused: boolean }>()
const emit = defineEmits(['update', 'focus', 'blur', 'enter', 'backspace-empty', 'slash', 'arrow-up', 'arrow-down'])

const el = ref<HTMLDivElement | null>(null)

onMounted(() => {
  if (el.value && props.block.content.text) el.value.textContent = props.block.content.text as string
})

watch(() => props.isFocused, (f) => { if (f) nextTick(() => el.value?.focus()) })

function onInput() {
  emit('update', { ...props.block.content, text: el.value?.textContent || '' })
}

function toggleCheck() {
  emit('update', { ...props.block.content, checked: !props.block.content.checked })
}

function onKeydown(e: KeyboardEvent) {
  const text = el.value?.textContent || ''
  if (e.key === 'Enter') { e.preventDefault(); emit('enter', '') }
  if (e.key === 'Backspace' && text === '') { e.preventDefault(); emit('backspace-empty') }
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
