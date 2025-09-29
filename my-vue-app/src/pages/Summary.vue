<script setup lang="ts">
import { computed, ref } from "vue";
import { useQuestionnaireStore } from "@/stores/useQuestionnaireStore";
import { useRouter } from "vue-router";
import { questionnaireData as questionnaireData1 } from "@/stores/questionnaires1";
import { questionnaireData as questionnaireData2 } from "@/stores/questionnaires2";
import type { Question2 } from "@/stores/questionnaires2";
import { VITE_API_BASE_URL } from "@/stores/config";
import ConfidentialForm from "@/components/ConfidentialForm.vue";
import { storeToRefs } from "pinia";
import html2pdf from "html2pdf.js";
import { formatPhoneNumber } from "@/utils/formatters";
import { routeDefinitions } from "@/stores/routeDefinitions";

const pdfContent = ref<HTMLElement | null>(null);
const store = useQuestionnaireStore();
const router = useRouter();
const showCancelModal = ref(false);
const projectNameVerification = ref("");
const isCancelling = ref(false);
const showCancelSuccessModal = ref(false);
const showCancelErrorModal = ref(false);

  const isRouteB = computed(() => {
  return store.suggestedRoutes.includes("Route B");
});
const {
  answers,
  suggestedRoutes,
  currentRemark,
  showReviewerFeedback,
  currentStatus,
} = storeToRefs(store);
type FileItem = File | { id: number; name: string; rehydrated: true };
const exportToPdf = () => {
  if (!pdfContent.value) {
    console.error("PDF content element not found.");
    return;
  }

  if (!answers.value[1002]) {
    console.error(
      "Project Name (answer 1002) is not available for the PDF filename."
    );
  }



  const options = {
    margin: [0.75, 0.5, 0.5, 0.7],
    filename: `RIRM-Summary-${answers.value[1002] || "report"} (${
      answers.value[1001]
    }).pdf`,
    image: { type: "jpeg", quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true },
    jsPDF: { unit: "in", format: "a4", orientation: "portrait" },
    pagebreak: {
      mode: "css",
      before: ".page-break-before",
      avoid: ".summary-item",
    },
  };

  html2pdf().from(pdfContent.value).set(options).save();
};

const getQuestionById = (id: number): Question2 | null => {
  for (const section of questionnaireData1[0].sections) {
    const questions = (section as any).questions || [];
    const foundQuestion = questions.find((q: any) => q.id === id);
    if (foundQuestion) return foundQuestion;
  }
  return null;
};

const getQuestionById2 = (id: number): Question2 | null => {
  for (const section of questionnaireData2[0].sections) {
    const foundQuestion = section.questions.find((q) => q.id === id);
    if (foundQuestion) return foundQuestion;
  }
  return null;
};

const firstFormAnswers = computed(
  () =>
    Object.entries(store.answers)
      .filter(([id]) => Number(id) >= 1001 && Number(id) <= 1014)
      .map(([id, answer]) => {
        const question = getQuestionById(Number(id));
        return question ? { ...question, answer } : null;
      })
      .filter((q) => q !== null) as Question2[]
);

const canCancelProject = computed(() => {
  return (
    (store.currentStatus === 0 || store.currentStatus === 1) &&
    store.currentToken
  );
});

const getConstructedAnswer = (question: Question2, answer: any): string => {
  if (typeof answer !== "object" || !answer.selectedOption) {
    return answer;
  }

  let finalString = answer.selectedOption;

  if (finalString.includes("___")) {
    const parts = finalString.split("___");
    let constructed = parts[0];

    const optionIndex = question.options?.findIndex(
      (opt) => opt === finalString
    );

    if (optionIndex !== undefined && optionIndex > -1 && answer.inlineText) {
      for (let i = 0; i < parts.length - 1; i++) {
        const key = `${question.id}-${optionIndex}-${i}`;
        const inlineValue = answer.inlineText[key] || "";
        constructed += inlineValue + parts[i + 1];
      }
      finalString = constructed;
    }
  }
  return finalString;
};

// const interventionAspectDetails = computed(() => {
//   const answer102 = answers.value[102];
//   if (typeof answer102 !== "object" || !answer102.selectedOption) return null;

//   const selectedOption = answer102.selectedOption;

//   if (selectedOption.startsWith("Yes")) {
//     return routeDefinitions["Intervention_Yes"];
//   } else if (selectedOption.startsWith("No")) {
//     return routeDefinitions["Intervention_No"];
//   } else if (selectedOption.startsWith("Uncertain")) {
//     return routeDefinitions["Intervention_Uncertain"];
//   }
//   return null;
// });

const getCleanOptionLabel = (option: string) => option.split("||")[0];

const dynamicInterventionAspect = computed(() => {
    const answer102 = answers.value[102];
    const answer103 = answers.value[103];

    if (!answer102 || !answer103) return null;

    let a2_intro = 'According to your research data, ';
    let a2_main = '';
    let a2_bullets: string[] = [];
    
    const a2_key = (typeof answer102 === 'object' && answer102.selectedOption) 
      ? answer102.selectedOption 
      : String(answer102);
    
    const a3_key = (typeof answer103 === 'object' && answer103.selectedOption) 
      ? answer103.selectedOption 
      : String(answer103);

    if (a2_key.startsWith('Yes')) {
        a2_main = 'a molecular intervention is known to achieve remission by targeting to originating cell:';
        a2_bullets = [
            'A single intervention achieves >80% remission',
            'There is no contradiction in treatment response',
            'The treatment is known to act on the originating cell or its direct signalling pathway',
        ];
    } else if (a2_key.startsWith('No')) {
        a2_main = 'a single intervention fails to induce true remission.';
    } else if (a2_key.startsWith('Uncertain')) {
        a2_main = 'it is not clear whether remission occurs across all clinical variants.';
    }

    const a3_intro = 'Published/public reports also show the remission rate of: ';
    const a3_main = getCleanOptionLabel(a3_key) + '.';

    return { a2_intro, a2_main, a2_bullets, a3_intro, a3_main };
});

// ADD THIS NEW COMPUTED PROPERTY
const dynamicDiseaseAspect = computed(() => {
  const answer201 = answers.value[201];
  const answer202 = answers.value[202];
  const answer203 = answers.value[203];
  const answer204 = answers.value[204];

  // Helper function to get the key from a simple answer
  const getAnswerKey = (answer: any): string => {
    if (!answer) return "";
    return typeof answer === 'object' && answer.selectedOption 
      ? answer.selectedOption 
      : String(answer);
  };
  
  // Helper function to get the crit count for B-2 and B-4
  const getCritCount = (answer: any, questionId: number): number => {
    const q = getQuestionById2(questionId);
    if (!q || !answer || typeof answer !== 'object' || !answer.inlineText || !q.options) return 0;
    const optionIndex = q.options.findIndex(opt => opt === answer.selectedOption);
    if (optionIndex === -1) return 0;
    const count = answer.inlineText[`${q.id}-${optionIndex}-select`];
    return Number(count) || 0;
  };

  // --- Process B-1 Answer ---
  let b1_main = '';
  let b1_bullets: string[] = [];
  const key201 = getAnswerKey(answer201);

  if (key201.startsWith('Yes, both staging and typing')) {
    b1_main = 'The disease shows both molecular types and stages.';
    b1_bullets = ['More than one type of lesion, all lesion types arise from the same upstream signal and those lesions also change over time.'];
  } else if (key201.startsWith('Yes, only staging.')) {
    const subSelection = answer201.subs?.[getCleanOptionLabel(key201)];
    if (subSelection?.startsWith('Have 2 stages')) {
      b1_main = 'Disease evolves through two molecular stages e.g. early vs. late.';
      b1_bullets = ['Each stage involves the same core signal and triggers', 'Example: Acute → chronic switch, early → fibrotic lesion'];
    } else if (subSelection?.startsWith('Have more than 2 stages')) {
      b1_main = 'Several- Molecular Staging or Branching Model.';
      b1_bullets = ['Disease progresses through more than two molecular stages or lesions may branch into different paths.'];
    }
  } else if (key201.startsWith('Yes, only typing')) {
    b1_main = 'All lesion types arise from the same upstream signal, suggesting unified origin despite clinical variation.';
    b1_bullets = ['Disease contains molecular types, each triggered by a distinct signal, but originating from the same cell types'];
  } else if (key201.startsWith('No staging and no typing')) {
    b1_main = 'The treatment fails to induce full remission, but this failure cannot be attributed to known subtypes, stages, or diverging lesion types.';
  }

  // --- Process B-3 Answer ---
  let b3_main = '';
  const key203 = getAnswerKey(answer203);
  if (key203.startsWith('No')) {
    b3_main = 'There is no clear contradiction in lesion behavior or treatment response. This suggests the disease is likely driven by an explicit, single-axis core mechanism.';
  } else {
    b3_main = 'N/A';
  }

  // --- Process B-2 Answer ---
  const b2_count = getCritCount(answer202, 202);
  let b2_imply = 'N/A';
  const key202 = getAnswerKey(answer202);
  if (key202.startsWith('Yes')) {
    if (b2_count <= 2) {
      b2_imply = 'Only one originating cell is responsible for disease initiation';
    } else {
      b2_imply = 'More than one cell type contributes to the disease process';
    }
  }

  // --- Process B-4 Answer ---
  const b4_count = getCritCount(answer204, 204);
  let b4_imply = 'N/A';
  const key204 = getAnswerKey(answer204);
  if (key204.startsWith('Yes')) {
    if (b4_count <= 2) {
      b4_imply = 'Only one originating cell is responsible for disease initiation';
    } else {
      b4_imply = 'More than one cell type contributes to the disease process';
    }
  } else if (key204.startsWith('Not yet')) {
    b4_imply = 'Remission criteria for this disease have not yet been clearly defined, either clinically or molecularly. Further research is required to establish measurable remission endpoints.';
  } else if (key204.startsWith('Not possible')) {
    b4_imply = 'Remission is considered not possible to achieve for this disease, as no clinical or molecular framework exists to support remission assessment. The disease may currently only be managed in terms of symptom control or progression delay, but not true (molecular) remission.';
  }
  
  return {
    b1_main, b1_bullets,
    b3_main,
    b2_count, b2_imply,
    b4_count, b4_imply
  };
});

const suggestedRouteDetails = computed(() => {
  if (suggestedRoutes.value.includes("Route C")) {
    return [routeDefinitions["Route C"]];
  }
  return [...suggestedRoutes.value]
    .sort()
    .map((route) => routeDefinitions[route])
    .filter(Boolean);
});

const editAnswers = () => {
  store.hideReviewerFeedback();
  router.push("/questionnairesResearcher");
};

const formatCheckboxAnswer = (answer: any): string => {
  if (!answer || !Array.isArray(answer.main)) return "";

  const formattedParts = answer.main.map((mainOpt: string) => {
    const mainLabel = mainOpt.split("||")[0];
    const subAnswer = answer.subs?.[mainLabel];

    if (subAnswer && subAnswer.length > 0) {
      const subAnswerString = Array.isArray(subAnswer)
        ? subAnswer.join(", ")
        : subAnswer;
      return `${mainLabel} (${subAnswerString})`;
    }

    return mainLabel;
  });

  return formattedParts.join(", ");
};

const submissionSuccess = ref(false);
const submissionError = ref(false);

const submitFinalResponse = async () => {
  try {
    store.processResearcherInfo(store.answers as Record<string, string>);
    const { name, project_name, branch_info, phone_number, email } =
      store.researcher;
    if (!name || !project_name || !branch_info || !phone_number || !email) {
      alert("Please fill in all researcher details before submitting!");
      return;
    }
    let researcherID = store.researcherID;
    if (!researcherID) {
      const researcherResponse = await fetch(
        `${VITE_API_BASE_URL}/api/researcher`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(store.researcher),
        }
      );
      const researcherResult = await researcherResponse.json();
      if (!researcherResponse.ok) throw new Error("Failed to save researcher");
      researcherID = researcherResult.researcher.id;
      store.setResearcherID(researcherID!);
    }

    const newFilesToUpload = store.liveFileAnswers;

    const existingFileIds: number[] = [];
    Object.entries(answers.value).forEach(([id, value]) => {
      if (value && typeof value === "object") {
        const findRehydratedFiles = (files: any[]) => {
          if (files && Array.isArray(files)) {
            files.forEach((file: any) => {
              if (file && file.rehydrated) {
                existingFileIds.push(file.id);
              }
            });
          }
        };
        if (value.fileData) {
          Object.values(value.fileData).forEach((fileInfo: any) =>
            findRehydratedFiles(fileInfo.files)
          );
        }
        if (value.files) {
          findRehydratedFiles(value.files);
        }
      }
    });

    const otherAnswers: Record<string, any> = {};
    const researchContext: Record<string, any> = {
      research_questions: {},
      molecular_signaling: {},
    };
    let confidentialityLevel = "";

    Object.entries(answers.value).forEach(([id, value]) => {
      const numericId = Number(id);
      const question = getQuestionById2(numericId);

      if (
        question &&
        (question.type === "radio" || question.type === "checkbox") &&
        typeof value === "object" &&
        value !== null
      ) {
        if (question.id === 207) {
          otherAnswers[id] = value;
        } else if (value.selectedOption) {
          otherAnswers[id] = getConstructedAnswer(question, value);
        } else {
          otherAnswers[id] = value;
        }

        const isComplexObjectToKeep =
          question.id === 207 ||
          (question.subOptions &&
            Object.keys(question.subOptions).length > 0) ||
          question.options?.some((opt) => opt.includes("||crit"));

        if (isComplexObjectToKeep) {
          otherAnswers[id] = value;
        } else if (value.selectedOption) {
          otherAnswers[id] = getConstructedAnswer(question, value);
        } else {
          otherAnswers[id] = value;
        }
      } else if (numericId >= 1008 && numericId <= 1010) {
        const keyMap: Record<string, string> = {
          "1008": "principle",
          "1009": "factual_statement",
          "1010": "implication",
        };
        researchContext.research_questions[keyMap[id]] = value;
      } else if (numericId >= 1011 && numericId <= 1013) {
        const keyMap: Record<string, string> = {
          "1011": "principle",
          "1012": "factual_statement",
          "1013": "implication",
        };
        researchContext.molecular_signaling[keyMap[id]] = value;
      } else if (numericId === 3001 && value && value.selectedOption) {
        const mainAnswer = value.selectedOption;
        const subAnswer = value.subs?.[mainAnswer] || "";
        confidentialityLevel = subAnswer
          ? `${mainAnswer} (Level: ${subAnswer})`
          : mainAnswer;
      } else {
        otherAnswers[id] = value;
      }
    });

    const response = await fetch(`${VITE_API_BASE_URL}/api/response`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        researcher_id: researcherID,
        questionnaire_id: 1,
        answers: otherAnswers,
        final_route: suggestedRoutes.value.join(", ") || "unknown",
        disease_name: answers.value[1006] || "",
        intervention: answers.value[1007] || "",
        research_context: researchContext,
        confidentiality_level: confidentialityLevel,
        token: store.currentToken,
        version: store.currentVersion,
        researcher_name: store.researcher.name,
        researcher_email: store.researcher.email,
        existing_file_ids: existingFileIds,
      }),
    });
    const responseResult = await response.json();
    if (!response.ok) throw new Error("Failed to save response");

    const responseID = responseResult.id;
    const responseToken = responseResult.token;

    if (newFilesToUpload.length > 0) {
      const uploadPromises = newFilesToUpload.map(({ questionId, file }) => {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("response_id", String(responseID));
        formData.append("question_id", questionId);
        return fetch(`${VITE_API_BASE_URL}/api/response/file`, {
          method: "POST",
          body: formData,
        });
      });
      const uploadResults = await Promise.all(uploadPromises);
      const failedUpload = uploadResults.find((res) => !res.ok);
      if (failedUpload) {
        throw new Error(`Failed to upload file: ${await failedUpload.text()}`);
      }
    }

    await fetch(`${VITE_API_BASE_URL}/api/response/${responseID}/finalize`, {
      method: "POST",
    });

    submissionSuccess.value = true;
  } catch (error) {
    console.error("Error submitting data:", error);
    submissionError.value = true;
  }
};
const startNewSurvey = () => {
  store.resetStore();
  router.push("/");
};

const summaryStep2 = computed(() => {
  const answer201 = answers.value[201];
  const answer202 = answers.value[202];

  const q201 = getQuestionById2(201);
  const q202 = getQuestionById2(202);

  if (!answer201 || !answer202 || !q201 || !q202) {
    return null;
  }

  let stagingTypingDesc = "";
  if (typeof answer201 === "string") {
    if (answer201.startsWith("Yes, both staging and typing")) {
      const ref = answer201.split("ref : ")[1] || "not specified";
      stagingTypingDesc = `that there is both staging and typing (ref: <span class="dynamic-text">${ref}</span>)`;
    } else if (answer201 === "Yes, staging only.") {
      const answer201_5 = answers.value[201.5] || "details not provided";
      stagingTypingDesc = `that there is staging only, specifically: "<em>${answer201_5}</em>"`;
    } else if (answer201.startsWith("Yes, typing only.")) {
      const typing = answer201.split(": ")[1]?.slice(0, -1) || "not specified";
      stagingTypingDesc = `that there is typing only, defined as: "<em>${typing}</em>"`;
    } else if (answer201 === "No") {
      stagingTypingDesc = "that there are no staging or typing classifications";
    } else if (answer201 === "Uncertain") {
      stagingTypingDesc =
        "that it is uncertain if staging or typing classifications exist";
    }
  }

  let criteriaDesc = "";
  if (typeof answer202 === "string") {
    if (answer202.startsWith("Yes")) {
      const criteriaText =
        answer202.split(": ")[1]?.slice(0, -1) || "not provided";
      criteriaDesc = `you have defined criteria ("<em>${criteriaText}</em>")`;
    } else {
      criteriaDesc = "you do not have defined diagnostic criteria";
    }
  }

  return `From your response to question - "<em>${q202.question}</em>", where ${criteriaDesc}, these are compared with the disease's classifications from question - "<em>${q201.question}</em>" (in which you indicated ${stagingTypingDesc}). Based on this comparison, the originating cell type is identified as <span class="dynamic-text">N/A</span>.`;
});

// const summaryStep3 = computed(() => {
//   const answer101 = answers.value[101];
//   const q101 = getQuestionById2(101);

//   if (!answer101 || !q101) {
//     return null;
//   }

//   const diseaseName = `<span class="dynamic-text">${
//     answers.value[1006] || "the disease"
//   }</span>`;
//   let mechanismText = `<span class="dynamic-text">undefined</span>`;

//   let finalAnswerString = "";
//   if (typeof answer101 === "object" && answer101.selectedOption) {
//     finalAnswerString = answer101.selectedOption;
//   } else if (typeof answer101 === "string") {
//     finalAnswerString = answer101;
//   }

//   if (finalAnswerString.startsWith("Yes")) {
//     const match = finalAnswerString.match(/mechanism : (.*) and Attach/);
//     const extractedText = match ? match[1] : "";

//     if (extractedText && extractedText.trim() !== "") {
//       mechanismText = `<em>${extractedText}</em>`;
//     }
//   }

//   return `From your response to question - "<em>${q101.question}</em>", the mechanism of ${diseaseName} is deduced as ${mechanismText}.`;
// });

// const summaryStep4 = computed(() => {
//   const answer201 = answers.value[201];
//   const answer202 = answers.value[202];

//   if (!answer201 || !answer202) {
//     return null;
//   }

//   const diseaseName = `<span class="dynamic-text">${
//     answers.value[1006] || "the disease"
//   }</span>`;

//   let stagingTypingDesc = "";
//   if (typeof answer201 === "string") {
//     if (answer201.startsWith("Yes, both staging and typing")) {
//       const ref = answer201.split("ref : ")[1] || "not specified";
//       stagingTypingDesc = `implying that there is both staging and typing (ref: <span class="dynamic-text">${ref}</span>)`;
//     } else if (answer201 === "Yes, staging only.") {
//       const answer201_5 = answers.value[201.5] || "details not provided";
//       stagingTypingDesc = `implying that there is staging only, specifically: "<em>${answer201_5}</em>"`;
//     } else if (answer201.startsWith("Yes, typing only.")) {
//       const typing = answer201.split(": ")[1]?.slice(0, -1) || "not specified";
//       stagingTypingDesc = `implying that there is typing only, defined as: "<em>${typing}</em>"`;
//     } else {
//       stagingTypingDesc = `implying that there are no staging or typing classifications`;
//     }
//   }

//   let criteriaDesc = "";
//   if (typeof answer202 === "string") {
//     if (answer202.startsWith("Yes")) {
//       criteriaDesc = `implying that you have defined criteria`;
//     } else {
//       criteriaDesc = `implying that you do not have defined diagnostic criteria`;
//     }
//   }

//   const probableInducers = ["N/A", "N/A", "N/A"];
//   const n = probableInducers.length;
//   const inducedResult = `<span class="dynamic-text">N/A</span>`;

//   const inducersList = probableInducers.map((item) => `<br>• ${item}`).join("");

//   return `By comparing molecular data associated with cell types involved in different stages and types (${stagingTypingDesc}) against molecules involved across all cell types listed in diagnostic criteria (${criteriaDesc}), it is inferred that the <strong>${n}</strong> probable initial inducers of ${diseaseName} are: ${inducersList}<br> All of these are capable of inducing ${inducedResult}.`;
// });

// const summaryStep5 = computed(() => {
//   const answer103 = answers.value[103];
//   const q103 = getQuestionById2(103);

//   if (!answer103 || !q103) {
//     return null;
//   }

//   const diseaseName = `<span class="dynamic-text">${
//     answers.value[1006] || "the disease"
//   }</span>`;
//   let title = "";
//   let body = "";

//   if (answer103 === "More than 80% efficiency") {
//     title = "Remission-Oriented Research Question";
//     body = `Given your response to question - ("<em>${q103.question}</em>") was "<em>${answer103}</em>", the research question is focused on confirming that eliminating or controlling known factors can induce true remission in ${diseaseName}.`;
//   } else {
//     title = "Exploratory Pre-Remission Research Question";
//     body = `Based on your response to question - ("<em>${q103.question}</em>") where you indicated the efficiency is "<em>${answer103}</em>", the focus shifts to an exploratory question: To formulate a research question that identifies unknown factors which must be addressed before confirming remission-inducing therapies or control strategies.`;
//   }

//   return `<strong>${title}:</strong> ${body}`;
// });

const summaryParagraphs = computed(() => {
  const paragraphs: { text: string }[] = [];
  const diseaseName = `<span class="dynamic-text">${
    store.answers[1006] || "the disease"
  }</span>`;

  const buildDecisionSentence = (text: string, route: string) => {
    return `<span class="decision-sentence">${text.replace(
      route,
      `<span class="route-name">${route}</span>`
    )}</span>`;
  };

  const getAnswerKey = (answer: any): string => {
    if (!answer) return "";
    return typeof answer === "object" && answer.selectedOption
      ? answer.selectedOption
      : String(answer);
  };

  const getCritCount = (answer: any, question: Question2 | null): number => {
    if (
      !answer ||
      typeof answer !== "object" ||
      !answer.inlineText ||
      !question?.options
    )
      return 0;
    const optionIndex = question.options.findIndex(
      (opt) => opt === answer.selectedOption
    );
    if (optionIndex === -1) return 0;
    const count = answer.inlineText[`${question.id}-${optionIndex}-select`];
    return Number(count) || 0;
  };

  const finalRoute = store.suggestedRoutes[0];
  let justificationText = "";

  switch (finalRoute) {
    case "Route A":
      justificationText = `Based on the researcher's confirmation that the intervention achieves a high remission rate in both internal data (Question A-2) and published reports (Question A-3), the evidence points towards a well-understood and highly effective mechanism. ${buildDecisionSentence(
        "This robust, positive data justifies pursuing Route A, focusing on a single, all-type remission target.",
        "Route A"
      )}`;
      break;

    case "Route B":
      justificationText = `The provided answers indicate that ${diseaseName} is defined by a limited number of diagnostic criteria (Question B-2) and does not meet the high-remission evidence required for Route A. This suggests a pathogenesis likely driven by a single cell type. ${buildDecisionSentence(
        "Therefore, the investigation logically proceeds via Route B to define this single-cell mechanism.",
        "Route B"
      )}`;
      break;

    case "Route C":
      justificationText = `The identification of a direct contradiction within the diagnostic criteria (Question B-3) is a pivotal finding. It suggests that the clinical presentation may be a syndrome of multiple, distinct molecular conditions rather than a single disease. ${buildDecisionSentence(
        "This critical insight mandates a re-evaluation via Route C.",
        "Route C"
      )}`;
      break;

    case "Route D":
    case "Route E":
    case "Route F":
    case "Route G":
    case "Route H":
      let intro = `The responses indicate a complex pathogenesis, as supported by a high number of diagnostic criteria (Question B-2), a lack of contradictions (Question B-3), and the absence of a known high-remission therapy (Question A-2/A-3). The specific path forward is determined by the disease's classification: `;
      let specificReason = "";

      const ans201 = store.answers[201];
      const key201 = getAnswerKey(ans201);

      if (finalRoute === "Route D") {
        specificReason = `Given the absence of defined staging or typing (Question B-1), the appropriate path is ${buildDecisionSentence(
          "Route D, aiming to characterize this complex, undifferentiated disease.",
          "Route D"
        )}`;
      } else if (finalRoute === "Route E") {
        specificReason = `Given the classification as a two-stage disease (Question B-1), the investigation should proceed via ${buildDecisionSentence(
          "Route E to analyze the molecular transition between these defined stages.",
          "Route E"
        )}`;
      } else if (finalRoute === "Route F") {
        specificReason = `Given the classification as a multi-stage disease (Question B-1), the investigation requires the more detailed analysis provided by ${buildDecisionSentence(
          "Route F.",
          "Route F"
        )}`;
      } else if (finalRoute === "Route G") {
        specificReason = `Given the classification by molecular types without distinct stages (Question B-1), the logical path is ${buildDecisionSentence(
          "Route G, focusing on the divergent triggers for each subtype.",
          "Route G"
        )}`;
      } else if (finalRoute === "Route H") {
        specificReason = `Given the classification involving both staging and typing (Question B-1), a comprehensive approach is necessary. The investigation must therefore proceed via ${buildDecisionSentence(
          "Route H to address this dual complexity.",
          "Route H"
        )}`;
      }
      justificationText = intro + specificReason;
      break;
  }

  if (justificationText) {
    paragraphs.push({ text: justificationText });
  }

  return paragraphs;
});

const isConfidentialFormComplete = computed(() => {
  const confidentialAnswer = answers.value[3001];
  if (
    !confidentialAnswer ||
    typeof confidentialAnswer !== "object" ||
    !confidentialAnswer.selectedOption
  ) {
    return false;
  }
  const mainSelection = confidentialAnswer.selectedOption;
  const subAnswer = confidentialAnswer.subs?.[mainSelection];
  if (subAnswer === null || subAnswer === undefined || subAnswer === "") {
    return false;
  }
  return true;
});

const hasNonsenseStagingTyping = computed(() => {
  const answer104 = answers.value[104];
  const answer201 = answers.value[201];

  if (typeof answer104 === "string" && answer104.startsWith("Yes")) {
    if (
      typeof answer201 === "string" &&
      !answer201.startsWith("Yes, both staging and typing") &&
      !answer201.startsWith("Yes, typing only")
    ) {
      return true;
    }
  }
  return false;
});

const hasNonsenseContradiction = computed(() => {
  const answer202 = answers.value[202];
  const answer203 = answers.value[203];

  if (answer202 === "No") {
    if (typeof answer203 === "string" && answer203.startsWith("Yes")) {
      return true;
    }
  }
  return false;
});

const isSubmissionLocked = computed(() => {
  const status = store.currentStatus;
  return status === 2 || status === -2 || status === -1;
});

const lockedStatusText = computed(() => {
  const status = store.currentStatus;
  switch (status) {
    case 2:
      return "This project has been Approved and can no longer be edited.";
    case -2:
      return "This project has been Rejected and can no longer be edited.";
    case -1:
      return "This project has been Canceled and can no longer be edited.";
    default:
      return "";
  }
});

const openCancelModal = () => {
  projectNameVerification.value = "";
  showCancelModal.value = true;
};

const handleCancelProject = async () => {
  if (projectNameVerification.value !== store.answers[1002]) {
    alert("Project name does not match.");
    return;
  }

  isCancelling.value = true;
  try {
    const response = await fetch(`${VITE_API_BASE_URL}/api/response/cancel`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        token: store.currentToken,
        status: -1,
        remark: "Canceled by researcher.",
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to cancel project");
    }

    store.setCurrentStatus(-1);
    showCancelModal.value = false;
    showCancelSuccessModal.value = true;
  } catch (error) {
    console.error("Error cancelling project:", error);
    showCancelErrorModal.value = true;
  } finally {
    isCancelling.value = false;
  }
};
</script>

<template>
  <div class="final-review">
    <div ref="pdfContent">
      <div class="questionnaire">
        <h3 style="margin-bottom: 16px">Summary</h3>

        <div
          v-for="section in questionnaireData1[0].sections"
          :key="section.name"
          class="section"
          style="margin-bottom: 16px"
        >
          <h4
            v-if="section.name !== 'null'"
            class="section-title"
            style="margin-left: 10px"
          >
            {{ section.name }}
          </h4>
          <div class="row">
            <div
              v-for="q in firstFormAnswers.filter(
          (fq) =>
            (section as any).questions?.some((sq: any) => sq.id === fq.id)
        )"
              :key="q.id"
              class="answer-item col-md-12"
            >
              <span class="info-label"
                >{{ q.question }}:
                <span
                  v-if="q.id === 1004"
                  class="info-answer"
                  style="margin-left: 10px"
                >
                  {{
                    typeof q.answer === "string"
                      ? formatPhoneNumber(q.answer)
                      : q.answer
                  }}
                </span>
                <span v-else class="info-answer" style="margin-left: 10px">
                  {{ q.answer }}
                </span></span
              >
            </div>
          </div>
        </div>
<div v-if="suggestedRoutes.length > 0" class="route-suggestion-container" style="margin-left: 10px">
  <h3 class="route-suggestion-header page-break-before" style="margin-bottom: 20px">
    Route of Suggestion
  </h3>

  <div v-for="route in suggestedRouteDetails" :key="route.route" class="route-item" style="margin-left: 16px; margin-bottom: 20px">
    <h4 class="route-title">
      <span class="final-route-text">{{ route.route }}</span>
      <span style="font-weight: 200; font-style: italic; font-size: 1.1rem; color: #333; margin-left: 10px;">
        : {{ route.title }}
      </span>
    </h4>

<div v-if="dynamicInterventionAspect" class="aspect-section">
  <h5 class="aspect-title">Intervention Aspect</h5>
  <div class="route-description" style="margin-left:1.5rem;">
    <ul>
      <li>
        {{ dynamicInterventionAspect.a2_intro }}
        <span class="dynamic-answer">{{ dynamicInterventionAspect.a2_main }}</span>
        <ul v-if="dynamicInterventionAspect.a2_bullets.length > 0" style="list-style-type: circle; margin-top: 0.5rem;">
          <li v-for="(aspect, i) in dynamicInterventionAspect.a2_bullets" :key="i">
            {{ aspect }}
          </li>
        </ul>
      </li>
      <li>
        {{ dynamicInterventionAspect.a3_intro }}
        <span class="dynamic-answer">{{ dynamicInterventionAspect.a3_main }}</span>
      </li>
    </ul>
  </div>
</div>
    <div v-if="dynamicDiseaseAspect" class="aspect-section">
  <h5 class="aspect-title">Disease Aspect</h5>
  <div class="route-description" style="margin-left:1.5rem;">
    <ul>
      <li style="margin-bottom: 8px;">
        Staging and/or typing classification:
        <span class="dynamic-answer">{{ dynamicDiseaseAspect.b1_main }}</span>
        <ul v-if="dynamicDiseaseAspect.b1_bullets.length > 0">
          <li v-for="(bullet, i) in dynamicDiseaseAspect.b1_bullets" :key="i">{{ bullet }}</li>
        </ul>
      </li>
      <li  style="margin-bottom: 8px;">
        Contradictory response or progression: Considering whether there is any contradictory response or contradiction in the natural progression of the disease, which may be inferred as evidence of more than one or different molecular mechanism within the disease:
        <span class="dynamic-answer">{{ dynamicDiseaseAspect.b3_main }}</span>
      </li>
      <li style="margin-bottom: 8px;">
        The number of cells involved in the studied disease can be inferred from diagnostic<!-- /remission --> criteria: more complex (many) criteria indicate multiple cell involvement.
        <ul style="list-style-type: circle; margin-top: 0.5rem;">
          <li>
            Number of the studied disease’s diagnostic criteria:
            <span class="dynamic-answer">{{ dynamicDiseaseAspect.b2_count }}</span>
            <div style="padding-left: 1.5rem;">
              Usually imply: <span class="dynamic-answer">{{ dynamicDiseaseAspect.b2_imply }}</span>
            </div>
          </li>
           <!-- <li>
            Number of the studied disease’s remission criteria:
            <span class="dynamic-answer">{{ dynamicDiseaseAspect.b4_count }}</span>
            <div style="padding-left: 1.5rem;">
              Usually imply: <span class="dynamic-answer">{{ dynamicDiseaseAspect.b4_imply }}</span>
            </div>
          </li> -->
        </ul>
      </li>
    </ul>
  </div>
</div>
    </div>
</div>
      </div>

      <div class="questionnaire page-break-before">
        <h2 style="margin-bottom: 20px">Step of extrapolation</h2>
        <h1
          class="aa"
          style="margin-left: 15px; padding-top: 0px; margin-top: 0px"
        >
          Step 1 : Choose the legitimated route to explore for the originating
          cell
        </h1>

        <div style="margin-left: 30px; margin-right: 30px">
          <div
            v-for="(p, index) in summaryParagraphs"
            :key="index"
            class="summary-item"
          >
            <span class="summary-bullet">•</span>
            <div v-if="p.text" class="summary-text-content">
              <span v-html="p.text"></span>
            </div>
            <div v-else class="summary-text-content">
              <span class="dynamic-text">
                (Answer questions 201 and 202 to generate this section.)
              </span>
            </div>
          </div>
        </div>
        <br style="padding-bottom: 0px" />

        <!-- <h1
          class="aa page-break-before"
          style="margin-left: 15px; padding-top: 0px; margin-top: 0px"
        >
          Step 2 : Identify the originating cell
        </h1>

        <div style="margin-left: 30px; margin-right: 30px">
          <div class="summary-item">
            <span class="summary-bullet">•</span>

        <div v-if="summaryStep2" class="summary-text-content">
            <span v-html="summaryStep2"></span>
          </div>
          <div v-else class="summary-text-content">
            <span class="dynamic-text">
              (Answer questions 201 and 202 to generate this section.)
            </span>
          </div> -->
                  
            <!-- <div class="summary-text-content">
              <span style="color: red"
                >N/A (Insufficient data. <br />Need : originating cell type
                identifier)</span
              >
            </div> -->
          <!-- </div>
        </div> -->

        <!-- <h1
          class="aa"
          style="margin-left: 15px; padding-top: 0px; margin-top: 0px"
        >
          Step 3 : Mechanism of the disease development
        </h1>

        <div style="margin-left: 30px; margin-right: 30px">
          <div class="summary-item">
            <span class="summary-bullet">•</span>
            <div v-if="summaryStep3" class="summary-text-content">
              <span v-html="summaryStep3"></span>
            </div>
            <div v-else class="summary-text-content">
              <span class="dynamic-text">
                (Answer questions A-1 to generate this section.)
              </span>
            </div>
          </div>
        </div> -->
        <!-- 
        <h1
          class="aa"
          style="margin-left: 15px; padding-top: 0px; margin-top: 0px"
        >
          Step 4 : Identify the initial signal
        </h1>

        <div style="margin-left: 30px; margin-right: 30px">
          <div class="summary-item">
            <span class="summary-bullet">•</span>
             -->
        <!-- <div v-if="summaryStep4" class="summary-text-content">
            <span v-html="summaryStep4"></span>
          </div>
          <div v-else class="summary-text-content">
            <span class="dynamic-text">
              (Answer questions 201 and 202 to generate this section.)
            </span>
          </div> -->
        <!-- <div class="summary-text-content">
              <span style="color: red"
                >N/A (Insufficient data. <br />Need : proable initial inducers
                and what they're induce.)</span
              >
            </div>
          </div>
        </div> -->

        <!-- <h1
          class="aa"
          style="margin-left: 15px; padding-top: 0px; margin-top: 0px"
        >
          Step 5 : Establish remission therapy question
        </h1>

        <div style="margin-left: 30px; margin-right: 30px">
          <div class="summary-item">
            <span class="summary-bullet">•</span>
            <div v-if="summaryStep5" class="summary-text-content">
              <span v-html="summaryStep5"></span>
            </div>
            <div v-else class="summary-text-content">
              <span class="dynamic-text">
                (Answer questions A-3 to generate this section.)
              </span>
            </div>
          </div>
        </div> -->

        <!-- <h1
          class="aa page-break-before"
          style="margin-left: 15px; padding-top: 0px; margin-top: 0px"
        >
          Step 6 : Confirm confidentiality level
        </h1>

        <div style="margin-left: 30px; margin-right: 30px">
          <ConfidentialForm />
        </div> -->
        <!-- <br /> -->
      </div>
    </div>
    <div class="btn-container">
      <div v-if="currentRemark && showReviewerFeedback" class="feedback-panel">
        <h4 class="feedback-title">Reviewer's Feedback</h4>
        <p class="feedback-text">{{ currentRemark }}</p>
      </div>
      <div
        v-if="suggestedRoutes.includes('Route C') && !hasNonsenseContradiction"
        class="preamble-inline"
      >
        <div class="preamble-icon">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 16 16"
            width="16"
            height="16"
          >
            <path
              fill-rule="evenodd"
              d="M8 1.5a6.5 6.5 0 1 0 0 13a6.5 6.5 0 0 0 0-13M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8m7.25-2.25a.75.75 0 0 1 .75.75v3.5a.75.75 0 0 1-1.5 0v-3.5a.75.75 0 0 1 .75-.75M8 11a1 1 0 1 1 0-2a1 1 0 0 1 0 2"
            />
          </svg>
        </div>
        <div class="preamble-text-group">
          <div>
            <strong>Contradiction Warning: Re-evaluation Required</strong>
            <p>
              Your responses have identified a significant contradiction within
              the diagnostic criteria or natural history of the disease. This is
              a critical finding, as it challenges the assumption that the
              condition is a single, uniform entity.
            </p>
            <p>
              This suggests that what is currently defined as one disease may,
              in fact, represent a heterogeneous syndrome—a collection of
              distinct pathological processes that converge on similar clinical
              signs. Proceeding with the current data is inadvisable, as it
              could lead to confounding results and a failure to identify the
              true originating cell type(s).
            </p>
            <strong>Recommended Action:</strong>
            <ul>
              <li>
                <strong>Further Research:</strong> Conduct additional
                preclinical or clinical research to gather data that clarifies
                the diagnostic criteria and resolves the observed contradiction.
              </li>
              <li>
                <strong>Re-evaluate Inputs:</strong> Carefully review the
                answers provided in this questionnaire to ensure they are based
                on a consistent and robust set of evidence.
              </li>
            </ul>
            <p style="margin-bottom: 0">
              Resolution of this contradiction is a prerequisite for
              legitimately exploring the originating cell and pursuing a
              high-precision therapeutic strategy.
            </p>
          </div>
        </div>
      </div>
<div v-if="isRouteB" class="preamble-inline">
  <div class="preamble-icon">
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="16" height="16"><path fill-rule="evenodd" d="M8 1.5a6.5 6.5 0 1 0 0 13a6.5 6.5 0 0 0 0-13M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8m7.25-2.25a.75.75 0 0 1 .75.75v3.5a.75.75 0 0 1-1.5 0v-3.5a.75.75 0 0 1 .75-.75M8 11a1 1 0 1 1 0-2a1 1 0 0 1 0 2" /></svg>
  </div>
  <div class="preamble-text-group">
    <strong>Note for Route B</strong>
    <p>If your disease is showing up here but you know from research that it usually involves multiple cells or has diverse clinical features, this likely means your diagnostic or remission criteria were written too narrowly.</p>
    <p style="margin-top: 1rem; margin-bottom: 0;"><strong>Please go back and:</strong></p>
    <ul>
      <li>Re-check your diagnostic criteria – complex, multi–cell type diseases usually require more than 2 key features to define, because different cell types contribute to different symptoms.</li>
      <li>Re-check your remission criteria – durable remission in complex diseases typically requires controlling several pathways or cell types, not just one.</li>
    </ul>
  </div>
</div>

<div v-if="suggestedRoutes.length > 0" class="route-suggestion-container">
  </div>
      <div v-if="hasNonsenseStagingTyping" class="preamble-inline">
        <div class="preamble-icon">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 16 16"
            width="16"
            height="16"
          >
            <path
              fill-rule="evenodd"
              d="M8 1.5a6.5 6.5 0 1 0 0 13a6.5 6.5 0 0 0 0-13M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8m7.25-2.25a.75.75 0 0 1 .75.75v3.5a.75.75 0 0 1-1.5 0v-3.5a.75.75 0 0 1 .75-.75M8 11a1 1 0 1 1 0-2a1 1 0 0 1 0 2"
            />
          </svg>
        </div>
        <div class="preamble-text-group">
          <div>
            <strong
              >Logical Inconsistency Detected: Pathway and
              Classification</strong
            >
            <p>
              Your responses indicate a mismatch. You confirmed evidence for a
              shared pathway with distinct triggers (Question 104), which
              logically requires a classification of "staging and typing" (for
              Route H) or "typing only" (for Route G).
            </p>
            <p>
              However, your selection for disease classification (Question 201)
              does not align with this evidence. Please re-evaluate your inputs
              to ensure consistency.
            </p>
          </div>
        </div>
      </div>

      <div v-if="hasNonsenseContradiction" class="preamble-inline">
        <div class="preamble-icon">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 16 16"
            width="16"
            height="16"
          >
            <path
              fill-rule="evenodd"
              d="M8 1.5a6.5 6.5 0 1 0 0 13a6.5 6.5 0 0 0 0-13M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8m7.25-2.25a.75.75 0 0 1 .75.75v3.5a.75.75 0 0 1-1.5 0v-3.5a.75.75 0 0 1 .75-.75M8 11a1 1 0 1 1 0-2a1 1 0 0 1 0 2"
            />
          </svg>
        </div>
        <div class="preamble-text-group">
          <div>
            <strong>Logical Inconsistency Detected: Diagnostic Criteria</strong>
            <p>
              Your responses are contradictory. You stated that there are no
              defined criteria for diagnosis (Question 202), but then identified
              a contradiction within those same criteria (Question 203).
            </p>
            <p>
              This indicates a fundamental inconsistency in the provided data.
              Please re-evaluate your inputs or conduct further research to
              establish a clear and non-contradictory set of diagnostic criteria
              before proceeding.
            </p>
          </div>
        </div>
      </div>

      <div v-if="!isSubmissionLocked" class="action-bar">
        <div class="action-bar-group">
          <button type="button" class="export-btn" @click="exportToPdf">
            Export to pdf
          </button>
          <button type="button" class="edit-btn" @click="editAnswers">
            Edit answer
          </button>
          <button
            v-if="
              !suggestedRoutes.includes('Route C') &&
              !hasNonsenseStagingTyping &&
              !hasNonsenseContradiction
            "
            type="button"
            class="submit-btn"
            @click="submitFinalResponse"
          >
            Save
          </button>
          <button
            v-else
            type="button"
            class="submit-btn"
            @click="startNewSurvey"
          >
            Reset form
          </button>
        </div>
        <a v-if="canCancelProject" @click="openCancelModal" class="cancel-href"
          >cancel this project</a
        >
      </div>

      <div v-else class="status-display-box">
        {{ lockedStatusText }}
      </div>

      <div v-if="showCancelModal" class="modal">
        <div class="modal-content">
          <h3>Confirm Project Cancellation</h3>
          <p>
            This action is permanent and cannot be undone. To proceed, please
            type the project name "<strong>{{ store.answers[1002] }}</strong
            >" in the box below to confirm.
          </p>
          <input
            type="text"
            v-model="projectNameVerification"
            class="verification-input"
            placeholder="Type project name here"
          />
          <div class="modal-buttons">
            <button
              @click="showCancelModal = false"
              class="modal-btn cancel-btn"
            >
              Close
            </button>
            <button
              @click="handleCancelProject"
              class="modal-btn confirm-btn"
              :disabled="
                isCancelling || projectNameVerification !== store.answers[1002]
              "
            >
              {{ isCancelling ? "Cancelling..." : "Confirm Cancellation" }}
            </button>
          </div>
        </div>
      </div>
      <div v-if="showCancelSuccessModal" class="modal">
        <div class="modal-content">
          <h3>Project Canceled</h3>
          <p>The project has been successfully canceled.</p>
          <div class="modal-buttons-center">
            <button
              @click="showCancelSuccessModal = false"
              class="modal-btn confirm-btn"
            >
              Close
            </button>
          </div>
        </div>
      </div>

      <div v-if="showCancelErrorModal" class="modal">
        <div class="modal-content">
          <h3>Error</h3>
          <p>There was a problem canceling the project. Please try again.</p>
          <div class="modal-buttons-center">
            <button
              @click="showCancelErrorModal = false"
              class="modal-btn cancel-btn"
            >
              Close
            </button>
          </div>
        </div>
      </div>

      <div v-if="submissionSuccess" class="modal">
        <div class="modal-content">
          <h3 class="h3">Data saved successfully.</h3>
          <p>Your information has been saved successfully.</p>
          <div class="modal-buttons">
            <button @click="startNewSurvey" class="btn btn-primary">
              Submit another response.
            </button>
          </div>
        </div>
      </div>

      <div v-if="submissionError" class="modal">
        <div class="modal-content">
          <h3 class="h3">An error occurred.</h3>
          <p>There was a problem saving your information. Please try again.</p>
          <button @click="submissionError = false" class="btn btn-primary">
            Close
          </button>
        </div>
      </div>
    </div>
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

.p {
  padding: 8px;
  margin-top: 24px;
  margin-bottom: 24px;
}

.edit-btn,
.export-btn {
  height: 100%;
  width: 188px;
  background-color: white;
  color: #eb4648;
  padding: 8px;
  border: 1px solid #eb4648;
  border-radius: 4px;
  cursor: pointer;
  margin-left: 8px;
  margin-right: 16px;
}

.edit-btn:hover {
  background-color: #e3e3e3;
}

.section-title {
  font-size: 20px;
  font-weight: 400;
  padding: 0;
  margin: 0px 0px 24px 0px;
  border: none;
}

.aa {
  margin-top: 10px;
  margin-bottom: 10px;
  padding-top: 8px;
  padding-bottom: 8px;
  font-size: 20px;
  font-weight: 400;
  line-height: 24px;
}

.h3 {
  padding-top: 8px;
  padding-bottom: 8px;
  font-size: 20px;
  font-weight: 400;
  line-height: 24px;
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

.padding-left {
  padding-right: 0px !important;
  padding-left: 16px !important;
}

.padding-right {
  padding-right: 16px !important;
}

.question-label {
  margin-bottom: 4px;
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
  border: 1px solid #a4a4a4;
  border-radius: 4px;
}

.radio-group,
.checkbox-group {
  display: flex;
  flex-direction: column;
}

.radio-option,
.checkbox-option {
  font-size: 18px;
  padding: 0px 8px;
  display: flex;
  align-items: center;
  margin: 12px 0px;
  gap: 10px;
}

.radio-input,
.checkbox-input {
  accent-color: #eb4648;
  cursor: pointer;
}

.submit-btn {
  height: 100%;
  width: 190px;
  background-color: #eb4648;
  color: white;
  padding: 8px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-left: 8px;
  margin-right: 16px;
}

.submit-btn:hover {
  background-color: #c9302c;
}

.submit-btn:disabled {
  background-color: #cccccc;
  color: #6c757d;
  cursor: not-allowed;
}

.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal-content {
  max-width: 400px;
  background: white;
  padding: 20px;
  border-radius: 8px;
  text-align: center;
  align-items: center;
}

.modal-buttons {
  display: flex;
  justify-content: space-between;
  margin-top: 15px;
}

.home-btn {
  background-color: #4caf50;
  color: white;
  padding: 10px 15px;
  border: none;
  cursor: pointer;
}

.new-survey-btn {
  background-color: #f0ad4e;
  color: white;
  padding: 10px 15px;
  border: none;
  cursor: pointer;
}

.close-btn {
  background-color: #d9534f;
  color: white;
  padding: 10px 15px;
  border: none;
  cursor: pointer;
}

.final-review {
  padding-bottom: 50px;
}
.questionnaire {
  padding: 16px;
  border-bottom: 1px solid #eee;
  margin-bottom: 20px;
}
.answer-block {
  margin-bottom: 24px;
}
.question-label {
  font-size: 18px;
  font-weight: 500;
  color: #333;
  margin-bottom: 8px;
}
.answer-text,
.answer-block ul {
  font-size: 16px;
  color: #555;
  margin-left: 16px;
}
.sub-answer-block {
  margin-left: 32px;
  margin-top: 10px;
  padding-left: 15px;
  border-left: 2px solid #f0f0f0;
}
.final-route-text {
  color: #eb4648;
  font-weight: bold;
}
.aa {
  font-size: 20px;
  font-weight: 400;
}
.btn-container {
  padding: 16px;
}

.summary-item {
  display: flex;
  gap: 8px;
  padding-bottom: 1rem;
  line-height: 1.6;
}

.summary-bullet {
  font-weight: bold;
  color: #eb4648;
}

.dynamic-text {
  color: #555;
  font-style: italic;
  font-weight: 500;
}

.decision-sentence {
  color: #555;
  display: block;
  margin-top: 4px;
}

.decision-words-positive {
  color: #28a745;
  font-weight: bold;
}

.decision-words-negative {
  color: #d84315;
  font-weight: bold;
}
.summary-item {
  display: flex;
  gap: 8px;
  padding-bottom: 1rem;
  line-height: 1.6;
}

.summary-bullet {
  font-weight: bold;
  color: #eb4648;
}

.dynamic-text {
  color: #555;
  font-style: italic;
  font-weight: 500;
}

.decision-sentence {
  color: #555;
  display: block;
  margin-top: 4px;
}

.route-name {
  color: #d84315;
  font-weight: bold;
}

.decision-words {
  color: #d84315;
  font-weight: bold;
}
</style>

<style>
.summary-item {
  display: flex;
  gap: 8px;
  padding-bottom: 1rem;
  line-height: 1.6;
}

.summary-bullet {
  font-weight: bold;
  color: #eb4648;
}

.dynamic-text {
  color: #555;
  font-style: italic;
  font-weight: 500;
}

.decision-sentence {
  color: #555;
  display: block;
  margin-top: 4px;
}

.route-name {
  color: #d84315;
  font-weight: bold;
}

.decision-words {
  color: #d84315;
  font-weight: bold;
}
.preamble-inline {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  background-color: #fbe9e7;
  color: #5d4037;
  border: 1px solid #ffab91;
  border-radius: 8px;
  padding: 16px;
  margin: 0 8px 1.5rem 8px;
}

.preamble-icon {
  flex-shrink: 0;
  color: #d84315;
}

.preamble-text {
  font-size: 16px;
  line-height: 1.5;
}

.preamble-text strong {
  font-weight: 600;
}

.answer-item {
  margin-bottom: 16px;
  padding: 0 8px;
}

.info-label {
  color: #333;
  font-size: 18px;
}

.info-answer {
  font-size: 16px;
  color: #555;
  margin-top: 4px;
  padding-left: 8px;
  white-space: pre-wrap;
  word-wrap: break-word;
}

.section .row {
  margin-left: 20px;
}

.answer-block {
  margin-left: 20px;
}

.cancel-href {
  width: 100%;
  align-self: end;
  align-items: end;
  align-content: end;
  text-align: end;
  font-size: 20px;
  border-radius: 6px;
  color: #4b5563;
  font-weight: 500;
  font-style: italic;
  cursor: pointer;
  padding-right: 1%;
}

.verification-input {
  width: 100%;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 1rem;
  margin-top: 1rem;
  margin-bottom: 1rem;
}

.action-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.action-bar-group {
  display: flex;
}

.aspect-section {
  margin-top: 1rem;
}

.aspect-title {
  font-weight: 600;
  color: #444;
  margin-bottom: 0.5rem;
}

.dynamic-answer {
  font-style: italic;
  color: #555; /* A standard grey color */
}
</style>
