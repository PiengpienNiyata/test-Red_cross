<script setup lang="ts">
import { ref } from "vue";
import GlossaryModal from "@/components/GlossaryModal.vue";
import { useRouter } from "vue-router";
import { glossaryData } from "@/stores/glossary"; 

const router = useRouter();
const isGlossaryVisible = ref(false);
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
        <dd class="definition" v-html="item.definition"></dd>
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
  padding: 2rem;
  margin: 0 auto;
}

.subtitle {
  font-size: 1rem;
  color: #555;
  margin-bottom: 2rem;
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

:deep(ul), :deep(ol) {
    padding-left: 2rem;
    margin-top: 0.5rem;
    margin-bottom: 1rem;
}
:deep(strong) {
    font-weight: 600;
}
</style>