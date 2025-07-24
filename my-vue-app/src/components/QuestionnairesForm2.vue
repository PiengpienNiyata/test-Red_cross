<script setup lang="ts">
import { defineProps, ref, computed, watch } from "vue";
import type { Questionnaire2, Question2 } from "@/stores/questionnaires2";
import { useQuestionnaireStore } from "@/stores/useQuestionnaireStore";
import { useRouter } from "vue-router";
import PreResult from "@/components/preResult.vue";
import FinalResult from "@/components/result.vue";
import GlossaryModal from "@/components/GlossaryModal.vue";

const props = defineProps<{ questionnaire: Questionnaire2 }>();
const store = useQuestionnaireStore();
const router = useRouter();

const answers = ref<Record<number, any>>({ ...store.answers });
const inlineInputAnswers = ref<Record<string, string>>({});
const questionHistory = ref<Question2[]>([]);
const currentQuestion = ref<Question2 | null>(
  props.questionnaire.sections[0].questions[0]
);
const isPreResult = ref(false);
const isFinalResult = ref(false);
const lastAnsweredQuestion = ref<Question2 | null>(null);
// const finalRoute = ref<string>("");
const suggestedRoutes = ref<string[]>([]);
const isGlossaryVisible = ref(false);

const showContradictionPreamble = ref(false);
const hasSeenContradictionPreamble = ref(false);
const pendingQuestion = ref<Question2 | null>(null);

const openGlossaryModal = () => {
  isGlossaryVisible.value = true;
};

const closeGlossaryModal = () => {
  isGlossaryVisible.value = false;
};

const contradictionText = {
  title: "Contradiction",
  body: `If different types or stages of a disease show contradictory responses (exhibit divergent responses) to the same treatment, or exhibit distinct molecular signatures, it raises the possibility that: What we call one disease might represent separate disease entities with converging symptoms, or the disease is heterogeneous, and our current classification (by name or type) may be oversimplified or incorrect.`,
  frameworkTitle:
    "In the RIRM framework, a contradiction between treatment response and expected shared pathway is a critical signal to:",
  actions: [
    "Re-examine treatment effects in each subtype to map precisely which molecular nodes are altered.",
    "Interrogate divergent triggers, cells of origin, and signalling cascades that might account for the split response.",
    "Entertain the “syndrome” hypothesis—i.e., that the disease label encompasses a family of related but separate conditions.",
  ],
  researchQuestionTitle: "Resulting research question",
  researchQuestionBody: `Can systematic mapping of molecular responses to the standard treatment across all clinical variants identify both the shared core pathway and the subtype-specific triggers that, once targeted, will convert each variant from active disease to durable remission? Answering this question will clarify whether a unified therapeutic strategy plus subtype-tailored add-ons can achieve true remission across the full spectrum of what is currently grouped under a single disease name.`,
};

const preambleData: Record<number, { term: string; definition: string }[]> = {
  104: [
    {
      term: "Molecular Types of the Disease",
      definition:
        "Distinct clusters of disease characteristics that share common molecular origins—driven by the same originating cell and signal—but are further influenced by additional distinct signals.",
    },
  ],
  201: [
    {
      term: "Molecular Stages of the Disease",
      definition:
        "The natural progression of a disease in which all stages are molecularly driven by the same originating cell and signal, differing only in intensity and duration.",
    },
  ],
  201.5: [
    {
      term: "Molecular Stages of the Disease",
      definition:
        "The natural progression of a disease in which all stages are molecularly driven by the same originating cell and signal, differing only in intensity and duration.",
    },
  ],
  204: [
    {
      term: "Remission",
      definition:
        "In a medical context, remission refers to a state in which the signs and symptoms of a disease have completely disappeared, either temporarily or permanently. True remission is defined as the occurrence of molecular normalization in the originating cells of a disease, combined with the complete disappearance of clinical signs and symptoms for a duration exceeding the onset timeframe of the designated disease. The unstable remission is defined as the status in which the occurrence of the true remission being happened while the source of causative signal persisted.",
    },
  ],
  206: [
    {
      term: "Molecular Clinico-pathological Cascade (Molecular Cascade)",
      definition:
        "A sequence of molecular signals initiated by a primary signal that drives the originating cell, leading to the development of clinical or pathological characteristics. This cascade may also trigger subsequent signals, aligning with diagnostic criteria based on clinical or histological features.",
    },
    {
      term: "Autocrine",
      definition:
        "A cell signaling mechanism where a cell secretes a molecule that binds to receptors on the same cell, leading to a response within that cell.",
    },
    {
      term: "Paracrine",
      definition:
        "A cell signaling mechanism where a cell signals to neighboring cells.",
    },
    {
      term: "Endocrine",
      definition:
        "A cell signaling mechanism where a cell signals to distant cells, such as through the bloodstream.",
    },
  ],
};

const currentPreamble = computed(() => {
  if (!currentQuestion.value) return null;
  return preambleData[currentQuestion.value.id] || null;
});

const handleCloseContradictionPreamble = () => {
  if (pendingQuestion.value) {
    hasSeenContradictionPreamble.value = true;
    showContradictionPreamble.value = false;

    questionHistory.value.push(currentQuestion.value!);
    currentQuestion.value = pendingQuestion.value;
    inlineInputAnswers.value = {};

    pendingQuestion.value = null;
  }
};

const getCleanOptionLabel = (option: string) => option.split("||")[0];
const hasSubOptions = (option: string) => option.includes("||sub");
const hasFileInput = (option: string) => option.includes("||files");
const parseOptionForInline = (option: string) => option.split("___");
const showPreResult = () => {
  isPreResult.value = true;
};
const showFinalResult = () => {
  isFinalResult.value = true;
};

const finalDisplayRoute = computed(() => {
  if (suggestedRoutes.value.includes("Route C")) {
    return "Route C";
  }
  return suggestedRoutes.value.join(", ");
});

const saveResponsesToStore = () => {
  store.setAnswers(answers.value);
};

const constructAnswerForInlineInputs = () => {
  if (!currentQuestion.value) return;

  const answerObject = answers.value[currentQuestion.value.id];
  if (!answerObject) return;

  let baseString: string;
  if (typeof answerObject === "object" && answerObject.selectedOption) {
    baseString = answerObject.selectedOption;
  } else if (typeof answerObject === "string") {
    baseString = answerObject;
  } else {
    return;
  }

  if (!baseString.includes("___")) return;

  const optionIndex = currentQuestion.value.options?.findIndex(
    (opt) => opt === baseString
  );
  if (optionIndex === undefined || optionIndex === -1) return;

  const parts = parseOptionForInline(baseString);
  let finalConstructedString = parts[0];
  for (let i = 0; i < parts.length - 1; i++) {
    const key = `${currentQuestion.value.id}-${optionIndex}-${i}`;
    const inlineValue = inlineInputAnswers.value[key] || "";
    finalConstructedString += inlineValue + parts[i + 1];
  }

  if (typeof answerObject === "object" && answerObject.selectedOption) {
    answerObject.selectedOption = finalConstructedString;
  } else {
    answers.value[currentQuestion.value.id] = finalConstructedString;
  }
};

const nextQuestion = () => {
  if (!currentQuestion.value) {
    console.error("LOG: No current question found.");
    return;
  }

  const qId = currentQuestion.value.id;

  constructAnswerForInlineInputs();

  const currentAnswer = answers.value[qId];

  if (
    currentAnswer === undefined ||
    currentAnswer === null ||
    currentAnswer === ""
  ) {
    console.warn("LOG: No answer provided, halting navigation.");
    return;
  }

  lastAnsweredQuestion.value = currentQuestion.value;
  updateSuggestedRoutes(qId);
  saveResponsesToStore();

  let nextId: number | string | undefined;
  const nextLogic = currentQuestion.value.next;

  if (nextLogic) {
    if ("all" in nextLogic) {
      nextId = nextLogic.all;
    } else {
      let key: string;
      if (
        typeof currentAnswer === "object" &&
        currentAnswer !== null &&
        currentAnswer.selectedOption
      ) {
        key = currentAnswer.selectedOption;
      } else {
        key = String(currentAnswer);
      }

      nextId = nextLogic[key];

      if (nextId === undefined && typeof key === "string") {
        for (const nextKey in nextLogic) {
          if (nextKey.includes("___")) {
            const prefix = nextKey.split("___")[0];
            if (key.startsWith(prefix)) {
              nextId = nextLogic[nextKey];
              break;
            }
          }
        }
      }
    }
  }

  if (nextId === "preResult") {
    showPreResult();
  } else if (nextId === "finalResult") {
    showFinalResult();
  } else if (nextId !== undefined) {
    const allQuestions = props.questionnaire.sections.flatMap(
      (s) => s.questions
    );
    const nextQ = allQuestions.find((q) => q.id === nextId);
    if (nextQ) {
      if (nextQ.id === 203 && !hasSeenContradictionPreamble.value) {
        pendingQuestion.value = nextQ;
        showContradictionPreamble.value = true;
        return;
      }
      questionHistory.value.push(currentQuestion.value);
      currentQuestion.value = nextQ;
      inlineInputAnswers.value = {};
    }
  }
};

const prevQuestion = () => {
  if (questionHistory.value.length > 0) {
    const destinationQuestion =
      questionHistory.value[questionHistory.value.length - 1];
    if (destinationQuestion) {
      const routesToRemoveStr = getRouteForQuestion(
        destinationQuestion.id,
        answers.value[destinationQuestion.id],
        answers.value
      );

      if (routesToRemoveStr) {
        let routesToRemove = routesToRemoveStr.split(",").map((r) => r.trim());

        if (routesToRemove.includes("Route H")) {
          const answer201 = answers.value[201];
          if (
            typeof answer201 === "string" &&
            answer201.startsWith("Yes, both staging and typing")
          ) {
            routesToRemove = routesToRemove.filter((r) => r !== "Route H");
          }
        }

        if (routesToRemove.length > 0) {
          suggestedRoutes.value = suggestedRoutes.value.filter(
            (r) => !routesToRemove.includes(r)
          );
          console.log(
            `Arrived at ${destinationQuestion.id}. Removed ${routesToRemove.join(
              ", "
            )}. Suggested Routes: [${suggestedRoutes.value.join(", ")}]`
          );
        }
      }
    }
    currentQuestion.value = questionHistory.value.pop() || null;
    isPreResult.value = false;
    isFinalResult.value = false;
  }
};

const radioSelection = computed({
  get() {
    if (!currentQuestion.value) return null;
    const answer = answers.value[currentQuestion.value.id];
    if (
      typeof answer === "object" &&
      answer !== null &&
      answer.selectedOption
    ) {
      return answer.selectedOption;
    }
    return answer;
  },
  set(newValue) {
    if (!currentQuestion.value || !newValue) return;
    const questionId = currentQuestion.value.id;

    if (hasSubOptions(newValue)) {
      answers.value[questionId] = {
        selectedOption: newValue,
        subs: {},
      };
    } else {
      answers.value[questionId] = newValue;
    }
  },
});

const checkboxModel = computed({
  get() {
    if (!currentQuestion.value) return [];
    const answer = answers.value[currentQuestion.value.id];
    if (answer && typeof answer === "object" && answer.main) {
      return answer.main;
    }
    return answer;
  },
  set(newValue) {
    if (!currentQuestion.value) return;
    const answer = answers.value[currentQuestion.value.id];
    if (answer && typeof answer === "object" && answer.main) {
      answer.main = newValue;
    } else {
      answers.value[currentQuestion.value.id] = newValue;
    }
  },
});

const handleFileChange = (
  event: Event,
  questionId: number,
  optionKey?: string
) => {
  const target = event.target as HTMLInputElement;
  if (!target.files || target.files.length === 0) return;

  const fileData = { files: target.files };

  if (optionKey) {
    const existingAnswer = answers.value[questionId];
    answers.value[questionId] = {
      selectedOption: radioSelection.value,
      fileData: {
        ...(typeof existingAnswer === "object" && existingAnswer?.fileData),
        [optionKey]: fileData,
      },
    };
  } else {
    answers.value[questionId] = fileData;
  }
};

const getRouteForQuestion = (
  questionId: number,
  answer: any,
  allAnswers: Record<number, any>
): string | null => {
  if (!answer) return null;

  const answerKey =
    typeof answer === "object" && answer !== null && answer.selectedOption
      ? answer.selectedOption
      : String(answer);

  let route: string | null = null;
  switch (questionId) {
    case 102:
      if (answerKey.startsWith("Yes (Attach your data")) {
        route = "Route A";
      }
      break;
    case 201:
      if (answerKey.startsWith("Yes, both staging and typing. ref :")) {
        route = "Route H";
      } else if (answerKey.startsWith("Yes, typing only.")) {
        route = "Route G";
      } else if (answerKey === "No") {
        route = "Route B";
      }
      break;
    case 201.5:
      if (answerKey === "Have 2 stages") {
        route = "Route E";
      } else if (answerKey === "Have more than 2 stages") {
        route = "Route F";
      }
      break;
    case 203:
      const answer102 = allAnswers[102];
      if (answerKey.startsWith("Yes (Please define the contradiction :")) {
        route = "Route C";
      } else if (answerKey === "No") {
        if (answer102 === "No") {
          route = "Route H, Route D";
        } else {
          route = "Route D";
        }
      }
      break;
  }
  return route;
};

const updateSuggestedRoutes = (questionId: number) => {
  const routesToAddStr = getRouteForQuestion(
    questionId,
    answers.value[questionId],
    answers.value
  );

  if (routesToAddStr) {
    // Split the string by comma, in case there are multiple routes
    const routes = routesToAddStr.split(",").map((r) => r.trim());
    // Add each route only if it's not already in the list
    routes.forEach((route) => {
      if (!suggestedRoutes.value.includes(route)) {
        suggestedRoutes.value.push(route);
      }
    });
    console.log(
      `Suggested Routes are now: [${suggestedRoutes.value.join(", ")}]`
    );
  }
};

// const updateFinalRoute = (questionId: number) => {
//   const answer = answers.value[questionId];
//   if (!answer) return; // Exit if there's no answer

//   // Get the string value of the answer, even if it's a complex object
//   const answerKey =
//     typeof answer === "object" && answer !== null && answer.selectedOption
//       ? answer.selectedOption
//       : String(answer);

//   // Use a switch to handle the new, specific routing rules
//   switch (questionId) {
//     case 102:
//       if (
//         answerKey === "Yes (Attach your data with molecular evidence.)||files"
//       ) {
//         finalRoute.value = "Route A";
//       }
//       break;

//     case 201:
//       if (answerKey.startsWith("Yes, both staging and typing. ref :")) {
//         finalRoute.value = "Route H";
//       } else if (answerKey === "Yes, staging only.") {
//         finalRoute.value = "Route E/F";
//       } else if (
//         answerKey.startsWith("Yes, typing only. (Please define the typing :")
//       ) {
//         finalRoute.value = "Route G";
//       } else if (answerKey === "No") {
//         finalRoute.value = "Route B";
//       }
//       break;

//     case 201.5:
//       if (answerKey === "Have 2 stages") {
//         finalRoute.value = "Route E";
//       } else if (answerKey === "Have more than 2 stages") {
//         finalRoute.value = "Route F";
//       }
//       break;

//     case 104:
//       // Question 104's answer for "No" is a simple string
//       if (answerKey === "No") {
//         finalRoute.value = "Route C/D";
//       }
//       break;
//     case 203:
//       if (answerKey.startsWith("Yes (Please define the contradiction :")) {
//         finalRoute.value = "Route C";
//       } else if (answerKey === "No") {
//         finalRoute.value = "Route D";
//       }
//       break;
//   }
//   console.log(
//     `Final route updated to: ${finalRoute.value} based on question ${questionId} answer: ${answerKey}`
//   );
// };

const submitFinalResponse = async () => {
  store.setSuggestedRoutes(suggestedRoutes.value);
  saveResponsesToStore();
  router.push("/questionnairesResearcher3");
};

const isNextDisabled = computed(() => {
  if (!currentQuestion.value) return true;

  const q = currentQuestion.value;
  const answer = answers.value[q.id];

  if (answer === undefined || answer === null || answer === "") {
    return true;
  }

  if (typeof answer === "string" && answer.includes("___")) {
    const placeholderCount = (answer.match(/___/g) || []).length;

    const optionIndex = q.options?.findIndex((opt) => opt === answer);

    if (optionIndex === undefined || optionIndex === -1) return true;

    let filledCount = 0;
    for (let i = 0; i < placeholderCount; i++) {
      const key = `${q.id}-${optionIndex}-${i}`;
      const inlineAnswer = inlineInputAnswers.value[key];
      if (inlineAnswer && inlineAnswer.trim() !== "") {
        filledCount++;
      }
    }
    if (filledCount < placeholderCount) {
      return true;
    }
  }

  if (
    typeof answer === "string" &&
    q.type === "radio" &&
    hasFileInput(answer)
  ) {
    return true;
  }

  if (typeof answer === "object" && answer !== null) {
    if (answer.main) {
      if (answer.main.length === 0) return true;
      for (const mainOpt of answer.main) {
        if (hasSubOptions(mainOpt)) {
          const mainLabel = getCleanOptionLabel(mainOpt);
          const subAnswer = answer.subs?.[mainLabel];
          if (!subAnswer || subAnswer.length === 0) return true;
        }
      }
    }
    if (answer.selectedOption) {
      const selectedOpt = answer.selectedOption;

      if (selectedOpt.includes("___")) {
        const placeholderCount = (selectedOpt.match(/___/g) || []).length;
        const optionIndex = q.options?.findIndex((opt) => opt === selectedOpt);
        if (optionIndex === undefined || optionIndex === -1) return true;
        let filledCount = 0;
        for (let i = 0; i < placeholderCount; i++) {
          const key = `${q.id}-${optionIndex}-${i}`;
          if (inlineInputAnswers.value[key]?.trim()) filledCount++;
        }
        if (filledCount < placeholderCount) return true;
      }
      if (hasFileInput(answer.selectedOption)) {
        const mainLabel = getCleanOptionLabel(answer.selectedOption);
        const fileData = answer.fileData?.[mainLabel];
        if (!fileData) return true;
      }
      if (hasSubOptions(answer.selectedOption)) {
        const mainLabel = getCleanOptionLabel(answer.selectedOption);
        const subAnswer = answer.subs?.[mainLabel];
        if (!subAnswer || subAnswer.length === 0) return true;
      }
    }
  }

  if (Array.isArray(answer) && answer.length === 0) {
    return true;
  }

  return false;
});

watch(
  () =>
    currentQuestion.value ? answers.value[currentQuestion.value.id] : null,
  (newAnswer, oldAnswer) => {
    if (!currentQuestion.value || !currentQuestion.value.options) return;

    const oldSelections = Array.isArray(oldAnswer) ? oldAnswer : [oldAnswer];

    oldSelections.forEach((oldOpt) => {
      if (oldOpt && typeof oldOpt === "string") {
        const cleanOldOpt = getCleanOptionLabel(oldOpt);

        if (hasSubOptions(oldOpt) || hasFileInput(oldOpt)) {
          if (
            answers.value[currentQuestion.value!.id] &&
            answers.value[currentQuestion.value!.id][cleanOldOpt]
          ) {
            delete answers.value[currentQuestion.value!.id][cleanOldOpt];
          }
        }
      }
    });
  },
  { deep: true }
);

watch(
  currentQuestion,
  (newQuestion) => {
    if (newQuestion && newQuestion.type === "checkbox") {
      if (!answers.value[newQuestion.id]) {
        if (newQuestion.subOptions) {
          answers.value[newQuestion.id] = { main: [], subs: {} };
        } else {
          answers.value[newQuestion.id] = [];
        }
      }
    }
  },
  { immediate: true }
);

watch(
  checkboxModel,
  (newSelection: string[], oldSelection: string[] | undefined) => {
    if (
      currentQuestion.value?.type !== "checkbox" ||
      !Array.isArray(newSelection)
    )
      return;

    if (!currentQuestion.value || !currentQuestion.value.subOptions) return;

    const { id, subOptionsType } = currentQuestion.value;
    if (!subOptionsType) return;

    const addedOptions = newSelection.filter(
      (opt: string) => !(oldSelection || []).includes(opt)
    );

    addedOptions.forEach((optionString: string) => {
      const optionLabel = getCleanOptionLabel(optionString);

      if (subOptionsType[optionLabel] === "checkbox") {
        if (!answers.value[id].subs[optionLabel]) {
          answers.value[id].subs[optionLabel] = [];
        }
      }
    });
  }
);

watch(radioSelection, (newSelection) => {
  if (
    !currentQuestion.value ||
    currentQuestion.value.type !== "radio" ||
    !newSelection ||
    !hasSubOptions(newSelection)
  ) {
    return;
  }

  const { id, subOptionsType } = currentQuestion.value;
  if (!subOptionsType) return;

  const optionLabel = getCleanOptionLabel(newSelection as string);

  if (subOptionsType[optionLabel] === "checkbox") {
    const answer = answers.value[id];
    if (answer && answer.subs && !answer.subs[optionLabel]) {
      answer.subs[optionLabel] = [];
    }
  }
});
</script>

<template>
  <div v-if="showContradictionPreamble" class="questionnaire">
    <div class="preamble-content">
      <h2>{{ contradictionText.title }}</h2>
      <p>{{ contradictionText.body }}</p>
      <h5>{{ contradictionText.frameworkTitle }}</h5>
      <ol>
        <li v-for="action in contradictionText.actions" :key="action">
          {{ action }}
        </li>
      </ol>
      <h5>{{ contradictionText.researchQuestionTitle }}</h5>
      <p>{{ contradictionText.researchQuestionBody }}</p>
      <button
        @click="handleCloseContradictionPreamble"
        class="next-btn"
        style="width: fit-content; margin-top: 20px"
      >
        Continue to Question
      </button>
    </div>
  </div>

  <div v-else class="questionnaire">
    <PreResult
      v-if="isPreResult"
      :lastQuestion="lastAnsweredQuestion?.question"
      @continue="showFinalResult"
    />
    <FinalResult
      v-else-if="isFinalResult"
      :route="finalDisplayRoute"
      :lastQuestion="lastAnsweredQuestion?.question"
      @save="submitFinalResponse"
    />

    <form
      v-else-if="currentQuestion"
      @submit.prevent="nextQuestion"
      class="form-container"
    >
      <div class="question">
        <div v-if="currentQuestion.id === 203" class="preamble-inline">
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
          <div class="preamble-text">
            <strong>{{ contradictionText.title }}:</strong>
            {{ contradictionText.body }}
          </div>
        </div>

        <div v-if="currentPreamble" class="preamble-inline">
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
            <div
              v-for="item in currentPreamble"
              :key="item.term"
              class="preamble-item"
            >
              <strong>{{ item.term }}:</strong>
              {{ item.definition }}
            </div>
          </div>
        </div>

        <label class="question-label">{{ currentQuestion.question }}</label>

        <input
          v-if="currentQuestion.type === 'text'"
          v-model="answers[currentQuestion.id]"
          type="text"
          class="input-text"
        />

        <div v-if="currentQuestion.type === 'files'">
          <input
            type="file"
            @change="handleFileChange($event, currentQuestion.id)"
            class="input-file"
            accept=".pdf,.png,.jpeg,.jpg,.docx,.xlsx"
            style="margin-left: 50px"
          />
          <div
            v-if="
              answers[currentQuestion.id] && answers[currentQuestion.id].files
            "
            class="saved-files"
          ></div>
        </div>

        <div v-else-if="currentQuestion.type === 'radio'" class="radio-group">
          <div
            v-for="(option, optionIndex) in currentQuestion.options"
            :key="option"
            class="option-wrapper"
          >
            <div class="radio-option">
              <input
                type="radio"
                :name="'q' + currentQuestion.id"
                :value="option"
                v-model="radioSelection"
                class="radio-input"
              />

              <label
                v-if="option.includes('___')"
                class="radio-label inline-input-label"
              >
                <span
                  v-for="(part, index) in parseOptionForInline(
                    getCleanOptionLabel(option)
                  )"
                  :key="index"
                >
                  {{ part }}
                  <input
                    v-if="
                      index <
                      parseOptionForInline(getCleanOptionLabel(option)).length -
                        1
                    "
                    type="text"
                    v-model="
                      inlineInputAnswers[
                        `${currentQuestion.id}-${optionIndex}-${index}`
                      ]
                    "
                    :disabled="radioSelection !== option"
                    class="inline-input"
                    @click.stop
                  />
                  <!-- style="
                      min-width: 300px;
                      max-width: 50%;
                      field-sizing: content;
                    " -->
                </span>
              </label>
              <label v-else class="radio-label">{{
                getCleanOptionLabel(option)
              }}</label>
            </div>

            <div v-if="radioSelection === option" class="sub-option-container">
              <div
                v-if="
                  hasSubOptions(option) &&
                  currentQuestion.subOptions &&
                  currentQuestion.subOptions[getCleanOptionLabel(option)]
                "
              >
                <!-- <div
                  v-for="subOpt in currentQuestion.subOptions[
                    getCleanOptionLabel(option)
                  ]"
                  :key="subOpt"
                  class="sub-radio-option"
                >
                  <input
                    type="radio"
                    :name="'sub-q' + currentQuestion.id"
                    :value="subOpt"
                  />
                  <label>{{ subOpt }}</label>
                </div> -->
                <div
                  v-for="subOpt in currentQuestion.subOptions[
                    getCleanOptionLabel(option)
                  ]"
                  :key="subOpt"
                  class="sub-radio-option"
                >
                  <input
                    v-if="
                      currentQuestion.subOptionsType &&
                      currentQuestion.subOptionsType[
                        getCleanOptionLabel(option)
                      ] === 'radio'
                    "
                    type="radio"
                    :name="'sub-q-' + getCleanOptionLabel(option)"
                    :value="subOpt"
                    v-model="
                      answers[currentQuestion.id].subs[
                        getCleanOptionLabel(option)
                      ]
                    "
                  />
                  <input
                    v-else
                    type="checkbox"
                    :value="subOpt"
                    v-model="
                      answers[currentQuestion.id].subs[
                        getCleanOptionLabel(option)
                      ]
                    "
                  />
                  <label>{{ subOpt }}</label>
                </div>
              </div>
              <div v-if="hasFileInput(option)">
                <input
                  type="file"
                  @change="
                    handleFileChange(
                      $event,
                      currentQuestion.id,
                      getCleanOptionLabel(option)
                    )
                  "
                  style="margin-left: 30px"
                  class="input-file-conditional"
                  accept=".pdf,.png,.jpeg,.jpg"
                />
                <div
                  v-if="
                    answers[currentQuestion.id] &&
                    answers[currentQuestion.id][getCleanOptionLabel(option)]
                  "
                  class="saved-files"
                >
                  <!-- <p>Saved file(s):</p>
                  <ul>
                    <li
                      v-for="file in Array.from(
                        answers[currentQuestion.id][getCleanOptionLabel(option)]
                          .files
                      )"
                      :key="(file as File).name"
                    >
                      {{ (file as File).name }}
                    </li>
                  </ul> -->
                </div>
              </div>
            </div>
          </div>
        </div>

        <div
          v-else-if="currentQuestion.type === 'checkbox'"
          class="checkbox-group"
        >
          <div
            v-for="option in currentQuestion.options"
            :key="option"
            class="option-wrapper"
          >
            <div class="checkbox-option">
              <input
                type="checkbox"
                :value="option"
                v-model="checkboxModel"
                class="checkbox-input"
              />
              <label class="checkbox-label">{{
                getCleanOptionLabel(option)
              }}</label>
            </div>

            <div
              v-if="
                currentQuestion.subOptions &&
                currentQuestion.subOptions[getCleanOptionLabel(option)] &&
                answers[currentQuestion.id].main?.includes(option)
              "
              class="sub-option-container"
            >
              <div
                v-for="subOpt in currentQuestion.subOptions[
                  getCleanOptionLabel(option)
                ]"
                :key="subOpt"
                class="sub-checkbox-option"
              >
                <input
                  v-if="
                    currentQuestion.subOptionsType &&
                    currentQuestion.subOptionsType[
                      getCleanOptionLabel(option)
                    ] === 'radio'
                  "
                  type="radio"
                  :name="'sub-q-' + getCleanOptionLabel(option)"
                  :value="subOpt"
                  v-model="
                    answers[currentQuestion.id].subs[
                      getCleanOptionLabel(option)
                    ]
                  "
                  class="radio-input"
                />
                <input
                  v-else
                  type="checkbox"
                  :value="subOpt"
                  v-model="
                    answers[currentQuestion.id].subs[
                      getCleanOptionLabel(option)
                    ]
                  "
                  class="checkbox-input"
                />
                <label>{{ subOpt }}</label>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="btn-container">
        <button
          type="button"
          class="back-btn"
          @click="prevQuestion"
          :disabled="questionHistory.length === 0"
        >
          Back
        </button>
        <button type="submit" class="next-btn" :disabled="isNextDisabled">
          Next
        </button>
      </div>
      <a
        class="gls-btn"
        @click="openGlossaryModal"
        style="color: #eb4648; cursor: pointer"
      >
        Show all glossary
      </a>
      <GlossaryModal
        :isVisible="isGlossaryVisible"
        @close="closeGlossaryModal"
      />
    </form>
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

.section-title {
  font-size: 20px;
  font-weight: 400;
  padding: 0;
  margin: 0px 0px 24px 0px;
  border: none;
}

.question {
  margin: 0 !important;
  padding-top: 0px;
  padding-bottom: 0px;
  padding-left: 16px;
  padding-right: 16px;
}

.question-label {
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

.sub-radio-option,
.sub-checkbox-option {
  font-size: 18px;
  padding: 0px 8px 0px 32px;
  display: flex;
  align-items: center;
  margin: 12px 0px;
  gap: 10px;
  accent-color: #eb4648;
  cursor: pointer;
}

.radio-input,
.checkbox-input {
  accent-color: #eb4648;
  cursor: pointer;
}

/* .btn-container {
  display: flex;
  position: absolute;
  margin-top: 30vh;
  gap: 14px;
} */
.btn-container {
  display: flex;
  /* position: absolute; has been removed to keep it in the document flow */
  margin-top: 40px; /* A fixed margin provides consistent spacing after the options */
  gap: 14px;
}

.back-btn,
.next-btn {
  height: 100%;
  width: 95px;
  padding: 8px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.back-btn {
  background-color: #d6d6d6;
  color: white;
  margin-right: 14px;
}

.next-btn {
  background-color: #eb4648;
  color: white;
}

.next-btn:hover {
  background-color: #c9302c;
}

.back-btn:hover {
  background-color: #b0b0b0;
}

.back-btn:disabled {
  background-color: #e0e0e0;
  cursor: not-allowed;
}
.next-btn:disabled {
  background-color: #eb46496b;
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
</style>
