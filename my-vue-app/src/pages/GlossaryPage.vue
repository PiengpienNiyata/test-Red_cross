<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import GlossaryModal from "@/components/GlossaryModal.vue";

const router = useRouter();
const isGlossaryVisible = ref(false);

const glossaryData = ref([
  {
    term: "Remission",
    definition:
      "In a medical context, remission refers to a state in which the signs and symptoms of a disease have completely disappeared, either temporarily or permanently.",
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
    definition:
      "Distinguishes variants that share a core mechanism but differ by specific additional triggers.",
  },
  {
    term: "Autocrine",
    definition:
      "A cell signaling mechanism where a cell secretes a molecule that binds to receptors on the same cell, leading to a response within that cell.",
  },
  {
    term: "Paracrine",
    definition:
      "A cell signaling mechanism where a cell signals to neighboring cells.",
  },
  {
    term: "Endocrine",
    definition:
      "A cell signaling mechanism where a cell signals to distant cells, such as through the bloodstream.",
  },
      {
    term: "Contradiction",
  definition: "If different types or stages of a disease show contradictory responses (divergent responses) to the same treatment, or exhibit distinct molecular signatures, it raises the possibility that what we call one disease might actually represent separate disease entities with converging symptoms. It can also mean the disease is heterogeneous, and our current classification (by name or type) may be oversimplified or incorrect.",
  },
]);

const goToNextPage = () => {
  router.push("/questionnairesResearcher");
};

const openGlossaryModal = () => {
  isGlossaryVisible.value = true;
};

const closeGlossaryModal = () => {
  isGlossaryVisible.value = false;
};
</script>

<template>
  <div class="glossary-page">
    <h2>Important Glossary</h2>
    <p class="subtitle">
      Please review the following key terms before proceeding to the
      questionnaire.
    </p>

    <dl class="glossary-list">
      <div v-for="item in glossaryData" :key="item.term" class="glossary-item">
        <dt class="term">{{ item.term }}</dt>
        <dd class="definition">{{ item.definition }}</dd>
      </div>
    </dl>

    <div class="btn-container">
      <button class="next-btn" @click="goToNextPage">Next</button>
    </div>

    <span>
      To see these definitions again, click
      <a
        class="gls-btn"
        @click="openGlossaryModal"
        style="color: #eb4648; cursor: pointer"
      >
        Show all glossary
      </a>
    </span>

    <GlossaryModal :isVisible="isGlossaryVisible" @close="closeGlossaryModal" />
  </div>
</template>

<style scoped>
.glossary-page {
  padding: 16px 24px;
}
.title {
  font-size: 24px;
  font-weight: 500;
  color: #333;
  margin-bottom: 8px;
}
.subtitle {
  font-size: 16px;
  color: #555;
  margin-bottom: 24px;
}
.glossary-list {
  margin-top: 1rem;
}
.glossary-item {
  margin-bottom: 1.5rem;
  border-left: 3px solid #fbe9e7;
  padding-left: 1rem;
}
.term {
  font-weight: bold;
  font-size: 1.1rem;
  color: #eb4648;
  margin-bottom: 0.25rem;
}
.definition {
  margin-left: 0;
  font-size: 1rem;
  line-height: 1.6;
  color: #555;
}
.btn-container {
  margin-top: 40px;

  margin-bottom: 20px;
  text-align: left;
}
.next-btn {
  height: 100%;
  width: 144px;
  background-color: #eb4648;
  color: white;
  padding: 10px;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
}
.next-btn:hover {
  background-color: #c9302c;
}
</style>
