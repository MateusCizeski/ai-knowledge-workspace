<template>
  <div v-if="users.length > 0" class="flex items-center gap-1.5">
    <div class="flex -space-x-2">
      <div
        v-for="user in visibleUsers"
        :key="user.socketId"
        class="relative group"
      >
        <div
          class="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white ring-2 cursor-default select-none transition-transform hover:scale-110 hover:z-10"
          :style="{ background: user.color, ringColor: 'var(--bg)' }"
          style="ring-color: var(--bg)"
        >
          {{ user.name.charAt(0).toUpperCase() }}
        </div>

        <div
          class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 rounded-lg text-xs font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20"
          style="
            background: var(--bg-tertiary);
            border: 1px solid var(--border);
            color: var(--text-primary);
            box-shadow: var(--shadow-md);
          "
        >
          {{ user.name }}
          <span v-if="user.blockId" class="opacity-60">. editing</span>
        </div>

        <div
          class="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-green-400 ring-2"
          style="ring-color: var(--bg)"
        ></div>
      </div>

      <div
        v-if="overflow > 0"
        class="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ring-2"
        style="
          background: var(--bg-tertiary);
          color: var(--text-secondary);
          ring-color: var(--bg);
          border: 1px solid var(--border);
        "
      >
        +{{ overflow }}
      </div>
    </div>

    <span class="text-xs" style="color: var(--text-tertiary)">
      {{ users.length }} online
    </span>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { PresenceUser } from "@/composables/useSocket";

const props = defineProps<{ users: PresenceUser[] }>();

const MAX_VISIBLE = 4;
const visibleUsers = computed(() => props.users.slice(0, MAX_VISIBLE));
const overflow = computed(() => Math.max(0, props.users.length - MAX_VISIBLE));
</script>
