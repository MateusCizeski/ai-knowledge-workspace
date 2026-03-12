import { defineStore } from 'pinia'
import { ref } from 'vue'
import { api } from '@/services/api'

export interface Block {
  id: string
  type: string
  content: Record<string, any>
  order: number
  pageId: string
}

export interface Tag {
  id: string
  name: string
  color: string
}

export interface PageMeta {
  id: string
  title: string
  icon: string
  parentId: string | null
  order: number
  isPublished: boolean
  tags: Tag[]
  createdAt: string
  updatedAt: string
  _count: { children: number; blocks: number }
}

export interface PageFull extends PageMeta {
  blocks: Block[]
  children: { id: string; title: string; icon: string; order: number }[]
}

export const usePagesStore = defineStore('pages', () => {
  const pages = ref<PageMeta[]>([])
  const currentPage = ref<PageFull | null>(null)
  const loading = ref(false)
  const saving = ref(false)

  async function fetchPages() {
    loading.value = true
    try {
      const { data } = await api.get('/pages')
      pages.value = data
    } finally {
      loading.value = false
    }
  }

  async function fetchPage(id: string) {
    loading.value = true
    try {
      const { data } = await api.get(`/pages/${id}`)
      currentPage.value = data
      return data as PageFull
    } finally {
      loading.value = false
    }
  }

  async function createPage(payload?: { title?: string; icon?: string; parentId?: string }) {
    const { data } = await api.post('/pages', payload || {})
    pages.value.push({ ...data, _count: { children: 0, blocks: data.blocks?.length || 0 } })
    return data as PageFull
  }

  async function updatePage(id: string, payload: Partial<Pick<PageMeta, 'title' | 'icon' | 'isPublished'>>) {
    const { data } = await api.patch(`/pages/${id}`, payload)
    const idx = pages.value.findIndex(p => p.id === id)
    if (idx !== -1) pages.value[idx] = { ...pages.value[idx], ...data }
    if (currentPage.value?.id === id) currentPage.value = { ...currentPage.value, ...data }
    return data
  }

  async function deletePage(id: string) {
    await api.delete(`/pages/${id}`)
    pages.value = pages.value.filter(p => p.id !== id)
    if (currentPage.value?.id === id) currentPage.value = null
  }

  async function saveBlocks(pageId: string, blocks: Block[]) {
    saving.value = true
    try {
      await api.patch(`/blocks/${pageId}/bulk`, { blocks })
      if (currentPage.value?.id === pageId) {
        currentPage.value = { ...currentPage.value, blocks }
      }
    } finally {
      saving.value = false
    }
  }

  async function createBlock(pageId: string, type: string, content: Record<string, any>, order: number) {
    const { data } = await api.post(`/blocks/${pageId}`, { type, content, order })
    if (currentPage.value?.id === pageId) {
      currentPage.value.blocks = [...currentPage.value.blocks, data].sort((a, b) => a.order - b.order)
    }
    return data as Block
  }

  async function deleteBlock(blockId: string) {
    await api.delete(`/blocks/${blockId}`)
    if (currentPage.value) {
      currentPage.value.blocks = currentPage.value.blocks.filter(b => b.id !== blockId)
    }
  }

  // Build nested tree from flat list
  function getPageTree(parentId: string | null = null): PageMeta[] {
    return pages.value
      .filter(p => p.parentId === parentId)
      .sort((a, b) => a.order - b.order)
  }

  return {
    pages,
    currentPage,
    loading,
    saving,
    fetchPages,
    fetchPage,
    createPage,
    updatePage,
    deletePage,
    saveBlocks,
    createBlock,
    deleteBlock,
    getPageTree,
  }
})
