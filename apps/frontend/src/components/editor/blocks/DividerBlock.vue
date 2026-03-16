<template>
  <div class="py-4">
    <hr class="border-gray-200" />
  </div>
</template>

<script setup lang="ts">
import type { Block } from "@/stores/pages.store";
defineProps<{ block: Block; isFocused: boolean }>();
defineEmits([
  "update",
  "focus",
  "blur",
  "enter",
  "backspace-empty",
  "slash",
  "arrow-up",
  "arrow-down",
]);
</script>
