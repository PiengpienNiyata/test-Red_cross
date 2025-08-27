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

const getCleanOptionLabel = (option: string): string => {
  if (typeof option !== "string") return ""; 
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

    store.resetStore();

    let combinedAnswers = { ...submissionData.answers };

    // 1. Unpack researcher and research context data
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

    // 2. Group all uploaded files by their question ID
    const filesByQuestionId: Record<string, any[]> = {};
    if (submissionData.uploaded_files) {
      submissionData.uploaded_files.forEach((file: any) => {
        const qId = file.question_id;
        if (!filesByQuestionId[qId]) {
          filesByQuestionId[qId] = [];
        }
        filesByQuestionId[qId].push({ id: file.id, name: file.file_name, rehydrated: true });
      });
    }

    // 3. Iterate through questions WITH files and merge them correctly
    Object.keys(filesByQuestionId).forEach(qIdStr => {
        const qId = Number(qIdStr);
        const question = getQuestionById2(qId);
        const answer = combinedAnswers[qId];
        const allFilesForQuestion = filesByQuestionId[qIdStr];

        if (!question) return;

        if (typeof answer === 'object' && answer !== null) {
            // CASE 1: Answer is a complex object (like for Q201).
            if (!answer.fileData) answer.fileData = {};
            const mainLabel = getCleanOptionLabel(answer.selectedOption);
            const subSelection = answer.subs?.[mainLabel];

            if (subSelection && typeof subSelection === 'string') {
                // If there's a sub-answer, use ITS label as the key.
                const subLabel = getCleanOptionLabel(subSelection);
                answer.fileData[subLabel] = { files: allFilesForQuestion };
            } else {
                // Otherwise, use the main answer's label.
                answer.fileData[mainLabel] = { files: allFilesForQuestion };
            }

        } else if (typeof answer === 'string') {
            // CASE 2: Answer is a flattened string (older questions).
            const originalOption = question.options?.find(opt => answer.startsWith(getCleanOptionLabel(opt)));
            if (originalOption) {
                const cleanOriginalOption = getCleanOptionLabel(originalOption);
                const newAnswerObject = {
                  selectedOption: originalOption,
                  inlineText: {},
                  fileData: { [cleanOriginalOption]: { files: allFilesForQuestion } },
                  subs: {}
                };
                if (originalOption.includes('___')) {
                    const parts = originalOption.split('___');
                    const prefix = parts[0].split('||')[0];
                    let userText = answer.split('||')[0].replace(prefix, '').trim();
                    const optionIndex = question.options?.indexOf(originalOption);
                    if (optionIndex !== undefined && optionIndex > -1) {
                        newAnswerObject.inlineText = { [`${qId}-${optionIndex}-0`]: userText };
                    }
                }
                combinedAnswers[qId] = newAnswerObject;
            }
        }
    });

     Object.keys(combinedAnswers).forEach(qIdStr => {
      const qId = Number(qIdStr);
      const question = getQuestionById2(qId);
      const answer = combinedAnswers[qId];

      // If it's a simple string answer for a radio question, convert it back to an object.
      if (question?.type === 'radio' && typeof answer === 'string') {
          // Find the original option that matches the saved string answer
          const originalOption = question.options?.find(opt => 
              getCleanOptionLabel(opt) === getCleanOptionLabel(answer)
          );

          if (originalOption) {
              combinedAnswers[qId] = {
                  selectedOption: originalOption,
                  // Initialize other properties in case they are needed elsewhere
                  subs: {},
                  inlineText: {},
                  fileData: {} 
              };
          }
      }
  });

    // 4. Rehydrate confidentiality level
    if (submissionData.confidentiality_level) {
        const confidentialityString = submissionData.confidentiality_level;
        const match = confidentialityString.match(/(.*) \(Level: (.*)\)/);
        if (match) {
            const mainOption = match[1].trim();
            const subOption = match[2].trim();
            combinedAnswers[3001] = { selectedOption: mainOption, subs: { [mainOption]: subOption } };
        } else {
            combinedAnswers[3001] = { selectedOption: confidentialityString, subs: {} };
        }
    }

    // 5. Save everything to the store and navigate
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
