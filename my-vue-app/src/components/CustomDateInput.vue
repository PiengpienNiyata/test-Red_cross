<script setup lang="ts">
import { ref, computed } from "vue";

const props = defineProps<{ modelValue: string }>();
const emit = defineEmits(["update:modelValue"]);

const hiddenDateInput = ref<HTMLInputElement | null>(null);

const onDateSelected = (event: Event) => {
  const target = event.target as HTMLInputElement;
  emit("update:modelValue", target.value);
};

const openDatePicker = () => {
  hiddenDateInput.value?.showPicker();
};

const handleTextInput = (event: Event) => {
  const input = event.target as HTMLInputElement;
  let typedValue = input.value;

  typedValue = typedValue.replace(/[^0-9/]/g, "");

  if (typedValue.length === 2 && !typedValue.includes("/")) {
    typedValue += "/";
  }

  if (typedValue.length === 5 && typedValue.split("/").length === 2) {
    typedValue += "/";
  }

  if (typedValue.length > 10) {
    typedValue = typedValue.substring(0, 10);
  }

  input.value = typedValue;

  const match = typedValue.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (match) {
    const [_, day, month, year] = match;
    emit("update:modelValue", `${year}-${month}-${day}`);
  } else {
    emit("update:modelValue", "");
  }
};
</script>

<template>
  <div class="custom-date-input-wrapper">
    <input
      type="text"
      :value="modelValue ? modelValue.split('-').reverse().join('/') : ''"
      @input="handleTextInput"
      @click="openDatePicker"
      class="visible-date-input"
      placeholder="Date (DD/MM/YYYY)"
    />
    <span class="calendar-icon" @click="openDatePicker"></span>

    <input
      type="date"
      ref="hiddenDateInput"
      :value="modelValue"
      @input="onDateSelected"
      class="hidden-date-input"
    />
  </div>
</template>

<style scoped>
.custom-date-input-wrapper {
  position: relative;
}

.visible-date-input {
  height: 2.5rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  padding: 0 2.5rem 0 0.75rem;
  width: 220px;
  background-color: white;
  cursor: text;
}

.calendar-icon {
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  width: 1em;
  height: 1em;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='currentColor' class='bi bi-calendar' viewBox='0 0 16 16'%3E%3Cpath d='M3.5 0a.5.5 0 0 1 .5.5V1h8V.5a.5.5 0 0 1 1 0V1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h1V.5a.5.5 0 0 1 .5-.5zM1 4v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V4H1z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: center;
  background-size: contain;
  cursor: pointer;
}

.visible-date-input:focus {
  outline: none;
  border-color: #ef4444;
  box-shadow: 0 0 0 2px rgba(239, 68, 68, 0.4);
}

.hidden-date-input {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  pointer-events: none;
}
</style>
