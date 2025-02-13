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
  <div class="container mt-4">
    <h3 v-if="questionnaire.title !== 'null'">{{ questionnaire.title }}</h3>
    <form @submit.prevent="saveResponses">
      <div
        v-for="section in questionnaire.sections"
        :key="section.name"
        class="mb-4"
      >
        <h4 v-if="section.name !== 'null'" class="mt-3">{{ section.name }}</h4>

        <div v-for="q in section.questions" :key="q.id" class="mb-3">
          <label class="form-label">{{ q.question }}</label>

          <input
            v-if="q.type === 'text'"
            v-model="answers[q.id]"
            type="text"
            class="form-control"
          />

          <div v-else-if="q.type === 'radio'">
            <div v-for="option in q.options" :key="option" class="form-check">
              <input
                class="form-check-input"
                type="radio"
                :name="'q' + q.id"
                :value="option"
                v-model="answers[q.id]"
              />
              <label class="form-check-label">{{ option }}</label>
            </div>
          </div>

          <div v-else-if="q.type === 'checkbox'">
            <div v-for="option in q.options" :key="option" class="form-check">
              <input
                class="form-check-input"
                type="checkbox"
                :value="option"
                v-model="answers[q.id]"
              />
              <label class="form-check-label">{{ option }}</label>
            </div>
          </div>
        </div>
      </div>
      <button type="submit" class="btn btn-danger">Submit</button>
    </form>
  </div>
</template>
