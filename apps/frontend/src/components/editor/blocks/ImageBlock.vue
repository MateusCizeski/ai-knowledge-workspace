<template>
  <div class="my-2">
    <div v-if="src" class="relative group rounded-xl overflow-hidden">
      <img
        :src="src"
        alt="Block image"
        class="max-w-full rounded-xl"
        style="border: 1px solid var(--border)"
      />
      <div
        class="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center"
      >
        <button
          @click="clearImage"
          class="opacity-0 group-hover:opacity-100 transition-opacity px-3 py-1.5 rounded-lg text-sm font-medium text-white"
          style="background: rgba(0, 0, 0, 0.6)"
        >
          Remove
        </button>
      </div>
      <div
        class="outline-none text-center text-sm py-1 mt-1"
        style="color: var(--text-tertiary)"
        :contenteditable="true"
        data-placeholder="Add a caption…"
        @input="onCaptionInput"
        ref="captionEl"
      ></div>
    </div>

    <div
      v-else
      @click="triggerUpload"
      @dragover.prevent="dragOver = true"
      @dragleave="dragOver = false"
      @drop.prevent="onDrop"
      :class="[
        'flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed py-8 cursor-pointer transition-all',
        dragOver ? 'border-accent scale-[1.01]' : '',
      ]"
      style="border-color: var(--border); background: var(--bg-secondary)"
    >
      <span class="text-3xl">🖼️</span>
      <div class="text-center">
        <p class="text-sm font-medium" style="color: var(--text-secondary)">
          Drop image or click to upload
        </p>
        <p class="text-xs mt-0.5" style="color: var(--text-tertiary)">
          PNG, JPG, GIF up to 5MB
        </p>
      </div>
      <input
        ref="fileInput"
        type="file"
        accept="image/*"
        class="hidden"
        @change="onFileChange"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
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
const fileInput = ref<HTMLInputElement | null>(null);
const captionEl = ref<HTMLDivElement | null>(null);
const dragOver = ref(false);
const src = computed(() => (props.block.content.src as string) || "");
onMounted(() => {
  if (captionEl.value && props.block.content.caption)
    captionEl.value.textContent = props.block.content.caption as string;
});
function triggerUpload() {
  fileInput.value?.click();
}
function clearImage() {
  emit("update", { ...props.block.content, src: "" });
}
function onCaptionInput() {
  emit("update", {
    ...props.block.content,
    caption: captionEl.value?.textContent || "",
  });
}
async function loadFile(file: File) {
  if (file.size > 5 * 1024 * 1024) return alert("Image must be under 5MB");
  const reader = new FileReader();
  reader.onload = (e) =>
    emit("update", { ...props.block.content, src: e.target?.result as string });
  reader.readAsDataURL(file);
}
function onFileChange(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0];
  if (file) loadFile(file);
}
function onDrop(e: DragEvent) {
  dragOver.value = false;
  const file = e.dataTransfer?.files?.[0];
  if (file?.type.startsWith("image/")) loadFile(file);
}
</script>
<style scoped>
[contenteditable]:empty:before {
  content: attr(data-placeholder);
  color: var(--text-placeholder);
  pointer-events: none;
}
.border-accent {
  border-color: var(--accent) !important;
  background: var(--accent-light) !important;
}
</style>
