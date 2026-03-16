<template>
  <component
    :is="tag"
    :class="classes"
    :contenteditable="true"
    :data-placeholder="placeholder"
    @input="onInput"
    @keydown="onKeydown"
    @focus="$emit('focus')"
    @blur="$emit('blur')"
    ref="el"
  ></component>
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

const el = ref<HTMLElement | null>(null);

const tag = computed(() => {
  const map: Record<string, string> = {
    HEADING_1: "h1",
    HEADING_2: "h2",
    HEADING_3: "h3",
  };
  return map[props.block.type] || "h2";
});

const classes = computed(() => {
  const base = "w-full outline-none font-bold text-gray-900 leading-tight";
  const sizeMap: Record<string, string> = {
    HEADING_1: "text-3xl mt-8 mb-2",
    HEADING_2: "text-2xl mt-6 mb-2",
    HEADING_3: "text-xl mt-4 mb-1",
  };
  return `${base} ${sizeMap[props.block.type] || "text-2xl"}`;
});

const placeholder = computed(() => {
  const map: Record<string, string> = {
    HEADING_1: "Heading 1",
    HEADING_2: "Heading 2",
    HEADING_3: "Heading 3",
  };
  return map[props.block.type] || "Heading";
});

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
  color: #d1d5db;
  pointer-events: none;
}
</style>
