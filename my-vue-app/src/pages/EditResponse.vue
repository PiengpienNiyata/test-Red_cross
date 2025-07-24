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

onMounted(async () => {
  const token = route.params.token;
  if (!token) {
    alert("No edit token provided.");
    router.push("/");
    return;
  }

  try {
    const res = await fetch(`${VITE_API_BASE_URL}/api/response/edit/${token}`);
    if (!res.ok) throw new Error("Could not find submission data.");
    const submissionData = await res.json();

    store.resetStore();

    let combinedAnswers = { ...submissionData.answers };

    if (submissionData.research_context) {
      // console.log(submissionData.research_context);
      const { research_questions, molecular_signaling } =
        submissionData.research_context;
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

    if (submissionData.uploaded_files) {
      submissionData.uploaded_files.forEach((file: any) => {
        const qId = Number(file.question_id);
        const question = getQuestionById2(qId);
        if (!question) return;

        const filePlaceholder = {
          id: file.id,
          name: file.file_name,
          rehydrated: true,
        };
        const answerForQuestion = combinedAnswers[qId];

        if (question.type === "files") {
          if (!answerForQuestion || !Array.isArray(answerForQuestion.files)) {
            combinedAnswers[qId] = { files: [] };
          }
          combinedAnswers[qId].files.push(filePlaceholder);
        } else if (question.type === "radio" && answerForQuestion?.fileData) {
          // Find the one and only key inside the fileData object.
          const fileDataKey = Object.keys(answerForQuestion.fileData)[0];
          if (fileDataKey) {
            const fileInfo = answerForQuestion.fileData[fileDataKey];
            // Ensure the 'files' property is an array before pushing to it.
            if (!Array.isArray(fileInfo.files)) {
              fileInfo.files = [];
            }
            fileInfo.files.push(filePlaceholder);
          }
        }
      });
    }

    // console.log(submissionData);
    store.setResearcherID(submissionData.researcher_data.id);
    console.log(submissionData);

    store.researcher = submissionData.research_data;
    store.setCurrentTokenAndVersion(
      submissionData.token,
      submissionData.version
    );
    store.setAnswers(combinedAnswers);

    if (submissionData.final_route) {
      const routes = submissionData.final_route.split(', ');
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
