<script setup lang="ts">
import { computed, defineProps } from 'vue';
import { questionnaireData as questionnaireData2 } from "@/stores/questionnaires2";
import type { Question2 } from "@/stores/questionnaires2";
import ConfidentialForm from '@/components/ConfidentialForm.vue'; // Assuming this is for display only now

const props = defineProps<{
  response: any; // The full response object from the backend
}>();

// --- ALL SUMMARY LOGIC MOVED HERE ---
// Note: It now reads from props.response.answers instead of the store

const getQuestionById2 = (id: number): Question2 | null => {
    // ... same getQuestionById2 logic as before ...
    for (const section of questionnaireData2[0].sections) {
    const foundQuestion = section.questions.find((q) => q.id === id);
    if (foundQuestion) return foundQuestion;
  }
  return null;
};

const createObjectURL = (file: File) => {
    return URL.createObjectURL(file);
};

const summaryStep2 = computed(() => {
    // ... same summaryStep2 logic as before, but using props.response.answers ...
    const answers = props.response.answers;
    if(!answers) return null;
    //...etc
    return "Step 2 Summary..."; // Placeholder for brevity
});

// ... Add summaryStep3, summaryStep4, summaryStep5 logic here as well ...
// ... Add formatCheckboxAnswer logic here ...

</script>

<template>
  <div class="response-display">
    <h4>Response ID: {{ response.id }}</h4>
    <p><strong>Disease:</strong> {{ response.disease_name }}</p>
    <p><strong>Intervention:</strong> {{ response.intervention }}</p>
    <p><strong>Suggested Route(s):</strong> {{ response.final_route }}</p>
    <p><strong>Confidentiality:</strong> {{ response.confidentiality_level }}</p>

    <h5>Uploaded Files:</h5>
    <ul>
      <li v-for="file in response.uploaded_files" :key="file.id">
        {{ file.file_name }} ({{ file.mime_type }})
      </li>
    </ul>

    <div v-html="summaryStep2"></div>
    </div>
</template>

<style scoped>
.response-display {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 24px;
}
h4 { margin-top: 0; }
</style>