<template>
  <div class="flex h-screen overflow-hidden" style="background: var(--bg)">
    <aside
      :class="[
        'flex flex-col transition-all duration-200 border-r overflow-hidden',
        sidebarOpen ? 'w-64' : 'w-0',
      ]"
      style="background: var(--sidebar-bg); border-color: var(--sidebar-border)"
    >
      <div
        class="flex items-center gap-2 px-3 py-3 border-b"
        style="border-color: var(--sidebar-border)"
      >
        <div
          class="w-7 h-7 rounded-md flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
          style="background: var(--ai-gradient)"
        >
          {{ authStore.user?.name?.charAt(0).toUpperCase() }}
        </div>
        <span
          class="text-sm font-medium truncate flex-1"
          style="color: var(--text-primary)"
        >
          {{ authStore.user?.name }}
        </span>
        <button
          @click="logout"
          title="Sign out"
          class="w-6 h-6 rounded flex items-center justify-center transition-colors"
          style="color: var(--text-tertiary)"
          onmouseover="this.style.background = 'var(--bg-hover)'"
          onmouseout="this.style.background = 'transparent'"
        >
          <svg
            class="w-3.5 h-3.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
            />
          </svg>
        </button>
      </div>

      <div class="px-2 pt-2">
        <button
          @click="searchOpen = true"
          class="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors"
          style="
            background: var(--bg-tertiary);
            border: 1px solid var(--border);
            color: var(--text-tertiary);
          "
          onmouseover="this.style.borderColor = 'var(--accent)'"
          onmouseout="this.style.borderColor = 'var(--border)'"
        >
          <svg
            class="w-3.5 h-3.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0"
            />
          </svg>
          <span class="flex-1 text-left text-xs">Search…</span>
          <kbd
            class="text-xs px-1 rounded"
            style="background: var(--bg); border: 1px solid var(--border)"
            >⌘K</kbd
          >
        </button>
      </div>

      <div class="px-2 pt-1">
        <button
          @click="createNewPage"
          class="w-full flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors"
          style="color: var(--text-secondary)"
          onmouseover="
            this.style.background = 'var(--sidebar-item-hover)';
            this.style.color = 'var(--text-primary)';
          "
          onmouseout="
            this.style.background = 'transparent';
            this.style.color = 'var(--text-secondary)';
          "
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
          New page
        </button>
      </div>

      <div class="flex-1 overflow-y-auto px-2 pb-4 mt-1">
        <PageTree />
      </div>

      <div
        class="px-3 py-3 border-t flex items-center gap-2"
        style="border-color: var(--sidebar-border)"
      >
        <span class="text-xs" style="color: var(--text-tertiary)">Theme</span>
        <button
          @click="themeToggle()"
          class="ml-auto flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs transition-colors"
          style="
            background: var(--bg-tertiary);
            color: var(--text-secondary);
            border: 1px solid var(--border);
          "
        >
          {{ theme === "dark" ? "☀️ Light" : "🌙 Dark" }}
        </button>
      </div>
    </aside>

    <div class="flex-1 flex flex-col min-w-0">
      <header
        class="flex items-center gap-2 px-4 h-12 border-b flex-shrink-0"
        style="border-color: var(--border); background: var(--bg)"
      >
        <button
          @click="sidebarOpen = !sidebarOpen"
          class="p-1.5 rounded-md transition-colors"
          style="color: var(--text-tertiary)"
          onmouseover="this.style.background = 'var(--bg-tertiary)'"
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
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>

        <div
          v-if="pagesStore.currentPage"
          class="flex items-center gap-1.5 text-sm"
        >
          <span>{{ pagesStore.currentPage.icon }}</span>
          <span class="font-medium" style="color: var(--text-primary)">{{
            pagesStore.currentPage.title
          }}</span>
        </div>

        <div class="ml-auto flex items-center gap-2">
          <PresenceBar v-if="presenceUsers.length" :users="presenceUsers" />

          <div
            v-if="pagesStore.currentPage"
            class="flex items-center gap-1.5 text-xs"
            style="color: var(--text-tertiary)"
          >
            <template v-if="pagesStore.saving">
              <div
                class="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"
              ></div>
              Saving…
            </template>
            <template v-else>
              <div class="w-1.5 h-1.5 rounded-full bg-green-400"></div>
              Saved
            </template>
          </div>

          <button
            v-if="pagesStore.currentPage"
            @click="versionsOpen = !versionsOpen"
            :class="[
              'flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all',
              versionsOpen ? 'btn-secondary' : 'btn-ghost',
            ]"
          >
            🕐 History
          </button>

          <button
            v-if="pagesStore.currentPage"
            @click="aiPanelOpen = !aiPanelOpen"
            :class="[
              'flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all',
              aiPanelOpen ? 'btn-ai' : 'btn-ghost',
            ]"
          >
            ✨ AI
          </button>
        </div>
      </header>

      <div class="flex flex-1 min-h-0">
        <main class="flex-1 overflow-y-auto">
          <RouterView @presence="onPresence" />
        </main>

        <VersionsSidebar
          v-if="versionsOpen && pagesStore.currentPage"
          :page-id="pagesStore.currentPage.id"
          @close="versionsOpen = false"
          @restored="versionsOpen = false"
        />

        <AISidebar
          v-if="aiPanelOpen && pagesStore.currentPage"
          @close="aiPanelOpen = false"
        />
      </div>
    </div>

    <SearchModal v-if="searchOpen" @close="searchOpen = false" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import { RouterView, useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth.store";
import { usePagesStore } from "@/stores/pages.store";
import { useTheme } from "@/composables/useTheme";
import { useSocket, type PresenceUser } from "@/composables/useSocket";
import PageTree from "@/components/sidebar/PageTree.vue";
import AISidebar from "@/components/ai/AISidebar.vue";
import SearchModal from "@/components/search/SearchModal.vue";
import VersionsSidebar from "@/components/versions/VersionsSidebar.vue";
import PresenceBar from "@/components/presence/PresenceBar.vue";

const router = useRouter();
const authStore = useAuthStore();
const pagesStore = usePagesStore();
const { theme, toggle: themeToggle } = useTheme();

const sidebarOpen = ref(true);
const aiPanelOpen = ref(false);
const versionsOpen = ref(false);
const searchOpen = ref(false);
const presenceUsers = ref<PresenceUser[]>([]);

const { connected, onUserJoined, onUserLeft, onPresenceList } = useSocket();

onUserJoined((user) => {
  presenceUsers.value = [
    ...presenceUsers.value.filter((u) => u.socketId !== user.socketId),
    user,
  ];
});
onUserLeft(({ socketId }) => {
  presenceUsers.value = presenceUsers.value.filter(
    (u) => u.socketId !== socketId,
  );
});
onPresenceList((users) => {
  presenceUsers.value = users;
});

function onPresence(users: PresenceUser[]) {
  presenceUsers.value = users;
}

onMounted(() => {
  pagesStore.fetchPages();
  window.addEventListener("keydown", onKeydown);
});

onUnmounted(() => {
  window.removeEventListener("keydown", onKeydown);
});

function onKeydown(e: KeyboardEvent) {
  if ((e.ctrlKey || e.metaKey) && e.key === "k") {
    e.preventDefault();
    searchOpen.value = !searchOpen.value;
  }
  if (e.key === "Escape") {
    searchOpen.value = false;
  }
}

async function createNewPage() {
  const page = await pagesStore.createPage();
  router.push({ name: "page", params: { id: page.id } });
}

function logout() {
  authStore.logout();
  router.push("/auth");
}
</script>
