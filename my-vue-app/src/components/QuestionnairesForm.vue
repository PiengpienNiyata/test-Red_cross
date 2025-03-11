<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useQuestionnaireStore } from "@/stores/useQuestionnaireStore";
import { questionnaireData } from "@/stores/questionnairesResearcher";
const store = useQuestionnaireStore();
const questionnaire = ref(questionnaireData[0]);
const router = useRouter();
const answers = ref<Record<number, string | string[]>>({ ...store.answers });

const saveAnswers = () => {
  store.setAnswers(answers.value);
  console.log(answers.value);
  router.push("/questionnairesResearcher2");
};


const initializeAnswers = () => {
  questionnaire.value.sections.forEach((section) => {
    section.questions.forEach((q) => {
      if (q.type === "checkbox" && !Array.isArray(answers.value[q.id])) {
        answers.value[q.id] = [];
      }
    });
  });
};

onMounted(() => {
  initializeAnswers();
});

</script>


<template>
  <div class="questionnaire">
    <h3 v-if="questionnaire.title !== 'null'" class="title">
      {{ questionnaire.title }}
    </h3>

    <form @submit.prevent="saveAnswers" class="form-container">
      <div v-for="section in questionnaire.sections" :key="section.name" class="section">
        <h4 v-if="section.name !== 'null'" class="section-title">
          {{ section.name }}
        </h4>

        <div class="row">
          <div v-for="q in section.questions ?? []" :key="q.id"  :class="{
              'col-md-6': q.id === 1001 || q.id === 1002 || q.id === 1004 || q.id === 1005,
              'col-md-12': q.id === 1003,
              'no-margin': q.id === 1001 || q.id === 1002 || q.id === 1003,
              'padding-left': q.id === 1001,
              'padding-right': q.id === 1002,
            }">
            <label class="question-label">{{ q.question }}</label>

            <input
              v-if="q.type === 'text'"
              v-model="answers[q.id]"
              :placeholder="q.question"
              type="text"
              class="input-text"
            />

            <div v-else-if="q.type === 'radio'" class="radio-group">
              <div v-for="option in q.options" :key="option" class="radio-option">
                <input
                  type="radio"
                  :name="'q' + q.id"
                  :value="option"
                  v-model="answers[q.id]"
                  class="radio-input"
                />
                <label class="radio-label">{{ option }}</label>
              </div>
            </div>

            <div v-else-if="q.type === 'checkbox'" class="checkbox-group">
              <div v-for="option in q.options" :key="option" class="checkbox-option">
                <input
                  type="checkbox"
                  :value="option"
                  v-model="answers[q.id]"
                  class="checkbox-input"
                />
                <label class="checkbox-label">{{ option }}</label>
              </div>
            </div>
          </div>
        </div>
      </div>

      <button type="submit" class="submit-btn">ถัดไป</button>
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

.question.no-margin {
  margin-bottom: 0 !important;
}

.no-margin {
  margin: 0 !important;
}

.padding-left {
  padding-right: 0px !important;
  padding-left: 16px !important;
}

.padding-right {
  padding-right: 16px !important;
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
  border: 1px solid #a4a4a4;
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
  accent-color: #eb4648;
  cursor: pointer;
}

.submit-btn {
  height: 100%;
  width: 144px;
  background-color: #eb4648;
  color: white;
  padding: 8px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.submit-btn:hover {
  background-color: #c9302c;
}
</style>
