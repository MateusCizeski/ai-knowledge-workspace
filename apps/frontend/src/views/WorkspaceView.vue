<template>
  <div class="flex h-screen bg-white overflow-hidden">
    <!-- Sidebar -->
    <aside
      :class="[
        'flex flex-col border-r border-gray-200 bg-gray-50 transition-all duration-200',
        sidebarOpen ? 'w-64' : 'w-0 overflow-hidden'
      ]"
    >
      <!-- User header -->
      <div class="flex items-center gap-3 px-4 py-3 border-b border-gray-200">
        <div class="w-7 h-7 rounded-md bg-indigo-100 flex items-center justify-center text-sm font-semibold text-indigo-700">
          {{ authStore.user?.name?.charAt(0).toUpperCase() }}
        </div>
        <span class="text-sm font-medium text-gray-800 truncate">{{ authStore.user?.name }}</span>
        <button @click="authStore.logout(); router.push('/auth')" class="ml-auto text-gray-400 hover:text-gray-600 text-xs">
          ↩
        </button>
      </div>

      <!-- New page button -->
      <div class="px-3 py-2">
        <button @click="createNewPage" class="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-600 rounded-lg hover:bg-gray-200 transition-colors">
          <span class="text-base">+</span>
          New page
        </button>
      </div>

      <!-- Page tree -->
      <div class="flex-1 overflow-y-auto px-2 pb-4">
        <PageTree />
      </div>
    </aside>

    <!-- Main -->
    <div class="flex-1 flex flex-col min-w-0">
      <!-- Topbar -->
      <header class="flex items-center gap-3 px-4 py-3 border-b border-gray-200 h-12">
        <button @click="sidebarOpen = !sidebarOpen" class="btn-ghost p-1.5 rounded-md">
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
          </svg>
        </button>

        <!-- Breadcrumb -->
        <div v-if="pagesStore.currentPage" class="flex items-center gap-1 text-sm text-gray-500">
          <span>{{ pagesStore.currentPage.icon }}</span>
          <span class="font-medium text-gray-800">{{ pagesStore.currentPage.title }}</span>
        </div>

        <!-- Saving indicator -->
        <div class="ml-auto flex items-center gap-2 text-xs text-gray-400">
          <template v-if="pagesStore.saving">
            <div class="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></div>
            Saving…
          </template>
          <template v-else-if="pagesStore.currentPage">
            <div class="w-1.5 h-1.5 rounded-full bg-green-400"></div>
            Saved
          </template>
        </div>
      </header>

      <!-- Page content -->
      <main class="flex-1 overflow-y-auto">
        <RouterView />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { RouterView, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'
import { usePagesStore } from '@/stores/pages.store'
import PageTree from '@/components/sidebar/PageTree.vue'

const router = useRouter()
const authStore = useAuthStore()
const pagesStore = usePagesStore()
const sidebarOpen = ref(true)

onMounted(() => pagesStore.fetchPages())

async function createNewPage() {
  const page = await pagesStore.createPage()
  router.push({ name: 'page', params: { id: page.id } })
}
</script>
