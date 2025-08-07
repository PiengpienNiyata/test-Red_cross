<script setup lang="ts">
import { computed, ref } from "vue";
import { useQuestionnaireStore } from "@/stores/useQuestionnaireStore";
import { useRouter } from "vue-router";
import { questionnaireData as questionnaireData1 } from "@/stores/questionnaires1";
import { questionnaireData as questionnaireData2 } from "@/stores/questionnaires2";
import type { Question2 } from "@/stores/questionnaires2";
import { VITE_API_BASE_URL } from "@/stores/config";
import { storeToRefs } from "pinia";
import { formatPhoneNumber } from "@/utils/formatters";

const store = useQuestionnaireStore();
const router = useRouter();
const showCancelModal = ref(false);
const projectNameVerification = ref("");
const isCancelling = ref(false);
// Add these new state variables for your modals
const showCancelSuccessModal = ref(false);
const showCancelErrorModal = ref(false);

const {
  answers,
  suggestedRoutes,
  currentRemark,
  showReviewerFeedback,
  currentStatus,
} = storeToRefs(store);
console.log("Current Status:", currentStatus.value);
type FileItem = File | { id: number; name: string; rehydrated: true };

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
const canCancelProject = computed(() => {
  return (
    (store.currentStatus === 0 || store.currentStatus === 1) &&
    store.currentToken
  );
});
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

const normalizeFiles = (files: any): FileItem[] => {
  // If it's already a valid array, just return it.
  if (Array.isArray(files)) {
    return files;
  }
  // If it's a FileList from a live upload, convert it to an array.
  if (files instanceof FileList) {
    return Array.from(files);
  }
  return [];
};

// const finalDisplayRoute = computed(() => {
//   if (suggestedRoutes.value.includes("Route C")) {
//     return "Route C";
//   }
//   return suggestedRoutes.value.join(", ");
// });

const parseOption = (option: string) => {
  if (option.includes("|/|")) {
    const parts = option.split("|/|");
    return { type: "radio", group: parts[0], label: parts[1] };
  }
  return { type: "checkbox", group: null, label: option };
};

const formatQ207Answer = (question: Question2, answer: any): string => {
  if (typeof answer !== "object" || answer === null) return "";

  const parts: string[] = [];

  // 1. Handle the radio selection part
  if (answer.radioSelection) {
    let radioText = answer.radioSelection;
    if (radioText.includes("___")) {
      const optionIndex = question.options?.findIndex(
        (opt) => parseOption(opt).label === radioText
      );
      if (optionIndex !== undefined && optionIndex > -1) {
        const key = `${question.id}-${optionIndex}-0`;
        // Use a placeholder if inline text is empty but the option is selected
        const inlineValue = answer.inlineText?.[key]?.trim() || "...";
        radioText = radioText.replace("___", inlineValue);
      }
    }
    parts.push(radioText.split("||")[0]);
  }

  // 2. Handle the checkbox selections part
  if (answer.checkboxes && answer.checkboxes.length > 0) {
    answer.checkboxes.forEach((checkboxOpt: string) => {
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
        checkboxText = `${checkboxText.split("||")[0]} (${
          answer.subs["Inflammation"]
        })`;
      } else {
        checkboxText = checkboxText.split("||")[0];
      }

      parts.push(checkboxText);
    });
  }

  return parts.join(", ");
};

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

const suggestedRouteDetails = computed(() => {
  if (suggestedRoutes.value.includes("Route C")) {
    return [routeDefinitions["Route C"]];
  }
  return suggestedRoutes.value
    .map((route) => routeDefinitions[route])
    .filter(Boolean);
});

const editAnswers = () => {
  store.hideReviewerFeedback();
  // store.resetServey();
  router.push("/questionnairesResearcher");
};

const formatCheckboxAnswer = (question: Question2, answer: any): string => {
  if (!answer || !Array.isArray(answer.main)) return "";

  const formattedParts = answer.main.map((mainOpt: string) => {
    // --- THIS IS THE NEW LOGIC FOR INLINE TEXT ---
    if (mainOpt.includes("___")) {
      const parts = mainOpt.split("___");
      // Get the clean label part (e.g., "Other : ")
      let constructed = parts[0].split("||")[0];

      const optionIndex = question.options?.findIndex((opt) => opt === mainOpt);
      if (optionIndex !== undefined && optionIndex > -1 && answer.inlineText) {
        for (let i = 0; i < parts.length - 1; i++) {
          const key = `${question.id}-${optionIndex}-${i}`;
          const inlineValue = answer.inlineText[key] || "";
          constructed += inlineValue + parts[i + 1].split("||")[0];
        }
        return constructed;
      }
      return constructed; // Return the base string if inline text is not found
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

const goToSummary = () => {
  store.setAnswers(answers.value);

  router.push("/summary");
};

const isSubmissionLocked = computed(() => {
  const status = store.currentStatus;
  // Locked if status is Approved (2), Rejected (-2), or Canceled (-1)
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
// --- ADD: Function to open the cancel modal ---
const openCancelModal = () => {
  projectNameVerification.value = ""; // Reset verification text
  showCancelModal.value = true;
};

// --- ADD: Function to handle the final cancellation ---
const handleCancelProject = async () => {
  // Double-check verification
  if (projectNameVerification.value !== store.answers[1002]) {
    alert("Project name does not match.");
    return;
  }

  isCancelling.value = true;
  try {
    const response = await fetch(`${VITE_API_BASE_URL}/api/response/status`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        token: store.currentToken,
        status: -1, // -1 for Canceled
        remark: "Canceled by researcher.",
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to cancel project");
    }

    // Update the local store to reflect the change immediately
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

// --- ADD THIS HELPER FUNCTION ---

const getConstructedAnswer = (question: Question2, answer: any): string => {
  // Return early if it's not the right kind of object
  if (typeof answer !== "object" || !answer.selectedOption) {
    if (typeof answer === "string") return answer.split("||")[0];
    return answer;
  }

  let finalString = answer.selectedOption;

  if (finalString.includes("___")) {
    const parts = finalString.split("___");
    let constructed = parts[0];

    // Find the original option index to build the key for inlineText
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
  return finalString.split("||")[0];
};
</script>

<template>
  <div class="final-review">
    <div class="questionnaire">
      <div
        v-for="section in questionnaireData1[0].sections"
        :key="section.name"
        class="section"
      >
        <h4 v-if="section.name !== 'null'" class="section-title">
          {{ section.name }}
        </h4>
        <div class="row">
          <div
            v-for="q in firstFormAnswers.filter(
              (fq) =>
                (section as any).questions?.some((sq: any) => sq.id === fq.id)
            )"
            :key="q.id"
            :class="{
              'col-md-6': [1001, 1002, 1004, 1005].includes(q.id),
              'col-md-12': q.id === 1003,
            }"
          >
            <label class="question-label">{{ q.question }}</label>
            <input
              v-if="q.type === 'text' && q.id !== 1004"
              :value="q.answer"
              type="text"
              class="input-text"
              disabled
            />
            <input
              v-if="q.type === 'text' && q.id === 1004"
              :value="
                typeof q.answer === 'string'
                  ? formatPhoneNumber(q.answer)
                  : q.answer
              "
              type="text"
              class="input-text"
              disabled
            />
            <textarea
              v-if="q.type === 'textarea'"
              :value="q.answer"
              class="input-text"
              disabled
              rows="3"
              style="field-sizing: content"
            ></textarea>
          </div>
        </div>
      </div>
    </div>

    <div class="questionnaire">
      <h3 class="aa">Explore the precision intervention</h3>
      <div v-for="q in secondFormAnswers" :key="q.id" class="answer-block">
        <label class="question-label">{{ q.question }}</label>

        <p v-if="typeof q.answer === 'string'" class="answer-text">
          <span style="color: red">Your answer : </span
          >{{ q.answer.split("||")[0] }}
        </p>
        <p v-else-if="Array.isArray(q.answer)" class="answer-text">
          <span style="color: red">Your answer : </span
          >{{ q.answer.join(", ") }}
        </p>
        <div v-if="q.id === 207">
          <p class="answer-text">
            <span style="color: red">Your answer : </span>
            {{ formatQ207Answer(q, q.answer) }}
          </p>
        </div>
        <div v-else-if="q.answer && typeof q.answer === 'object' && !Array.isArray(q.answer) && 'selectedOption' in q.answer">
          <p class="answer-text">
            <span style="color: red">Your answer : </span>
            {{ getConstructedAnswer(q, q.answer) }}
            <span v-for="(subAnswer, key) in (q.answer as any).subs" :key="key">
              ({{
                Array.isArray(subAnswer) ? subAnswer.join(", ") : subAnswer
              }})
            </span>
          </p>
        </div>
        <div v-else-if="q.answer && typeof q.answer === 'object' && !Array.isArray(q.answer) && 'main' in q.answer">
          <p class="answer-text">
            <span style="color: red">Your answer : </span>
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

      <!-- <h3
        v-if="suggestedRoutes.length > 0"
        style="margin-left: 8px; padding-top: 16px"
      >
        Road Map Suggestion:
        <span class="final-route-text">{{ finalDisplayRoute }}</span>
      </h3> -->
      <!-- <div
        v-if="suggestedRoutes.length > 0"
        class="route-suggestion-container"
        style="margin-left: 10px;"
      >
        <h3 class="route-suggestion-header" style=" margin-bottom: 20px;">Road Map Suggestion</h3>
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
          <li class="route-description" style="margin-left: 16px; color: grey">
            {{ route.description }}
          </li>
        </div>
      </div> -->

      <div class="btn-container">
        <div
          v-if="currentRemark && showReviewerFeedback"
          class="feedback-panel"
        >
          <h4 class="feedback-title">Reviewer's Feedback</h4>
          <p class="feedback-text">{{ currentRemark }}</p>
        </div>
        <div
          v-if="
            suggestedRoutes.includes('Route C') && !hasNonsenseContradiction
          "
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
                Your responses have identified a significant contradiction
                within the diagnostic criteria or natural history of the
                disease. This is a critical finding, as it challenges the
                assumption that the condition is a single, uniform entity.
              </p>
              <p>
                This suggests that what is currently defined as one disease may,
                in fact, represent a heterogeneous syndrome—a collection of
                distinct pathological processes that converge on similar
                clinical signs. Proceeding with the current data is inadvisable,
                as it could lead to confounding results and a failure to
                identify the true originating cell type(s).
              </p>
              <strong>Recommended Action:</strong>
              <ul>
                <li>
                  <strong>Further Research:</strong> Conduct additional
                  preclinical or clinical research to gather data that clarifies
                  the diagnostic criteria and resolves the observed
                  contradiction.
                </li>
                <li>
                  <strong>Re-evaluate Inputs:</strong> Carefully review the
                  answers provided in this questionnaire to ensure they are
                  based on a consistent and robust set of evidence.
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
                However, your selection for disease classification (Question
                201) does not align with this evidence. Please re-evaluate your
                inputs to ensure consistency.
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
              <strong
                >Logical Inconsistency Detected: Diagnostic Criteria</strong
              >
              <p>
                Your responses are contradictory. You stated that there are no
                defined criteria for diagnosis (Question 202), but then
                identified a contradiction within those same criteria (Question
                203).
              </p>
              <p>
                This indicates a fundamental inconsistency in the provided data.
                Please re-evaluate your inputs or conduct further research to
                establish a clear and non-contradictory set of diagnostic
                criteria before proceeding.
              </p>
            </div>
          </div>
        </div>

        <div v-if="!isSubmissionLocked" class="action-bar">
          <div class="action-bar-group">
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
              @click="goToSummary"
            >
              Next
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
          <a
            v-if="canCancelProject"
            @click="openCancelModal"
            class="cancel-href"
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
                  isCancelling ||
                  projectNameVerification !== store.answers[1002]
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
            <p>
              There was a problem saving your information. Please try again.
            </p>
            <button @click="submissionError = false" class="btn btn-primary">
              Close
            </button>
          </div>
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
  font-weight: 500;
}
/* Other styles remain the same */
.aa {
  font-size: 20px;
  font-weight: 400;
}
.btn-container {
  padding-top: 16px;
}
/* Add these styles to your <style scoped> block */

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
/* ADD THESE STYLES */
.feedback-panel {
  border: 1px solid #fbbf24; /* Yellow border */
  background-color: #fffbeb; /* Light yellow background */
  border-radius: 8px;
  padding: 1rem;
  margin: 0 8px 1.5rem 8px;
}

.feedback-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #d97706; /* Darker yellow */
  margin-bottom: 0.5rem;
}

.feedback-text {
  font-size: 1rem;
  color: #374151;
  white-space: pre-wrap; /* This respects line breaks in the remark text */
}
.status-display-box {
  width: 100%;
  text-align: center;
  padding: 0.75rem 1rem;
  margin: 0 8px;
  /* background-color: #F3F4F6; */
  border-radius: 6px;
  color: #4b5563;
  font-weight: 500;
  font-style: italic;
}

.cancel-href {
  width: 100%;
  align-self: end;
  align-items: end;
  align-content: end;
  text-align: end;
  font-size: 20px;
  /* padding: 0.75rem 1rem; */
  /* margin: 0 8px; */
  /* background-color: #F3F4F6; */
  border-radius: 6px;
  color: #4b5563;
  font-weight: 500;
  font-style: italic;
  cursor: pointer;
  padding-right: 1%;
}

/* ADD THIS STYLE */
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
  justify-content: space-between; /* This pushes the two groups apart */
  align-items: center;
  width: 100%;
}

.action-bar-group {
  display: flex;
}
</style>
