<script setup lang="ts">
import { ref } from 'vue';

defineProps<{
  isVisible: boolean;
}>();
const emit = defineEmits(['close']);

const glossaryData = ref([
  {
    term: "Remission",
    definition:
      "In a medical context, remission refers to a state in which the signs and symptoms of a disease have completely disappeared, either temporarily or permanently."
  },
  {
    term: "True remission",
    definition:
      "The occurrence of molecular normalization in the originating cells of a disease, combined with the complete disappearance of clinical signs and symptoms for a duration exceeding the onset timeframe of the designated disease.",
  },
  {
    term: "Unstable remission",
    definition:
      "The status in which true remission has occurred while the source of the causative signal still persists.",
  },
  {
    term: "Molecular Stages of the Disease",
    definition:
      "The natural progression of a disease in which all stages are molecularly driven by the same originating cell and signal, differing only in intensity and duration.",
  },
  {
    term: "Molecular Types of the Disease",
    definition:
      "Distinct clusters of disease characteristics that share common molecular origins—driven by the same originating cell and signal—but are further influenced by additional distinct signals.",
  },
  {
    term: "Molecular Clinico-pathological Cascade (Molecular Cascade)",
    definition:
      "A sequence of molecular signals initiated by a primary signal that drives the originating cell, leading to the development of clinical or pathological characteristics. This cascade may also trigger subsequent signals, aligning with diagnostic criteria based on clinical or histological features.",
  },
      {
    term: "Typing",
    definition: "distinguishes variants that share a core mechanism but differ by specific additional triggers.",
  },
  {
    term: "Autocrine",
    definition:
      "A cell signaling mechanism where a cell secretes a molecule that binds to receptors on the same cell, leading to a response within that cell.",
  },
  {
    term: "Paracrine",
    definition: "A cell signaling mechanism where a cell signals to neighboring cells.",
  },
  {
    term: "Endocrine",
    definition: "A cell signaling mechanism where a cell signals to distant cells, such as through the bloodstream.",
  },
    {
    term: "Contradiction",
  definition: "If different types or stages of a disease show contradictory responses (divergent responses) to the same treatment, or exhibit distinct molecular signatures, it raises the possibility that what we call one disease might actually represent separate disease entities with converging symptoms. It can also mean the disease is heterogeneous, and our current classification (by name or type) may be oversimplified or incorrect.",
  },
]);
</script>

<template>
  <div v-if="isVisible" class="modal-overlay" @click.self="emit('close')">
    <div class="modal-content">
      <button class="close-button" @click="emit('close')">&times;</button>
      <h2 class="modal-title">Glossary</h2>
      <dl class="glossary-list">
        <div v-for="item in glossaryData" :key="item.term" class="glossary-item">
          <dt class="term">{{ item.term }}</dt>
          <dd class="definition">{{ item.definition }}</dd>
        </div>
      </dl>
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
  z-index: 1000;
}

.modal-content {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  width: 90%;
  max-width: 600px;
  max-height: 80vh;
  overflow-y: auto;
  position: relative;
  box-shadow: 0 5px 15px rgba(0,0,0,0.3);
}

.modal-title {
  margin-top: 0;
  color: #333;
  border-bottom: 1px solid #eee;
  padding-bottom: 1rem;
}

.close-button {
  position: absolute;
  top: 10px;
  right: 30px;
  border: none;
  background: none;
  font-size: 2rem;
  cursor: pointer;
  color: #aaa;
}
.close-button:hover {
  color: #333;
}

.glossary-list {
  margin-top: 1rem;
}

.glossary-item {
  margin-bottom: 1.5rem;
}

.term {
  font-weight: bold;
  font-size: 1.1rem;
  color: #eb4648; /* Matching your theme's red color */
  margin-bottom: 0.25rem;
}

.definition {
  margin-left: 0;
  font-size: 1rem;
  line-height: 1.6;
  color: #555;
}
</style>