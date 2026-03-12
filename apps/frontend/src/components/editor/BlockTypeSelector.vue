<template>
  <div
    class="absolute z-50 left-0 mt-1 w-64 bg-white rounded-xl border border-gray-200 shadow-lg py-1 overflow-hidden"
    ref="menuEl"
  >
    <div class="px-3 py-2 text-xs font-medium text-gray-400 border-b border-gray-100">Block type</div>
    <div class="max-h-60 overflow-y-auto py-1">
      <button
        v-for="item in filteredItems"
        :key="item.type"
        @click="$emit('select', item.type); $emit('close')"
        class="w-full flex items-center gap-3 px-3 py-2 text-sm hover:bg-gray-50 text-left transition-colors"
      >
        <span class="text-lg w-7 text-center">{{ item.icon }}</span>
        <div>
          <div class="font-medium text-gray-800">{{ item.label }}</div>
          <div class="text-xs text-gray-400">{{ item.description }}</div>
        </div>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'

const emit = defineEmits<{
  select: [type: string]
  close: []
}>()

const menuEl = ref<HTMLDivElement | null>(null)
const search = ref('')

const blockTypes = [
  { type: 'TEXT', icon: '¶', label: 'Text', description: 'Plain paragraph' },
  { type: 'HEADING_1', icon: 'H1', label: 'Heading 1', description: 'Large section header' },
  { type: 'HEADING_2', icon: 'H2', label: 'Heading 2', description: 'Medium section header' },
  { type: 'HEADING_3', icon: 'H3', label: 'Heading 3', description: 'Small section header' },
  { type: 'CHECKLIST', icon: '✅', label: 'To-do', description: 'Checklist item' },
  { type: 'CODE', icon: '<>', label: 'Code', description: 'Code block with syntax' },
  { type: 'QUOTE', icon: '"', label: 'Quote', description: 'Blockquote' },
  { type: 'CALLOUT', icon: '💡', label: 'Callout', description: 'Highlighted note' },
  { type: 'DIVIDER', icon: '—', label: 'Divider', description: 'Horizontal rule' },
]

const filteredItems = computed(() =>
  search.value
    ? blockTypes.filter(i => i.label.toLowerCase().includes(search.value.toLowerCase()))
    : blockTypes
)

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') emit('close')
}

// Close on outside click
function onClickOutside(e: MouseEvent) {
  if (menuEl.value && !menuEl.value.contains(e.target as Node)) emit('close')
}

onMounted(() => {
  document.addEventListener('keydown', onKeydown)
  document.addEventListener('mousedown', onClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('keydown', onKeydown)
  document.removeEventListener('mousedown', onClickOutside)
})
</script>
