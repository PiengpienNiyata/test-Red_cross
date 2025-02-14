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
      <div v-for="section in questionnaire.sections" :key="section.name" class="mb-4">
        <h4 v-if="section.name !== 'null'" class="mt-3">{{ section.name }}</h4>

        <div v-for="q in section.questions" :key="q.id" class="mb-3">
          <label class="form-label">{{ q.question }}</label>

          <input v-if="q.type === 'text'" v-model="answers[q.id]" type="text" class="form-control" />

          <div v-else-if="q.type === 'radio'">
            <div v-for="option in q.options" :key="option" class="form-check">
              <input class="form-check-input" type="radio" :name="'q' + q.id" :value="option" v-model="answers[q.id]" />
              <label class="form-check-label">{{ option }}</label>
            </div>
          </div>

          <div v-else-if="q.type === 'checkbox'">
            <div v-for="option in q.options" :key="option" class="form-check">
              <input class="form-check-input" type="checkbox" :value="option" v-model="answers[q.id]" />
              <label class="form-check-label">{{ option }}</label>
            </div>
          </div>
        </div>
      </div>
      <button type="submit" class="btn btn-danger">Submit</button>
    </form>
  </div>

  <form class="row g-3">
    <div class="col-md-6">
      <label for="inputEmail4" class="form-label">Email</label>
      <input type="email" class="form-control" id="inputEmail4">
    </div>
    <div class="col-md-6">
      <label for="inputPassword4" class="form-label">Password</label>
      <input type="password" class="form-control" id="inputPassword4">
    </div>
    <div class="col-12">
      <label for="inputAddress" class="form-label">Address</label>
      <input type="text" class="form-control" id="inputAddress" placeholder="1234 Main St">
    </div>
    <div class="col-12">
      <label for="inputAddress2" class="form-label">Address 2</label>
      <input type="text" class="form-control" id="inputAddress2" placeholder="Apartment, studio, or floor">
    </div>
    <div class="col-md-6">
      <label for="inputCity" class="form-label">City</label>
      <input type="text" class="form-control" id="inputCity">
    </div>
    <div class="col-md-4">
      <label for="inputState" class="form-label">State</label>
      <select id="inputState" class="form-select">
        <option selected>Choose...</option>
        <option>...</option>
      </select>
    </div>
    <div class="col-md-2">
      <label for="inputZip" class="form-label">Zip</label>
      <input type="text" class="form-control" id="inputZip">
    </div>
    <div class="col-12">
      <div class="form-check">
        <input class="form-check-input" type="checkbox" id="gridCheck">
        <label class="form-check-label" for="gridCheck">
          Check me out
        </label>
      </div>
    </div>
    <div class="col-12">
      <button type="submit" class="btn btn-primary">Sign in</button>
    </div>
  </form>
</template>
