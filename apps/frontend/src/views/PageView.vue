<template>
  <div class="max-w-3xl mx-auto px-8 py-12">
    <div v-if="pagesStore.loading" class="space-y-4 animate-pulse">
      <div
        class="h-10 rounded-xl w-1/2"
        style="background: var(--bg-tertiary)"
      ></div>
      <div
        class="h-4 rounded-lg w-full"
        style="background: var(--bg-tertiary)"
      ></div>
      <div
        class="h-4 rounded-lg w-4/5"
        style="background: var(--bg-tertiary)"
      ></div>
    </div>

    <template v-else-if="pagesStore.currentPage">
      <div class="mb-8">
        <div class="relative inline-block mb-4">
          <div
            class="text-5xl cursor-pointer select-none hover:scale-110 transition-transform"
            @click="showIconPicker = !showIconPicker"
          >
            {{ pagesStore.currentPage.icon || "📄" }}
          </div>

          <div
            v-if="showIconPicker"
            class="absolute top-full left-0 mt-1 z-40 p-2 rounded-xl animate-fadeIn"
            style="
              background: var(--bg);
              border: 1px solid var(--border);
              box-shadow: var(--shadow-lg);
            "
          >
            <div class="flex flex-wrap gap-1 max-w-[200px]">
              <button
                v-for="emoji in commonIcons"
                :key="emoji"
                @click="setIcon(emoji)"
                class="text-xl p-1.5 rounded-lg hover:scale-110 transition-all"
                onmouseover="this.style.background = 'var(--bg-tertiary)'"
                onmouseout="this.style.background = ''"
              >
                {{ emoji }}
              </button>
            </div>
          </div>
        </div>

        <input
          ref="titleInput"
          v-model="title"
          @blur="saveTitle"
          @keydown.enter.prevent="titleInput?.blur()"
          placeholder="Untitled"
          class="w-full text-4xl font-bold border-none outline-none bg-transparent resize-none leading-tight"
          style="color: var(--text-primary)"
          :style="{ caretColor: 'var(--accent)' }"
        />

        <div
          v-if="pagesStore.currentPage.tags?.length"
          class="flex flex-wrap gap-1.5 mt-3"
        >
          <span
            v-for="tag in pagesStore.currentPage.tags"
            :key="tag.id"
            class="text-xs px-2.5 py-0.5 rounded-full font-medium"
            :style="{ background: tag.color + '20', color: tag.color }"
          >
            {{ tag.name }}
          </span>
        </div>

        <div class="mt-6 mb-4 h-px" style="background: var(--border)"></div>
      </div>

      <BlockEditor
        :blocks="pagesStore.currentPage.blocks"
        :page-id="pagesStore.currentPage.id"
      />
    </template>

    <div v-else class="text-center mt-20" style="color: var(--text-tertiary)">
      Page not found
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import { useRoute } from "vue-router";
import { usePagesStore } from "@/stores/pages.store";
import BlockEditor from "@/components/editor/BlockEditor.vue";

const route = useRoute();
const pagesStore = usePagesStore();
const title = ref("");
const showIconPicker = ref(false);
const titleInput = ref<HTMLInputElement | null>(null);
const commonIcons = [
  "📄",
  "📝",
  "💡",
  "🚀",
  "⭐",
  "🔥",
  "📚",
  "🎯",
  "🧠",
  "💼",
  "🏗️",
  "🎨",
  "📊",
  "🔬",
  "🌟",
  "🎪",
  "🔮",
  "⚡",
  "🌊",
  "🎭",
];

watch(
  () => route.params.id,
  (id) => {
    if (id) loadPage(id as string);
  },
  { immediate: true },
);
watch(
  () => pagesStore.currentPage?.title,
  (val) => {
    if (val !== undefined) title.value = val;
  },
);

async function loadPage(id: string) {
  await pagesStore.fetchPage(id);
  title.value = pagesStore.currentPage?.title || "";
}
async function saveTitle() {
  if (!pagesStore.currentPage || title.value === pagesStore.currentPage.title)
    return;
  await pagesStore.updatePage(pagesStore.currentPage.id, {
    title: title.value || "Untitled",
  });
}
async function setIcon(emoji: string) {
  if (!pagesStore.currentPage) return;
  showIconPicker.value = false;
  await pagesStore.updatePage(pagesStore.currentPage.id, { icon: emoji });
}
</script>
