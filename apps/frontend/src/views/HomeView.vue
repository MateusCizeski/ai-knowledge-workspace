<template>
  <div class="flex items-center justify-center h-full px-8">
    <div class="text-center max-w-md w-full">
      <div class="relative inline-block mb-6">
        <div class="text-7xl animate-float select-none">🧠</div>
        <div
          class="absolute -top-1 -right-1 w-4 h-4 rounded-full animate-ping"
          style="background: var(--accent); opacity: 0.4"
        ></div>
      </div>

      <h2 class="text-2xl font-bold mb-2" style="color: var(--text-primary)">
        Welcome back{{ userName ? ", " + userName.split(" ")[0] : "" }}!
      </h2>
      <p class="text-sm mb-8" style="color: var(--text-secondary)">
        Your AI-powered knowledge workspace is ready.
      </p>

      <div class="grid grid-cols-3 gap-3 mb-8" v-if="pages.length > 0">
        <div
          class="rounded-xl p-4 text-center"
          style="
            background: var(--bg-secondary);
            border: 1px solid var(--border);
          "
        >
          <p class="text-2xl font-bold" style="color: var(--accent)">
            {{ pages.length }}
          </p>
          <p class="text-xs mt-1" style="color: var(--text-tertiary)">Pages</p>
        </div>
        <div
          class="rounded-xl p-4 text-center"
          style="
            background: var(--bg-secondary);
            border: 1px solid var(--border);
          "
        >
          <p class="text-2xl font-bold" style="color: var(--accent)">
            {{ totalBlocks }}
          </p>
          <p class="text-xs mt-1" style="color: var(--text-tertiary)">Blocks</p>
        </div>
        <div
          class="rounded-xl p-4 text-center"
          style="
            background: var(--bg-secondary);
            border: 1px solid var(--border);
          "
        >
          <p class="text-2xl font-bold" style="color: var(--accent)">
            {{ recentCount }}
          </p>
          <p class="text-xs mt-1" style="color: var(--text-tertiary)">
            This week
          </p>
        </div>
      </div>

      <div v-if="recentPages.length > 0" class="mb-6 text-left">
        <p
          class="text-xs font-semibold uppercase tracking-wider mb-2"
          style="color: var(--text-tertiary)"
        >
          Recent pages
        </p>
        <div class="space-y-1">
          <button
            v-for="page in recentPages"
            :key="page.id"
            @click="router.push({ name: 'page', params: { id: page.id } })"
            class="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all"
            style="
              background: var(--bg-secondary);
              border: 1px solid var(--border);
            "
            onmouseover="
              this.style.borderColor = 'var(--accent)';
              this.style.transform = 'translateX(2px)';
            "
            onmouseout="
              this.style.borderColor = 'var(--border)';
              this.style.transform = '';
            "
          >
            <span class="text-lg">{{ page.icon }}</span>
            <span
              class="flex-1 text-sm font-medium truncate"
              style="color: var(--text-primary)"
            >
              {{ page.title }}
            </span>
            <span class="text-xs" style="color: var(--text-tertiary)">{{
              timeAgo(page.updatedAt)
            }}</span>
          </button>
        </div>
      </div>

      <button
        @click="createPage"
        class="btn-primary px-6 py-3 text-sm rounded-xl w-full justify-center"
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
            d="M12 4v16m8-8H4"
          />
        </svg>
        Create new page
      </button>

      <p class="text-xs mt-3" style="color: var(--text-tertiary)">
        Press
        <kbd
          class="px-1.5 py-0.5 rounded"
          style="
            background: var(--bg-tertiary);
            border: 1px solid var(--border);
          "
          >⌘K</kbd
        >
        to search
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRouter } from "vue-router";
import { usePagesStore } from "@/stores/pages.store";
import { useAuthStore } from "@/stores/auth.store";

const router = useRouter();
const pagesStore = usePagesStore();
const authStore = useAuthStore();

const pages = computed(() => pagesStore.pages);
const userName = computed(() => authStore.user?.name || "");
const totalBlocks = computed(() =>
  pages.value.reduce((acc, p) => acc + (p._count?.blocks || 0), 0),
);

const recentPages = computed(() =>
  [...pages.value]
    .sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
    )
    .slice(0, 4),
);

const recentCount = computed(() => {
  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  return pages.value.filter((p) => new Date(p.updatedAt).getTime() > weekAgo)
    .length;
});

async function createPage() {
  const page = await pagesStore.createPage();
  router.push({ name: "page", params: { id: page.id } });
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  const h = Math.floor(m / 60);
  const d = Math.floor(h / 24);
  if (d > 0) return `${d}d ago`;
  if (h > 0) return `${h}h ago`;
  if (m > 0) return `${m}m ago`;
  return "just now";
}
</script>

<style scoped>
@keyframes float {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-8px);
  }
}
.animate-float {
  animation: float 3s ease-in-out infinite;
  display: inline-block;
}
</style>
