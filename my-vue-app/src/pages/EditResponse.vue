<script setup lang="ts">
import { onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useQuestionnaireStore } from "@/stores/useQuestionnaireStore";
import { VITE_API_BASE_URL } from "@/stores/config";
import { questionnaireData as questionnaireData2 } from "@/stores/questionnaires2";
import type { Question2 } from "@/stores/questionnaires2";

const route = useRoute();
const router = useRouter();
const store = useQuestionnaireStore();

const getQuestionById2 = (id: number): Question2 | null => {
  for (const section of questionnaireData2[0].sections) {
    const foundQuestion = section.questions.find((q) => q.id === id);
    if (foundQuestion) return foundQuestion;
  }
  return null;
};

// Add this helper function to your script
const getCleanOptionLabel = (option: string): string => {
  if (typeof option !== 'string') return ''; // Safety check for undefined values
  return option.split("||")[0];
};

onMounted(async () => {
  const token = route.params.token as string;
  if (!token) {
    alert("No edit token provided.");
    router.push("/");
    return;
  }

  try {
    const res = await fetch(`${VITE_API_BASE_URL}/api/response/edit/${token}`);
    if (!res.ok) throw new Error("Could not find submission data.");
    const submissionData = await res.json();

    console.log("--- RAW SUBMISSION DATA FROM BACKEND ---");
    console.log(JSON.parse(JSON.stringify(submissionData)));
    
    store.resetStore();

    // Start with the raw answers from the database
    let combinedAnswers = { ...submissionData.answers };

    // --- RECONSTRUCT COMPLEX ANSWERS ---

    // 1. Unpack researcher_data into the answers object
    if (submissionData.researcher_data) {
      const rd = submissionData.researcher_data;
      combinedAnswers[1001] = rd.name || "";
      combinedAnswers[1002] = rd.project_name || "";
      combinedAnswers[1003] = rd.branch_info || "";
      combinedAnswers[1004] = rd.phone_number || "";
      combinedAnswers[1005] = rd.email || "";
    }
    combinedAnswers[1006] = submissionData.disease_name || "";
    combinedAnswers[1007] = submissionData.intervention || "";

    // 2. Unpack research_context into the answers object
    if (submissionData.research_context) {
      const { research_questions, molecular_signaling } = submissionData.research_context;
      if (research_questions) {
        combinedAnswers[1008] = research_questions.principle || "";
        combinedAnswers[1009] = research_questions.factual_statement || "";
        combinedAnswers[1010] = research_questions.implication || "";
      }
      if (molecular_signaling) {
        combinedAnswers[1011] = molecular_signaling.principle || "";
        combinedAnswers[1012] = molecular_signaling.factual_statement || "";
        combinedAnswers[1013] = molecular_signaling.implication || "";
      }
    }

    // 3. Rehydrate uploaded files and build the full answer object
    if (submissionData.uploaded_files) {
      submissionData.uploaded_files.forEach((file: any) => {
        const qId = Number(file.question_id);
        const question = getQuestionById2(qId);
        if (!question) return;

        const filePlaceholder = { id: file.id, name: file.file_name, rehydrated: true };
        const rawAnswer = combinedAnswers[qId]; // This is the string like "Yes..."

        // --- THIS IS THE KEY CHANGE ---
        // Find the original option template that this file belongs to
        const originalOption = question.options?.find(opt => {
  const cleanOpt = getCleanOptionLabel(opt);
  
  // --- THIS IS THE KEY CHANGE ---
  // First, make sure rawAnswer is actually a string before calling .startsWith()
  if (typeof rawAnswer !== 'string') {
    return false;
  }

  // For inline text, check if the raw answer starts with the option's prefix
  if (cleanOpt.includes(':')) {
    return rawAnswer.startsWith(cleanOpt.split(':')[0]);
  }
  return rawAnswer.startsWith(cleanOpt);
});
        
        if (originalOption) {
          const cleanOriginalOption = getCleanOptionLabel(originalOption);

          // Create a new, complete answer object
          const newAnswerObject = {
            selectedOption: originalOption,
            inlineText: {},
            fileData: {
              [cleanOriginalOption]: { files: [filePlaceholder] }
            },
            subs: {}
          };
          
          // If the answer has inline text, parse it out
          // if (originalOption.includes('___')) {
          //    const parts = originalOption.split('___');
          //    const prefix = parts[0].split('||')[0];
          //    const userText = rawAnswer.substring(prefix.length, rawAnswer.length - parts[1].split('||')[0].length);
          //    const optionIndex = question.options?.indexOf(originalOption);
          //    const key = `${qId}-${optionIndex}-0`; // Assuming one inline input per option
          //    newAnswerObject.inlineText = { [key]: userText };
          // }
// If the answer has inline text, parse it out
if (originalOption.includes('___')) {
    const parts = originalOption.split('___');
    const prefix = parts[0].split('||')[0];
    const suffix = parts[1].split('||')[0];
    
    // Check if rawAnswer is a string before using substring
// Inside the if (originalOption.includes('___')) block...

let userText = rawAnswer.split('||')[0]; // Start with the clean answer text
userText = userText.replace(prefix, '');   // Remove the prefix
userText = userText.replace(suffix, '');   // Remove the suffix
    const optionIndex = question.options?.indexOf(originalOption);
    if (optionIndex !== undefined && optionIndex > -1) {
        const key = `${qId}-${optionIndex}-0`;
        newAnswerObject.inlineText = { [key]: userText };
    }
}
        
          
          combinedAnswers[qId] = newAnswerObject;
        }
      });
    }
    if (submissionData.confidentiality_level) {
      const confidentialityString = submissionData.confidentiality_level;

      // Use regex to capture the main part and the level
      const match = confidentialityString.match(/(.*) \(Level: (.*)\)/);

      if (match) {
        // Case 1: The string has a level, e.g., "Remission... (Level: Level 2)"
        const mainOption = match[1].trim();
        const subOption = match[2].trim();
        combinedAnswers[3001] = {
          selectedOption: mainOption,
          subs: { [mainOption]: subOption },
        };
      } else {
        // Case 2: The string has no level, e.g., "Symptomatic treatment"
        combinedAnswers[3001] = {
          selectedOption: confidentialityString,
          subs: {}, // No sub-option was selected
        };
      }
    }
    // 5. Save everything to the store
    store.setResearcherID(submissionData.researcher_data.id);
    store.setCurrentTokenAndVersion(submissionData.token, submissionData.version);
    store.setAnswers(combinedAnswers);
    store.setCurrentRemark(submissionData.remark);
    store.setCurrentStatus(submissionData.status);

    if (submissionData.final_route) {
      const routes = submissionData.final_route.split(", ");
      store.setSuggestedRoutes(routes);
    }

    router.push("/questionnairesResearcher3");

  } catch (error) {
    console.error("Failed to load submission data:", error);
    alert("Failed to load submission data. You may have an invalid link.");
    router.push("/");
  }
});
</script>

<template>
  <div class="loader-page">
    <h2>Loading your submission...</h2>
  </div>
</template>

<style scoped>
.loader-page {
  padding: 40px;
  text-align: center;
}
</style>
