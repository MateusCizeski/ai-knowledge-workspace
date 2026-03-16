<template>
  <Teleport to="body">
    <div
      class="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]"
      style="background: rgba(0, 0, 0, 0.5); backdrop-filter: blur(4px)"
      @mousedown.self="$emit('close')"
    >
      <div
        class="w-full max-w-xl rounded-2xl overflow-hidden animate-fadeIn"
        style="
          background: var(--bg);
          border: 1px solid var(--border);
          box-shadow: var(--shadow-lg);
        "
      >
        <div
          class="flex items-center gap-3 px-4 py-3 border-b"
          style="border-color: var(--border)"
        >
          <svg
            class="w-4 h-4 flex-shrink-0"
            style="color: var(--text-tertiary)"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0"
            />
          </svg>
          <input
            ref="inputEl"
            v-model="query"
            placeholder="Search pages and content…"
            class="flex-1 text-sm bg-transparent outline-none"
            style="color: var(--text-primary)"
            @keydown.esc="$emit('close')"
            @keydown.arrow-down.prevent="navigate(1)"
            @keydown.arrow-up.prevent="navigate(-1)"
            @keydown.enter.prevent="selectActive"
          />
          <kbd
            class="text-xs px-1.5 py-0.5 rounded"
            style="
              background: var(--bg-tertiary);
              color: var(--text-tertiary);
              border: 1px solid var(--border);
            "
            >Esc</kbd
          >
        </div>

        <div class="max-h-96 overflow-y-auto">
          <div v-if="loading" class="p-4 space-y-3">
            <div v-for="i in 3" :key="i" class="flex gap-3 items-start">
              <div class="ai-loading w-6 h-6 rounded-lg flex-shrink-0"></div>
              <div class="flex-1 space-y-1.5">
                <div class="ai-loading h-3 w-3/4 rounded"></div>
                <div class="ai-loading h-2.5 w-full rounded"></div>
              </div>
            </div>
          </div>

          <div
            v-else-if="!query.trim()"
            class="py-8 text-center text-sm"
            style="color: var(--text-tertiary)"
          >
            Start typing to search…
          </div>

          <div
            v-else-if="results.length === 0 && !loading"
            class="py-8 text-center text-sm"
            style="color: var(--text-tertiary)"
          >
            No results for "<strong>{{ query }}</strong
            >"
          </div>

          <div v-else>
            <button
              v-for="(result, i) in results"
              :key="result.id"
              @click="goToPage(result.id)"
              @mouseenter="activeIndex = i"
              :class="[
                'w-full flex items-start gap-3 px-4 py-3 text-left transition-colors',
                activeIndex === i ? 'active-result' : '',
              ]"
              :style="
                activeIndex === i ? 'background: var(--accent-light)' : ''
              "
              onmouseover="this.style.background = 'var(--bg-secondary)'"
              onmouseout="
                this.style.background = this.classList.contains('active-result')
                  ? 'var(--accent-light)'
                  : ''
              "
            >
              <span class="text-lg mt-0.5 flex-shrink-0">
                {{ result.icon }}
              </span>

              <div class="flex-1 min-w-0">
                <p
                  class="text-sm font-medium truncate"
                  style="color: var(--text-primary)"
                  v-html="highlight(result.title, query)"
                ></p>

                <div v-if="result.matches?.length" class="mt-1 space-y-0.5">
                  <p
                    v-for="match in result.matches"
                    :key="match.blockId"
                    class="text-xs truncate"
                    style="color: var(--text-secondary)"
                    v-html="highlight(match.excerpt, query)"
                  ></p>
                </div>

                <div
                  v-if="result.tags?.length"
                  class="flex gap-1 mt-1.5 flex-wrap"
                >
                  <span
                    v-for="tag in result.tags"
                    :key="tag.name"
                    class="text-xs px-1.5 py-0 rounded-full"
                    :style="{ background: tag.color + '20', color: tag.color }"
                    >{{ tag.name }}</span
                  >
                </div>
              </div>

              <span
                class="text-xs flex-shrink-0 mt-0.5"
                style="color: var(--text-tertiary)"
              >
                {{ timeAgo(result.updatedAt) }}
              </span>
            </button>
          </div>
        </div>

        <div
          class="flex items-center gap-4 px-4 py-2 border-t text-xs"
          style="border-color: var(--border); color: var(--text-tertiary)"
        >
          <span
            ><kbd
              class="px-1 rounded"
              style="
                background: var(--bg-tertiary);
                border: 1px solid var(--border);
              "
              >↑↓</kbd
            >
            navigate</span
          >
          <span
            ><kbd
              class="px-1 rounded"
              style="
                background: var(--bg-tertiary);
                border: 1px solid var(--border);
              "
              >↵</kbd
            >
            open</span
          >
          <span class="ml-auto"
            >{{ results.length }} result{{
              results.length !== 1 ? "s" : ""
            }}</span
          >
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, nextTick } from "vue";
import { useRouter } from "vue-router";
import { api } from "@/services/api";

const emit = defineEmits(["close"]);
const router = useRouter();

const inputEl = ref<HTMLInputElement | null>(null);
const query = ref("");
const loading = ref(false);
const activeIndex = ref(0);
const results = ref<any[]>([]);

let debounceTimer: ReturnType<typeof setTimeout> | null = null;

onMounted(() => nextTick(() => inputEl.value?.focus()));

watch(query, (val) => {
  if (debounceTimer) clearTimeout(debounceTimer);
  if (!val.trim()) {
    results.value = [];
    loading.value = false;
    return;
  }
  loading.value = true;
  debounceTimer = setTimeout(() => search(val.trim()), 300);
});

async function search(q: string) {
  try {
    const { data } = await api.get("/search", { params: { q } });
    results.value = data.results;
    activeIndex.value = 0;
  } catch {
    results.value = [];
  } finally {
    loading.value = false;
  }
}

function navigate(dir: number) {
  activeIndex.value = Math.max(
    0,
    Math.min(results.value.length - 1, activeIndex.value + dir),
  );
}

function selectActive() {
  const r = results.value[activeIndex.value];
  if (r) goToPage(r.id);
}

function goToPage(id: string) {
  router.push({ name: "page", params: { id } });
  emit("close");
}

function highlight(text: string, q: string): string {
  if (!q || !text) {
    return text;
  }

  const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  return text.replace(
    new RegExp(`(${escaped})`, "gi"),
    '<mark style="background: var(--accent-light); color: var(--accent-text); border-radius: 2px; padding: 0 1px">$1</mark>',
  );
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  const h = Math.floor(m / 60);
  const d = Math.floor(h / 24);
  if (d > 0) return `${d}d ago`;
  if (h > 0) return `${h}h ago`;
  if (m > 0) return `${m}m ago`;
  return "now";
}
</script>
