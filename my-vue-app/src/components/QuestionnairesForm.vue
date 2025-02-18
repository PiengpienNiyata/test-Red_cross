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
        
        <div v-for="q in section.questions" :key="q.id" class="question">
          <label class="question-label">{{ q.question }}</label>
          
          <input v-if="q.type === 'text'" v-model="answers[q.id]" type="text" class="input-text" />
          
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
      
      <button type="submit" class="submit-btn">Submit</button>
    </form>
  </div>
</template>

<style scoped>
.questionnaire{
  padding-left: 16px;
  padding-right: 16px;
}

.title {
  font-size: 1.8em;
  font-weight: bold;
  margin-bottom: 20px;
}

.form-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.section {
  border:none;
}

.section-title {
margin: 0;
border:none;
}

.question {
  margin-bottom: 15px;
}

.question-label {
  display: block;
  padding: 8px;
  margin-bottom: 24px;
}

.input-text {
  width: 100%;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.radio-group, .checkbox-group {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.radio-option, .checkbox-option {
  display: flex;
  align-items: center;
  gap: 8px;
}

.radio-input, .checkbox-input {
  cursor: pointer;
}

.submit-btn {
  margin: 0 auto;
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



