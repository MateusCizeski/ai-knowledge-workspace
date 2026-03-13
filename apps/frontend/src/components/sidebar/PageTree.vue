<template>
  <div>
    <div
      v-if="pagesStore.loading"
      class="px-3 py-2 text-xs"
      style="color: var(--text-tertiary)"
    >
      Loading…
    </div>
    <template v-else>
      <div
        v-if="rootPages.length === 0"
        class="px-3 py-6 text-xs text-center"
        style="color: var(--text-tertiary)"
      >
        No pages yet.<br />Click "+ New page" to start.
      </div>
      <PageTreeItem
        v-for="page in rootPages"
        :key="page.id"
        :page="page"
        :depth="0"
      />
    </template>
  </div>
</template>
<script setup lang="ts">
import { computed } from "vue";
import { usePagesStore } from "@/stores/pages.store";
import PageTreeItem from "./PageTreeItem.vue";
const pagesStore = usePagesStore();
const rootPages = computed(() => pagesStore.getPageTree(null));
</script>
