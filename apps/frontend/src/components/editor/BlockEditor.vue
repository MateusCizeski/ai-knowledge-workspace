<template>
  <div class="block-editor" @click="focusLastBlock">
    <div
      v-for="(block, index) in localBlocks"
      :key="block.id"
      class="block-wrapper group relative"
      @mouseenter="hoveredIndex = index"
      @mouseleave="hoveredIndex = null"
    >
      <!-- Block actions (shown on hover) -->
      <div
        :class="[
          'absolute -left-10 top-1/2 -translate-y-1/2 flex items-center gap-0.5 transition-opacity',
          hoveredIndex === index ? 'opacity-100' : 'opacity-0'
        ]"
      >
        <button
          @click="addBlockAfter(index)"
          class="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600 text-lg leading-none"
          title="Add block"
        >+</button>
        <button
          @click="deleteBlock(index)"
          class="p-1 rounded hover:bg-red-50 text-gray-400 hover:text-red-500 text-sm"
          title="Delete block"
        >⋮</button>
      </div>

      <!-- Block type selector (slash command) -->
      <BlockTypeSelector
        v-if="slashMenuIndex === index"
        @select="changeBlockType(index, $event)"
        @close="slashMenuIndex = null"
      />

      <!-- Render block by type -->
      <component
        :is="blockComponent(block.type)"
        :block="block"
        :is-focused="focusedIndex === index"
        @update="updateBlock(index, $event)"
        @focus="focusedIndex = index"
        @blur="focusedIndex = null"
        @enter="splitBlock(index, $event)"
        @backspace-empty="deleteBlock(index, true)"
        @slash="slashMenuIndex = index"
        @arrow-up="focusBlock(index - 1)"
        @arrow-down="focusBlock(index + 1)"
      />
    </div>

    <!-- Add block at end -->
    <div
      class="py-2 px-1 text-gray-300 text-sm cursor-text hover:text-gray-400 transition-colors"
      @click="addBlockAtEnd"
    >
      Click to add a block, or type '/' for commands
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'
import { usePagesStore, type Block } from '@/stores/pages.store'
import BlockTypeSelector from './BlockTypeSelector.vue'
import TextBlock from './blocks/TextBlock.vue'
import HeadingBlock from './blocks/HeadingBlock.vue'
import CodeBlock from './blocks/CodeBlock.vue'
import ChecklistBlock from './blocks/ChecklistBlock.vue'
import DividerBlock from './blocks/DividerBlock.vue'

const props = defineProps<{
  blocks: Block[]
  pageId: string
}>()

const pagesStore = usePagesStore()
const localBlocks = ref<Block[]>([...props.blocks])
const focusedIndex = ref<number | null>(null)
const hoveredIndex = ref<number | null>(null)
const slashMenuIndex = ref<number | null>(null)

// Auto-save debounce
let saveTimeout: ReturnType<typeof setTimeout> | null = null

watch(() => props.blocks, (newBlocks) => {
  localBlocks.value = [...newBlocks]
}, { deep: true })

function blockComponent(type: string) {
  const map: Record<string, any> = {
    TEXT: TextBlock,
    HEADING_1: HeadingBlock,
    HEADING_2: HeadingBlock,
    HEADING_3: HeadingBlock,
    CODE: CodeBlock,
    CHECKLIST: ChecklistBlock,
    DIVIDER: DividerBlock,
    QUOTE: TextBlock,
    CALLOUT: TextBlock,
  }
  return map[type] || TextBlock
}

function updateBlock(index: number, content: Record<string, any>) {
  localBlocks.value[index] = { ...localBlocks.value[index], content }
  debouncedSave()
}

function debouncedSave() {
  if (saveTimeout) clearTimeout(saveTimeout)
  saveTimeout = setTimeout(() => {
    pagesStore.saveBlocks(props.pageId, localBlocks.value)
  }, 800)
}

async function addBlockAfter(index: number) {
  const newBlock: Block = {
    id: `temp-${Date.now()}`,
    type: 'TEXT',
    content: { text: '' },
    order: index + 1,
    pageId: props.pageId,
  }

  // Reorder blocks after insertion point
  const updated = [
    ...localBlocks.value.slice(0, index + 1),
    newBlock,
    ...localBlocks.value.slice(index + 1).map(b => ({ ...b, order: b.order + 1 })),
  ]
  localBlocks.value = updated.map((b, i) => ({ ...b, order: i }))

  await nextTick()
  focusedIndex.value = index + 1
  debouncedSave()
}

async function splitBlock(index: number, textAfterCursor: string) {
  // Update current block (text before cursor)
  const beforeBlock = { ...localBlocks.value[index] }
  const currentText = (beforeBlock.content.text as string) || ''
  const splitPoint = currentText.length - textAfterCursor.length
  beforeBlock.content = { ...beforeBlock.content, text: currentText.slice(0, splitPoint) }
  localBlocks.value[index] = beforeBlock

  // Insert new block with text after cursor
  const newBlock: Block = {
    id: `temp-${Date.now()}`,
    type: 'TEXT',
    content: { text: textAfterCursor },
    order: index + 1,
    pageId: props.pageId,
  }

  localBlocks.value = [
    ...localBlocks.value.slice(0, index + 1),
    newBlock,
    ...localBlocks.value.slice(index + 1),
  ].map((b, i) => ({ ...b, order: i }))

  await nextTick()
  focusedIndex.value = index + 1
  debouncedSave()
}

async function deleteBlock(index: number, focusPrev = false) {
  if (localBlocks.value.length <= 1) {
    // Keep at least one block, just clear it
    localBlocks.value[0] = { ...localBlocks.value[0], content: { text: '' } }
    debouncedSave()
    return
  }

  const blockId = localBlocks.value[index].id
  localBlocks.value = localBlocks.value.filter((_, i) => i !== index).map((b, i) => ({ ...b, order: i }))

  if (!blockId.startsWith('temp-')) {
    await pagesStore.deleteBlock(blockId)
  }

  if (focusPrev) {
    focusedIndex.value = Math.max(0, index - 1)
  }
}

async function changeBlockType(index: number, type: string) {
  localBlocks.value[index] = { ...localBlocks.value[index], type }
  slashMenuIndex.value = null
  debouncedSave()
}

function addBlockAtEnd() {
  addBlockAfter(localBlocks.value.length - 1)
}

function focusBlock(index: number) {
  if (index >= 0 && index < localBlocks.value.length) {
    focusedIndex.value = index
  }
}

function focusLastBlock() {
  // Only if clicking on the empty area at the bottom
}
</script>

<style scoped>
.block-editor {
  min-height: 200px;
}
.block-wrapper {
  padding: 2px 0;
}
</style>
