<script setup lang="ts">
import { defineProps, ref, computed, watch } from "vue";
import type { Questionnaire2, Question2 } from "@/stores/questionnaires2";
import { useQuestionnaireStore } from "@/stores/useQuestionnaireStore";
import { useRouter } from "vue-router";
import PreResult from "@/components/preResult.vue";
import FinalResult from "@/components/result.vue";
import GlossaryModal from "@/components/GlossaryModal.vue";
import DynamicInlineInput from "@/components/DynamicInlineInput.vue";
import { storeToRefs } from "pinia";
import { VITE_API_BASE_URL } from "@/stores/config";

const props = defineProps<{ questionnaire: Questionnaire2 }>();
const store = useQuestionnaireStore();
const { answers } = storeToRefs(store);

const router = useRouter();

const inlineInputAnswers = computed({
  get() {
    if (!currentQuestion.value) return {};
    const answer = answers.value[currentQuestion.value.id];
    if (answer && typeof answer === "object" && answer.inlineText) {
      return answer.inlineText;
    }
    return {};
  },
  set(newValue) {
    if (!currentQuestion.value) return;
    const answer = answers.value[currentQuestion.value.id];
    if (answer && typeof answer === "object") {
      answer.inlineText = newValue;
    }
  },
});

const questionHistory = ref<Question2[]>([]);
const currentQuestion = ref<Question2 | null>(
  props.questionnaire.sections[0].questions[0]
);
const isPreResult = ref(false);
const isFinalResult = ref(false);
const lastAnsweredQuestion = ref<Question2 | null>(null);
// const finalRoute = ref<string>("");
// const suggestedRoutes = ref<string[]>([]);

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
    {
      term: "Molecular Types of the Disease",
      definition:
        "Distinct clusters of disease characteristics that share common molecular origins—driven by the same originating cell and signal—but are further influenced by additional distinct signals.",
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
        "In a medical context, remission refers to a state in which the signs and symptoms of a disease have completely disappeared, either temporarily or permanently.",
    },
    {
      term: "True remission",
      definition:
        "The occurrence of molecular normalization in the originating cells of a disease, combined with the complete disappearance of clinical signs and symptoms for a duration exceeding the onset timeframe of the designated disease.",
    },
    {
      term: "Unstable remission",
      definition:
        "The status in which true remission has occurred while the source of the causative signal still persists.",
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
  if (store.suggestedRoutes.includes("Route C")) {
    return "Route C";
  }
  return store.suggestedRoutes.join(", ");
});

const saveResponsesToStore = () => {
  store.setAnswers(answers.value);
};

const createObjectURL = (file: File) => {
  return URL.createObjectURL(file);
};

const getFileDownloadUrl = (fileId: number) => {
  return `${VITE_API_BASE_URL}/api/file/${fileId}`;
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
      if (
        answerKey.startsWith("Yes, please explain the exact remission rate")
      ) {
        route = "Route A";
      }
      break;
    case 201:
      if (answerKey.startsWith("Yes, both staging and typing. ref :")) {
        route = "Route H";
      } else if (answerKey.startsWith("Yes, typing only.")) {
        route = "Route G";
      } else if (answerKey.startsWith("No")) {
        route = "Route B";
      }
      break;
    case 201.5:
      if (answerKey.startsWith("Have 2 stages")) {
        route = "Route E";
      } else if (answerKey.startsWith("Have more than 2 stages")) {
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

const recalculatedRoutes = computed(() => {
  const routes = new Set<string>();

  Object.keys(answers.value).forEach((idStr) => {
    const id = Number(idStr);
    const answer = answers.value[id];
    const routeStr = getRouteForQuestion(id, answer, answers.value);

    if (routeStr) {
      routeStr.split(",").forEach((r) => {
        if (r.trim()) routes.add(r.trim());
      });
    }
  });

  return Array.from(routes).sort();
});

const nextQuestion = () => {
  console.log('--- "Next" button clicked ---');
  if (!currentQuestion.value) {
    console.error("DEBUG: No current question. Aborting.");
    return;
  }

  const questionId = currentQuestion.value.id;
  console.log(`DEBUG: Current Question ID is ${questionId}`);

  console.log(
    "DEBUG: Answer object BEFORE save:",
    JSON.parse(JSON.stringify(answers.value[questionId]))
  );

  console.log(
    "DEBUG: Answer object AFTER save:",
    JSON.parse(JSON.stringify(answers.value[questionId]))
  );

  const currentAnswer = answers.value[questionId];

  if (
    currentAnswer === undefined ||
    currentAnswer === null ||
    currentAnswer === ""
  ) {
    console.warn("DEBUG: No answer provided, halting navigation.");
    return;
  }

  lastAnsweredQuestion.value = currentQuestion.value;

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
    }
  }
};

const prevQuestion = () => {
  if (currentQuestion.value?.id === 101) {
    router.push("/questionnairesResearcher");
    return;
  }
  if (questionHistory.value.length > 0) {
    const destinationQuestion =
      questionHistory.value[questionHistory.value.length - 1];
    currentQuestion.value = questionHistory.value.pop() || null;
    isPreResult.value = false;
    isFinalResult.value = false;
  }
};

const radioSelection = computed({
  get() {
    if (!currentQuestion.value) return null;
    const answer = answers.value[currentQuestion.value.id];

    if (answer && typeof answer === "object" && answer.selectedOption) {
      const savedOptionText = answer.selectedOption;

      const originalOption = currentQuestion.value.options?.find((opt) => {
        if (opt.includes("___")) {
          const prefix = opt.split("___")[0];
          return savedOptionText.startsWith(prefix);
        }
        return (
          getCleanOptionLabel(opt) === getCleanOptionLabel(savedOptionText)
        );
      });

      return originalOption || null;
    }
    return answer || null;
  },
  set(newValue) {
    if (!currentQuestion.value || !newValue) return;
    const questionId = currentQuestion.value.id;

    const newAnswer: { [key: string]: any } = {
      selectedOption: newValue,
    };

    if (hasSubOptions(newValue)) {
      newAnswer.subs = {};
    }
    if (hasFileInput(newValue)) {
      newAnswer.fileData = {};
    }
    if (String(newValue).includes("___")) {
      newAnswer.inlineText = {};
    }

    answers.value[questionId] = newAnswer;
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
    const questionId = currentQuestion.value.id;
    const existingAnswer = answers.value[questionId];

    if (
      existingAnswer &&
      typeof existingAnswer === "object" &&
      existingAnswer.main
    ) {
      existingAnswer.main = newValue;
    } else {
      answers.value[questionId] = {
        main: newValue,
        subs: {},
        inlineText: {},
      };
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

    if (typeof existingAnswer !== "object" || existingAnswer === null) {
      return;
    }

    existingAnswer.fileData = {
      ...existingAnswer.fileData,
      [optionKey]: fileData,
    };

    answers.value[questionId] = { ...existingAnswer };
  } else {
    answers.value[questionId] = fileData;
  }
};

watch(
  recalculatedRoutes,
  (newRoutes) => {
    store.setSuggestedRoutes(newRoutes);
  },
  { immediate: true }
);

const submitFinalResponse = async () => {
  const filesToPass: { questionId: string; file: File }[] = [];
  Object.entries(answers.value).forEach(([id, value]) => {
    if (value && typeof value === "object") {
      if (value.files instanceof FileList) {
        Array.from(value.files).forEach((file: any) => {
          filesToPass.push({ questionId: id, file: file as File });
        });
      }
      if (value.fileData) {
        Object.values(value.fileData).forEach((fileInfo: any) => {
          if (fileInfo.files instanceof FileList) {
            Array.from(fileInfo.files).forEach((file: any) => {
              filesToPass.push({ questionId: id, file: file as File });
            });
          }
        });
      }
    }
  });

  store.setLiveFiles(filesToPass);

  saveResponsesToStore();
  router.push("/questionnairesResearcher3");
};

const isNextDisabled = computed(() => {
  if (!currentQuestion.value) return true;

  const q = currentQuestion.value;
  const answer = answers.value[q.id];

  if (!answer) return true;
  if (q.id === 207) {
    const ans207 = answer; // It's already the complex object

    // Rule 1: Must select one of the radio buttons
    if (!ans207.radioSelection) {
      return true;
    }

    // Rule 2 & 3 combined: Check all selected options (radio and checkboxes)
    const allSelections = [ans207.radioSelection, ...ans207.checkboxes];
    for (const selection of allSelections) {
      // Check if an inline input is required and not filled
      if (selection.includes("___")) {
        const optionIndex = q.options?.findIndex(
          (opt) => parseOption(opt).label === selection
        );
        if (optionIndex === undefined) continue;
        const key = `207-${optionIndex}-0`; // Assuming one inline input
        if (!ans207.inlineText[key] || ans207.inlineText[key].trim() === "") {
          return true;
        }
      }
      // Check if "Inflammation" is selected and its sub-option is not
      if (
        selection.startsWith("Inflammation") &&
        !ans207.subs?.["Inflammation"]
      ) {
        return true;
      }
    }
    return false; // If all rules pass, enable the button
  }
  if (
    typeof answer === "string" &&
    !answer.includes("___") &&
    !hasFileInput(answer)
  ) {
    return false;
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
        if (mainOpt.includes("___")) {
          const optionIndex = q.options?.findIndex((opt) => opt === mainOpt);
          const placeholderCount = (mainOpt.match(/___/g) || []).length;

          if (optionIndex !== undefined && optionIndex > -1) {
            let filledCount = 0;
            for (let i = 0; i < placeholderCount; i++) {
              const key = `${q.id}-${optionIndex}-${i}`;
              if (answer.inlineText && answer.inlineText[key]?.trim()) {
                filledCount++;
              }
            }
            if (filledCount < placeholderCount) return true;
          }
        }
      }
    }

    if (answer.selectedOption) {
      const originalOption = q.options?.find((opt) =>
        answer.selectedOption.startsWith(opt.split("___")[0])
      );

      if (!originalOption) return true;

      if (hasSubOptions(originalOption)) {
        const mainLabel = getCleanOptionLabel(originalOption);
        const subAnswer = answer.subs?.[mainLabel];
        if (!subAnswer || subAnswer.length === 0) return true;
      }

      if (hasFileInput(originalOption)) {
        const mainLabel = getCleanOptionLabel(originalOption);
        const fileData = answer.fileData?.[mainLabel];
        if (!fileData || !fileData.files || fileData.files.length === 0)
          return true;
      }

      if (originalOption.includes("___")) {
        const placeholderCount = (originalOption.match(/___/g) || []).length;
        const inlineText = answer.inlineText || {};
        const filledCount = Object.values(inlineText).filter(
          (val) => val && String(val).trim() !== ""
        ).length;
        if (filledCount < placeholderCount) return true;
      }
    }
  } else if (!answer) {
    return true;
  }

  return false;
});

const parseOption = (option: string) => {
  if (option.includes("|/|")) {
    const parts = option.split("|/|");
    return { type: "radio", group: parts[0], label: parts[1] };
  }
  return { type: "checkbox", group: null, label: option };
};

// const q207AnswerModel = computed({
//   get() {
//     const currentAnswer = answers.value[207];
//     if (typeof currentAnswer !== "object" || currentAnswer === null) {
//       return { radioSelection: "", checkboxes: [], subs: {}, inlineText: {} };
//     }
//     return {
//       radioSelection: currentAnswer.radioSelection || "",
//       checkboxes: Array.isArray(currentAnswer.checkboxes)
//         ? currentAnswer.checkboxes
//         : [],
//       subs: currentAnswer.subs || {},
//       inlineText: currentAnswer.inlineText || {},
//     };
//   },
//   set(newValue) {
//     answers.value[207] = {
//       ...answers.value[207],
//       radioSelection: newValue.radioSelection,
//       checkboxes: newValue.checkboxes,
//       subs: newValue.subs,
//       inlineText: newValue.inlineText,
//     };
//   },
// });

const getQuestionById2 = (id: number): Question2 | null => {
  for (const section of props.questionnaire.sections) {
    const foundQuestion = section.questions.find((q) => q.id === id);
    if (foundQuestion) return foundQuestion;
  }
  return null;
};

// const isSubOptionVisible = (questionId: number, option: string): boolean => {
//   const q = getQuestionById2(questionId);
//   const answer = answers.value[questionId];
//   if (!q || !answer) return false;

//   const optionLabel = option.split("||")[0];
//   const hasSubOptions = q.subOptions && q.subOptions[optionLabel];
//   if (!hasSubOptions) return false;

//   if (questionId === 207) {
//     return q207AnswerModel.value.checkboxes.some((selected: string) =>
//       selected.startsWith(optionLabel)
//     );
//   }

//   if (answer.main && Array.isArray(answer.main)) {
//     return answer.main.includes(option);
//   }

//   return false;
// };
watch(
  currentQuestion,
  (q) => {
    if (q && q.id === 207) {
      const currentAnswer = answers.value[207];
      // If the answer for Q207 isn't a correctly structured object, create it.
      if (
        typeof currentAnswer !== "object" ||
        currentAnswer === null ||
        !("radioSelection" in currentAnswer)
      ) {
        answers.value[207] = {
          radioSelection: "",
          checkboxes: [],
          subs: {},
          inlineText: {},
        };
      }
    }
  },
  { immediate: true }
);

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
        if (
          newQuestion.subOptions ||
          newQuestion.options?.some((opt) => opt.includes("___"))
        ) {
          answers.value[newQuestion.id] = {
            main: [],
            subs: {},
            inlineText: {},
          };
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

    const oldSelectionArray = Array.isArray(oldSelection) ? oldSelection : [];

    const addedOptions = newSelection.filter(
      (opt: string) => !oldSelectionArray.includes(opt)
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

const removeFile = (questionId: number, optionKey: string) => {
  const answer = answers.value[questionId];
  if (
    answer &&
    typeof answer === "object" &&
    answer.fileData &&
    answer.fileData[optionKey]
  ) {
    delete answer.fileData[optionKey];
    answers.value[questionId] = { ...answer };
  }
};

watch(radioSelection, (newSelection, oldSelection) => {
  if (
    !currentQuestion.value ||
    !oldSelection ||
    newSelection === oldSelection
  ) {
    return;
  }

  if (String(oldSelection).includes("___")) {
    const oldOptionIndex = currentQuestion.value.options?.findIndex(
      (opt) => opt === oldSelection
    );
    if (oldOptionIndex !== undefined && oldOptionIndex > -1) {
      Object.keys(inlineInputAnswers.value).forEach((key) => {
        if (key.startsWith(`${currentQuestion.value?.id}-${oldOptionIndex}`)) {
          delete inlineInputAnswers.value[key];
        }
      });
    }
  }

  if (String(oldSelection).includes("||files")) {
    const answer = answers.value[currentQuestion.value.id];
    const oldOptionLabel = getCleanOptionLabel(String(oldSelection));

    if (answer?.fileData?.[oldOptionLabel]) {
      delete answer.fileData[oldOptionLabel];
    }
  }
});

watch(
  () => answers.value[201],
  (newAnswerFor201) => {
    if (newAnswerFor201 !== "Yes, staging only.") {
      if (answers.value[201.5]) {
        delete answers.value[201.5];
        console.log("DEBUG: Cleared orphaned answer for question 201.5");
      }
    }
  }
);

watch(
  () => answers.value[201],
  (newAnswerFor201) => {
    const selection =
      typeof newAnswerFor201 === "object" && newAnswerFor201 !== null
        ? newAnswerFor201.selectedOption
        : newAnswerFor201;

    if (selection !== "Yes, staging only.") {
      if (answers.value[201.5]) {
        delete answers.value[201.5];
        console.log(
          "WATCHER: Cleared orphaned answer for question 201.5 because 201 changed."
        );
      }
    }
  },
  { deep: true }
);

watch(
  () => answers.value[207],
  (newAnswer, oldAnswer) => {
    if (
      !newAnswer ||
      !oldAnswer ||
      !currentQuestion.value ||
      currentQuestion.value.id !== 207
    )
      return;

    // 1. Cleanup for deselected radio button
    if (
      newAnswer.radioSelection !== oldAnswer.radioSelection &&
      oldAnswer.radioSelection?.includes("___")
    ) {
      const oldOptionIndex = currentQuestion.value.options?.findIndex(
        (opt) => parseOption(opt).label === oldAnswer.radioSelection
      );
      if (oldOptionIndex !== undefined && oldOptionIndex > -1) {
        const key = `207-${oldOptionIndex}-0`;
        if (newAnswer.inlineText && newAnswer.inlineText[key]) {
          delete newAnswer.inlineText[key];
        }
      }
    }

    // 2. Cleanup for deselected checkboxes
    const deselected = oldAnswer.checkboxes?.filter(
      (opt: string) => !newAnswer.checkboxes?.includes(opt)
    );
    deselected?.forEach((deselectedOpt: string) => {
      if (deselectedOpt.includes("___")) {
        const oldOptionIndex = currentQuestion.value?.options?.findIndex(
          (opt) => parseOption(opt).label === deselectedOpt
        );
        if (oldOptionIndex !== undefined && oldOptionIndex > -1) {
          const key = `207-${oldOptionIndex}-0`;
          if (newAnswer.inlineText && newAnswer.inlineText[key]) {
            delete newAnswer.inlineText[key];
          }
        }
      }
    });
  },
  { deep: true }
);

// ADD THESE TWO WATCHERS. DELETE THE OLD watch for answers.value[207].

// Watcher for the Q207 RADIO BUTTON selection
watch(
  () => answers.value[207]?.radioSelection,
  (newRadio, oldRadio) => {
    if (oldRadio && oldRadio !== newRadio && oldRadio.includes("___")) {
      const oldOptionIndex = currentQuestion.value?.options?.findIndex(
        (opt) => parseOption(opt).label === oldRadio
      );
      if (oldOptionIndex !== undefined && oldOptionIndex > -1) {
        const key = `207-${oldOptionIndex}-0`;
        if (answers.value[207]?.inlineText?.[key]) {
          // Use delete to remove the property from the object
          delete answers.value[207].inlineText[key];
        }
      }
    }
  }
);

// Watcher for the Q207 CHECKBOX selections
watch(
  () => answers.value[207]?.checkboxes,
  (newBoxes, oldBoxes) => {
    if (!oldBoxes || !newBoxes) return;

    const deselected = oldBoxes.filter(
      (opt: string) => !newBoxes.includes(opt)
    );
    deselected.forEach((deselectedOpt: string) => {
      // Clean up inline text for deselected checkboxes
      if (deselectedOpt.includes("___")) {
        const oldOptionIndex = currentQuestion.value?.options?.findIndex(
          (opt) => parseOption(opt).label === deselectedOpt
        );
        if (oldOptionIndex !== undefined && oldOptionIndex > -1) {
          const key = `207-${oldOptionIndex}-0`;
          if (answers.value[207]?.inlineText?.[key]) {
            delete answers.value[207].inlineText[key];
          }
        }
      }
      // Clean up sub-options for deselected "Inflammation"
      if (
        deselectedOpt.startsWith("Inflammation") &&
        answers.value[207]?.subs?.["Inflammation"]
      ) {
        delete answers.value[207].subs["Inflammation"];
      }
    });
  },
  { deep: true }
);
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
                  <!-- {{ part }}
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
                  /> -->
                  {{ part }}
                  <DynamicInlineInput
                    v-if="
                      index <
                      parseOptionForInline(getCleanOptionLabel(option)).length -
                        1
                    "
                    v-model="
                      inlineInputAnswers[
                        `${currentQuestion.id}-${optionIndex}-${index}`
                      ]
                    "
                    :disabled="radioSelection !== option"
                    @click.stop
                  />
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
                  style="margin-top: 8px"
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

              <div v-if="hasFileInput(option)" class="file-input-wrapper">
                <div
                  v-if="
                    answers[currentQuestion.id]?.fileData?.[
                      getCleanOptionLabel(option)
                    ]?.files?.[0]
                  "
                  class="file-preview"
                >
                  <a
                    :href="
                      answers[currentQuestion.id].fileData[
                        getCleanOptionLabel(option)
                      ].files[0].rehydrated
                        ? getFileDownloadUrl(
                            answers[currentQuestion.id].fileData[
                              getCleanOptionLabel(option)
                            ].files[0].id
                          )
                        : createObjectURL(
                            answers[currentQuestion.id].fileData[
                              getCleanOptionLabel(option)
                            ].files[0]
                          )
                    "
                    target="_blank"
                    rel="noopener noreferrer"
                    class="file-link"
                  >
                    {{
                      answers[currentQuestion.id].fileData[
                        getCleanOptionLabel(option)
                      ].files[0].name
                    }}
                  </a>
                  <button
                    @click="
                      removeFile(
                        currentQuestion.id,
                        getCleanOptionLabel(option)
                      )
                    "
                    class="remove-file-btn"
                    type="button"
                    style="
                      font-size: 32px;
                      color: #eb4648;
                      background: none;
                      border: none;
                      cursor: pointer;
                    "
                  >
                    &times;
                  </button>
                </div>

                <div v-else>
                  <input
                    type="file"
                    @change="
                      handleFileChange(
                        $event,
                        currentQuestion.id,
                        getCleanOptionLabel(option)
                      )
                    "
                    class="input-file-conditional"
                    accept=".pdf,.png,.jpeg,.jpg"
                  />
                  <div class="file-format-text">
                    (Attach in .pdf, .png, .jpeg or .jpg format)
                  </div>
                </div>
              </div>
              <!-- <div v-if="hasFileInput(option)">
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
                  style="
                    margin: 16px auto 10px 32px;
                    padding-top: 0px;
                    font-style: italic;
                  "
                >
                  Attach in .pdf, .png, .jpeg or .jpg format
                </div>

                <div
                  v-if="
                    answers[currentQuestion.id] &&
                    answers[currentQuestion.id][getCleanOptionLabel(option)]
                  "
                  class="saved-files"
                ></div>
              </div> -->
            </div>
          </div>
        </div>

        <!-- <div
          v-else-if="currentQuestion.type === 'checkbox'"
          class="checkbox-group"
        >
          <div
            v-for="(option, optionIndex) in currentQuestion.options"
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

              <label
                v-if="option.includes('___')"
                class="checkbox-label inline-input-label"
              >
                <span
                  v-for="(part, index) in parseOptionForInline(
                    getCleanOptionLabel(option)
                  )"
                  :key="index"
                >
                  {{ part }}
                  <DynamicInlineInput
                    v-if="
                      index <
                      parseOptionForInline(getCleanOptionLabel(option)).length -
                        1
                    "
                    v-model="
                      answers[currentQuestion.id].inlineText[
                        `${currentQuestion.id}-${optionIndex}-${index}`
                      ]
                    "
                    :disabled="!checkboxModel.includes(option)"
                    @click.stop
                  />
                </span>
              </label>
              <label v-else class="checkbox-label">{{
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
            ></div>
          </div>
        </div> -->
        <div
          v-else-if="currentQuestion.type === 'checkbox'"
          class="checkbox-group"
          :data-question-id="currentQuestion.id"
        >
          <div
            v-for="(option, index) in currentQuestion.options"
            :key="index"
            class="checkbox-option-container"
          >
            <div class="checkbox-option">
              <template v-if="currentQuestion.id === 207 && answers[207]">
                <div class="option-item">
                  <input
                    v-if="parseOption(option).type === 'radio'"
                    type="radio"
                    :name="'q207-radio-group-' + parseOption(option).group"
                    :value="parseOption(option).label"
                    v-model="answers[207].radioSelection"
                    class="radio-input"
                  />
                  <input
                    v-else
                    type="checkbox"
                    :value="parseOption(option).label"
                    v-model="answers[207].checkboxes"
                    class="checkbox-input"
                  />

                  <label class="checkbox-label inline-input-label">
                    <span
                      v-for="(part, partIndex) in parseOption(
                        option
                      ).label.split('___')"
                      :key="partIndex"
                    >
                      {{ part.split("||")[0] }}
                      <DynamicInlineInput
                        v-if="
                          partIndex <
                          parseOption(option).label.split('___').length - 1
                        "
                        v-model="
                          answers[207].inlineText[`207-${index}-${partIndex}`]
                        "
                        :disabled="
                          (parseOption(option).type === 'radio' &&
                            answers[207].radioSelection !==
                              parseOption(option).label) ||
                          (parseOption(option).type === 'checkbox' &&
                            !answers[207].checkboxes.includes(
                              parseOption(option).label
                            ))
                        "
                        @click.stop
                      />
                    </span>
                  </label>
                </div>
              </template>

              <template v-else>
                <div class="option-item">
                  <input
                    type="checkbox"
                    :value="option"
                    v-model="checkboxModel"
                    class="checkbox-input"
                  />
                  <label class="checkbox-label">{{
                    option.split("||")[0]
                  }}</label>
                </div>
              </template>
            </div>

            <div
              v-if="
                currentQuestion.id === 207 &&
                parseOption(option).label === 'Inflammation||sub' &&
                answers[207]?.checkboxes.includes('Inflammation||sub')
              "
              class="sub-options-panel"
            >
              <div
                v-for="subOpt in currentQuestion.subOptions?.['Inflammation'] ||
                []"
                :key="subOpt"
                class="sub-option"
              >
                <input
                  type="radio"
                  name="q207-inflammation-sub"
                  :value="subOpt"
                  v-model="answers[207].subs['Inflammation']"
                  class="radio-input"
                />
                <label class="radio-label">{{ subOpt }}</label>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="btn-container">
        <button type="button" class="back-btn" @click="prevQuestion">
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
  align-items: flex-start;
  margin: 12px 0px;
  gap: 10px;
}

.sub-radio-option,
.sub-checkbox-option {
  font-size: 18px;
  padding: 0px 8px 0px 32px;
  display: flex;
  align-items: flex-start;
  margin: 12px 0px;
  gap: 10px;
  accent-color: #eb4648;
  cursor: pointer;
}

.radio-input,
.checkbox-input {
  accent-color: #eb4648;
  cursor: pointer;
  margin-top: 8px; /* Change to this */
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
  background-color: white;
  color: #eb4648;
  border: 1px solid #eb4648;
}
/* .back-btn :disabled{
  background-color: #d6d6d6;
  color: white;
  margin-right: 14px;
  border: none;
} */

.next-btn {
  background-color: #eb4648;
  color: white;
}

.next-btn:hover {
  background-color: #c9302c;
}

/* .back-btn:hover {
  background-color: #ffffff;
} */

.back-btn:disabled {
  /* background-color: #e0e0e0; */
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

/* ADD THESE STYLES */

.file-input-wrapper {
  /* Reduce the left margin to bring it closer to the radio button */
  margin-left: 30px;
  /* Remove the top margin to tighten the vertical space */
  margin-top: 0;
}

.file-preview {
  display: flex;
  /* This is the key for vertical alignment */
  align-items: center;
  gap: 10px;
  /* Remove the background and border to make it look cleaner */
  /* padding: 8px; */
  /* background-color: #f8f9fa; */
  /* border: 1px solid #dee2e6; */
  /* border-radius: 4px; */
}

.file-link {
  color: #007bff;
  text-decoration: none;
  font-weight: 500;
}

.file-link:hover {
  text-decoration: underline;
}

/* This is the new style for your remove button */
.remove-file-btn {
  /* Use your existing inline styles here */
  font-size: 36px; /* Reduced size slightly */
  color: #eb4648;
  background: none;
  border: none;
  cursor: pointer;

  /* Add padding and line-height to help with centering */
  padding: 0;
  line-height: 1; /* Aligns the '×' character better */
}

.file-format-text {
  margin-top: 8px;
  font-style: italic;
  font-size: 14px;
  color: #6c757d;
}
.sub-radio-option input,
.sub-checkbox-option input {
  margin-top: 8px; /* Adjust this value if needed */
}

.checkbox-option-container {
  /* This ensures each option block (including sub-options) is a distinct block */
  display: block;
  width: 100%;
}

.option-item {
  display: flex;
  align-items: flex-start; /* Aligns checkbox/radio with the start of the text */
  gap: 10px; /* Creates space between the checkbox/radio and the label */
  width: 100%; /* Ensures the flex container takes full width */
}

.sub-options-panel {
  padding-left: 42px; /* Indents the entire sub-option block (input width + gap) */
  margin-top: 8px; /* Adds some space below the parent option */
}

.sub-option {
  display: flex;
  align-items: center; /* Aligns the radio and its label */
  gap: 10px;
  margin-bottom: 12px; /* Space between each sub-option */
  font-size: 18px; /* Matches the parent option font size */
}
</style>
