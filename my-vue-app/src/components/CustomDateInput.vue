<script setup lang="ts">
import { ref, computed } from "vue";

const props = defineProps<{ modelValue: string }>();
const emit = defineEmits(["update:modelValue"]);

const hiddenDateInput = ref<HTMLInputElement | null>(null);

// Formats the date from YYYY-MM-DD to DD/MM/YYYY for display
// const formattedDisplayDate = computed(() => {
//   if (!props.modelValue) return "";
//   const [year, month, day] = props.modelValue.split("-");
//   return `${day}/${month}/${year}`;
// });

// When the user selects a date from the hidden picker, update the v-model
const onDateSelected = (event: Event) => {
  const target = event.target as HTMLInputElement;
  emit("update:modelValue", target.value);
};

// When the user clicks the calendar icon, open the hidden date picker
const openDatePicker = () => {
  hiddenDateInput.value?.showPicker();
};

// --- ADD THIS NEW FUNCTION ---
// When the user types in the visible input, parse the date
// const handleTextInput = (event: Event) => {
//   const target = event.target as HTMLInputElement;
//   const typedValue = target.value;

//   // Use regex to check if the input is a valid DD/MM/YYYY date
//   const match = typedValue.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);

//   if (match) {
//     const [_, day, month, year] = match;
//     // If it matches, convert it to YYYY-MM-DD and update the model
//     emit("update:modelValue", `${year}-${month}-${day}`);
//   }
//   // If it doesn't match, you might want to handle it (e.g., clear the model if invalid)
//   // For now, it will just not update if the format is wrong.
// };
const handleTextInput = (event: Event) => {
  const input = event.target as HTMLInputElement;
  let typedValue = input.value;

  // Remove any character that is not a digit or a slash
  typedValue = typedValue.replace(/[^0-9/]/g, "");

  // Auto-add slash after the day (2 digits)
  if (typedValue.length === 2 && !typedValue.includes("/")) {
    typedValue += "/";
  }

  // Auto-add slash after the month (5 characters: DD/)
  if (typedValue.length === 5 && typedValue.split("/").length === 2) {
    typedValue += "/";
  }

  // Limit the total length to 10 characters (DD/MM/YYYY)
  if (typedValue.length > 10) {
    typedValue = typedValue.substring(0, 10);
  }

  // Update the input's visual value
  input.value = typedValue;

  // Now, check if it's a complete date to update the v-model
  const match = typedValue.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (match) {
    const [_, day, month, year] = match;
    // Emit the update in the standard YYYY-MM-DD format
    emit("update:modelValue", `${year}-${month}-${day}`);
  } else {
    // If the date is not complete, emit an empty string so the filter clears
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
  /* Inherit the styles from your .filter-select class */
  height: 2.5rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  padding: 0 2.5rem 0 0.75rem; /* Make space for the icon */
  width: 220px;
  background-color: white;
  cursor: text; /* Change cursor to text */
}

/* --- ADD: Style for the clickable calendar icon --- */
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
  /* Make the hidden input ignore mouse clicks so they pass through to the visible input */
  pointer-events: none;
}
</style>
