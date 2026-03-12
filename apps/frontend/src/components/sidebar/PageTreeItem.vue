<template>
  <div>
    <div
      :style="{ paddingLeft: `${depth * 12 + 12}px` }"
      :class="[
        'flex items-center gap-1.5 py-1 pr-2 rounded-md cursor-pointer group text-sm transition-colors',
        isActive ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-200'
      ]"
    >
      <!-- Expand toggle -->
      <button
        v-if="hasChildren"
        @click.stop="expanded = !expanded"
        class="w-4 h-4 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-gray-400"
      >
        <svg
          :class="['w-3 h-3 transition-transform', expanded ? 'rotate-90' : '']"
          fill="none" viewBox="0 0 24 24" stroke="currentColor"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
        </svg>
      </button>
      <span v-else class="w-4"></span>

      <!-- Icon + title -->
      <span class="text-base leading-none">{{ page.icon }}</span>
      <span
        @click="navigate"
        class="flex-1 truncate"
      >{{ page.title || 'Untitled' }}</span>

      <!-- Actions -->
      <div class="opacity-0 group-hover:opacity-100 flex items-center gap-0.5 ml-auto">
        <button
          @click.stop="createChild"
          title="Add sub-page"
          class="p-0.5 rounded hover:bg-gray-300 text-gray-500"
        >+</button>
        <button
          @click.stop="deletePage"
          title="Delete"
          class="p-0.5 rounded hover:bg-red-100 text-gray-500 hover:text-red-500"
        >×</button>
      </div>
    </div>

    <!-- Children -->
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
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { usePagesStore, type PageMeta } from '@/stores/pages.store'

const props = defineProps<{ page: PageMeta; depth: number }>()

const route = useRoute()
const router = useRouter()
const pagesStore = usePagesStore()

const expanded = ref(false)

const isActive = computed(() => route.params.id === props.page.id)
const childPages = computed(() => pagesStore.getPageTree(props.page.id))
const hasChildren = computed(() => props.page._count.children > 0 || childPages.value.length > 0)

function navigate() {
  router.push({ name: 'page', params: { id: props.page.id } })
}

async function createChild() {
  expanded.value = true
  const newPage = await pagesStore.createPage({ parentId: props.page.id })
  router.push({ name: 'page', params: { id: newPage.id } })
}

async function deletePage() {
  if (!confirm(`Delete "${props.page.title}"? This will also delete all sub-pages.`)) return
  await pagesStore.deletePage(props.page.id)
  if (isActive.value) router.push({ name: 'workspace-home' })
}
</script>
