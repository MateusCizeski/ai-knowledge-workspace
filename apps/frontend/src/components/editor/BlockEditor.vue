<template>
  <div class="block-editor" @click.self="addBlockAtEnd">
    <div
      v-for="(block, index) in localBlocks"
      :key="block.id"
      class="block-wrapper group relative"
      draggable="true"
      @dragstart="onDragStart(index, $event)"
      @dragover.prevent="onDragOver(index)"
      @dragleave="dragOverIndex = null"
      @drop.prevent="onDrop(index)"
      :class="{
        dragging: dragIndex === index,
        'drag-over': dragOverIndex === index && dragIndex !== index,
      }"
      @mouseenter="hoveredIndex = index"
      @mouseleave="hoveredIndex = null"
    >
      <div
        v-if="getRemoteCursorOnBlock(block.id)"
        class="absolute -left-1 top-0 bottom-0 w-0.5 rounded-full z-10 pointer-events-none"
        :style="{ background: getRemoteCursorOnBlock(block.id)!.color }"
      >
        <div
          class="absolute -top-5 left-1 text-xs font-medium px-1.5 py-0.5 rounded-md text-white whitespace-nowrap"
          :style="{ background: getRemoteCursorOnBlock(block.id)!.color }"
        >
          {{ getRemoteCursorOnBlock(block.id)!.name }}
        </div>
      </div>

      <div
        :class="[
          'absolute flex items-center gap-0.5 transition-opacity',
          hoveredIndex === index ? 'opacity-100' : 'opacity-0',
        ]"
        style="left: -52px; top: 50%; transform: translateY(-50%)"
      >
        <div
          class="cursor-grab active:cursor-grabbing p-1 rounded"
          style="color: var(--text-tertiary)"
          onmouseover="this.style.background = 'var(--bg-tertiary)'"
          onmouseout="this.style.background = ''"
        >
          <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
            <circle cx="7" cy="6" r="1.5" />
            <circle cx="13" cy="6" r="1.5" />
            <circle cx="7" cy="10" r="1.5" />
            <circle cx="13" cy="10" r="1.5" />
            <circle cx="7" cy="14" r="1.5" />
            <circle cx="13" cy="14" r="1.5" />
          </svg>
        </div>
        <button
          @click="addBlockAfter(index)"
          class="p-1 rounded text-base leading-none transition-colors"
          style="color: var(--text-tertiary)"
          onmouseover="
            this.style.background = 'var(--bg-tertiary)';
            this.style.color = 'var(--text-primary)';
          "
          onmouseout="
            this.style.background = '';
            this.style.color = 'var(--text-tertiary)';
          "
          title="Add block"
        >
          +
        </button>
        <button
          @click="deleteBlock(index)"
          class="p-1 rounded text-sm leading-none transition-colors"
          style="color: var(--text-tertiary)"
          onmouseover="
            this.style.background = '#fef2f2';
            this.style.color = '#ef4444';
          "
          onmouseout="
            this.style.background = '';
            this.style.color = 'var(--text-tertiary)';
          "
          title="Delete"
        >
          ×
        </button>
      </div>

      <div class="relative" v-if="slashMenuIndex === index">
        <BlockTypeSelector
          @select="changeBlockType(index, $event)"
          @close="slashMenuIndex = null"
          @ai-action="handleAIAction"
          @ai-generate="handleAIGenerate"
        />
      </div>

      <div v-if="aiLoadingIndex === index" class="py-3 space-y-2">
        <div class="ai-loading h-3 w-full rounded"></div>
        <div class="ai-loading h-3 w-5/6 rounded"></div>
        <div class="ai-loading h-3 w-3/4 rounded"></div>
      </div>

      <component
        v-else
        :is="blockComponent(block.type)"
        :block="block"
        :is-focused="focusedIndex === index"
        :number="getNumberedIndex(index)"
        @update="updateBlock(index, $event)"
        @focus="onBlockFocus(index, block.id)"
        @blur="focusedIndex = null"
        @enter="splitBlock(index, $event)"
        @backspace-empty="deleteBlock(index, true)"
        @slash="slashMenuIndex = index"
        @arrow-up="focusBlock(index - 1)"
        @arrow-down="focusBlock(index + 1)"
      />
    </div>

    <div
      class="py-4 px-1 text-sm cursor-text select-none"
      style="color: var(--text-placeholder)"
      @click="addBlockAtEnd"
    >
      Click to add ·
      <kbd
        class="px-1 py-0.5 rounded text-xs"
        style="background: var(--bg-tertiary); border: 1px solid var(--border)"
        >/</kbd
      >
      blocks ·
      <kbd
        class="px-1 py-0.5 rounded text-xs"
        style="background: var(--bg-tertiary); border: 1px solid var(--border)"
        >✨</kbd
      >
      AI
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from "vue";
import { usePagesStore, type Block } from "@/stores/pages.store";
import { useAI } from "@/composables/useAI";
import BlockTypeSelector from "./BlockTypeSelector.vue";
import TextBlock from "./blocks/TextBlock.vue";
import HeadingBlock from "./blocks/HeadingBlock.vue";
import CodeBlock from "./blocks/CodeBlock.vue";
import ChecklistBlock from "./blocks/ChecklistBlock.vue";
import DividerBlock from "./blocks/DividerBlock.vue";
import BulletBlock from "./blocks/BulletBlock.vue";
import NumberedBlock from "./blocks/NumberedBlock.vue";
import QuoteBlock from "./blocks/QuoteBlock.vue";
import CalloutBlock from "./blocks/CalloutBlock.vue";
import ImageBlock from "./blocks/ImageBlock.vue";

const props = defineProps<{
  blocks: Block[];
  pageId: string;
  remoteCursors?: Record<
    string,
    { name: string; color: string; blockId: string | null }
  >;
}>();

const emit = defineEmits<{
  "blocks-saved": [blocks: Block[]];
  "cursor-change": [blockId: string | null];
}>();

const pagesStore = usePagesStore();
const ai = useAI();

const localBlocks = ref<Block[]>([...props.blocks]);
const focusedIndex = ref<number | null>(null);
const hoveredIndex = ref<number | null>(null);
const slashMenuIndex = ref<number | null>(null);
const dragIndex = ref<number | null>(null);
const dragOverIndex = ref<number | null>(null);
const aiLoadingIndex = ref<number | null>(null);

let saveTimeout: ReturnType<typeof setTimeout> | null = null;

watch(
  () => props.blocks,
  (b) => {
    localBlocks.value = [...b];
  },
  { deep: true },
);

function blockComponent(type: string) {
  const map: Record<string, any> = {
    TEXT: TextBlock,
    HEADING_1: HeadingBlock,
    HEADING_2: HeadingBlock,
    HEADING_3: HeadingBlock,
    CODE: CodeBlock,
    CHECKLIST: ChecklistBlock,
    DIVIDER: DividerBlock,
    BULLET: BulletBlock,
    NUMBERED: NumberedBlock,
    QUOTE: QuoteBlock,
    CALLOUT: CalloutBlock,
    IMAGE: ImageBlock,
  };
  return map[type] || TextBlock;
}

function getNumberedIndex(blockIndex: number): number {
  let count = 0;
  for (let i = blockIndex; i >= 0; i--) {
    if (localBlocks.value[i].type === "NUMBERED") count++;
    else break;
  }
  return count;
}

function getRemoteCursorOnBlock(blockId: string) {
  if (!props.remoteCursors) return null;
  const entry = Object.values(props.remoteCursors).find(
    (c) => c.blockId === blockId,
  );
  return entry || null;
}

function updateBlock(index: number, content: Record<string, any>) {
  localBlocks.value[index] = { ...localBlocks.value[index], content };
  debouncedSave();
}

function debouncedSave() {
  if (saveTimeout) clearTimeout(saveTimeout);
  saveTimeout = setTimeout(async () => {
    await pagesStore.saveBlocks(props.pageId, localBlocks.value);
    emit("blocks-saved", localBlocks.value);
  }, 800);
}

async function addBlockAfter(index: number, type = "TEXT") {
  const newBlock: Block = {
    id: `temp-${Date.now()}`,
    type,
    content:
      type === "CHECKLIST"
        ? { text: "", checked: false }
        : type === "CALLOUT"
          ? { text: "", emoji: "💡" }
          : { text: "" },
    order: index + 1,
    pageId: props.pageId,
  };
  const updated = [
    ...localBlocks.value.slice(0, index + 1),
    newBlock,
    ...localBlocks.value.slice(index + 1),
  ].map((b, i) => ({ ...b, order: i }));
  localBlocks.value = updated;
  await nextTick();
  focusedIndex.value = index + 1;
  debouncedSave();
}

async function splitBlock(index: number, textAfterCursor: string) {
  const before = { ...localBlocks.value[index] };
  const currentText = (before.content.text as string) || "";
  before.content = {
    ...before.content,
    text: currentText.slice(0, currentText.length - textAfterCursor.length),
  };
  localBlocks.value[index] = before;

  const sameType = ["BULLET", "NUMBERED", "CHECKLIST"].includes(before.type);
  const newBlock: Block = {
    id: `temp-${Date.now()}`,
    type: sameType ? before.type : "TEXT",
    content:
      before.type === "CHECKLIST"
        ? { text: textAfterCursor, checked: false }
        : { text: textAfterCursor },
    order: index + 1,
    pageId: props.pageId,
  };
  localBlocks.value = [
    ...localBlocks.value.slice(0, index + 1),
    newBlock,
    ...localBlocks.value.slice(index + 1),
  ].map((b, i) => ({ ...b, order: i }));
  await nextTick();
  focusedIndex.value = index + 1;
  debouncedSave();
}

async function deleteBlock(index: number, focusPrev = false) {
  if (localBlocks.value.length <= 1) {
    localBlocks.value[0] = { ...localBlocks.value[0], content: { text: "" } };
    debouncedSave();
    return;
  }
  const blockId = localBlocks.value[index].id;
  localBlocks.value = localBlocks.value
    .filter((_, i) => i !== index)
    .map((b, i) => ({ ...b, order: i }));
  if (!blockId.startsWith("temp-")) await pagesStore.deleteBlock(blockId);
  if (focusPrev) focusedIndex.value = Math.max(0, index - 1);
  debouncedSave();
}

async function changeBlockType(index: number, type: string) {
  localBlocks.value[index] = {
    ...localBlocks.value[index],
    type,
    content:
      type === "CHECKLIST"
        ? { text: localBlocks.value[index].content.text || "", checked: false }
        : type === "CALLOUT"
          ? { text: localBlocks.value[index].content.text || "", emoji: "💡" }
          : { text: (localBlocks.value[index].content.text as string) || "" },
  };
  slashMenuIndex.value = null;
  debouncedSave();
}

function addBlockAtEnd() {
  addBlockAfter(localBlocks.value.length - 1);
}

function focusBlock(index: number) {
  if (index >= 0 && index < localBlocks.value.length)
    focusedIndex.value = index;
}

function onBlockFocus(index: number, blockId: string) {
  focusedIndex.value = index;
  emit("cursor-change", blockId.startsWith("temp-") ? null : blockId);
}

function onDragStart(index: number, e: DragEvent) {
  dragIndex.value = index;
  e.dataTransfer!.effectAllowed = "move";
}
function onDragOver(index: number) {
  dragOverIndex.value = index;
}
function onDrop(targetIndex: number) {
  const from = dragIndex.value;
  if (from === null || from === targetIndex) {
    dragIndex.value = null;
    dragOverIndex.value = null;
    return;
  }
  const blocks = [...localBlocks.value];
  const [moved] = blocks.splice(from, 1);
  blocks.splice(targetIndex, 0, moved);
  localBlocks.value = blocks.map((b, i) => ({ ...b, order: i }));
  dragIndex.value = null;
  dragOverIndex.value = null;
  debouncedSave();
}

async function handleAIAction(actionId: string) {
  const idx = slashMenuIndex.value ?? focusedIndex.value;
  if (idx === null) return;
  const block = localBlocks.value[idx];
  const text = (block?.content?.text as string) || "";
  if (!text.trim()) return;
  aiLoadingIndex.value = idx;
  slashMenuIndex.value = null;
  let res: { result: string } | null = null;
  if (actionId === "improve") res = await ai.improve(text);
  else if (actionId === "fix_grammar") res = await ai.fixGrammar(text);
  else if (actionId === "make_shorter") res = await ai.makeShorter(text);
  else if (actionId === "make_longer") res = await ai.makeLonger(text);
  else if (actionId === "complete") res = await ai.complete(text);
  aiLoadingIndex.value = null;
  if (res) updateBlock(idx, { ...block.content, text: res.result });
}

async function handleAIGenerate(prompt: string) {
  const idx = focusedIndex.value ?? localBlocks.value.length - 1;
  const context = localBlocks.value
    .map((b) => b.content.text || "")
    .filter(Boolean)
    .join("\n");
  aiLoadingIndex.value = idx;
  const res = await ai.generate(prompt, context);
  aiLoadingIndex.value = null;
  if (res) {
    const lines = res.result.split("\n").filter((l) => l.trim());
    for (let i = 0; i < lines.length; i++) {
      await addBlockAfter(idx + i, "TEXT");
      const newIdx = idx + i + 1;
      if (newIdx < localBlocks.value.length) {
        localBlocks.value[newIdx] = {
          ...localBlocks.value[newIdx],
          content: { text: lines[i] },
        };
      }
    }
    debouncedSave();
  }
}
</script>

<style scoped>
.block-editor {
  min-height: 300px;
  padding-left: 52px;
}
.block-wrapper {
  padding: 2px 0;
}
</style>
