<script setup lang="ts">
import { ref, watch, computed, nextTick, onMounted } from "vue";

const props = defineProps<{
  modelValue: string;
  disabled?: boolean;
}>();
const emit = defineEmits(["update:modelValue"]);

const inputRef = ref<HTMLInputElement | HTMLTextAreaElement | null>(null);
const componentType = ref<"input" | "textarea">("input");
const isTextarea = computed(() => componentType.value === "textarea");

const WIDTH_THRESHOLD = 40;

watch(
  () => props.modelValue,
  (newValue) => {
    if (typeof newValue !== "string") {
      componentType.value = "input";
      return;
    }

    if (newValue.includes("\n") || newValue.length > WIDTH_THRESHOLD) {
      if (componentType.value !== "textarea") {
        componentType.value = "textarea";
        nextTick(() => {
          inputRef.value?.focus();
        });
      }
    } else {
      if (componentType.value !== "input") {
        componentType.value = "input";
        nextTick(() => {
          inputRef.value?.focus();
        });
      }
    }
  },
  { immediate: true }
);
const onInput = (event: Event) => {
  const target = event.target as HTMLInputElement | HTMLTextAreaElement;
  emit("update:modelValue", target.value);
};

const inputStyle = computed(() => {
  if (isTextarea.value) return {};
  const length = props.modelValue ? props.modelValue.length : 0;
  const size = length > 0 ? length + 2 : 15;
  return { width: `${size}ch` };
});

const switchToTextarea = () => {
  if (componentType.value === "input") {
    emit("update:modelValue", props.modelValue + "\n");
  }
};
</script>

<template>
  <textarea
    v-if="isTextarea"
    ref="inputRef"
    :value="modelValue"
    @input="onInput"
    :disabled="disabled"
    class="dynamic-input is-textarea"
    rows="1"
  ></textarea>

  <input
    v-else
    ref="inputRef"
    :value="modelValue"
    @input="onInput"
    @keydown.enter.prevent="switchToTextarea"
    :disabled="disabled"
    class="dynamic-input"
    :style="inputStyle"
  />
</template>

<style scoped>
.dynamic-input {
  border: 1px solid #a4a4a4;
  border-radius: 4px;
  padding: 4px 6px;
  font-size: 18px;
  background-color: white;
  vertical-align: middle;
  transition: all 0.2s ease;
}

.dynamic-input:focus {
  outline: none;
  border-color: #eb4648;
  box-shadow: 0 0 0 2px rgba(239, 68, 68, 0.4);
}

.dynamic-input:disabled {
  background-color: #e9ecef;
  cursor: not-allowed;
}

.dynamic-input:not(.is-textarea) {
  max-width: 100%;
}

.dynamic-input.is-textarea {
  width: 100%;
  resize: none;
  field-sizing: content;
  min-height: 2.5em;
  margin-top: 8px;
  display: block;
  word-break: break-all;
}

.inline-input-label {
  word-break: break-all;
}
</style>
