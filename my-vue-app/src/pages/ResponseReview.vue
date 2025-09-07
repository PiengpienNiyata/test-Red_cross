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

  if (JSON.stringify(currentAnswer) !== JSON.stringify(prevAnswer)) {
    return prevAnswer;
  }

  return null;
};
const isLatestVersion = computed(() => {
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

    finalParts.push(
      `<span style="color: red">Pathogenesis Mechanisms</span> ${mechanismParts.join(
        ", "
      )}`
    );
  }

  return finalParts.join("<br>");
};

const interventionAspectDetails = computed(() => {
  const answer102 = answers.value[102];
  if (typeof answer102 !== "object" || !answer102.selectedOption) {
    return null;
  }
  const selectedOption = answer102.selectedOption;
  if (selectedOption.startsWith("Yes")) {
    return routeDefinitions["Intervention_Yes"];
  } else if (selectedOption.startsWith("No")) {
    return routeDefinitions["Intervention_No"];
  } else if (selectedOption.startsWith("Uncertain")) {
    return routeDefinitions["Intervention_Uncertain"];
  }
  return null;
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

const formatCheckboxAnswer = (question: Question2, answer: any): string => {
  if (!answer || !Array.isArray(answer.main)) return "";

  const formattedParts = answer.main.map((mainOpt: string) => {
    if (mainOpt.includes("___")) {
      const parts = mainOpt.split("___");
      let constructed = parts[0].split("||")[0];

      const optionIndex = question.options?.findIndex(
        (opt) => parseOption(opt).label === mainOpt
      );

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
    return files as FileItem[];
  }
  if (files instanceof FileList) {
    return Array.from(files) as FileItem[];
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

    const optionIndex = question.options?.findIndex(
      (opt) => parseOption(opt).label === finalString
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
  return finalString.split("||")[0];
};

// const summaryStep2 = computed(() => {
//   const answer201 = answers.value[201];
//   const answer202 = answers.value[202];

//   const q201 = getQuestionById2(201);
//   const q202 = getQuestionById2(202);

//   if (!answer201 || !answer202 || !q201 || !q202) {
//     return null;
//   }

//   let stagingTypingDesc = "";
//   if (typeof answer201 === "string") {
//     if (answer201.startsWith("Yes, both staging and typing")) {
//       const ref = answer201.split("ref : ")[1] || "not specified";
//       stagingTypingDesc = `that there is both staging and typing (ref: <span class="dynamic-text">${ref}</span>)`;
//     } else if (answer201 === "Yes, staging only.") {
//       const answer201_5 = answers.value[201.5] || "details not provided";
//       stagingTypingDesc = `that there is staging only, specifically: "<em>${answer201_5}</em>"`;
//     } else if (answer201.startsWith("Yes, typing only.")) {
//       const typing = answer201.split(": ")[1]?.slice(0, -1) || "not specified";
//       stagingTypingDesc = `that there is typing only, defined as: "<em>${typing}</em>"`;
//     } else if (answer201 === "No") {
//       stagingTypingDesc = "that there are no staging or typing classifications";
//     } else if (answer201 === "Uncertain") {
//       stagingTypingDesc =
//         "that it is uncertain if staging or typing classifications exist";
//     }
//   }

//   let criteriaDesc = "";
//   if (typeof answer202 === "string") {
//     if (answer202.startsWith("Yes")) {
//       const criteriaText =
//         answer202.split(": ")[1]?.slice(0, -1) || "not provided";
//       criteriaDesc = `you have defined criteria ("<em>${criteriaText}</em>")`;
//     } else {
//       criteriaDesc = "you do not have defined diagnostic criteria";
//     }
//   }

//   return `From researcher's response to question - "<em>${q202.question}</em>", where ${criteriaDesc}, these are compared with the disease's classifications from question - "<em>${q201.question}</em>" (in which you indicated ${stagingTypingDesc}). Based on this comparison, the originating cell type is identified as <span class="dynamic-text">N/A</span>.`;
// });

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

//   return `From researcher's response to question - "<em>${q101.question}</em>", the mechanism of ${diseaseName} is deduced as ${mechanismText}.`;
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
//     body = `Given researcher's response to question - ("<em>${q103.question}</em>") was "<em>${answer103}</em>", the research question is focused on confirming that eliminating or controlling known factors can induce true remission in ${diseaseName}.`;
//   } else {
//     title = "Exploratory Pre-Remission Research Question";
//     body = `Based on researcher's response to question - ("<em>${q103.question}</em>") where you indicated the efficiency is "<em>${answer103}</em>", the focus shifts to an exploratory question: To formulate a research question that identifies unknown factors which must be addressed before confirming remission-inducing therapies or control strategies.`;
//   }

//   return `<strong>${title}:</strong> ${body}`;
// });

const summaryParagraphs = computed(() => {
  const paragraphs: { text: string }[] = [];

  if (!store.suggestedRoutes || store.suggestedRoutes.length === 0) {
    paragraphs.push({
      text: `<span class="dynamic-text">(No route could be determined from the provided answers. The submission may be incomplete or contain logical inconsistencies.)</span>`,
    });
    return paragraphs;
  }

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
      justificationText = `The provided answers indicate that ${diseaseName} is defined by a limited number of diagnostic criteria (Question B-2 or B-4) and does not meet the high-remission evidence required for Route A. This suggests a pathogenesis likely driven by a single cell type. ${buildDecisionSentence(
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
      let intro = `The responses indicate a complex pathogenesis, as supported by a high number of diagnostic criteria (Question B-2 and B-4), a lack of contradictions (Question B-3), and the absence of a known high-remission therapy (Question A-2/A-3). The specific path forward is determined by the disease's classification: `;
      let specificReason = "";
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
    // 1. Get the authentication token from the store
    const token = store.authToken;
    if (!token) {
      alert("Authentication error. Please log in again.");
      router.push("/login");
      isSubmitting.value = false;
      return;
    }

    // 2. Make the API call with the Authorization header
    const response = await fetch(`${VITE_API_BASE_URL}/api/response/status`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`, // <-- This is the crucial part
      },
      body: JSON.stringify({
        token: store.currentToken,
        status: status,
        remark: remark,
      }),
    });

    if (!response.ok) {
      // If the token is invalid/expired, redirect to login
      if (response.status === 401) {
        store.clearAuthToken();
        router.push("/login");
      }
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
  remarkText.value = "";
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

const getCleanOptionLabel = (option: string) => option.split("||")[0];

const formatSubAnswer = (
  question: Question2,
  mainAnswer: any,
  mainOptionKey: string
): string => {
  const subSelection = mainAnswer.subs?.[mainOptionKey];

  // If there is no sub-selection, or it's not a string, return nothing.
  if (!subSelection || typeof subSelection !== "string") {
    return "";
  }

  // If the sub-option has an inline input, we need to build the final string.
  if (subSelection.includes("___")) {
    // Find the indexes needed to build the unique key for the inline text
    const mainOption = question.options?.find(
      (opt) => getCleanOptionLabel(opt) === mainOptionKey
    );
    if (!mainOption) return `(${getCleanOptionLabel(subSelection)})`;

    const mainOptionIndex = question.options?.indexOf(mainOption);
    const subOptions = question.subOptions?.[mainOptionKey];
    const subIndex = subOptions?.indexOf(subSelection);

    if (
      mainOptionIndex === undefined ||
      subIndex === undefined ||
      mainOptionIndex === -1 ||
      subIndex === -1
    ) {
      return `(${getCleanOptionLabel(subSelection)})`;
    }

    const key = `${question.id}-${mainOptionIndex}-sub-${subIndex}-0`;
    const inlineValue = mainAnswer.inlineText?.[key] || "";

    const constructedString = getCleanOptionLabel(subSelection).replace(
      "___",
      inlineValue
    );

    return `(${constructedString})`;
  }
  return `(${getCleanOptionLabel(subSelection)})`;
};

interface FormattedCritAnswer {
  label: string;
  count: number;
  criteria: string[];
}

const formatCritAnswer = (question: Question2): FormattedCritAnswer | null => {
  const answer = question.answer as any;

  if (
    !answer ||
    typeof answer !== "object" ||
    !answer.selectedOption ||
    !answer.inlineText ||
    !question.options
  ) {
    return null;
  }

  const optionIndex = question.options.findIndex(
    (opt) => opt === answer.selectedOption
  );
  if (optionIndex === -1) return null;

  const count = Number(
    answer.inlineText[`${question.id}-${optionIndex}-select`] || 0
  );

  const criteria: string[] = [];
  for (let i = 1; i <= count; i++) {
    const criterionText =
      answer.inlineText[`${question.id}-${optionIndex}-list-${i}`] || "...";
    criteria.push(criterionText);
  }

  const label = `${
    answer.selectedOption.split("||")[0]
  } (Number of criteria: ${count})`;

  return { label, count, criteria };
};

const countTotalFiles = (answer: any): number => {
  if (!answer || typeof answer !== "object") {
    return 0;
  }

  let count = 0;

  if (answer.fileData) {
    Object.values(answer.fileData).forEach((fileInfo: any) => {
      if (fileInfo && Array.isArray(fileInfo.files)) {
        count += fileInfo.files.length;
      }
    });
  }

  if (Array.isArray(answer.files)) {
    count += answer.files.length;
  }

  return count;
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
      </div>

      <div class="questionnaire page-break-before">
        <h3 class="aa">Explore the precision intervention</h3>

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
<div v-if="q.id === 207 && q.answer && typeof q.answer === 'object'" class="answer-text">
  <div v-for="(levelData, levelName) in q.answer as { [key: string]: { inlineText?: string, mechanisms?: string[], subs?: { [key: string]: string }, inlineTextOther?: string } }" :key="levelName" class="q207-summary-level">
    <p>
        <span class="answer-prefix" style="color: red;">Level of Development - </span><strong> {{ String(levelName).split('___')[0] }}</strong>
        <span v-if="levelData.inlineText"> {{ levelData.inlineText }}</span>
    </p>
    
    <div v-if="levelData.mechanisms && levelData.mechanisms.length > 0" class="q207-part">
        <strong>Pathogenesis Mechanisms:</strong>
        <ul class="mechanism-list">
            <li v-for="mechanism in levelData.mechanisms" :key="mechanism">
                {{ getCleanOptionLabel(mechanism) }}
                <template v-if="mechanism.startsWith('Inflammation') && levelData.subs?.['Inflammation']">
                    ({{ levelData.subs['Inflammation'] }})
                </template>
                 <template v-if="mechanism.includes('___') && levelData.inlineTextOther">
                   : {{ levelData.inlineTextOther }}
                </template>
            </li>
        </ul>
    </div>
  </div>
</div>
            <div
              v-else-if="
                q.options?.some((opt) => opt.includes('||crit')) &&
                typeof q.answer === 'object' &&
                q.answer !== null
              "
            >
              <template v-if="(q.answer as any).inlineText">
                <p class="answer-text">
                  <span style="color: red">Answer : </span>
                  {{ formatCritAnswer(q)?.label }}
                </p>
                <ol class="criteria-list">
                  <li
                    v-for="(criterion, index) in formatCritAnswer(q)?.criteria"
                    :key="index"
                  >
                    {{ criterion }}
                  </li>
                </ol>
              </template>

              <p v-else class="answer-text">
                <span style="color: red">Answer : </span>
                {{ (q.answer as any).selectedOption.split("||")[0] }}
              </p>
            </div>

            <div
              v-else-if="
                'selectedOption' in q.answer &&
                !q.options?.some((opt) => opt.includes('||crit'))
              "
            >
              <p class="answer-text">
                <span style="color: red">Answer : </span>
                {{ getConstructedAnswer(q, q.answer) }}
                <span
                  v-for="(subAnswer, key) in (q.answer as any).subs"
                  :key="key"
                >
                  {{ formatSubAnswer(q, q.answer, String(key)) }}
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

              <template v-if="countTotalFiles(q.answer) > 0">
                <ul>
                  <template
                    v-for="(fileInfo, key) in (q.answer as any).fileData"
                    :key="key"
                  >
                    <li
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
                    </li>
                  </template>

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
              </template>

              <p v-else class="no-files-text">No files were attached.</p>
            </div>
          </div>

          <div
            v-if="(q.answer as any).fileData || (q.answer as any).files"
            class="sub-answer-block"
          ></div>

          <div v-if="getAnswerDifference(q.id)" class="previous-answer-block">
            <div class="previous-answer-heading">
              Previous Answer (version {{ currentVersion - 1 }})
            </div>

<div v-if="q.id === 207" class="previous-answer-text">
  <div v-for="(levelData, levelName) in getAnswerDifference(q.id) as { [key: string]: { inlineText?: string, mechanisms?: string[], subs?: { [key: string]: string }, inlineTextOther?: string } }" :key="levelName" class="q207-summary-level">
    <p>
        <strong>Level of Development - {{ String(levelName).split('___')[0] }}</strong>
        <span v-if="levelData.inlineText"> {{ levelData.inlineText }}</span>
    </p>
    
    <div v-if="levelData.mechanisms && levelData.mechanisms.length > 0" class="q207-part">
        <strong>Pathogenesis Mechanisms:</strong>
        <ul class="mechanism-list">
            <li v-for="mechanism in levelData.mechanisms" :key="mechanism">
                {{ getCleanOptionLabel(mechanism) }}
                <template v-if="mechanism.startsWith('Inflammation') && levelData.subs?.['Inflammation']">
                    ({{ levelData.subs['Inflammation'] }})
                </template>
                 <template v-if="mechanism.includes('___') && levelData.inlineTextOther">
                   : {{ levelData.inlineTextOther }}
                </template>
            </li>
        </ul>
    </div>
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
              <template v-if="countTotalFiles(getAnswerDifference(q.id)) > 0">
                <ul class="previous-files-list">
                  <template
                    v-for="(fileInfo, key) in (getAnswerDifference(q.id) as any).fileData"
                    :key="key"
                  >
                    <li
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
                    </li>
                  </template>

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
              </template>

              <p v-else class="no-files-text">none</p>
            </div>

            <div
              v-if="
                q.id === 201 &&
                typeof previousAnswers[201] === 'string' &&
                previousAnswers[201].startsWith('Yes, staging only.') &&
                previousAnswers[201.5]
              "
              class="orphaned-previous-answer"
            >
              <label
                class="question-label"
                style="font-style: italic; color: #757575"
              >
                {{ getQuestionById2(201.5)?.question }}
              </label>
              <p class="previous-answer-text" style="margin-left: 16px">
                {{
                  getConstructedAnswer(
                    getQuestionById2(201.5)!,
                    previousAnswers[201.5]
                  )
                }}
              </p>

              <div
                v-if="(previousAnswers[201.5] as any).fileData || (previousAnswers[201.5] as any).files"
                class="sub-answer-block"
              >
                <strong style="color: #757575">Previous Files:</strong>
                <ul class="previous-files-list">
                  <template
                    v-for="(fileInfo, key) in (previousAnswers[201.5] as any).fileData"
                    :key="key"
                  >
                    <li
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
                    </li>
                  </template>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div
          v-if="suggestedRoutes.length > 0"
          class="route-suggestion-container"
          style="margin-left: 10px"
        >
          <h3
            class="route-suggestion-header page-break-before"
            style="margin-bottom: 20px"
          >
            Route of Suggestion
          </h3>

          <div
            v-for="route in suggestedRouteDetails"
            :key="route.route"
            class="route-item"
            style="margin-left: 16px; margin-bottom: 20px"
          >
            <h4 class="route-title">
              <span class="final-route-text">{{ route.route }}</span>
              <span
                style="
                  font-weight: 200;
                  font-style: italic;
                  font-size: 1.1rem;
                  color: #333;
                  margin-left: 10px;
                "
              >
                : {{ route.title }}
              </span>
            </h4>

            <div
              v-if="interventionAspectDetails?.interventionAspect"
              class="aspect-section"
            >
              <h5 class="aspect-title">Intervention Aspect</h5>
              <ul class="route-description">
                <li
                  v-for="(
                    aspect, i
                  ) in interventionAspectDetails.interventionAspect"
                  :key="i"
                >
                  {{ aspect }}
                </li>
              </ul>
            </div>

            <div
              v-if="route.diseaseAspect && route.diseaseAspect.length > 0"
              class="aspect-section"
            >
              <h5 class="aspect-title">Disease Aspect</h5>
              <ul class="route-description">
                <li v-for="(aspect, i) in route.diseaseAspect" :key="i">
                  {{ aspect }}
                </li>
              </ul>
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
            <button @click="startNewSurvey" class="btn btn-primary">
              Submit another response.
            </button>
          </div>
        </div>
      </div>

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
  white-space: pre-wrap;
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
}
.approve-btn:hover {
  background-color: #16a34a;
}

.revise-btn {
  background-color: #fbbf24;
}
.revise-btn:hover {
  background-color: #f59e0b;
}

.reject-btn {
  background-color: #ef4444;
}
.reject-btn:hover {
  background-color: #dc2626;
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
  justify-content: flex-end;
  gap: 1rem;
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
  gap: 0.1rem;
  padding: 16px;
}

.approve-btn {
  margin-left: auto;
}

.status-display-box {
  margin-left: auto;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  color: #4b5563;
  font-weight: 500;
  font-style: italic;

  display: flex;
  align-items: center;
  justify-content: flex-end;
}

.previous-answer-block {
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px dashed #e0e0e0;
}

.previous-answer-text {
  font-size: 15px;
  color: #757575;
  font-style: italic;
}

.previous-files-list {
  font-style: italic;
  color: #757575;
}

.previous-files-list a {
  color: #8a8a8a;
}

.q207-part {
  margin-bottom: 0.75rem;
}
.q207-part:last-child {
  margin-bottom: 0;
}
.mechanism-list {
  margin-top: 0.25rem;
  padding-left: 20px;
  list-style-type: disc;
}

.answer-block.changed-answer {
  background-color: #fffdf5;
  border: 1px solid #fde68a;
  border-radius: 8px;
  padding: 1rem;
  margin-left: 0;
}

.orphaned-previous-answer {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px dotted #e0e0e0;
}

.criteria-list li,
.answer-text,
.previous-answer-text,
.info-answer {
  white-space: pre-wrap;
  word-wrap: break-word;
}

.no-files-text {
  margin-left: 16px;
  font-style: italic;
  color: #555;
}

/* Add these for the Q207 summary */
.q207-summary-level {
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px dotted #e0e0e0;
}
.q207-summary-level:last-child {
  border-bottom: none;
  padding-bottom: 0;
  margin-bottom: 0;
}
</style>
