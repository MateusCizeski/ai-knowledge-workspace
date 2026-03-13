<template>
  <div>
    <div
      :style="{ paddingLeft: `${depth * 12 + 8}px` }"
      :class="[
        'flex items-center gap-1 py-1 pr-1.5 rounded-md cursor-pointer group text-sm transition-colors mx-1',
      ]"
      :style2="
        isActive
          ? 'background: var(--sidebar-item-active); color: var(--sidebar-item-active-text)'
          : 'color: var(--text-secondary)'
      "
      @click="navigate"
      @mouseenter="hovered = true"
      @mouseleave="hovered = false"
      :ref="
        (el) => {
          if (el) applyStyle(el as HTMLElement);
        }
      "
    >
      <button
        v-if="hasChildren"
        @click.stop="expanded = !expanded"
        class="w-4 h-4 flex items-center justify-center flex-shrink-0 transition-opacity rounded"
        :class="[hovered ? 'opacity-100' : 'opacity-0']"
        style="color: var(--text-tertiary)"
      >
        <svg
          :class="['w-3 h-3 transition-transform', expanded ? 'rotate-90' : '']"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M9 5l7 7-7 7"
          />
        </svg>
      </button>
      <span v-else class="w-4 flex-shrink-0"></span>

      <span class="text-sm leading-none flex-shrink-0">{{ page.icon }}</span>
      <span class="flex-1 truncate text-xs font-medium">{{
        page.title || "Untitled"
      }}</span>

      <div
        :class="[
          'flex items-center gap-0.5 ml-auto',
          hovered ? 'opacity-100' : 'opacity-0',
        ]"
      >
        <button
          @click.stop="createChild"
          title="Add sub-page"
          class="w-5 h-5 flex items-center justify-center rounded text-xs transition-colors"
          style="color: var(--text-tertiary)"
          onmouseover="this.style.background = 'var(--bg-hover)'"
          onmouseout="this.style.background = ''"
        >
          +
        </button>
        <button
          @click.stop="deletePage"
          title="Delete"
          class="w-5 h-5 flex items-center justify-center rounded text-xs transition-colors"
          style="color: var(--text-tertiary)"
          onmouseover="
            this.style.background = '#fef2f2';
            this.style.color = '#ef4444';
          "
          onmouseout="
            this.style.background = '';
            this.style.color = 'var(--text-tertiary)';
          "
        >
          ×
        </button>
      </div>
    </div>

    <template v-if="expanded && hasChildren">
      <PageTreeItem
        v-for="child in childPages"
        :key="child.id"
        :page="child"
        :depth="depth + 1"
      />
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { usePagesStore, type PageMeta } from "@/stores/pages.store";
const props = defineProps<{ page: PageMeta; depth: number }>();
const route = useRoute();
const router = useRouter();
const pagesStore = usePagesStore();
const expanded = ref(false);
const hovered = ref(false);
const isActive = computed(() => route.params.id === props.page.id);
const childPages = computed(() => pagesStore.getPageTree(props.page.id));
const hasChildren = computed(
  () => props.page._count.children > 0 || childPages.value.length > 0,
);

function applyStyle(el: HTMLElement) {
  if (isActive.value) {
    el.style.background = "var(--sidebar-item-active)";
    el.style.color = "var(--sidebar-item-active-text)";
  } else if (hovered.value) {
    el.style.background = "var(--sidebar-item-hover)";
    el.style.color = "var(--text-primary)";
  } else {
    el.style.background = "";
    el.style.color = "var(--text-secondary)";
  }
}

function navigate() {
  router.push({ name: "page", params: { id: props.page.id } });
}
async function createChild() {
  expanded.value = true;
  const p = await pagesStore.createPage({ parentId: props.page.id });
  router.push({ name: "page", params: { id: p.id } });
}
async function deletePage() {
  if (!confirm(`Delete "${props.page.title}"?`)) return;
  await pagesStore.deletePage(props.page.id);
  if (isActive.value) router.push({ name: "workspace-home" });
}
</script>
