<script setup lang="ts">
import { defineProps, ref, onMounted } from "vue";
import type { Questionnaire } from "@/stores/questionnaires";
import { saveAs } from "file-saver";

const props = defineProps<{ questionnaire: Questionnaire }>();
const answers = ref<Record<number, string | string[]>>({});

props.questionnaire.sections.forEach((section) => {
  section.questions.forEach((q) => {
    if (q.type === "checkbox" && !Array.isArray(answers.value[q.id])) {
      answers.value[q.id] = [];
    }
  });
});

const existingResponses = ref([]);

const responseFile = `${props.questionnaire.title
  .replace(/\s+/g, "_")}_response.json`;

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
</script>

<template>
  <div class="questionnaire">
    <h3 v-if="questionnaire.title !== 'null'" class="title">{{ questionnaire.title }}</h3>

    <form @submit.prevent="saveResponses" class="form-container">
      <div v-for="section in questionnaire.sections" :key="section.name" class="section">
        <h4 v-if="section.name !== 'null'" class="section-title">{{ section.name }}</h4>

        <div class="row">
          <div v-for="q in section.questions ?? []" :key="q.id" :class="{
            'col-md-6': q.id === 1 || q.id === 2,
            'col-md-12': q.id === 3,
            'no-margin': q.id === 1 || q.id === 2 || q.id === 3,
            'padding-left': q.id === 1,
            'padding-right': q.id === 2
          }" class="question">
            <label class="question-label" v-text="q.question"></label>



            <input v-if="q.type === 'text'" v-model="answers[q.id]" :placeholder="q.question" type="text"
              class="input-text" />

            <div v-else-if="q.type === 'radio'" class="radio-group">
              <div v-for="option in q.options" :key="option" class="radio-option">
                <input type="radio" :name="'q' + q.id" :value="option" v-model="answers[q.id]" class="radio-input" />
                <label class="radio-label">{{ option }}</label>
              </div>
            </div>

            <div v-else-if="q.type === 'checkbox'" class="checkbox-group">
              <div v-for="option in q.options" :key="option" class="checkbox-option">
                <input type="checkbox" :value="option" v-model="answers[q.id]" class="checkbox-input" />
                <label class="checkbox-label">{{ option }}</label>
              </div>
            </div>
          </div>
        </div>
      </div>

      <button type="submit" class="submit-btn">Submit</button>
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

.padding-left{
  padding-right: 0px !important;
  padding-left: 16px !important;
}

.padding-right{
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
  border: 1px solid #A4A4A4;
  border-radius: 4px;
}

.radio-group,
.checkbox-group {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.radio-option,
.checkbox-option {
  font-size: 18px;
  padding: 8px;
  display: flex;
  align-items: center;
  margin-top: 12px;
  margin-bottom: 12px;
  gap: 10px;
}

.radio-input,
.checkbox-input {
  cursor: pointer;
}

.submit-btn {
  margin-top: 190px;
  margin-left: auto;
  margin-right: auto;
  height: 100%;
  width: 144px;
  background-color: #EB4648;
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
