<script setup lang="ts">
import { glossaryData } from "@/stores/glossary";

defineProps<{
  isVisible: boolean;
}>();
const emit = defineEmits(["close"]);
</script>

<template>
  <div v-if="isVisible" class="modal-overlay" @click.self="emit('close')">
    <div class="modal-content">
      <div class="modal-header">
        <h2 class="modal-title">Glossary</h2>
        <button class="close-button" @click="emit('close')">&times;</button>
      </div>
      <div class="modal-body">
        <dl class="glossary-list">
          <div
            v-for="item in glossaryData"
            :key="item.term"
            class="glossary-item"
          >
            <dt class="term">{{ item.term }}</dt>
            <dd class="definition" v-html="item.definition"></dd>
          </div>
        </dl>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
}
.modal-content {
  background: white;
  border-radius: 8px;
  width: 90%;
  max-width: 800px;
  max-height: 85vh;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
  text-align: left;

  /* NEW: Use flexbox to structure the modal */
  display: flex;
  flex-direction: column;
  overflow: hidden; /* Hide the main scrollbar */
}

/* --- FIXED HEADER --- */
.modal-header {
  padding: 0 2.5rem;
  position: relative;
  flex-shrink: 0; /* Prevents the header from shrinking */
}

.modal-title {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
  color: #333;
  /* border-bottom: 1px solid #eee; */
  padding-bottom: 1rem;
}

.close-button {
  position: absolute;
  /* top: 1rem; */
  right: 2.5rem;
  border: none;
  background: none;
  font-size: 2.5rem;
  cursor: pointer;
  color: #aaa;
  line-height: 0.4;
  padding-bottom: 1rem;
}
.close-button:hover {
  color: #333;
}

/* --- SCROLLABLE BODY --- */
.modal-body {
  padding: 0 2.5rem 2rem 2.5rem; /* Add padding to the body instead of the main container */
  overflow-y: auto; /* This makes ONLY the body scrollable */
}

.glossary-list {
  margin-top: 1rem;
}

.glossary-item {
  margin-bottom: 2rem;
  border-left: 3px solid #fce8e6;
  padding-left: 1.5rem;
}

.term {
  font-weight: bold;
  font-size: 1.2rem;
  color: #eb4648;
  margin-bottom: 0.5rem;
}

.definition {
  margin-left: 0;
  font-size: 1rem;
  line-height: 1.7;
  color: #333;
}

/* Deep selector to style the HTML from the store */
:deep(ul),
:deep(ol) {
  padding-left: 2rem;
  margin-top: 0.5rem;
  margin-bottom: 1rem;
}
:deep(strong) {
  font-weight: 600;
}
:deep(em) {
  font-style: italic;
}
</style>
