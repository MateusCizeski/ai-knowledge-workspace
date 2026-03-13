<template>
  <div
    class="flex items-start gap-3 rounded-xl px-4 py-3 my-1"
    style="background: var(--accent-light); border: 1px solid var(--border)"
  >
    <button
      @click="cycleEmoji"
      class="text-xl flex-shrink-0 mt-0.5 hover:scale-110 transition-transform"
    >
      {{ emoji }}
    </button>
    <div
      class="flex-1 outline-none leading-relaxed min-h-[1.5rem]"
      style="color: var(--text-primary)"
      :contenteditable="true"
      data-placeholder="Callout note…"
      @input="onInput"
      @keydown="onKeydown"
      @focus="$emit('focus')"
      @blur="$emit('blur')"
      ref="el"
    ></div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick } from "vue";
import type { Block } from "@/stores/pages.store";
const props = defineProps<{ block: Block; isFocused: boolean }>();
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
const emojis = ["💡", "ℹ️", "⚠️", "🚨", "✅", "📌", "🔑", "💬"];
const emoji = computed(() => (props.block.content.emoji as string) || "💡");
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
function cycleEmoji() {
  const idx = emojis.indexOf(emoji.value);
  emit("update", {
    ...props.block.content,
    emoji: emojis[(idx + 1) % emojis.length],
  });
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
