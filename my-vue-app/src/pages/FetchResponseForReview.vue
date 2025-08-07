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
  if (typeof option !== 'string') return '';
  return option.split("||")[0];
};

// --- REUSABLE REHYDRATION FUNCTION ---
// This function takes raw data from the API and builds the complex answer object
const rehydrateAnswers = (submissionData: any): Record<number, any> => {
    let combinedAnswers = { ...submissionData.answers };

    // 1. Unpack researcher_data
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

    // 2. Unpack research_context
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

    // 3. Rehydrate uploaded files
    if (submissionData.uploaded_files) {
      submissionData.uploaded_files.forEach((file: any) => {
        const qId = Number(file.question_id);
        const question = getQuestionById2(qId);
        if (!question) return;

        const filePlaceholder = { id: file.id, name: file.file_name, rehydrated: true };
        const rawAnswer = combinedAnswers[qId];

        const originalOption = question.options?.find(opt => {
            const cleanOpt = getCleanOptionLabel(opt);
            if (typeof rawAnswer !== 'string') return false;
            if (cleanOpt.includes(':')) return rawAnswer.startsWith(cleanOpt.split(':')[0]);
            return rawAnswer.startsWith(cleanOpt);
        });

        if (originalOption) {
          const cleanOriginalOption = getCleanOptionLabel(originalOption);
          const newAnswerObject = {
            selectedOption: originalOption, inlineText: {},
            fileData: { [cleanOriginalOption]: { files: [filePlaceholder] } }, subs: {}
          };
          if (originalOption.includes('___')) {
              const parts = originalOption.split('___');
              const prefix = parts[0].split('||')[0];
              const suffix = parts[1].split('||')[0];
              let userText = rawAnswer.split('||')[0];
              userText = userText.replace(prefix, '');
              userText = userText.replace(suffix, '');
              const optionIndex = question.options?.indexOf(originalOption);
              if (optionIndex !== undefined && optionIndex > -1) {
                  newAnswerObject.inlineText = { [`${qId}-${optionIndex}-0`]: userText };
              }
          }
          combinedAnswers[qId] = newAnswerObject;
        }
      });
    }

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
    return combinedAnswers;
};


onMounted(async () => {
  const token = route.params.token as string;
  let version = route.params.version as string | undefined;

  if (!token) {
    alert("No review token provided.");
    router.push("/admin/dashboard");
    return;
  }

  try {
    store.resetStore();

    // --- FETCH CURRENT VERSION ---
    const currentApiUrl = version ? `${VITE_API_BASE_URL}/api/response/review/${token}/${version}` : `${VITE_API_BASE_URL}/api/response/edit/${token}`;
    const currentRes = await fetch(currentApiUrl);
    if (!currentRes.ok) throw new Error("Could not find submission data.");
    const currentSubmissionData = await currentRes.json();
    
    const currentVersionNumber = currentSubmissionData.version;

    // --- FETCH PREVIOUS VERSION (IF IT EXISTS) ---
    if (currentVersionNumber > 1) {
        const prevApiUrl = `${VITE_API_BASE_URL}/api/response/review/${token}/${currentVersionNumber - 1}`;
        const prevRes = await fetch(prevApiUrl);
        if (prevRes.ok) {
            const prevSubmissionData = await prevRes.json();
            const combinedPreviousAnswers = rehydrateAnswers(prevSubmissionData);
            store.setPreviousAnswers(combinedPreviousAnswers);
        }
    }

    // --- PROCESS AND STORE CURRENT VERSION DATA ---
    const combinedCurrentAnswers = rehydrateAnswers(currentSubmissionData);
    
    store.setResearcherID(currentSubmissionData.researcher_data.id);
    store.setCurrentTokenAndVersion(currentSubmissionData.token, currentVersionNumber);
    store.setAnswers(combinedCurrentAnswers);
    store.setCurrentRemark(currentSubmissionData.remark);
    store.setCurrentStatus(currentSubmissionData.status);

    if (currentSubmissionData.final_route) {
      store.setSuggestedRoutes(currentSubmissionData.final_route.split(", "));
    }

    const versionRes = await fetch(`${VITE_API_BASE_URL}/api/versions/${token}`);
    if (versionRes.ok) {
        const versionData = await versionRes.json();
        store.setVersionHistory(versionData);
    }

    router.push("/Review");

  } catch (error) {
    console.error("Failed to load submission data for review:", error);
    alert("Failed to load submission data. You may have an invalid link.");
    router.push("/admin/dashboard");
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
