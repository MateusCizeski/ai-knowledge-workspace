<template>
  <aside
    class="w-72 flex flex-col border-l flex-shrink-0 overflow-hidden animate-fadeIn"
    style="background: var(--bg-secondary); border-color: var(--border)"
  >
    <div
      class="flex items-center justify-between px-4 py-3 border-b"
      style="border-color: var(--border)"
    >
      <div class="flex items-center gap-2">
        <span class="text-base">🕐</span>
        <span class="text-sm font-semibold" style="color: var(--text-primary)"
          >Version history</span
        >
      </div>
      <button
        @click="$emit('close')"
        class="w-7 h-7 flex items-center justify-center rounded-lg transition-colors"
        style="color: var(--text-tertiary)"
        onmouseover="this.style.background = 'var(--bg-hover)'"
        onmouseout="this.style.background = 'transparent'"
      >
        <svg
          class="w-4 h-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
    </div>

    <div class="flex-1 overflow-y-auto">
      <div v-if="loading" class="p-4 space-y-3">
        <div v-for="i in 5" :key="i" class="space-y-1.5">
          <div class="ai-loading h-3 w-1/3 rounded"></div>
          <div class="ai-loading h-2.5 w-full rounded"></div>
        </div>
      </div>

      <div
        v-else-if="versions.length === 0"
        class="flex flex-col items-center justify-center h-full py-12 text-center px-4"
      >
        <span class="text-3xl mb-3">📭</span>
        <p class="text-sm font-medium" style="color: var(--text-secondary)">
          No versions yet
        </p>
        <p class="text-xs mt-1" style="color: var(--text-tertiary)">
          Versions are saved automatically when you edit
        </p>
      </div>

      <div v-else class="p-2 space-y-1">
        <div
          class="flex items-start gap-2.5 px-3 py-2.5 rounded-lg"
          style="
            background: var(--accent-light);
            border: 1px solid var(--accent);
          "
        >
          <div
            class="w-2 h-2 rounded-full mt-1.5 flex-shrink-0"
            style="background: var(--accent)"
          ></div>
          <div class="flex-1 min-w-0">
            <p class="text-xs font-semibold" style="color: var(--accent-text)">
              Current version
            </p>
            <p
              class="text-xs mt-0.5 truncate"
              style="color: var(--accent-text); opacity: 0.7"
            >
              Live — editing now
            </p>
          </div>
        </div>

        <button
          v-for="(version, i) in versions"
          :key="version.id"
          @click="preview(version)"
          :class="[
            'w-full flex items-start gap-2.5 px-3 py-2.5 rounded-lg text-left transition-colors',
            selectedVersion?.id === version.id ? 'selected-version' : '',
          ]"
          :style="
            selectedVersion?.id === version.id
              ? 'background: var(--bg-hover); border: 1px solid var(--border-strong)'
              : 'background: transparent; border: 1px solid transparent'
          "
          onmouseover="
            if (!this.style.background.includes('bg-hover')) {
              this.style.background = 'var(--bg-tertiary)';
            }
          "
          onmouseout="
            if (!this.classList.contains('selected-version')) {
              this.style.background = 'transparent';
            }
          "
        >
          <div
            class="w-2 h-2 rounded-full mt-1.5 flex-shrink-0"
            style="background: var(--border-strong)"
          ></div>
          <div class="flex-1 min-w-0">
            <p class="text-xs font-medium" style="color: var(--text-primary)">
              {{ formatDate(version.createdAt) }}
            </p>
            <p
              class="text-xs mt-0.5 truncate"
              style="color: var(--text-secondary)"
            >
              {{ version.preview || "Empty page" }}
            </p>
            <p class="text-xs mt-0.5" style="color: var(--text-tertiary)">
              {{ version.blockCount }} block{{
                version.blockCount !== 1 ? "s" : ""
              }}
            </p>
          </div>
        </button>
      </div>
    </div>

    <div
      v-if="selectedVersion"
      class="border-t p-4 space-y-2 animate-fadeIn"
      style="border-color: var(--border); background: var(--bg)"
    >
      <p class="text-xs font-medium" style="color: var(--text-secondary)">
        Restore to {{ formatDate(selectedVersion.createdAt) }}?
      </p>
      <p class="text-xs" style="color: var(--text-tertiary)">
        Current version will be saved before restoring.
      </p>
      <div class="flex gap-2 mt-3">
        <button
          @click="restore"
          :disabled="restoring"
          class="btn-primary flex-1 justify-center text-xs"
          :style="restoring ? 'opacity: 0.6; cursor: not-allowed' : ''"
        >
          {{ restoring ? "Restoring…" : "↩ Restore" }}
        </button>
        <button
          @click="selectedVersion = null"
          class="btn-secondary !px-3 text-xs"
        >
          Cancel
        </button>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { api } from "@/services/api";
import { usePagesStore } from "@/stores/pages.store";

const props = defineProps<{ pageId: string }>();
const emit = defineEmits(["close", "restored"]);

const pagesStore = usePagesStore();
const loading = ref(true);
const restoring = ref(false);
const versions = ref<any[]>([]);
const selectedVersion = ref<any | null>(null);

onMounted(() => fetchVersions());

async function fetchVersions() {
  loading.value = true;
  try {
    const { data } = await api.get(`/versions/${props.pageId}`);
    versions.value = data;
  } finally {
    loading.value = false;
  }
}

function preview(version: any) {
  selectedVersion.value =
    selectedVersion.value?.id === version.id ? null : version;
}

async function restore() {
  if (!selectedVersion.value) return;
  restoring.value = true;
  try {
    await api.post(
      `/versions/${props.pageId}/restore/${selectedVersion.value.id}`,
    );
    await pagesStore.fetchPage(props.pageId);
    selectedVersion.value = null;
    await fetchVersions();
    emit("restored");
  } finally {
    restoring.value = false;
  }
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();
  const isYesterday =
    new Date(now.setDate(now.getDate() - 1)).toDateString() ===
    d.toDateString();

  const time = d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  if (isToday) return `Today at ${time}`;
  if (isYesterday) return `Yesterday at ${time}`;
  return (
    d.toLocaleDateString([], { month: "short", day: "numeric" }) + ` at ${time}`
  );
}
</script>
