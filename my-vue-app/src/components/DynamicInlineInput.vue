<script setup lang="ts">
import { ref, watch, computed, nextTick, onMounted } from 'vue';

// Define props and emits
const props = defineProps<{
  modelValue: string; // for v-model
  disabled?: boolean;
}>();
const emit = defineEmits(['update:modelValue']);

// --- STATE MANAGEMENT ---
const inputRef = ref<HTMLInputElement | HTMLTextAreaElement | null>(null);
const componentType = ref<'input' | 'textarea'>('input');
const isTextarea = computed(() => componentType.value === 'textarea');

// A threshold to switch to textarea when text gets long
const WIDTH_THRESHOLD = 40; 

// --- CORE LOGIC ---
// Watch for changes in the input value
watch(() => props.modelValue, (newValue) => {
  // Add this check. If newValue is not a string, default to 'input' and exit.
  if (typeof newValue !== 'string') {
    componentType.value = 'input';
    return;
  }

  // The rest of the logic is now safe
  if (newValue.includes('\n') || newValue.length > WIDTH_THRESHOLD) {
    if (componentType.value !== 'textarea') {
      componentType.value = 'textarea';
      nextTick(() => {
        inputRef.value?.focus();
      });
    }
  } else {
    if (componentType.value !== 'input') {
      componentType.value = 'input';
      nextTick(() => {
        inputRef.value?.focus();
      });
    }
  }
}, { immediate: true });
// Handle v-model updates from the input/textarea
const onInput = (event: Event) => {
  const target = event.target as HTMLInputElement | HTMLTextAreaElement;
  emit('update:modelValue', target.value);
};

// --- STYLE COMPUTATIONS ---
const inputStyle = computed(() => {
  if (isTextarea.value) return {};
  // Safely get the length of the modelValue, defaulting to 0 if it's not set
  const length = props.modelValue ? props.modelValue.length : 0;
  const size = length > 0 ? length + 2 : 15;
  return { width: `${size}ch` }; 
});

// --- ADD THIS NEW FUNCTION ---
const switchToTextarea = () => {
  // Only switch if it's currently an input
  if (componentType.value === 'input') {
    // Append a newline character to the current value
    emit('update:modelValue', props.modelValue + '\n');
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

/* Styles for the single-line input state */
.dynamic-input:not(.is-textarea) {
  /* Don't grow past the container's width */
  max-width: 100%; 
}

/* Styles for the multi-line textarea state */
.dynamic-input.is-textarea {
  width: 100%;
  resize: none;
  /* This is the magic property that makes the textarea grow with content */
  field-sizing: content;
  min-height: 2.5em; /* Start with a reasonable height */
  margin-top: 8px; /* Add some space when it becomes a block element */
  display: block;
    word-break: break-all; /* Add this line */

}

/* Add this new rule to handle long, unbroken words in the label */
.inline-input-label {
  word-break: break-all;
}
</style>