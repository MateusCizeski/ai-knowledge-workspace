<template>
  <div class="max-w-3xl mx-auto px-8 py-12">
    <div v-if="pagesStore.loading" class="space-y-4 animate-pulse">
      <div
        class="h-12 rounded-xl w-1/2"
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
      <div
        class="h-4 rounded-lg w-3/5"
        style="background: var(--bg-tertiary)"
      ></div>
    </div>

    <template v-else-if="pagesStore.currentPage">
      <div class="mb-8">
        <div class="relative inline-block mb-4">
          <button
            @click="showIconPicker = !showIconPicker"
            class="text-5xl cursor-pointer select-none hover:scale-110 transition-transform block"
          >
            {{ pagesStore.currentPage.icon || "📄" }}
          </button>

          <div
            v-if="showIconPicker"
            class="absolute top-full left-0 mt-2 z-40 p-2 rounded-xl animate-fadeIn"
            style="
              background: var(--bg);
              border: 1px solid var(--border);
              box-shadow: var(--shadow-lg);
            "
          >
            <div class="flex flex-wrap gap-1" style="max-width: 220px">
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
          @input="debouncedTitleBroadcast"
          @keydown.enter.prevent="titleInput?.blur()"
          placeholder="Untitled"
          class="w-full text-4xl font-bold border-none outline-none bg-transparent resize-none leading-tight"
          style="color: var(--text-primary); caret-color: var(--accent)"
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
        :remote-cursors="remoteCursors"
        @blocks-saved="onBlocksSaved"
        @cursor-change="onCursorChange"
      />
    </template>

    <div v-else class="text-center mt-20" style="color: var(--text-tertiary)">
      <span class="text-4xl block mb-3">🔍</span>
      Page not found
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from "vue";
import { useRoute } from "vue-router";
import { usePagesStore } from "@/stores/pages.store";
import { useSocket } from "@/composables/useSocket";
import BlockEditor from "@/components/editor/BlockEditor.vue";

const route = useRoute();
const pagesStore = usePagesStore();
const {
  joinPage,
  leavePage,
  emitBlocksChanged,
  emitCursorMove,
  emitTitleChanged,
  onBlocksUpdated,
  onCursorUpdate,
  onPageTitleUpdated,
} = useSocket();

const title = ref("");
const showIconPicker = ref(false);
const titleInput = ref<HTMLInputElement | null>(null);
const remoteCursors = ref<
  Record<string, { name: string; color: string; blockId: string | null }>
>({});

let titleBroadcastTimer: ReturnType<typeof setTimeout> | null = null;
let currentPageId: string | null = null;

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

onBlocksUpdated(({ blocks, by }) => {
  if (pagesStore.currentPage) {
    pagesStore.currentPage = { ...pagesStore.currentPage, blocks };
  }
});

onCursorUpdate((data) => {
  remoteCursors.value = {
    ...remoteCursors.value,
    [data.socketId]: {
      name: data.name,
      color: data.color,
      blockId: data.blockId ?? null,
    },
  };
});

onPageTitleUpdated(({ pageId, title: newTitle, icon }) => {
  if (pagesStore.currentPage?.id === pageId) {
    title.value = newTitle;
    pagesStore.currentPage = {
      ...pagesStore.currentPage,
      title: newTitle,
      icon,
    };
  }

  const idx = pagesStore.pages.findIndex((p) => p.id === pageId);
  if (idx !== -1)
    pagesStore.pages[idx] = { ...pagesStore.pages[idx], title: newTitle, icon };
});

watch(
  () => route.params.id,
  (id) => {
    if (id) {
      if (currentPageId) leavePage(currentPageId);
      currentPageId = id as string;
      loadPage(id as string);
      joinPage(id as string);
    }
  },
  { immediate: true },
);

watch(
  () => pagesStore.currentPage?.title,
  (val) => {
    if (val !== undefined && val !== title.value) title.value = val;
  },
);

onUnmounted(() => {
  if (currentPageId) leavePage(currentPageId);
});

async function loadPage(id: string) {
  remoteCursors.value = {};
  await pagesStore.fetchPage(id);
  title.value = pagesStore.currentPage?.title || "";
}

async function saveTitle() {
  if (!pagesStore.currentPage) return;
  const newTitle = title.value.trim() || "Untitled";
  if (newTitle === pagesStore.currentPage.title) return;
  await pagesStore.updatePage(pagesStore.currentPage.id, { title: newTitle });
}

function debouncedTitleBroadcast() {
  if (!pagesStore.currentPage) return;
  if (titleBroadcastTimer) clearTimeout(titleBroadcastTimer);
  titleBroadcastTimer = setTimeout(() => {
    emitTitleChanged(
      pagesStore.currentPage!.id,
      title.value,
      pagesStore.currentPage!.icon || "📄",
    );
  }, 500);
}

async function setIcon(emoji: string) {
  if (!pagesStore.currentPage) return;
  showIconPicker.value = false;
  await pagesStore.updatePage(pagesStore.currentPage.id, { icon: emoji });
  emitTitleChanged(pagesStore.currentPage.id, title.value, emoji);
}

function onBlocksSaved(blocks: any[]) {
  if (pagesStore.currentPage) {
    emitBlocksChanged(pagesStore.currentPage.id, blocks);
  }
}

function onCursorChange(blockId: string | null) {
  if (pagesStore.currentPage) {
    emitCursorMove(pagesStore.currentPage.id, blockId);
  }
}
</script>
