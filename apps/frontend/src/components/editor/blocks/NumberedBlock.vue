<template>
  <div class="flex items-start gap-2.5 py-0.5">
    <span
      class="mt-0.5 flex-shrink-0 text-sm font-medium tabular-nums min-w-[1.25rem]"
      style="color: var(--text-tertiary)"
      >{{ number }}.</span
    >
    <div
      class="flex-1 outline-none leading-relaxed min-h-[1.5rem]"
      style="color: var(--text-primary)"
      :contenteditable="true"
      data-placeholder="List item…"
      @input="onInput"
      @keydown="onKeydown"
      @focus="$emit('focus')"
      @blur="$emit('blur')"
      ref="el"
    ></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, nextTick } from "vue";
import type { Block } from "@/stores/pages.store";
const props = defineProps<{
  block: Block;
  isFocused: boolean;
  number?: number;
}>();
const emit = defineEmits([
  "update",
  "focus",
  "blur",
  "enter",
  "backspace-empty",
  "slash",
  "arrow-up",
  "arrow-down",
]);
const el = ref<HTMLDivElement | null>(null);
onMounted(() => {
  if (el.value && props.block.content.text)
    el.value.textContent = props.block.content.text as string;
});
watch(
  () => props.isFocused,
  (f) => {
    if (f) nextTick(() => el.value?.focus());
  },
);
function onInput() {
  emit("update", { ...props.block.content, text: el.value?.textContent || "" });
}
function onKeydown(e: KeyboardEvent) {
  const text = el.value?.textContent || "";
  if (e.key === "Enter") {
    e.preventDefault();
    emit("enter", "");
  }
  if (e.key === "Backspace" && text === "") {
    e.preventDefault();
    emit("backspace-empty");
  }
  if (e.key === "ArrowUp") emit("arrow-up");
  if (e.key === "ArrowDown") emit("arrow-down");
}
</script>
<style scoped>
[contenteditable]:empty:before {
  content: attr(data-placeholder);
  color: var(--text-placeholder);
  pointer-events: none;
}
</style>
