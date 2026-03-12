<template>
  <div>
    <div v-if="pagesStore.loading" class="px-3 py-2 text-xs text-gray-400">Loading…</div>

    <template v-else>
      <div v-if="rootPages.length === 0" class="px-3 py-4 text-xs text-gray-400 text-center">
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
import { computed } from 'vue'
import { usePagesStore } from '@/stores/pages.store'
import PageTreeItem from './PageTreeItem.vue'

const pagesStore = usePagesStore()
const rootPages = computed(() => pagesStore.getPageTree(null))
</script>
