<template>
  <aside
    class="w-80 flex flex-col border-l flex-shrink-0 overflow-hidden animate-fadeIn"
    style="background: var(--bg-secondary); border-color: var(--border)"
  >
    <div
      class="flex items-center justify-between px-4 py-3 border-b"
      style="border-color: var(--border)"
    >
      <div class="flex items-center gap-2">
        <span class="text-base">✨</span>
        <span class="text-sm font-semibold" style="color: var(--text-primary)"
          >AI Assistant</span
        >
        <span
          class="text-xs px-1.5 py-0.5 rounded-full font-medium"
          style="background: var(--accent-light); color: var(--accent-text)"
          >Gemini</span
        >
      </div>
      <button
        @click="$emit('close')"
        class="w-7 h-7 flex items-center justify-center rounded-lg transition-colors"
        style="color: var(--text-tertiary)"
        onmouseover="this.style.background = 'var(--bg-hover)'"
        onmouseout="this.style.background = 'transparent'"
      >
        <svg
          class="w-4 h-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
    </div>

    <div
      v-if="!hasContent"
      class="mx-4 mt-4 px-3 py-2.5 rounded-lg text-xs"
      style="
        background: var(--bg-tertiary);
        border: 1px solid var(--border);
        color: var(--text-secondary);
      "
    >
      ✏️ Add some text to the page first to use AI actions.
    </div>

    <div class="flex-1 overflow-y-auto p-4 space-y-5">
      <section>
        <p
          class="text-xs font-semibold uppercase tracking-wider mb-2"
          style="color: var(--text-tertiary)"
        >
          Quick actions
        </p>
        <div class="grid grid-cols-2 gap-1.5">
          <button
            v-for="action in quickActions"
            :key="action.id"
            @click="runAction(action.id)"
            :disabled="
              ai.loading.value || (!hasContent && action.id !== 'generate')
            "
            class="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-left transition-all"
            :style="
              ai.loading.value || (!hasContent && action.id !== 'generate')
                ? 'opacity: 0.4; cursor: not-allowed; background: var(--bg); border: 1px solid var(--border); color: var(--text-secondary)'
                : 'background: var(--bg); border: 1px solid var(--border); color: var(--text-secondary); cursor: pointer'
            "
            onmouseover="
              if (!this.disabled) {
                this.style.borderColor = 'var(--accent)';
                this.style.color = 'var(--text-primary)';
              }
            "
            onmouseout="
              if (!this.disabled) {
                this.style.borderColor = 'var(--border)';
                this.style.color = 'var(--text-secondary)';
              }
            "
          >
            <span>{{ action.icon }}</span>
            {{ action.label }}
          </button>
        </div>
      </section>

      <section>
        <p
          class="text-xs font-semibold uppercase tracking-wider mb-2"
          style="color: var(--text-tertiary)"
        >
          Change tone
        </p>
        <div class="flex flex-wrap gap-1.5">
          <button
            v-for="tone in tones"
            :key="tone.id"
            @click="runChangeTone(tone.id)"
            :disabled="ai.loading.value || !hasContent"
            class="px-3 py-1 rounded-full text-xs font-medium transition-colors"
            :style="
              ai.loading.value || !hasContent
                ? 'opacity: 0.4; cursor: not-allowed; background: var(--bg-tertiary); color: var(--text-secondary); border: 1px solid var(--border)'
                : 'background: var(--bg-tertiary); color: var(--text-secondary); border: 1px solid var(--border); cursor: pointer'
            "
            onmouseover="
              if (!this.disabled) {
                this.style.background = 'var(--accent-light)';
                this.style.color = 'var(--accent-text)';
              }
            "
            onmouseout="
              if (!this.disabled) {
                this.style.background = 'var(--bg-tertiary)';
                this.style.color = 'var(--text-secondary)';
              }
            "
          >
            {{ tone.label }}
          </button>
        </div>
      </section>

      <section>
        <p
          class="text-xs font-semibold uppercase tracking-wider mb-2"
          style="color: var(--text-tertiary)"
        >
          Generate content
        </p>
        <textarea
          v-model="generatePrompt"
          placeholder="Ask AI to write something…&#10;e.g. 'Write 3 bullet points about this topic'"
          rows="3"
          class="input text-xs resize-none mb-2"
          @keydown.meta.enter="runGenerate"
          @keydown.ctrl.enter="runGenerate"
        ></textarea>
        <button
          @click="runGenerate"
          :disabled="!generatePrompt.trim() || ai.loading.value"
          class="btn-ai w-full justify-center text-xs"
        >
          <span>✨</span> Generate
          <span class="opacity-60 text-xs ml-1">⌘↵</span>
        </button>
      </section>

      <section>
        <p
          class="text-xs font-semibold uppercase tracking-wider mb-2"
          style="color: var(--text-tertiary)"
        >
          Suggested tags
        </p>
        <div v-if="suggestedTags.length === 0">
          <button
            @click="runSuggestTags"
            :disabled="ai.loading.value || !hasContent"
            class="btn-secondary w-full justify-center text-xs"
            :style="
              !hasContent || ai.loading.value
                ? 'opacity: 0.4; cursor: not-allowed'
                : ''
            "
          >
            <span>🏷️</span> Suggest tags for this page
          </button>
        </div>
        <div v-else class="flex flex-wrap gap-1.5">
          <span
            v-for="tag in suggestedTags"
            :key="tag"
            class="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium"
            style="background: var(--accent-light); color: var(--accent-text)"
          >
            {{ tag }}
            <button
              @click="suggestedTags = suggestedTags.filter((t) => t !== tag)"
              class="opacity-60 hover:opacity-100 leading-none ml-0.5"
            >
              ×
            </button>
          </span>
          <button
            @click="runSuggestTags"
            class="text-xs"
            style="color: var(--text-tertiary)"
          >
            ↻ Refresh
          </button>
        </div>
      </section>

      <div v-if="ai.loading.value" class="space-y-2 pt-2">
        <div
          class="flex items-center gap-2 text-xs mb-3"
          style="color: var(--text-tertiary)"
        >
          <div
            class="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse"
          ></div>
          AI is thinking…
        </div>
        <div class="ai-loading h-3 w-full rounded"></div>
        <div class="ai-loading h-3 w-5/6 rounded"></div>
        <div class="ai-loading h-3 w-4/6 rounded"></div>
      </div>

      <section v-if="result && !ai.loading.value">
        <div class="flex items-center justify-between mb-2">
          <p
            class="text-xs font-semibold uppercase tracking-wider"
            style="color: var(--text-tertiary)"
          >
            Result
          </p>
          <button
            @click="copyResult"
            class="text-xs font-medium"
            style="color: var(--accent-text)"
          >
            {{ copied ? "✓ Copied" : "Copy" }}
          </button>
        </div>

        <div
          class="rounded-xl p-3 text-xs leading-relaxed whitespace-pre-wrap"
          style="
            background: var(--bg);
            border: 1px solid var(--border);
            color: var(--text-primary);
            max-height: 220px;
            overflow-y: auto;
          "
        >
          {{ result }}
        </div>

        <div v-if="canApply" class="mt-2 flex gap-2">
          <button
            v-if="applyMode === 'replace'"
            @click="applyReplace"
            class="btn-primary flex-1 justify-center text-xs"
          >
            ✅ Apply to page
          </button>
          <button
            v-if="applyMode === 'insert'"
            @click="applyInsert"
            class="btn-primary flex-1 justify-center text-xs"
          >
            ➕ Insert into page
          </button>
          <button @click="result = ''" class="btn-secondary !px-3 text-xs">
            Discard
          </button>
        </div>
      </section>

      <div
        v-if="ai.error.value"
        class="rounded-xl p-3 text-xs"
        style="background: #fef2f2; border: 1px solid #fecaca; color: #b91c1c"
      >
        ⚠️ {{ ai.error.value }}
        <button @click="ai.error.value = null" class="ml-2 underline">
          Dismiss
        </button>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { usePagesStore, type Block } from "@/stores/pages.store";
import { useAI, type AITone } from "@/composables/useAI";

defineEmits(["close"]);

const pagesStore = usePagesStore();
const ai = useAI();

const result = ref("");
const generatePrompt = ref("");
const suggestedTags = ref<string[]>([]);
const copied = ref(false);
const canApply = ref(false);
const applyMode = ref<"replace" | "insert">("replace");

const quickActions = [
  { id: "summarize", icon: "📝", label: "Summarize" },
  { id: "improve", icon: "✨", label: "Improve" },
  { id: "fix_grammar", icon: "🔤", label: "Fix grammar" },
  { id: "make_shorter", icon: "✂️", label: "Shorter" },
  { id: "make_longer", icon: "📖", label: "Longer" },
  { id: "complete", icon: "🔮", label: "Continue" },
];

const tones = [
  { id: "professional", label: "💼 Professional" },
  { id: "casual", label: "😊 Casual" },
  { id: "formal", label: "🎩 Formal" },
  { id: "friendly", label: "🤗 Friendly" },
];

const hasContent = computed(() => {
  const page = pagesStore.currentPage;
  if (!page) return false;
  return page.blocks.some((b) => {
    const text = b.content?.text;
    return typeof text === "string" && text.trim().length > 0;
  });
});

function getPageText(): string {
  const page = pagesStore.currentPage;
  if (!page) return "";
  return page.blocks
    .filter(
      (b) =>
        typeof b.content?.text === "string" &&
        (b.content.text as string).trim(),
    )
    .map((b) => b.content.text as string)
    .join("\n\n")
    .trim();
}

async function runAction(id: string) {
  const content = getPageText();
  if (!content) return;

  result.value = "";
  canApply.value = id !== "summarize";
  applyMode.value = id === "complete" ? "insert" : "replace";

  let res: { result: string } | null = null;
  if (id === "summarize") res = await ai.summarize(content);
  else if (id === "improve") res = await ai.improve(content);
  else if (id === "fix_grammar") res = await ai.fixGrammar(content);
  else if (id === "make_shorter") res = await ai.makeShorter(content);
  else if (id === "make_longer") res = await ai.makeLonger(content);
  else if (id === "complete") res = await ai.complete(content);

  if (res) result.value = res.result;
}

async function runChangeTone(tone: string) {
  const content = getPageText();
  if (!content) return;
  result.value = "";
  canApply.value = true;
  applyMode.value = "replace";
  const res = await ai.changeTone(content, tone as AITone);
  if (res) result.value = res.result;
}

async function runGenerate() {
  if (!generatePrompt.value.trim()) return;
  const context = getPageText();
  result.value = "";
  canApply.value = true;
  applyMode.value = "insert";
  const res = await ai.generate(generatePrompt.value, context || undefined);
  if (res) {
    result.value = res.result;
    generatePrompt.value = "";
  }
}

async function runSuggestTags() {
  const content = getPageText();
  if (!content) return;
  const res = await ai.suggestTags(content);
  if (res) suggestedTags.value = res.tags;
}

async function copyResult() {
  await navigator.clipboard.writeText(result.value);
  copied.value = true;
  setTimeout(() => (copied.value = false), 2000);
}

async function applyReplace() {
  const page = pagesStore.currentPage;
  if (!page || !result.value) return;

  const PRESERVE_TYPES = ["CODE", "IMAGE", "DIVIDER", "CHECKLIST"];
  const preserved = page.blocks.filter((b) => PRESERVE_TYPES.includes(b.type));

  const lines = result.value.split("\n").filter((l) => l.trim().length > 0);

  const newTextBlocks: Block[] = lines.map((line, i) => ({
    id: `temp-replace-${Date.now()}-${i}`,
    type: "TEXT" as const,
    content: { text: line },
    order: i,
    pageId: page.id,
  }));

  const finalBlocks = [...newTextBlocks, ...preserved].map((b, i) => ({
    ...b,
    order: i,
  }));

  await pagesStore.saveBlocks(page.id, finalBlocks);
  await pagesStore.fetchPage(page.id);
  result.value = "";
}

async function applyInsert() {
  const page = pagesStore.currentPage;
  if (!page || !result.value) return;

  const lines = result.value.split("\n").filter((l) => l.trim().length > 0);
  const baseOrder = page.blocks.length;

  const newBlocks: Block[] = lines.map((line, i) => ({
    id: `temp-insert-${Date.now()}-${i}`,
    type: "TEXT" as const,
    content: { text: line },
    order: baseOrder + i,
    pageId: page.id,
  }));

  const finalBlocks = [...page.blocks, ...newBlocks].map((b, i) => ({
    ...b,
    order: i,
  }));

  await pagesStore.saveBlocks(page.id, finalBlocks);
  await pagesStore.fetchPage(page.id);
  result.value = "";
}
</script>
