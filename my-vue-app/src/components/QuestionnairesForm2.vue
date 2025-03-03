<script setup lang="ts">
import { defineProps, ref, onMounted, computed } from "vue";
import type { Questionnaire2, Question2 } from "@/stores/questionnairesResearcher2";
import { saveAs } from "file-saver";

const props = defineProps<{ questionnaire: Questionnaire2 }>();
const answers = ref<Record<number, string | string[]>>({});
const currentQuestion = ref<Question2 | null>(props.questionnaire.sections[0].questions[0]);

const existingResponses = ref([]);
const responseFile = `${props.questionnaire.title.replace(/\s+/g, "_")}_response.json`;

const loadExistingResponses = async () => {
  try {
    const response = await fetch(responseFile);
    if (!response.ok) throw new Error("Response file not found.");
    existingResponses.value = await response.json();
  } catch (error) {
    console.error("Error loading existing responses:", error);
    existingResponses.value = [];
  }
};

onMounted(loadExistingResponses);

const saveResponses = () => {
  const newResponse = {
    title: props.questionnaire.title,
    responses: JSON.parse(JSON.stringify(answers.value)),
  };

  existingResponses.value.push(newResponse);

  const blob = new Blob([JSON.stringify(existingResponses.value, null, 2)], {
    type: "application/json",
  });

  saveAs(blob, responseFile);
};

const nextQuestion = () => {
  if (!currentQuestion.value) return;
  
  const selectedAnswer = answers.value[currentQuestion.value.id];
  if (!selectedAnswer) return;
  
  const nextId = currentQuestion.value.next?.[selectedAnswer as string];
  if (nextId === "preResult") {
    showPreResult();
  } else if (nextId === "finalResult") {
    showFinalResult();
  } else {
    const allQuestions = props.questionnaire.sections.flatMap(s => s.questions);
    currentQuestion.value = allQuestions.find(q => q.id === nextId) || null;
  }
};

const prevQuestion = () => {
  // Logic for navigating back if necessary
};

const showPreResult = () => {
  console.log("User selected 'ไม่แน่ใจ'. Showing pre-result page.");
  // Implement logic for pre-result display
};

const showFinalResult = () => {
  console.log("Questionnaire complete. Showing final result.");
  // Implement logic for final result display
};

const isNextDisabled = computed(() => {
  return !currentQuestion.value || !answers.value[currentQuestion.value.id];
});
</script>

<template>
  <div class="questionnaire">
    <h3 v-if="questionnaire.title !== 'null'" class="title">{{ questionnaire.title }}</h3>

    <form @submit.prevent="saveResponses" class="form-container">
      <div v-if="currentQuestion" class="question">
        <label class="question-label" v-text="currentQuestion.question"></label>

        <input v-if="currentQuestion.type === 'text'" v-model="answers[currentQuestion.id]" :placeholder="currentQuestion.question" type="text" class="input-text" />

        <div v-else-if="currentQuestion.type === 'radio'" class="radio-group">
          <div v-for="option in currentQuestion.options" :key="option" class="radio-option">
            <input type="radio" :name="'q' + currentQuestion.id" :value="option" v-model="answers[currentQuestion.id]" class="radio-input" />
            <label class="radio-label">{{ option }}</label>
          </div>
        </div>
      </div>

      <div class="btn-container">
        <button type="button" class="back-btn" @click="prevQuestion" :disabled="!currentQuestion">
          กลับ
        </button>
        <button type="button" class="next-btn" @click="nextQuestion" :disabled="isNextDisabled">
          ถัดไป
        </button>
      </div>
    </form>
  </div>
</template>

<style scoped>
.questionnaire {
  padding-left: 16px;
  padding-right: 16px;
}

.title {
  font-weight: 400;
  padding: 8px 0px;
  font-size: 20px;
  line-height: 24px;
  margin-bottom: 16px;
}

.form-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.section {
  border: none;
}

.section-title {
  font-size: 20px;
  font-weight: 400;
  padding: 0;
  margin: 0px 0px 24px 0px;
  border: none;
}

.question {
  margin: 0 !important;
  padding-top: 0px;
  padding-bottom: 0px;
  padding-left: 16px;
  padding-right: 16px;
}

.question-label {
  font-size: 18px;
  display: block;
  padding: 8px;
  color: #000000;
}

.input-text {
  font-size: 18px;
  margin-bottom: 24px;
  width: 100%;
  padding: 8px;
  border: 1px solid #A4A4A4;
  border-radius: 4px;
}

.radio-group,
.checkbox-group {
  display: flex;
  flex-direction: column;
}

.radio-option,
.checkbox-option {
  font-size: 18px;
  padding: 0px 8px;
  display: flex;
  align-items: center;
  margin: 12px 0px;
  gap: 10px;
}

.radio-input,
.checkbox-input {
  accent-color: #EB4648;
  cursor: pointer;
}

.btn-container {
  display: flex;
  gap: 14px;
}

.back-btn,
.next-btn {
  height: 100%;
  width: 95px;
  padding: 8px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.back-btn {
  background-color: #D6D6D6;
  color: white;
  margin-right: 14px;
}

.next-btn {
  background-color: #EB4648;
  color: white;
}

.next-btn:hover {
  background-color: #c9302c;
}

.back-btn:hover {
  background-color: #b0b0b0;
}

.back-btn:disabled{
  background-color: #E0E0E0;
  cursor: not-allowed;
}
.next-btn:disabled{
  background-color: #eb46496b;
}
</style>
