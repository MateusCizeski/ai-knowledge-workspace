<template>
  <div class="flex items-center justify-center h-full">
    <div class="text-center max-w-sm">
      <div class="text-6xl mb-4">🧠</div>
      <h2 class="text-xl font-semibold text-gray-800 mb-2">Your workspace is ready</h2>
      <p class="text-gray-500 text-sm mb-6">
        Select a page from the sidebar, or create a new one to get started.
      </p>
      <button @click="createPage" class="btn-primary">
        + New page
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { usePagesStore } from '@/stores/pages.store'

const router = useRouter()
const store = usePagesStore()

async function createPage() {
  const page = await store.createPage()
  router.push({ name: 'page', params: { id: page.id } })
}
</script>
