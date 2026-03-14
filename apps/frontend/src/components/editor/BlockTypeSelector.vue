<template>
  <div
    ref="menuEl"
    class="absolute z-50 left-0 w-72 rounded-xl overflow-hidden animate-fadeIn"
    style="
      background: var(--bg);
      border: 1px solid var(--border);
      box-shadow: var(--shadow-lg);
      top: calc(100% + 4px);
    "
  >
    <div class="px-3 pt-3 pb-2">
      <input
        v-model="search"
        ref="searchInput"
        :placeholder="mode === 'ai' ? 'Ask AI anything…' : 'Search blocks…'"
        class="input text-xs"
        @keydown.esc="$emit('close')"
        @keydown.enter.prevent="handleEnter"
        @keydown.arrow-up.prevent="navigateUp"
        @keydown.arrow-down.prevent="navigateDown"
      />
    </div>

    <div class="flex px-3 pb-2 gap-1">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        @click="
          mode = tab.id;
          search = '';
          activeIndex = 0;
        "
        :class="[
          'text-xs px-2.5 py-1 rounded-md font-medium transition-colors',
          mode === tab.id
            ? 'btn-primary !py-0.5 !px-2'
            : 'btn-ghost !py-0.5 !px-2',
        ]"
      >
        {{ tab.icon }} {{ tab.label }}
      </button>
    </div>

    <div class="h-px" style="background: var(--border)"></div>

    <div v-if="mode === 'blocks'" class="max-h-60 overflow-y-auto py-1">
      <button
        v-for="(item, i) in filteredBlocks"
        :key="item.type"
        @click="selectBlock(item.type)"
        :class="[
          'w-full flex items-center gap-3 px-3 py-2 text-left transition-colors text-sm',
          activeIndex === i ? 'block-active' : '',
        ]"
        style="color: var(--text-primary)"
        onmouseover="this.style.background = 'var(--bg-tertiary)'"
        onmouseout="this.style.background = ''"
        @mouseenter="activeIndex = i"
      >
        <span
          class="w-8 h-8 rounded-lg flex items-center justify-center text-base flex-shrink-0"
          style="background: var(--bg-tertiary)"
          >{{ item.icon }}</span
        >
        <div>
          <div class="font-medium text-xs" style="color: var(--text-primary)">
            {{ item.label }}
          </div>
          <div class="text-xs" style="color: var(--text-tertiary)">
            {{ item.description }}
          </div>
        </div>
      </button>
      <div
        v-if="filteredBlocks.length === 0"
        class="px-4 py-6 text-center text-xs"
        style="color: var(--text-tertiary)"
      >
        No blocks found
      </div>
    </div>

    <div v-if="mode === 'ai'" class="py-2">
      <div class="px-3 pb-2">
        <p class="text-xs mb-2" style="color: var(--text-tertiary)">
          Quick AI actions
        </p>
        <div class="space-y-0.5">
          <button
            v-for="action in aiActions"
            :key="action.id"
            @click="
              $emit('ai-action', action.id);
              $emit('close');
            "
            class="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-left transition-colors"
            style="color: var(--text-secondary)"
            onmouseover="
              this.style.background = 'var(--bg-tertiary)';
              this.style.color = 'var(--text-primary)';
            "
            onmouseout="
              this.style.background = '';
              this.style.color = 'var(--text-secondary)';
            "
          >
            <span>{{ action.icon }}</span>
            {{ action.label }}
          </button>
        </div>
      </div>
      <div
        v-if="search.trim()"
        class="px-3 pt-2 border-t"
        style="border-color: var(--border)"
      >
        <button
          @click="
            $emit('ai-generate', search);
            $emit('close');
          "
          class="btn-ai w-full justify-center text-xs"
        >
          ✨ Generate: "{{ search }}"
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from "vue";

const emit = defineEmits(["select", "close", "ai-action", "ai-generate"]);

const menuEl = ref<HTMLDivElement | null>(null);
const searchInput = ref<HTMLInputElement | null>(null);
const search = ref("");
const mode = ref<"blocks" | "ai">("blocks");
const activeIndex = ref(0);

const tabs = [
  { id: "blocks", icon: "⬜", label: "Blocks" },
  { id: "ai", icon: "✨", label: "AI" },
];

const blockTypes = [
  { type: "TEXT", icon: "¶", label: "Text", description: "Plain paragraph" },
  {
    type: "HEADING_1",
    icon: "H1",
    label: "Heading 1",
    description: "Large section header",
  },
  {
    type: "HEADING_2",
    icon: "H2",
    label: "Heading 2",
    description: "Medium section header",
  },
  {
    type: "HEADING_3",
    icon: "H3",
    label: "Heading 3",
    description: "Small section header",
  },
  {
    type: "CHECKLIST",
    icon: "✅",
    label: "To-do",
    description: "Checklist item",
  },
  {
    type: "CODE",
    icon: "</>",
    label: "Code",
    description: "Code block with syntax",
  },
  { type: "QUOTE", icon: '"', label: "Quote", description: "Blockquote" },
  {
    type: "CALLOUT",
    icon: "💡",
    label: "Callout",
    description: "Highlighted note",
  },
  {
    type: "BULLET",
    icon: "•",
    label: "Bullet list",
    description: "Unordered list item",
  },
  {
    type: "NUMBERED",
    icon: "1.",
    label: "Numbered",
    description: "Ordered list item",
  },
  {
    type: "DIVIDER",
    icon: "—",
    label: "Divider",
    description: "Horizontal rule",
  },
  {
    type: "IMAGE",
    icon: "🖼️",
    label: "Image",
    description: "Upload or paste image",
  },
];

const aiActions = [
  { id: "summarize", icon: "📝", label: "Summarize page" },
  { id: "improve", icon: "✨", label: "Improve writing" },
  { id: "fix_grammar", icon: "🔤", label: "Fix grammar" },
  { id: "make_shorter", icon: "✂️", label: "Make shorter" },
  { id: "make_longer", icon: "📖", label: "Make longer" },
  { id: "complete", icon: "🔮", label: "Continue writing" },
];

const filteredBlocks = computed(() =>
  search.value
    ? blockTypes.filter((i) =>
        i.label.toLowerCase().includes(search.value.toLowerCase()),
      )
    : blockTypes,
);

function selectBlock(type: string) {
  emit("select", type);
  emit("close");
}

function handleEnter() {
  if (mode.value === "blocks" && filteredBlocks.value[activeIndex.value]) {
    selectBlock(filteredBlocks.value[activeIndex.value].type);
  } else if (mode.value === "ai" && search.value.trim()) {
    emit("ai-generate", search.value);
    emit("close");
  }
}

function navigateUp() {
  activeIndex.value = Math.max(0, activeIndex.value - 1);
}
function navigateDown() {
  activeIndex.value = Math.min(
    filteredBlocks.value.length - 1,
    activeIndex.value + 1,
  );
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === "Escape") emit("close");
}
function onClickOutside(e: MouseEvent) {
  if (menuEl.value && !menuEl.value.contains(e.target as Node)) emit("close");
}

onMounted(() => {
  document.addEventListener("keydown", onKeydown);
  document.addEventListener("mousedown", onClickOutside);
  nextTick(() => searchInput.value?.focus());
});
onUnmounted(() => {
  document.removeEventListener("keydown", onKeydown);
  document.removeEventListener("mousedown", onClickOutside);
});
</script>
