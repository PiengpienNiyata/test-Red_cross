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

const pdfContent = ref<HTMLElement | null>(null);
const store = useQuestionnaireStore();
const router = useRouter();
const showApproveModal = ref(false);
const showReviseModal = ref(false);
const showRejectModal = ref(false);
const showSuccessModal = ref(false);
const remarkText = ref("");
const isSubmitting = ref(false);
const modalActionType = ref<"approve" | "revise" | "reject" | null>(null);

const {
  answers,
  suggestedRoutes,
  currentRemark,
  previousAnswers,
  currentToken,
  currentStatus,
  showReviewerFeedback,
  latestVersion,
  currentVersion,
} = storeToRefs(store);

const getAnswerDifference = (questionId: number) => {
  const currentAnswer = answers.value[questionId];
  const prevAnswer = previousAnswers.value[questionId];

  if (prevAnswer === undefined || prevAnswer === null) return null;

  // Use JSON.stringify for a reliable comparison of objects and primitives
  if (JSON.stringify(currentAnswer) !== JSON.stringify(prevAnswer)) {
    return prevAnswer;
  }

  return null;
};
const isLatestVersion = computed(() => {
  // Check if there is a latest version defined and if it matches the current version
  return (
    store.latestVersion > 0 && store.currentVersion === store.latestVersion
  );
});

const goToDashboard = () => {
  store.resetServey();
  router.push("/admin/dashboard");
};
type FileItem = File | { id: number; name: string; rehydrated: true };
const exportToPdf = () => {
  if (!pdfContent.value) {
    console.error("PDF content element not found.");
    return;
  }

  // Safety check to ensure the answer for the project name exists.
  if (!answers.value[1002]) {
    console.error(
      "Project Name (answer 1002) is not available for the PDF filename."
    );
  }

  const options = {
    margin: [0.75, 0.5, 0.5, 0.7], // Use the project name directly from the answers ref.
    filename: `RIRM-Summary-${answers.value[1002] || "report"} (${
      answers.value[1001]
    }).pdf`,
    image: { type: "jpeg", quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true },
    jsPDF: { unit: "in", format: "a4", orientation: "portrait" },
    pagebreak: {
      mode: "css",
      before: ".page-break-before", // Create a new page BEFORE any element with this class
      avoid: ".summary-item", // AVOID creating a page break inside any element with this class
    },
  };

  html2pdf().from(pdfContent.value).set(options).save();
};

const getFileDownloadUrl = (fileId: number) => {
  return `${VITE_API_BASE_URL}/api/file/${fileId}`;
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

const secondFormAnswers = computed(
  () =>
    Object.entries(store.answers)
      .filter(
        ([id]) => (Number(id) < 600 || Number(id) > 1100) && Number(id) < 1001
      )
      .sort(([idA], [idB]) => Number(idA) - Number(idB))

      .map(([id, answer]) => {
        const question = getQuestionById2(Number(id));
        return question ? { ...question, answer } : null;
      })
      .filter((q) => q !== null) as Question2[]
);

const parseOption = (option: string) => {
  if (option.includes("|/|")) {
    const parts = option.split("|/|");
    return { type: "radio", group: parts[0], label: parts[1] };
  }
  return { type: "checkbox", group: null, label: option };
};

const formatQ207Answer = (question: Question2, answer: any): string => {
  if (typeof answer !== "object" || answer === null) return "";

  const finalParts: string[] = [];

  // Part 1: Format the "Level of Development" (radio button)
  if (answer.radioSelection) {
    let radioText = answer.radioSelection;
    if (radioText.includes("___")) {
      const optionIndex = question.options?.findIndex(
        (opt) => parseOption(opt).label === radioText
      );
      if (optionIndex !== undefined && optionIndex > -1) {
        const key = `${question.id}-${optionIndex}-0`;
        const inlineValue = answer.inlineText?.[key]?.trim() || "...";
        radioText = radioText.replace("___", inlineValue);
      }
    }
    // Add the formatted radio selection with its label
    finalParts.push(
      `<span style="color: red">Level of Development:</span> ${
        radioText.split("||")[0]
      }`
    );
  }

  // Part 2: Format the "Pathogenesis Mechanisms" (checkboxes)
  if (answer.checkboxes && answer.checkboxes.length > 0) {
    const mechanismParts = answer.checkboxes.map((checkboxOpt: string) => {
      let checkboxText = checkboxOpt;

      if (checkboxText.includes("___")) {
        const optionIndex = question.options?.findIndex(
          (opt) => parseOption(opt).label === checkboxText
        );
        if (optionIndex !== undefined && optionIndex > -1) {
          const key = `${question.id}-${optionIndex}-0`;
          const inlineValue = answer.inlineText?.[key]?.trim() || "...";
          checkboxText = checkboxText.replace("___", inlineValue);
        }
      }

      if (
        checkboxText.startsWith("Inflammation") &&
        answer.subs?.["Inflammation"]
      ) {
        return `${checkboxText.split("||")[0]} (${
          answer.subs["Inflammation"]
        })`;
      }
      return checkboxText.split("||")[0];
    });

    // Add the formatted checkboxes with their label
    finalParts.push(
      `<span style="color: red">Pathogenesis Mechanisms:</span> ${mechanismParts.join(
        ", "
      )}`
    );
  }

  // Join the two main parts with a line break for clarity
  return finalParts.join("<br>");
};
// const finalDisplayRoute = computed(() => {
//   if (suggestedRoutes.value.includes("Route C")) {
//     return "Route C";
//   }
//   return suggestedRoutes.value.join(", ");
// });

const routeDefinitions: {
  [key: string]: { route: string; title: string; description: string };
} = {
  "Route A": {
    route: "Route A",
    title: "Known Remission: Single Target, All-Type",
    description:
      "A molecular intervention is known to achieve remission by targeting the originating cell.",
  },
  "Route B": {
    route: "Route B",
    title: "Single Cell Type Mechanism",
    description:
      "The disease's molecular mechanism involves only a single cell type.",
  },
  "Route C": {
    route: "Route C",

    title: "Contradiction Reveals Complexity",
    description:
      "The treatment fails broadly, or contradictions in the data suggest the diagnosis may group multiple distinct diseases under a single name. More than one cell type is involved, but without clear molecular staging or typing.",
  },
  "Route D": {
    route: "Route D",

    title: "Multiple Cell Types without Staging",
    description:
      "More than one cell type is involved, but there are no defined molecular stages or types and no obvious contradictions.",
  },
  "Route E": {
    route: "Route E",

    title: "Simple Molecular Staging (Two-Stage Model)",
    description:
      "The disease progresses through two simple molecular stages (e.g., early vs. late).",
  },
  "Route F": {
    route: "Route F",

    title: "Complex Molecular Staging (Multi-Stage or Branching Model)",
    description:
      "The disease involves more than two molecular stages, or its progression may branch into different paths.",
  },
  "Route G": {
    route: "Route G",

    title: "Multiple Molecular Types (Multiple Triggers)",
    description:
      "All variations of the disease arise from the same upstream signal, suggesting a unified origin despite clinical differences.",
  },
  "Route H": {
    route: "Route H",

    title: "Multiple Molecular Types with Progression (Staging + Typing)",
    description:
      "The disease presents with more than one type of lesion, and these lesions also change in severity or characteristics over time.",
  },
};

// const suggestedRouteDetails = computed(() => {
//   if (suggestedRoutes.value.includes("Route C")) {
//     return [routeDefinitions["Route C"]];
//   }
//   return suggestedRoutes.value
//     .map((route) => routeDefinitions[route])
//     .filter(Boolean);
// });
const suggestedRouteDetails = computed(() => {
  if (suggestedRoutes.value.includes("Route C")) {
    return [routeDefinitions["Route C"]];
  }
  // Create a copy with [...] before sorting to avoid changing the original order in the store.
  // Then, sort it alphabetically.
  return [...suggestedRoutes.value]
    .sort()
    .map((route) => routeDefinitions[route])
    .filter(Boolean);
});
// const editAnswers = () => {
//   store.resetServey();
//   router.push("/questionnairesResearcher");
// };

// const formatCheckboxAnswer = (answer: any): string => {
//   if (!answer || !Array.isArray(answer.main)) return "";

//   const formattedParts = answer.main.map((mainOpt: string) => {
//     const mainLabel = mainOpt.split("||")[0];
//     const subAnswer = answer.subs?.[mainLabel];

//     if (subAnswer && subAnswer.length > 0) {
//       const subAnswerString = Array.isArray(subAnswer)
//         ? subAnswer.join(", ")
//         : subAnswer;
//       return `${mainLabel} (${subAnswerString})`;
//     }

//     return mainLabel;
//   });

//   return formattedParts.join(", ");
// };
const formatCheckboxAnswer = (question: Question2, answer: any): string => {
  if (!answer || !Array.isArray(answer.main)) return "";

  const formattedParts = answer.main.map((mainOpt: string) => {
    if (mainOpt.includes("___")) {
      const parts = mainOpt.split("___");
      let constructed = parts[0].split("||")[0];

      // --- THIS IS THE FIX ---
      // Find the index by comparing the parsed label, not the raw option string
      const optionIndex = question.options?.findIndex(
        (opt) => parseOption(opt).label === mainOpt
      );
      // --- END OF FIX ---

      if (optionIndex !== undefined && optionIndex > -1 && answer.inlineText) {
        for (let i = 0; i < parts.length - 1; i++) {
          const key = `${question.id}-${optionIndex}-${i}`;
          const inlineValue = answer.inlineText[key] || "";
          constructed += inlineValue + parts[i + 1].split("||")[0];
        }
        return constructed;
      }
      return constructed;
    }
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

const startNewSurvey = () => {
  store.resetStore();
  router.push("/");
};

const createObjectURL = (file: File) => {
  return URL.createObjectURL(file);
};

const normalizeFiles = (files: any): FileItem[] => {
  if (Array.isArray(files)) {
    return files as FileItem[]; // Also added an assertion here for consistency
  }
  if (files instanceof FileList) {
    return Array.from(files) as FileItem[]; // This assertion fixes the error
  }
  return [];
};

const getConstructedAnswer = (question: Question2, answer: any): string => {
  if (typeof answer !== "object" || !answer.selectedOption) {
    if (typeof answer === "string") return answer.split("||")[0];
    return answer;
  }

  let finalString = answer.selectedOption;

  if (finalString.includes("___")) {
    const parts = finalString.split("___");
    let constructed = parts[0];

    // --- THIS IS THE FIX ---
    // Find the index by comparing the parsed label, not the raw option string
    const optionIndex = question.options?.findIndex(
      (opt) => parseOption(opt).label === finalString
    );
    // --- END OF FIX ---

    if (optionIndex !== undefined && optionIndex > -1 && answer.inlineText) {
      for (let i = 0; i < parts.length - 1; i++) {
        const key = `${question.id}-${optionIndex}-${i}`;
        const inlineValue = answer.inlineText[key] || "";
        constructed += inlineValue + parts[i + 1];
      }
      finalString = constructed;
    }
  }
  return finalString.split("||")[0];
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

  return `From researcher's response to question - "<em>${q202.question}</em>", where ${criteriaDesc}, these are compared with the disease's classifications from question - "<em>${q201.question}</em>" (in which you indicated ${stagingTypingDesc}). Based on this comparison, the originating cell type is identified as <span class="dynamic-text">N/A</span>.`;
});

const summaryStep3 = computed(() => {
  const answer101 = answers.value[101];
  const q101 = getQuestionById2(101);

  if (!answer101 || !q101) {
    return null;
  }

  const diseaseName = `<span class="dynamic-text">${
    answers.value[1006] || "the disease"
  }</span>`;
  let mechanismText = `<span class="dynamic-text">undefined</span>`;

  let finalAnswerString = "";
  if (typeof answer101 === "object" && answer101.selectedOption) {
    finalAnswerString = answer101.selectedOption;
  } else if (typeof answer101 === "string") {
    finalAnswerString = answer101;
  }

  if (finalAnswerString.startsWith("Yes")) {
    const match = finalAnswerString.match(/mechanism : (.*) and Attach/);
    const extractedText = match ? match[1] : "";

    if (extractedText && extractedText.trim() !== "") {
      mechanismText = `<em>${extractedText}</em>`;
    }
  }

  return `From researcher's response to question - "<em>${q101.question}</em>", the mechanism of ${diseaseName} is deduced as ${mechanismText}.`;
});

const summaryStep4 = computed(() => {
  const answer201 = answers.value[201];
  const answer202 = answers.value[202];

  if (!answer201 || !answer202) {
    return null;
  }

  const diseaseName = `<span class="dynamic-text">${
    answers.value[1006] || "the disease"
  }</span>`;

  let stagingTypingDesc = "";
  if (typeof answer201 === "string") {
    if (answer201.startsWith("Yes, both staging and typing")) {
      const ref = answer201.split("ref : ")[1] || "not specified";
      stagingTypingDesc = `implying that there is both staging and typing (ref: <span class="dynamic-text">${ref}</span>)`;
    } else if (answer201 === "Yes, staging only.") {
      const answer201_5 = answers.value[201.5] || "details not provided";
      stagingTypingDesc = `implying that there is staging only, specifically: "<em>${answer201_5}</em>"`;
    } else if (answer201.startsWith("Yes, typing only.")) {
      const typing = answer201.split(": ")[1]?.slice(0, -1) || "not specified";
      stagingTypingDesc = `implying that there is typing only, defined as: "<em>${typing}</em>"`;
    } else {
      stagingTypingDesc = `implying that there are no staging or typing classifications`;
    }
  }

  let criteriaDesc = "";
  if (typeof answer202 === "string") {
    if (answer202.startsWith("Yes")) {
      criteriaDesc = `implying that you have defined criteria`;
    } else {
      criteriaDesc = `implying that you do not have defined diagnostic criteria`;
    }
  }

  const probableInducers = ["N/A", "N/A", "N/A"];
  const n = probableInducers.length;
  const inducedResult = `<span class="dynamic-text">N/A</span>`;

  const inducersList = probableInducers.map((item) => `<br>• ${item}`).join("");

  return `By comparing molecular data associated with cell types involved in different stages and types (${stagingTypingDesc}) against molecules involved across all cell types listed in diagnostic criteria (${criteriaDesc}), it is inferred that the <strong>${n}</strong> probable initial inducers of ${diseaseName} are: ${inducersList}<br> All of these are capable of inducing ${inducedResult}.`;
});

const summaryStep5 = computed(() => {
  const answer103 = answers.value[103];
  const q103 = getQuestionById2(103);

  if (!answer103 || !q103) {
    return null;
  }

  const diseaseName = `<span class="dynamic-text">${
    answers.value[1006] || "the disease"
  }</span>`;
  let title = "";
  let body = "";

  if (answer103 === "More than 80% efficiency") {
    title = "Remission-Oriented Research Question";
    body = `Given researcher's response to question - ("<em>${q103.question}</em>") was "<em>${answer103}</em>", the research question is focused on confirming that eliminating or controlling known factors can induce true remission in ${diseaseName}.`;
  } else {
    title = "Exploratory Pre-Remission Research Question";
    body = `Based on researcher's response to question - ("<em>${q103.question}</em>") where you indicated the efficiency is "<em>${answer103}</em>", the focus shifts to an exploratory question: To formulate a research question that identifies unknown factors which must be addressed before confirming remission-inducing therapies or control strategies.`;
  }

  return `<strong>${title}:</strong> ${body}`;
});

// const summaryParagraphs = computed(() => {
//   const paragraphs: { text: string }[] = [];
//   const diseaseName = `<span class="dynamic-text">${store.answers[1006] || "the disease"}</span>`;

//   const buildDecisionSentence = (text: string, words: string, route: string) => {
//     const styledText = text.replace(words, `<span class="decision-words">${words}</span>`);
//     return `<span class="decision-sentence">${styledText.replace(route, `<span class="route-name">${route}</span>`)}</span>`;
//   };

//   // Helper to safely get the string value of an answer
//   const getAnswerKey = (answer: any): string => {
//     if (!answer) return "";
//     return (typeof answer === 'object' && answer.selectedOption) ? answer.selectedOption : String(answer);
//   };

//   // Get all the answer keys we need at the top
//   const key102 = getAnswerKey(store.answers[102]);
//   const key201 = getAnswerKey(store.answers[201]);
//   const key201_5 = getAnswerKey(store.answers[201.5]);
//   const key203 = getAnswerKey(store.answers[203]);

//   // --- Route A Logic ---
//   if (store.answers[102]) {
//     const q102_text = getQuestionById2(102)?.question || "";
//     if (key102.startsWith("Yes, please explain the exact remission rate")) {
//       paragraphs.push({
//         text: `Based on your response to question - "<em>${q102_text}</em>", your assertion that the intervention can achieve a high rate of true remission suggests a highly effective mechanism targeting a core pathway. ${buildDecisionSentence("This supports the decision to pursue Route A.", "to pursue", "Route A")}`,
//       });
//     } else {
//       paragraphs.push({
//         text: `Based on your response to question - "<em>${q102_text}</em>", the inability of the intervention to achieve a high rate of true remission indicates that a single, clear molecular target is unlikely or unproven. ${buildDecisionSentence("This supports the decision not to pursue Route A.", "not to pursue", "Route A")}`,
//       });
//     }
//   }

//   // --- Route B, G, H (from Q201) Logic ---
//   if (store.answers[201]) {
//     const q201_text = getQuestionById2(201)?.question || "";
//     if (key201.startsWith("No")) { // Route B
//       paragraphs.push({
//         text: `From your response to question B-1 - "<em>${q201_text}</em>", you've indicated there is no existing staging or typing classification for ${diseaseName}. ${buildDecisionSentence("This observation justifies choosing Route B.", "justifies choosing", "Route B")}`,
//       });
//     }
//     if (key201.startsWith("Yes")) { // Not Route B
//         paragraphs.push({
//             text: `From your response to question - "<em>${q201_text}</em>", your acknowledgment of existing staging and/or typing for ${diseaseName} indicates the disease is not a single, uniform entity. ${buildDecisionSentence("This contradicts the core assumption of Route B, justifying the decision not to pursue this route.", "not to pursue this route", "Route B")}`,
//         });
//     }
//     if (key201.startsWith("Yes, typing only")) { // Route G
//       paragraphs.push({
//         text: `By specifying that ${diseaseName} has typing but not staging (question 201), the investigation is focused on the molecular differences between subtypes. ${buildDecisionSentence("This makes Route G the logical next step.", "makes Route G the logical next step", "Route G")}`,
//       });
//     }
//     if (key201.startsWith("Yes, both staging and typing")) { // Route H
//       paragraphs.push({
//         text: `Your confirmation of both staging and typing for ${diseaseName} (question 201) points to a complex pathogenesis. ${buildDecisionSentence("This supports Route H as the most appropriate and comprehensive approach.", "supports Route H as the most appropriate", "Route H")}`,
//       });
//     }
//   }

//   // --- Route C, D, H (from Q203) Logic ---
//   if (store.answers[203]) {
//     const q203_text = getQuestionById2(203)?.question || "";
//     if (key203.startsWith("Yes")) { // Route C
//       paragraphs.push({
//         text: `By identifying a contradiction within the diagnostic criteria (question - "<em>${q203_text}</em>"), you suggest that '${diseaseName}' may be a syndrome of related conditions. ${buildDecisionSentence("This critical insight directs the investigation towards Route C.", "directs the investigation towards", "Route C")}`,
//       });
//     } else if (key203 === "No") { // Route D or D+H
//       paragraphs.push({
//         text: `Your response to question - "<em>${q203_text}</em>", indicating no contradiction, supports the model of ${diseaseName} as a single, cohesive disease. ${buildDecisionSentence("This allows for the exploration of its pathway via Route D.", "allows for the exploration of its pathway via", "Route D")}`,
//       });
//       // if (key102 === "No") { // Special case for Route H
//       //     paragraphs.push({
//       //         text: `Additionally, because the intervention is unable to achieve a high rate of true remission (question A-2), this suggests the disease, while a single entity, has a complex pathogenesis that the current treatment does not fully address. ${buildDecisionSentence("This supports investigating its complexity via Route H.", "investigating its complexity via", "Route H")}`
//       //     });
//       // }
//     }
//   }

//   // --- Route E, F (from Q201.5) Logic ---
//   if (store.answers[201.5]) {
//       if (key201_5.startsWith("Have 2 stages")) {
//           paragraphs.push({
//               text: `Your identification of two distinct stages (question B-1 | staging only) provides a clear framework for comparative analysis. ${buildDecisionSentence("This supports pursuing Route E to investigate the molecular transition between stages.", "supports pursuing", "Route E")}`
//           });
//       } else if (key201_5.startsWith("Have more than 2 stages")) {
//           paragraphs.push({
//               text: `The presence of more than two stages (question B-1 | more than 2 stages) suggests a complex, multi-step progression. ${buildDecisionSentence("This complexity warrants the detailed analysis provided by Route F.", "warrants the detailed analysis provided by", "Route F")}`
//           });
//       }
//   }

//   return paragraphs;
// });
const summaryParagraphs = computed(() => {
  const paragraphs: { text: string }[] = [];
  const diseaseName = `<span class="dynamic-text">${
    store.answers[1006] || "the disease"
  }</span>`;

  const buildDecisionSentence = (
    text: string,
    words: string,
    route: string
  ) => {
    const styledText = text.replace(
      words,
      `<span class="decision-words">${words}</span>`
    );
    return `<span class="decision-sentence">${styledText.replace(
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

  const key102 = getAnswerKey(store.answers[102]);
  const key201 = getAnswerKey(store.answers[201]);
  const key201_5 = getAnswerKey(store.answers[201.5]);
  const key203 = getAnswerKey(store.answers[203]);

  if (store.answers[102]) {
    const q102_text = getQuestionById2(102)?.question || "";
    if (key102.startsWith("Yes, please explain the exact remission rate")) {
      paragraphs.push({
        text: `Based on the researcher's response to question - "<em>${q102_text}</em>", their assertion that the intervention can achieve a high rate of true remission suggests a highly effective mechanism targeting a core pathway. ${buildDecisionSentence(
          "This supports the decision to pursue Route A.",
          "to pursue",
          "Route A"
        )}`,
      });
    } else {
      paragraphs.push({
        text: `Based on the researcher's response to question - "<em>${q102_text}</em>", the inability of the intervention to achieve a high rate of true remission indicates that a single, clear molecular target is unlikely or unproven. ${buildDecisionSentence(
          "This supports the decision not to pursue Route A.",
          "not to pursue",
          "Route A"
        )}`,
      });
    }
  }

  if (store.answers[201]) {
    const q201_text = getQuestionById2(201)?.question || "";
    if (key201.startsWith("No")) {
      paragraphs.push({
        text: `From the response to question B-1 - "<em>${q201_text}</em>", the researcher has indicated there is no existing staging or typing classification for ${diseaseName}. ${buildDecisionSentence(
          "This observation justifies choosing Route B.",
          "justifies choosing",
          "Route B"
        )}`,
      });
    }
    if (key201.startsWith("Yes")) {
      paragraphs.push({
        text: `From the response to question - "<em>${q201_text}</em>", the acknowledgment of existing staging and/or typing for ${diseaseName} indicates the disease is not a single, uniform entity. ${buildDecisionSentence(
          "This contradicts the core assumption of Route B, justifying the decision not to pursue this route.",
          "not to pursue this route",
          "Route B"
        )}`,
      });
    }
    if (key201.startsWith("Yes, typing only")) {
      paragraphs.push({
        text: `By specifying that ${diseaseName} has typing but not staging (question 201), the investigation is focused on the molecular differences between subtypes. ${buildDecisionSentence(
          "This makes Route G the logical next step.",
          "makes Route G the logical next step",
          "Route G"
        )}`,
      });
    }
    if (key201.startsWith("Yes, both staging and typing")) {
      paragraphs.push({
        text: `The confirmation of both staging and typing for ${diseaseName} (question 201) points to a complex pathogenesis. ${buildDecisionSentence(
          "This supports Route H as the most appropriate and comprehensive approach.",
          "supports Route H as the most appropriate",
          "Route H"
        )}`,
      });
    }
  }

  if (store.answers[203]) {
    const q203_text = getQuestionById2(203)?.question || "";
    if (key203.startsWith("Yes")) {
      paragraphs.push({
        text: `By identifying a contradiction within the diagnostic criteria (question - "<em>${q203_text}</em>"), the researcher suggests that '${diseaseName}' may be a syndrome of related conditions. ${buildDecisionSentence(
          "This critical insight directs the investigation towards Route C.",
          "directs the investigation towards",
          "Route C"
        )}`,
      });
    } else if (key203 === "No") {
      paragraphs.push({
        text: `The response to question - "<em>${q203_text}</em>", indicating no contradiction, supports the model of ${diseaseName} as a single, cohesive disease. ${buildDecisionSentence(
          "This allows for the exploration of its pathway via Route D.",
          "allows for the exploration of its pathway via",
          "Route D"
        )}`,
      });
    }
  }

  if (store.answers[201.5]) {
    if (key201_5.startsWith("Have 2 stages")) {
      paragraphs.push({
        text: `The identification of two distinct stages (question B-1 | staging only) provides a clear framework for comparative analysis. ${buildDecisionSentence(
          "This supports pursuing Route E to investigate the molecular transition between stages.",
          "supports pursuing",
          "Route E"
        )}`,
      });
    } else if (key201_5.startsWith("Have more than 2 stages")) {
      paragraphs.push({
        text: `The presence of more than two stages (question B-1 | more than 2 stages) suggests a complex, multi-step progression. ${buildDecisionSentence(
          "This complexity warrants the detailed analysis provided by Route F.",
          "warrants the detailed analysis provided by",
          "Route F"
        )}`,
      });
    }
  }

  return paragraphs;
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

const handleStatusUpdate = async (status: number, remark: string) => {
  if (isSubmitting.value) return;
  isSubmitting.value = true;

  try {
    const response = await fetch(`${VITE_API_BASE_URL}/api/response/status`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        token: store.currentToken,
        status: status,
        remark: remark,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to update status");
    }

    // Close all modals and show the success message
    showApproveModal.value = false;
    showReviseModal.value = false;
    showRejectModal.value = false;
    showSuccessModal.value = true;
  } catch (error) {
    console.error("Error updating status:", error);
    alert("There was an error updating the status. Please try again.");
  } finally {
    isSubmitting.value = false;
  }
};

const openModal = (type: "approve" | "revise" | "reject") => {
  modalActionType.value = type;
  remarkText.value = ""; // Reset remark text
  if (type === "approve") showApproveModal.value = true;
  if (type === "revise") showReviseModal.value = true;
  if (type === "reject") showRejectModal.value = true;
};

const closeModal = () => {
  showApproveModal.value = false;
  showReviseModal.value = false;
  showRejectModal.value = false;
};

const confirmAction = () => {
  if (modalActionType.value === "approve") {
    handleStatusUpdate(2, ""); // Status 2 for Approved
  } else if (modalActionType.value === "revise") {
    handleStatusUpdate(1, remarkText.value); // Status 1 for Revise
  } else if (modalActionType.value === "reject") {
    handleStatusUpdate(-2, remarkText.value); // Status -2 for Reject
  }
};

const reviewStatusText = computed(() => {
  const status = currentStatus.value;

  // No need to check for currentRemark here, just the status
  if (status === 2) return "This project has already been Approved.";
  if (status === 1) return "Waiting for researcher revisions.";
  if (status === -2) return "This project has already been Rejected.";
  if (status === -1) return "This project has already been Canceled.";

  return "This project has been reviewed.";
});
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
              <!-- :class="{
                'col-md-6': [1001, 1002, 1004, 1005, 1006, 1007].includes(q.id),
                'col-md-12': [
                  1003, 1008, 1009, 1010, 1011, 1012, 1013,
                ].includes(q.id),
              }" -->
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
      </div>

      <div class="questionnaire page-break-before">
        <h3 class="aa">Explore the precision intervention</h3>
        <!-- <div v-for="q in secondFormAnswers" :key="q.id" class="answer-block">
          <label class="question-label">{{ q.question }}</label>

          <p v-if="typeof q.answer === 'string'" class="answer-text">
            <span style="color: red">answer : </span
            >{{ q.answer.split("||")[0] }}
          </p>
          <p v-else-if="Array.isArray(q.answer)" class="answer-text">
            <span style="color: red">answer : </span>{{ q.answer.join(", ") }}
          </p>
          <div v-else-if="typeof q.answer === 'object' && q.answer !== null">
            <div
              v-if="
                typeof q.answer === 'object' &&
                q.answer !== null &&
                'selectedOption' in q.answer
              "
            >
              <p class="answer-text">
                <span style="color: red">answer : </span>
                {{ (q.answer as any).selectedOption.split("||")[0] }}
                <span
                  v-for="(subAnswer, key) in (q.answer as any).subs"
                  :key="key"
                >
                  (
                  {{
                    Array.isArray(subAnswer) ? subAnswer.join(", ") : subAnswer
                  }}
                  )
                </span>
              </p>

              <div v-if="(q.answer as any).fileData" class="sub-answer-block">
                <strong>Attached Files:</strong>
                <ul>
                  <li
                    v-for="(fileInfo, key) in (q.answer as any).fileData"
                    :key="key"
                  >
                   
                    <span
                      v-for="file in (fileInfo.files as FileItem[])"
                      :key="file.name"
                      style="margin-left: 8px"
                    >
                      <a
                        v-if="'rehydrated' in file"
                        :href="getFileDownloadUrl(file.id)"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {{ file.name }}
                      </a>
                      <a
                        v-else
                        :href="createObjectURL(file)"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {{ file.name }}
                      </a>
                    </span>
                  </li>
                </ul>
              </div>
            </div>

            <div
              v-else-if="
                typeof q.answer === 'object' &&
                q.answer !== null &&
                'main' in q.answer
              "
            >
              <p class="answer-text">
                <span style="color: red">answer : </span
                >{{ formatCheckboxAnswer(q.answer) }}
              </p>
            </div>

            <div
              v-else-if="
                typeof q.answer === 'object' &&
                q.answer !== null &&
                'files' in q.answer
              "
            >
             
              <ul>
                <li
                  v-for="file in ((q.answer as any).files as FileItem[])"
                  :key="file.name"
                >
                  <a
                    v-if="'rehydrated' in file"
                    :href="getFileDownloadUrl(file.id)"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {{ file.name }}
                  </a>
                  <a
                    v-else
                    :href="createObjectURL(file)"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {{ file.name }}
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div> -->
        <div
          v-for="q in secondFormAnswers"
          :key="q.id"
          class="answer-block"
          :class="{ 'changed-answer': getAnswerDifference(q.id) }"
        >
          <label class="question-label">{{ q.question }}</label>

          <p v-if="typeof q.answer === 'string'" class="answer-text">
            <span style="color: red">Answer : </span
            >{{ q.answer.split("||")[0] }}
          </p>

          <p v-else-if="Array.isArray(q.answer)" class="answer-text">
            <span style="color: red">Answer : </span>{{ q.answer.join(", ") }}
          </p>

          <div
            v-else-if="
              q.answer &&
              typeof q.answer === 'object' &&
              !Array.isArray(q.answer)
            "
          >
            <div v-if="q.id === 207 && q.answer" class="answer-text">
              <div v-if="(q.answer as any).radioSelection" class="q207-part">
                <span style="color: red">Level of Development : </span>
                {{
                  getConstructedAnswer(q, {
                    selectedOption: (q.answer as any).radioSelection,
                    inlineText: (q.answer as any).inlineText,
                  })
                }}
              </div>

              <div
                v-if="(q.answer as any).checkboxes && (q.answer as any).checkboxes.length > 0"
                class="q207-part"
              >
                <span style="color: red">Pathogenesis Mechanisms : </span>

                <ul class="mechanism-list">
                  <li
                    v-for="mechanism in [...(q.answer as any).checkboxes].sort((a, b) => {
      const masterOptions = getQuestionById2(207)?.options || [];
      const indexA = masterOptions.findIndex(opt => parseOption(opt).label === a);
      const indexB = masterOptions.findIndex(opt => parseOption(opt).label === b);
      return indexA - indexB;
    })"
                    :key="mechanism"
                  >
                    {{
                      formatCheckboxAnswer(q, {
                        main: [mechanism],
                        subs: (q.answer as any).subs,
                        inlineText: (q.answer as any).inlineText,
                      })
                    }}
                  </li>
                </ul>
              </div>
            </div>

            <div v-else-if="'selectedOption' in q.answer">
              <p class="answer-text">
                <span style="color: red">Answer : </span>
                {{ getConstructedAnswer(q, q.answer) }}
                <span
                  v-for="(subAnswer, key) in (q.answer as any).subs"
                  :key="key"
                >
                  ({{
                    Array.isArray(subAnswer) ? subAnswer.join(", ") : subAnswer
                  }})
                </span>
              </p>
            </div>

            <div v-else-if="'main' in q.answer">
              <p class="answer-text">
                <span style="color: red">Answer : </span>
                {{ formatCheckboxAnswer(q, q.answer) }}
              </p>
            </div>

            <div
              v-if="(q.answer as any).fileData || (q.answer as any).files"
              class="sub-answer-block"
            >
              <strong>Attached Files:</strong>
              <ul>
                <li
                  v-for="(fileInfo, key) in (q.answer as any).fileData"
                  :key="key"
                >
                  <span
                    v-for="file in normalizeFiles(fileInfo.files)"
                    :key="file.name"
                    style="margin-left: 8px"
                  >
                    <a
                      v-if="'rehydrated' in file"
                      :href="getFileDownloadUrl(file.id)"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {{ file.name }}
                    </a>
                    <a
                      v-else
                      :href="createObjectURL(file)"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {{ file.name }}
                    </a>
                  </span>
                </li>
                <li
                  v-for="file in normalizeFiles((q.answer as any).files)"
                  :key="file.name"
                >
                  <a
                    v-if="'rehydrated' in file"
                    :href="getFileDownloadUrl(file.id)"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {{ file.name }}
                  </a>
                  <a
                    v-else
                    :href="createObjectURL(file)"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {{ file.name }}
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div
            v-if="(q.answer as any).fileData || (q.answer as any).files"
            class="sub-answer-block"
          ></div>

          <div v-if="getAnswerDifference(q.id)" class="previous-answer-block">
            <!-- <p class="previous-answer-text">
              <span style="color: grey; margin-left: 16px"
                >Previous Answer (version {{ currentVersion - 1 }}) :
              </span>
              <template v-if="typeof getAnswerDifference(q.id) === 'string'">
                {{ getAnswerDifference(q.id).split("||")[0] }}
              </template>
              <template v-else-if="q.id === 207">
                {{ formatQ207Answer(q, getAnswerDifference(q.id)) }}
              </template>
              <template
                v-else-if="
                  getAnswerDifference(q.id) &&
                  'selectedOption' in getAnswerDifference(q.id)
                "
              >
                {{ getConstructedAnswer(q, getAnswerDifference(q.id)) }}
              </template>
              <template
                v-else-if="
                  getAnswerDifference(q.id) &&
                  'main' in getAnswerDifference(q.id)
                "
              >
                {{ formatCheckboxAnswer(q, getAnswerDifference(q.id)) }}
              </template>
            </p>

            <div
              v-if="
                getAnswerDifference(q.id).fileData ||
                getAnswerDifference(q.id).files
              "
              class="sub-answer-block"
            >
              <strong style="color: #757575">Previous Files:</strong>
              <ul class="previous-files-list">
                <li
                  v-for="(fileInfo, key) in getAnswerDifference(q.id).fileData"
                  :key="key"
                >
                  <span
                    v-for="file in normalizeFiles(fileInfo.files)"
                    :key="file.name"
                  >
                    <a
                      v-if="'rehydrated' in file"
                      :href="getFileDownloadUrl(file.id)"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {{ file.name }}
                    </a>
                  </span>
                </li>
                <li
                  v-for="file in normalizeFiles(
                    getAnswerDifference(q.id).files
                  )"
                  :key="file.name"
                >
                  <a
                    v-if="'rehydrated' in file"
                    :href="getFileDownloadUrl(file.id)"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {{ file.name }}
                  </a>
                </li>
              </ul>
            </div> -->
            <div class="previous-answer-heading">
              Previous Answer (version {{ currentVersion - 1 }})
            </div>

            <div v-if="q.id === 207" class="previous-answer-text">
              <div
                v-if="(getAnswerDifference(q.id) as any).radioSelection"
                class="q207-part"
              >
                <span style="margin-left: 12px">Level of Development:</span>
                {{
                  getConstructedAnswer(q, {
                    selectedOption: (getAnswerDifference(q.id) as any)
                      .radioSelection,
                    inlineText: (getAnswerDifference(q.id) as any).inlineText,
                  })
                }}
              </div>
              <div
                v-if="(getAnswerDifference(q.id) as any).checkboxes?.length > 0"
                class="q207-part"
              >
                <span style="margin-left: 12px">Pathogenesis Mechanisms:</span>
                <ul class="mechanism-list">
                  <li
                    v-for="mechanism in [...(getAnswerDifference(q.id) as any).checkboxes].sort((a, b) => {
        const masterOptions = getQuestionById2(207)?.options || [];
        const indexA = masterOptions.findIndex(opt => parseOption(opt).label === a);
        const indexB = masterOptions.findIndex(opt => parseOption(opt).label === b);
        return indexA - indexB;
      })"
                    :key="mechanism"
                  >
                    {{
                      formatCheckboxAnswer(q, {
                        main: [mechanism],
                        subs: (getAnswerDifference(q.id) as any).subs,
                        inlineText: (getAnswerDifference(q.id) as any)
                          .inlineText,
                      })
                    }}
                  </li>
                </ul>
              </div>
            </div>

            <p v-else class="previous-answer-text" style="margin-left: 16px">
              <template v-if="typeof getAnswerDifference(q.id) === 'string'">
                {{ getAnswerDifference(q.id).split("||")[0] }}
              </template>
              <template
                v-else-if="
                  getAnswerDifference(q.id) &&
                  'selectedOption' in getAnswerDifference(q.id)
                "
              >
                {{ getConstructedAnswer(q, getAnswerDifference(q.id)) }}
              </template>
              <template
                v-else-if="
                  getAnswerDifference(q.id) &&
                  'main' in getAnswerDifference(q.id)
                "
              >
                {{ formatCheckboxAnswer(q, getAnswerDifference(q.id)) }}
              </template>
            </p>

            <div
              v-if="(getAnswerDifference(q.id) as any).fileData || (getAnswerDifference(q.id) as any).files"
              class="sub-answer-block"
            >
              <strong style="color: #757575">Previous Files:</strong>
              <ul class="previous-files-list">
                <li
                  v-for="(fileInfo, key) in (getAnswerDifference(q.id) as any).fileData"
                  :key="key"
                >
                  <span
                    v-for="file in normalizeFiles(fileInfo.files)"
                    :key="file.name"
                  >
                    <a
                      v-if="'rehydrated' in file"
                      :href="getFileDownloadUrl(file.id)"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {{ file.name }}
                    </a>
                  </span>
                </li>
                <li
                  v-for="file in normalizeFiles((getAnswerDifference(q.id) as any).files)"
                  :key="file.name"
                >
                  <a
                    v-if="'rehydrated' in file"
                    :href="getFileDownloadUrl(file.id)"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {{ file.name }}
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <!-- <h3 v-if="suggestedRoutes.length > 0" style="margin-left: 8px">
          Road Map Suggestion:
          <span class="final-route-text">{{ finalDisplayRoute }}</span>
        </h3> -->
        <div
          v-if="suggestedRoutes.length > 0"
          class="route-suggestion-container"
          style="margin-left: 10px"
        >
          <h3
            class="route-suggestion-header page-break-before"
            style="margin-bottom: 20px"
          >
            Road Map Suggestion
          </h3>
          <div
            v-for="(route, index) in suggestedRouteDetails"
            :key="index"
            class="route-item"
            style="margin-left: 16px; margin-bottom: 20px"
          >
            <h4 class="route-title">
              <span class="final-route-text">{{ route.route }}</span>
              <span
                style="
                  font-weight: 200;
                  font-style: italic;
                  font-size: 24px;
                  color: #333;
                  margin-left: 10px;
                "
                >: {{ route.title }}</span
              >
            </h4>
            <li
              class="route-description"
              style="margin-left: 16px; color: grey"
            >
              {{ route.description }}
            </li>
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
                (Answer questions B-1 and B-2 to generate this section.)
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
            <span class="summary-bullet">•</span> -->

        <!-- <div v-if="summaryStep2" class="summary-text-content">
            <span v-html="summaryStep2"></span>
          </div>
          <div v-else class="summary-text-content">
            <span class="dynamic-text">
              (Answer questions 201 and 202 to generate this section.)
            </span>
          </div> -->
        <!--           
            <div class="summary-text-content">
              <span style="color: red"
                >N/A (Insufficient data. <br />Need : originating cell type
                identifier)</span
              >
            </div>
          </div>
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

        <!-- <h1
          class="aa"
          style="margin-left: 15px; padding-top: 0px; margin-top: 0px"
        >
          Step 4 : Identify the initial signal
        </h1>

        <div style="margin-left: 30px; margin-right: 30px">
          <div class="summary-item">
            <span class="summary-bullet">•</span> -->

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
          <ConfidentialForm :disabled="true" />
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
              Researcher's responses have identified a significant contradiction
              within the diagnostic criteria or natural history of the disease.
              This is a critical finding, as it challenges the assumption that
              the condition is a single, uniform entity.
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

      <div v-if="hasNonsenseStagingTyping" class="preamble-inline">
        <div class="preamble-icon"></div>
        <div class="preamble-text-group">
          <div>
            <strong
              >Logical Inconsistency Detected: Pathway and
              Classification</strong
            >
            <p>
              Researcher's responses indicate a mismatch. You confirmed evidence
              for a shared pathway with distinct triggers (Question 104), which
              logically requires a classification of "staging and typing" (for
              Route H) or "typing only" (for Route G).
            </p>
            <p>
              However, researcher's selection for disease classification
              (Question 201) does not align with this evidence. Please
              re-evaluate researcher's inputs to ensure consistency.
            </p>
          </div>
        </div>
      </div>

      <div v-if="hasNonsenseContradiction" class="preamble-inline">
        <div class="preamble-icon"></div>
        <div class="preamble-text-group">
          <div>
            <strong>Logical Inconsistency Detected: Diagnostic Criteria</strong>
            <p>
              Researcher's responses are contradictory. You stated that there
              are no defined criteria for diagnosis (Question 202), but then
              identified a contradiction within those same criteria (Question
              203).
            </p>
            <p>
              This indicates a fundamental inconsistency in the provided data.
              Please re-evaluate researcher's inputs or conduct further research
              to establish a clear and non-contradictory set of diagnostic
              criteria before proceeding.
            </p>
          </div>
        </div>
      </div>

      <!-- <button type="button" class="edit-btn" @click="editAnswers">
        Edit answer
      </button> -->
      <!-- <button
        v-if="!suggestedRoutes.includes('Route C')"
        type="button"
        class="submit-btn"
        @click="submitFinalResponse"
        :disabled="!isConfidentialFormComplete"
      >
        Save
      </button> -->
      <!-- 
      <button v-else type="button" class="submit-btn" @click="startNewSurvey">
        Reset form
      </button> -->
      <div class="main-btn-container">
        <button type="button" class="export-btn" @click="exportToPdf">
          Export to pdf
        </button>
        <button @click="goToDashboard" class="dashboard-btn">Dashboard</button>

        <template v-if="!currentRemark && isLatestVersion">
          <button @click="openModal('approve')" class="action-btn approve-btn">
            Approve
          </button>
          <button @click="openModal('revise')" class="action-btn revise-btn">
            Revise
          </button>
          <button @click="openModal('reject')" class="action-btn reject-btn">
            Reject
          </button>
        </template>
        <div v-else class="status-display-box">
          <span v-if="!isLatestVersion">
            You are viewing an older version. Actions are disabled.
          </span>
          <span v-else>
            {{ reviewStatusText }}
          </span>
        </div>
      </div>
      <div v-if="submissionSuccess" class="modal">
        <div class="modal-content">
          <h3 class="h3">Data saved successfully.</h3>
          <p>Your information has been saved successfully.</p>
          <div class="modal-buttons">
            <!-- <button @click="goToHome" class="btn btn-primary">กลับสู่หน้าหลัก</button> -->
            <button @click="startNewSurvey" class="btn btn-primary">
              Submit another response.
            </button>
          </div>
        </div>
      </div>

      <!-- ADD THIS ENTIRE MODAL SECTION AT THE END OF THE TEMPLATE -->
      <!-- Approve Confirmation Modal -->
      <div v-if="showApproveModal" class="modal">
        <div class="modal-content">
          <h3>Confirm Approval</h3>
          <p>Are you sure you want to approve this submission?</p>
          <div class="modal-buttons">
            <button @click="closeModal" class="modal-btn cancel-btn">
              Cancel
            </button>
            <button
              @click="confirmAction"
              class="modal-btn confirm-btn"
              :disabled="isSubmitting"
            >
              {{ isSubmitting ? "Confirming..." : "Confirm" }}
            </button>
          </div>
        </div>
      </div>

      <!-- Revise / Reject Modal -->
      <div v-if="showReviseModal || showRejectModal" class="modal">
        <div class="modal-content">
          <h3>
            {{ showReviseModal ? "Request Revisions" : "Reject Submission" }}
          </h3>
          <p>Please provide a reason or instructions for the researcher.</p>
          <textarea
            v-model="remarkText"
            class="remark-textarea"
            placeholder="Enter remarks here..."
          ></textarea>
          <div class="modal-buttons">
            <button @click="closeModal" class="modal-btn cancel-btn">
              Cancel
            </button>
            <button
              @click="confirmAction"
              class="modal-btn confirm-btn"
              :disabled="isSubmitting || remarkText.trim().length === 0"
            >
              {{ isSubmitting ? "Sending..." : "Send" }}
            </button>
          </div>
        </div>
      </div>

      <!-- Success Modal -->
      <div v-if="showSuccessModal" class="modal">
        <div class="modal-content">
          <h3>Success!</h3>
          <p>
            The submission status has been updated and the researcher has been
            notified.
          </p>
          <div class="modal-buttons-center">
            <button @click="goToDashboard" class="modal-btn confirm-btn">
              Go back to dashboard
            </button>
          </div>
        </div>
      </div>

      <div v-if="submissionError" class="modal">
        <div class="modal-content">
          <h3 class="h3">An error occurred.</h3>
          <p>
            There was a problem saving researcher's information. Please try
            again.
          </p>
          <button @click="submissionError = false" class="btn btn-primary">
            Close
          </button>
        </div>
      </div>
    </div>
    <!-- <a
      style="color: #eb4648; cursor: pointer; margin-left: 24px"
      @click="exportToPdf"
    >
      Export to .pdf here
    </a> -->
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

.edit-btn {
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
  width: 188px;
  background-color: #eb4648;
  color: white;
  padding: 8px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
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
.answer-block ul,
.previous-answer-block,
.previous-answer-block ul {
  font-size: 16px;
  color: #555;
  margin-left: 16px;
  white-space: pre-wrap; /* <-- ADD THIS LINE */
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
/* Other styles remain the same */
.aa {
  font-size: 20px;
  font-weight: 400;
}
.btn-container {
  padding: 16px;
}
/* Add these styles to researcher's <style scoped> block */

.summary-item {
  display: flex; /* Aligns bullet and text */
  gap: 8px;
  padding-bottom: 1rem;
  line-height: 1.6;
}

.summary-bullet {
  font-weight: bold;
  color: #eb4648;
}

/* Class for dynamic text like the disease name */
.dynamic-text {
  color: #555;
  font-style: italic;
  font-weight: 500;
}

/* Class for the entire decision sentence */
.decision-sentence {
  color: #555;
  display: block; /* Puts it on its own line */
  margin-top: 4px;
}

/* Class for the route name itself */
/* .route-name {
  color: #d84315;
  font-weight: bold;
} */

/* Class for positive decision words */
.decision-words-positive {
  color: #28a745; /* Green */
  font-weight: bold;
}

/* Class for negative decision words */
.decision-words-negative {
  color: #d84315; /* Red */
  font-weight: bold;
}
/* Styles for the dynamic summary paragraphs */
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

/* Dynamic text like the disease name */
.dynamic-text {
  color: #555;
  font-style: italic;
  font-weight: 500;
}

/* The entire decision sentence */
.decision-sentence {
  color: #555; /* Gray color */
  display: block;
  margin-top: 4px;
}

/* The route name itself */
.route-name {
  color: #d84315; /* Red */
  font-weight: bold;
}

/* The decision words (e.g., "not to pursue", "justifies choosing") */
.decision-words {
  color: #d84315; /* Red */
  font-weight: bold;
}
</style>

<style>
/* These are now global styles that can affect v-html content */

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

/* Dynamic text like the disease name */
.dynamic-text {
  color: #555;
  font-style: italic;
  font-weight: 500;
}

/* The entire decision sentence will be gray */
.decision-sentence {
  color: #555;
  display: block;
  margin-top: 4px;
}

/* The route name itself will be red */
.route-name {
  color: #d84315;
  font-weight: bold;
}

/* The decision words will be red */
.decision-words {
  color: #d84315;
  font-weight: bold;
}
.preamble-inline {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  background-color: #fbe9e7; /* Light pink/red background */
  color: #5d4037; /* Darker text for readability */
  border: 1px solid #ffab91; /* Reddish border */
  border-radius: 8px;
  padding: 16px;
  margin: 0 8px 1.5rem 8px;
}

.preamble-icon {
  /* margin-top: 2px; */
  flex-shrink: 0;
  color: #d84315; /* Red icon color */
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
  /* font-weight: 600; */
  color: #333;
  font-size: 18px;
}

.info-answer {
  font-size: 16px;
  color: #555;
  margin-top: 4px;
  padding-left: 8px;
  white-space: pre-wrap; /* This is important: it preserves line breaks */
  word-wrap: break-word;
}

.section .row {
  margin-left: 20px;
}

/*
  This targets the container for the "Explore the precision intervention"
  answers to ensure they are also indented consistently.
*/
.answer-block {
  margin-left: 20px;
}

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
.dashboard-btn {
  height: 100%;
  width: 188px;
  background-color: #eb4648;
  color: #ffffff;
  padding: 8px;
  border: 1px solid #eb4648;
  border-radius: 4px;
  cursor: pointer;
  margin-left: 8px;
  margin-right: 16px;
}

/* ADD THESE STYLES TO YOUR <style> OR <style scoped> BLOCK */

.action-btn {
  height: 100%;
  width: 188px;
  color: white;
  padding: 8px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-left: 8px;
  margin-right: 16px;
  transition: background-color 0.2s;
}

.approve-btn {
  background-color: #22c55e;
} /* Green */
.approve-btn:hover {
  background-color: #16a34a;
}

.revise-btn {
  background-color: #fbbf24;
} /* Yellow */
.revise-btn:hover {
  background-color: #f59e0b;
}

.reject-btn {
  background-color: #ef4444;
} /* Red */
.reject-btn:hover {
  background-color: #dc2626;
}

/* Modal Styles */
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
  z-index: 1000;
}

.modal-content {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  text-align: center;
  width: 100%;
  max-width: 1000px;
}

.modal-content h3 {
  font-size: 1.5rem;
  margin-bottom: 1rem;
}

.modal-content p {
  margin-bottom: 1.5rem;
}

.remark-textarea {
  width: 100%;
  min-height: 120px;
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 1rem;
  resize: vertical;
}

.modal-buttons {
  display: flex;
  justify-content: flex-end; /* Align buttons to the right */
  gap: 1rem; /* Add space between the buttons */
  margin-top: 1.5rem;
}

.modal-buttons-center {
  display: flex;
  justify-content: center;
  margin-top: 1.5rem;
}

.modal-btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 500;
}

.cancel-btn {
  background-color: #e5e7eb;
  color: #374151;
}

.confirm-btn {
  background-color: #eb4648;
  color: white;
}
.confirm-btn:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.main-btn-container {
  display: flex;
  align-items: center;
  gap: 0.1rem; /* Adjust the space between buttons */
  padding: 16px; /* Your existing btn-container padding */
}

.approve-btn {
  /* This is the key part. It pushes this button and everything after it to the right. */
  margin-left: auto;
}

/* ADD THIS STYLE */
.status-display-box {
  margin-left: auto; /* Keeps the box pushed to the right */
  padding: 0.5rem 1rem;
  border-radius: 6px;
  color: #4b5563;
  font-weight: 500;
  font-style: italic;

  /* --- ADD THESE LINES --- */
  display: flex;
  align-items: center; /* Vertically centers the text */
  justify-content: flex-end; /* Horizontally aligns the text to the end */
}

.previous-answer-block {
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px dashed #e0e0e0;
}

.previous-answer-text {
  font-size: 15px;
  color: #757575; /* Grey text */
  font-style: italic;
}

/* ADD THIS CSS */
.previous-files-list {
  font-style: italic;
  color: #757575; /* Grey text */
}

.previous-files-list a {
  color: #8a8a8a; /* A slightly dimmer link color for old files */
}

.q207-part {
  margin-bottom: 0.75rem; /* Adds space between the two parts of the answer */
}
.q207-part:last-child {
  margin-bottom: 0;
}
.mechanism-list {
  margin-top: 0.25rem;
  padding-left: 20px; /* Indents the bulleted list */
  list-style-type: disc;
}

.answer-block.changed-answer {
  background-color: #fffdf5; /* Light yellow background */
  border: 1px solid #fde68a; /* Slightly darker yellow border */
  border-radius: 8px;
  padding: 1rem;
  margin-left: 0; /* Override the default margin-left for a full-width highlight */
}
</style>
