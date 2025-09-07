<script setup lang="ts">
import { ref, computed } from "vue";
import { useQuestionnaireStore } from "@/stores/useQuestionnaireStore";
import { useRouter } from "vue-router";
import { storeToRefs } from "pinia";

const store = useQuestionnaireStore();
const router = useRouter();

const { contradictionStep: step } = storeToRefs(store);

const disease1 = ref(store.answers[1006] || "");
const disease2 = ref("");
const disease3 = ref("");

const enteredDiseases = computed(() => {
  return [disease1.value, disease2.value, disease3.value].filter(
    (d) => d.trim() !== ""
  );
});
const isNextDisabled = computed(() => {
  return enteredDiseases.value.length < 2;
});

const selectedDisease = ref("");

const routeCDefinition = {
  route: "Route C",
  title: "Contradiction Reveals Complexity",
  // WHY: Changed from a single string to an array of strings for list formatting.
  description: [
    "Multiple cell types are involved",
    "Clinical variants show opposite or divergent responses to the same intervention",
    "There’s clear contradiction in natural history of the disease and how lesions react",
    "Suggests disease may be misclassified",
    "Goal: Re-examine disease definition and core pathway",
  ],
};

const goToStep2 = () => {
  store.setContradictionStep(2);
};

const goToStep1 = () => {
  store.setContradictionStep(1);
};

const restudyQuestionnaire = () => {
  if (!selectedDisease.value) {
    alert("Please select a disease to restudy.");
    return;
  }

  store.answers[1006] = selectedDisease.value;

  store.resetServey();

  router.push("/questionnairesResearcher");
};
</script>

<template>
  <div class="contradiction-container">
    <div v-if="step === 1" class="contradiction-step">
      <div class="preamble-inline">
        <div class="preamble-icon">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 16 16"
            width="16"
            height="16"
          >
            <path
              fill="currentColor"
              fill-rule="evenodd"
              d="M8 1.5a6.5 6.5 0 1 0 0 13a6.5 6.5 0 0 0 0-13M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8m7.25-2.25a.75.75 0 0 1 .75.75v3.5a.75.75 0 0 1-1.5 0v-3.5a.75.75 0 0 1 .75-.75M8 11a1 1 0 1 1 0-2a1 1 0 0 1 0 2"
            />
          </svg>
        </div>
        <div class="preamble-text-group">
          <strong>Contradiction Identified</strong>
          <p>
            Your disease diagnosis has contradiction. It may suggest different
            diseases, please consider and separate it into multiple diseases.
          </p>
        </div>
      </div>

      <label class="question-label"
        >Please enter the separated disease names:</label
      >

      <div class="row">
        <div class="col-md-12 question-container">
          <div class="label-wrapper">
            <label class="question-label-sub">Contradict Disease 1</label>
            <span class="optional-remark"><span class="asterisk">*</span></span>
          </div>
          <input
            type="text"
            v-model="disease1"
            placeholder="Enter first disease name"
            class="input-text"
          />
        </div>

        <div class="col-md-12 question-container">
          <div class="label-wrapper">
            <label class="question-label-sub">Contradict Disease 2</label>
            <span class="optional-remark"><span class="asterisk">*</span></span>
          </div>
          <input
            type="text"
            v-model="disease2"
            placeholder="Enter second disease name"
            class="input-text"
          />
        </div>

        <div class="col-md-12 question-container">
          <div class="label-wrapper">
            <label class="question-label-sub"
              >Contradict Disease 3 (Optional)</label
            >
          </div>
          <input
            type="text"
            v-model="disease3"
            placeholder="Enter third disease name"
            class="input-text"
            :disabled="isNextDisabled"
          />
        </div>
      </div>

      <div class="btn-container">
        <button @click="goToStep2" class="next-btn" :disabled="isNextDisabled">
          Next
        </button>
      </div>
    </div>

    <div v-else-if="step === 2" class="contradiction-step">
      <h2>Analysis and Refined Starting Point</h2>

      <div class="summary-section">
        <h3>Hypothesized Disease Separation</h3>
        <p class="summary-explanation">
          Based on your input, the original diagnosis has been separated into
          the following potential disease entities:
        </p>
        <ul>
          <li v-for="disease in enteredDiseases" :key="disease">
            {{ disease }}
          </li>
        </ul>
      </div>

      <div class="summary-section">
        <h3>Recommended Research Pathway</h3>
        <div class="route-item">
  <h4 class="route-title">
    <span class="final-route-text">{{ routeCDefinition.route }}</span>
    <span>: {{ routeCDefinition.title }}</span>
  </h4>
  <ul class="route-description">
    <li v-for="(item, index) in routeCDefinition.description" :key="index">
      {{ item }}
    </li>
  </ul>
</div>
      </div>

      <div class="summary-section">
        <label class="question-label"
          >Please select the primary disease entity to re-investigate:</label
        >
        <div class="radio-group">
          <div
            v-for="disease in enteredDiseases"
            :key="disease"
            class="radio-option"
          >
            <input
              type="radio"
              :id="disease"
              :value="disease"
              v-model="selectedDisease"
              class="radio-input"
            />
            <label :for="disease">{{ disease }}</label>
          </div>
        </div>
      </div>

      <div class="btn-container">
        <button @click="goToStep1" class="back-btn">Back</button>
        <button
          @click="restudyQuestionnaire"
          class="cont-btn"
          :disabled="!selectedDisease"
        >
          Restudy Questionnaire
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.contradiction-container {
  padding-left: 16px;
  padding-right: 16px;
  margin: 0 auto;
  border-radius: 8px;
  align-items: flex-start;
}
.contradiction-step {
  display: flex;
  flex-direction: column;
}
h2 {
  color: #d84315;
  margin-bottom: 0.5rem;
}
.subtitle {
  line-height: 1.6;
  margin-bottom: 2rem;
  font-size: 1.1rem;
}
.question-container {
  margin-bottom: 1rem;
}

.label-wrapper {
  display: flex;
  align-items: baseline;
  padding: 8px 0;
}

.question-label-sub {
  font-size: 18px;
}

.input-text {
  font-size: 18px;
  width: 100%;
  padding: 8px;
  border: 1px solid #a4a4a4;
  border-radius: 4px;
}

.input-text:disabled {
  background-color: #e9ecef;
  cursor: not-allowed;
}

.optional-remark {
  font-size: 24px;
  color: #6c757d;
  margin-left: 4px;
  line-height: 1;
}

.optional-remark .asterisk {
  color: #eb4848;
}

.row {
  display: flex;
  flex-wrap: wrap;
  margin-left: 16px;
  margin-right: 16px;
}

.col-md-12 {
  width: 100%;
  padding: 0 8px;
}
.btn-container {
  margin-top: 40px;
  display: flex;
  gap: 14px;
}
.btn-container.space-between {
  justify-content: space-between;
}
.next-btn,
.back-btn {
  height: 100%;
  width: 95px;
  padding: 8px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.cont-btn {
  height: 100%;
  padding: 8px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.next-btn,
.cont-btn {
  background-color: #eb4648;
  color: white;
}
.next-btn:hover,
.cont-btn:hover {
  background-color: #c9302c;
}
.next-btn:disabled,
.cont-btn:disabled {
  background-color: #fca5a5;
  cursor: not-allowed;
}
.back-btn {
  background-color: #e5e7eb;
  color: #374151;
}
.back-btn:hover {
  background-color: #d1d5db;
}

.summary-section {
  margin-top: 1.5rem;
}
.summary-section h3 {
  border-bottom: 1px solid #ffccbc;
  padding-bottom: 0.5rem;
  margin-bottom: 1rem;
}
.summary-section ul {
  list-style-type: disc;
  padding-left: 20px;
}
.route-item {
  list-style: none;
}
.route-title {
  font-size: 1.2rem;
}
.final-route-text {
  color: #eb4648;
  font-weight: bold;
}
.route-description {
  margin-left: 16px;
  color: #555;
}
.radio-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.radio-option {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.1rem;
}

.preamble-inline {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  background-color: #fbe9e7;
  color: #5d4037;
  border: 1px solid #ffab91;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 2rem;
}
.preamble-icon {
  flex-shrink: 0;
  color: #d84315;
  margin-top: 4px;
}
.preamble-text-group strong {
  font-weight: 600;
  font-size: 1.1rem;
  display: block;
  margin-bottom: 0.5rem;
}
.preamble-text-group p {
  margin-bottom: 0;
}
.question-label {
  font-size: 18px;
  display: block;
  padding: 8px;
  color: #000000;
}

.required-asterisk {
  color: #eb4648;
  font-weight: bold;
  margin-left: 4px;
}

.radio-input,
.checkbox-input {
  accent-color: #eb4648;
  cursor: pointer;
  margin-left: 24px;
}

.summary-explanation {
  font-style: italic;
  color: #555;
  margin-bottom: 1rem;
}
</style>
