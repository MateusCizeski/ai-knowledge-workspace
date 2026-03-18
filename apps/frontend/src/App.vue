<template>
  <RouterView v-slot="{ Component, route }">
    <Transition
      :name="(route.meta.transition as string) || 'fade'"
      mode="out-in"
    >
      <component :is="Component" :key="route.path" />
    </Transition>
  </RouterView>
</template>

<script setup lang="ts">
import { RouterView } from "vue-router";
import { useTheme } from "@/composables/useTheme";

const { init } = useTheme();
init();
</script>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.18s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-enter-active,
.slide-leave-active {
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}
.slide-enter-from {
  opacity: 0;
  transform: translateX(12px);
}
.slide-leave-to {
  opacity: 0;
  transform: translateX(-8px);
}
</style>
