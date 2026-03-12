<template>
  <div class="max-w-3xl mx-auto px-8 py-12">
    <div v-if="pagesStore.loading" class="space-y-3 animate-pulse">
      <div class="h-8 bg-gray-100 rounded-lg w-1/2"></div>
      <div class="h-4 bg-gray-100 rounded w-full"></div>
      <div class="h-4 bg-gray-100 rounded w-4/5"></div>
    </div>

    <template v-else-if="pagesStore.currentPage">
      <!-- Page header -->
      <div class="mb-8">
        <!-- Icon picker (simple) -->
        <div class="text-5xl mb-4 cursor-pointer select-none" @click="showIconPicker = !showIconPicker">
          {{ pagesStore.currentPage.icon || '📄' }}
        </div>

        <!-- Icon quick-picker -->
        <div v-if="showIconPicker" class="flex flex-wrap gap-2 mb-4 p-3 bg-gray-50 rounded-xl border border-gray-200 max-w-sm">
          <button
            v-for="emoji in commonIcons"
            :key="emoji"
            @click="setIcon(emoji)"
            class="text-xl hover:bg-gray-200 p-1.5 rounded-lg transition-colors"
          >{{ emoji }}</button>
        </div>

        <!-- Title -->
        <input
          ref="titleInput"
          v-model="title"
          @blur="saveTitle"
          @keydown.enter.prevent="$refs.titleInput?.blur()"
          placeholder="Untitled"
          class="w-full text-4xl font-bold text-gray-900 border-none outline-none bg-transparent placeholder:text-gray-300 resize-none"
        />
      </div>

      <!-- Block editor -->
      <BlockEditor
        :blocks="pagesStore.currentPage.blocks"
        :page-id="pagesStore.currentPage.id"
      />
    </template>

    <div v-else class="text-center text-gray-400 mt-20">
      Page not found
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { usePagesStore } from '@/stores/pages.store'
import BlockEditor from '@/components/editor/BlockEditor.vue'

const route = useRoute()
const pagesStore = usePagesStore()

const title = ref('')
const showIconPicker = ref(false)
const titleInput = ref<HTMLInputElement | null>(null)

const commonIcons = ['📄', '📝', '💡', '🚀', '⭐', '🔥', '📚', '🎯', '🧠', '💼', '🏗️', '🎨', '📊', '🔬', '🌟']

watch(() => route.params.id, (id) => {
  if (id) loadPage(id as string)
}, { immediate: true })

watch(() => pagesStore.currentPage?.title, (val) => {
  if (val !== undefined) title.value = val
})

async function loadPage(id: string) {
  await pagesStore.fetchPage(id)
  title.value = pagesStore.currentPage?.title || ''
}

async function saveTitle() {
  if (!pagesStore.currentPage) return
  if (title.value === pagesStore.currentPage.title) return
  await pagesStore.updatePage(pagesStore.currentPage.id, { title: title.value || 'Untitled' })
}

async function setIcon(emoji: string) {
  if (!pagesStore.currentPage) return
  showIconPicker.value = false
  await pagesStore.updatePage(pagesStore.currentPage.id, { icon: emoji })
}
</script>
