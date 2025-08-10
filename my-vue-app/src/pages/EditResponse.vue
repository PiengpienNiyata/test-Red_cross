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
  if (typeof option !== "string") return ""; // Safety check for undefined values
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

   let combinedAnswers = { ...submissionData.answers };

  // 1. Unpack researcher and research context data (no change here)
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

  // --- NEW, ROBUST FILE REHYDRATION LOGIC ---

  // 2. First, group all uploaded files by their question ID
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

  // 3. Now, iterate through the questions that have files and build the complex answer object
  Object.keys(filesByQuestionId).forEach(qIdStr => {
    const qId = Number(qIdStr);
    const question = getQuestionById2(qId);
    const rawAnswerString = combinedAnswers[qId];
    const allFilesForQuestion = filesByQuestionId[qIdStr];

    if (question && typeof rawAnswerString === 'string') {
      const originalOption = question.options?.find(opt => {
        const cleanOpt = getCleanOptionLabel(opt);
        if (cleanOpt.includes(':')) return rawAnswerString.startsWith(cleanOpt.split(':')[0]);
        return rawAnswerString.startsWith(cleanOpt);
      });

      if (originalOption) {
        const cleanOriginalOption = getCleanOptionLabel(originalOption);
        const newAnswerObject = {
          selectedOption: originalOption,
          inlineText: {},
          // Assign the ENTIRE group of files at once
          fileData: { [cleanOriginalOption]: { files: allFilesForQuestion } },
          subs: {}
        };
        
        if (originalOption.includes('___')) {
            const parts = originalOption.split('___');
            const prefix = parts[0].split('||')[0];
            const suffix = parts[1].split('||')[0];
            let userText = rawAnswerString.split('||')[0];
            userText = userText.replace(prefix, '').replace(suffix, '');
            const optionIndex = question.options?.indexOf(originalOption);
            if (optionIndex !== undefined && optionIndex > -1) {
                newAnswerObject.inlineText = { [`${qId}-${optionIndex}-0`]: userText };
            }
        }
        // Overwrite the raw string with the complete, correct object
        combinedAnswers[qId] = newAnswerObject;
      }
    }
  });

  // 4. Rehydrate confidentiality level (no change here)
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
    // 5. Save everything to the store
    store.setResearcherID(submissionData.researcher_data.id);
    store.setCurrentTokenAndVersion(
      submissionData.token,
      submissionData.version
    );
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
