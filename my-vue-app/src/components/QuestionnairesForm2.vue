<script setup lang="ts">
import { defineProps, ref, computed, watch, onMounted } from "vue";
import type { Questionnaire2, Question2 } from "@/stores/questionnaires2";
import { useQuestionnaireStore } from "@/stores/useQuestionnaireStore";
import { useRouter } from "vue-router";
import PreResult from "@/components/preResult.vue";
import FinalResult from "@/components/result.vue";
import GlossaryModal from "@/components/GlossaryModal.vue";
import DynamicInlineInput from "@/components/DynamicInlineInput.vue";
import { storeToRefs } from "pinia";
import { VITE_API_BASE_URL } from "@/stores/config";
import { instructions } from "@/stores/instructions2";
import { questionnaireData as questionnaireData1 } from "@/stores/questionnaires1";
import { formatPhoneNumber } from "@/utils/formatters";

const File = window.File;

const props = defineProps<{ questionnaire: Questionnaire2 }>();
const store = useQuestionnaireStore();
const { answers } = storeToRefs(store);

const router = useRouter();

const showDraftModal = ref(false);
const showDraftSuccessModal = ref(false);
const showDraftErrorModal = ref(false);
const isSavingDraft = ref(false);
const draftEditUrl = ref("");

const getQuestionById2 = (id: number): Question2 | null => {
  for (const section of props.questionnaire.sections) {
    const foundQuestion = section.questions.find((q) => q.id === id);
    if (foundQuestion) return foundQuestion;
  }
  return null;
};
const currentInstruction = computed(() => {
  if (!currentQuestion.value) return null;
  return instructions[currentQuestion.value.id] || null;
});

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
    "Within the RIRM framework, this contradiction prompts three actions:",
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
        "Distinct clusters of disease presentations that share the same originating cell and base molecular trigger, but are further influenced by additional, subtype-specific signals that give rise to different clinical behaviors or lesion patterns.",
    },
  ],
  201: [
    {
      term: "Molecular Stages of the Disease",
      definition:
        "The natural progression of a disease in which all stages are molecularly driven by the same originating cell and core signal, differing only in intensity and duration over time.",
    },
    {
      term: "Molecular Types of the Disease",
      definition:
        "Distinct clusters of disease presentations that share the same originating cell and base molecular trigger, but are further influenced by additional, subtype-specific signals that give rise to different clinical behaviors or lesion patterns.",
    },
  ],
  204: [
    {
      term: "Remission",
      definition:
        "In a medical context, remission refers to a state in which the signs and symptoms of a disease have completely disappeared, either temporarily or permanently.",
    },
    {
      term: "True Remission",
      definition:
        "True remission is defined as the occurrence of molecular normalization in the originating cells of a disease, accompanied by the complete disappearance of clinical signs and symptoms sustained for a duration longer than the onset timeframe of the designated disease.",
    },
  ],
  205: [
    {
      term: "True Remission",
      definition:
        "True remission is defined as the occurrence of molecular normalization in the originating cells of a disease, accompanied by the complete disappearance of clinical signs and symptoms sustained for a duration longer than the onset timeframe of the designated disease.",
    },
  ],
  206: [
    {
      term: "Molecular Clinico-Pathological Cascade (Molecular Cascade)",
      definition:
        "A sequence of molecular signals initiated by a primary signal that drives the originating cell, leading to the development of clinical or pathological characteristics.",
    },
    {
      term: "Autocrine Signaling",
      definition:
        "A signaling mechanism in which a single cell produces and responds to its own signaling molecules.",
    },
    {
      term: "Paracrine Signaling",
      definition:
        "A mechanism which one cell secretes signaling molecules that act on neighboring or nearby cells.",
    },
    {
      term: "Endocrine Signaling",
      definition:
        "A long-distance communication method where a cell releases hormones into the bloodstream, which travel to and affect distant cells.",
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

const getCleanOptionLabel = (option: string): string => {
  if (typeof option !== "string") return "";
  return option.split("||")[0];
};
const hasSubOptions = (option: string) => option.includes("||sub");
const hasFileInput = (option: string) => option.includes("||files");
const hasCritInput = (option: string) => option.includes("||crit");
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

const isContradiction = ref(false);

const getCritCount = (answer: any, question: Question2): number => {
  if (
    !answer ||
    typeof answer !== "object" ||
    !answer.inlineText ||
    !question.options
  ) {
    return 0;
  }
  const optionIndex = question.options.findIndex(
    (opt) => opt === answer.selectedOption
  );
  if (optionIndex === -1) return 0;

  const count = answer.inlineText[`${question.id}-${optionIndex}-select`];
  return Number(count) || 0;
};

const recalculatedRoutes = computed(() => {
  const getAnswerKey = (answer: any): string => {
    if (!answer) return "";
    return typeof answer === "object" && answer.selectedOption
      ? answer.selectedOption
      : String(answer);
  };

  const ans102 = getAnswerKey(answers.value[102]);
  const ans103 = getAnswerKey(answers.value[103]);
  const ans201 = answers.value[201];
  const ans202 = answers.value[202];
  const ans204 = answers.value[204];

  // --- Route A ---
  if (
    ans102.startsWith("Yes") ||
    ans103.startsWith("More than 80% efficiency")
  ) {
    if(getAnswerKey(ans202).startsWith("Yes") &&
  getAnswerKey(ans204).startsWith("Yes")){
      return ["Route A"];
    }
  }

  // --- Route B ---
  const meetsRouteB1 =
    !ans102.startsWith("Yes") &&
    !ans103.startsWith("More than 80% efficiency") &&
    getAnswerKey(ans202).startsWith("Yes") &&
    getCritCount(ans202, getQuestionById2(202)!) <= 2 &&
    getAnswerKey(ans204).startsWith("Yes") &&
    getCritCount(ans204, getQuestionById2(204)!) <= 2;;

  // const meetsRouteB2 =
  //   !ans103.startsWith("More than 80% efficiency") &&
  //   getAnswerKey(ans204).startsWith("Yes") &&
  //   getCritCount(ans204, getQuestionById2(204)!) <= 2;  || meetsRouteB2

  if (meetsRouteB1) {
    return ["Route B"];
  }

  // --- Common Pre-conditions for Routes D, E, F, G, H ---
  const meetsComplexRoutePreconditions =
    !ans102.startsWith("Yes") &&
    !ans103.startsWith("More than 80% efficiency") &&
    getAnswerKey(ans202).startsWith("Yes") &&
    getCritCount(ans202, getQuestionById2(202)!) > 2 &&
    getAnswerKey(ans204).startsWith("Yes") &&
    getCritCount(ans204, getQuestionById2(204)!) > 2;

  if (meetsComplexRoutePreconditions) {
    const key201 = getAnswerKey(ans201);
    if (
      key201.startsWith("No staging and no typing.")
      // || key201.startsWith("Uncertain")
    ) {
      return ["Route D"];
    }
    if (key201.startsWith("Yes, both staging and typing.")) {
      return ["Route H"];
    }
    if (key201.startsWith("Yes, only typing.")) {
      return ["Route G"];
    }
    if (key201.startsWith("Yes, only staging.")) {
      const subSelection = ans201.subs?.["Yes, only staging."];
      if (subSelection?.startsWith("Have 2 stages")) {
        return ["Route E"];
      }
      if (subSelection?.startsWith("Have more than 2 stages")) {
        return ["Route F"];
      }
    }
  }

  // If no other route is matched, return an empty array
  return [];
});

const nextQuestion = () => {
  if (!currentQuestion.value) {
    console.error("DEBUG: No current question. Aborting.");
    return;
  }
  const questionId = currentQuestion.value.id;
  const getAnswerKey = (answer: any): string => {
    if (!answer) return "";
    return typeof answer === "object" && answer.selectedOption
      ? answer.selectedOption
      : String(answer);
  };
  const currentAnswer = answers.value[questionId];

  if (questionId === 203 && getAnswerKey(currentAnswer).startsWith("Yes")) {
    const ans102 = getAnswerKey(answers.value[102]);
    const ans103 = getAnswerKey(answers.value[103]);

    const meetsRouteC =
      !ans102.startsWith("Yes") &&
      !ans103.startsWith("More than 80% efficiency");

    if (meetsRouteC) {
      store.setSuggestedRoutes(["Route C"]);
      store.setContradictionStep(1);
      router.push("/contradiction");
      return;
    }
  }

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
      // if (nextQ.id === 203 && !hasSeenContradictionPreamble.value) {
      //   pendingQuestion.value = nextQ;
      //   showContradictionPreamble.value = true;
      //   return;
      // }
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
    if (currentQuestion.value?.id === 207) return null;// <-- ADD THIS LINE

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
      if (currentQuestion.value?.id === 207) return []; // <-- ADD THIS LINE

    if (!currentQuestion.value || !newValue) return;
    const questionId = currentQuestion.value.id;
    const q = currentQuestion.value;

    const newAnswer: { [key: string]: any } = {
      selectedOption: newValue,
    };

    let needsInlineText = String(newValue).includes("___");

    if (hasSubOptions(newValue)) {
      newAnswer.subs = {};
      const mainLabel = getCleanOptionLabel(newValue);
      const subOptions = q.subOptions?.[mainLabel];
      if (subOptions?.some((subOpt) => subOpt.includes("___"))) {
        needsInlineText = true;
      }
    }

    if (hasCritInput(newValue)) {
      needsInlineText = true;
      newAnswer.fileData = {};
    }

    if (needsInlineText) {
      newAnswer.inlineText = {};
    }

    if (hasFileInput(newValue)) {
      newAnswer.fileData = {};
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
  if (!target.files) return;

  // Use a default key for standalone file questions
  const key = optionKey || "main";

  const newFiles = Array.from(target.files);
  const existingAnswer = answers.value[questionId];

  if (typeof existingAnswer !== "object" || existingAnswer === null) return;

  if (!existingAnswer.fileData) existingAnswer.fileData = {};
  if (!existingAnswer.fileData[key])
    existingAnswer.fileData[key] = { files: [] };

  const currentFiles = existingAnswer.fileData[key].files || [];

  if (currentFiles.length + newFiles.length > 3) {
    alert("You can only upload a maximum of 3 files.");
    target.value = "";
    return;
  }

  existingAnswer.fileData[key].files.push(...newFiles);
  answers.value[questionId] = { ...existingAnswer };
};

const removeFile = (
  questionId: number,
  optionKey: string | undefined,
  fileIndex: number
) => {
  const key = optionKey || "main";
  const answer = answers.value[questionId];

  if (answer?.fileData?.[key]?.files) {
    answer.fileData[key].files.splice(fileIndex, 1);
    answers.value[questionId] = { ...answer };
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
      if (value.fileData) {
        Object.values(value.fileData).forEach((fileInfo: any) => {
          if (fileInfo && Array.isArray(fileInfo.files)) {
            fileInfo.files.forEach((file: any) => {
              if (file instanceof File) {
                filesToPass.push({ questionId: id, file: file });
              }
            });
          }
        });
      }

      if (Array.isArray(value.files)) {
        value.files.forEach((file: any) => {
          if (file instanceof File) {
            filesToPass.push({ questionId: id, file: file });
          }
        });
      }
    }
  });

  store.setLiveFiles(filesToPass);

  saveResponsesToStore();
  router.push("/questionnairesResearcher3");
};
onMounted(() => {
  console.log("DEBUG: State of 'answers' object when QuestionnaireResearcher3 LOADS:");
  console.log(JSON.parse(JSON.stringify(store.answers)));
});
const isNextDisabled = computed(() => {
  if (!currentQuestion.value) return true;

  const q = currentQuestion.value;
  const answer = answers.value[q.id];

  if (!answer) return true;


if (q.id === 207) {
    const answer207 = answers.value[207];
    if (typeof answer207 !== 'object' || answer207 === null) return true;
    
    // WHY: This is the fix. We get the list of VALID level options from the
    // question definition first.
    const validLevels = q.levelOptions || [];
    
    // Then, we get the keys from the answer and FILTER them to ensure
    // we only check properties that are actual, valid levels.
    const selectedLevels = Object.keys(answer207).filter(key => validLevels.includes(key));

    // Rule 1: At least one VALID level must be selected.
    if (selectedLevels.length === 0) {
      return true;
    }

    // Now, we loop through the CLEAN list of selected levels.
    for (const level of selectedLevels) {
      const levelData = answer207[level];

      // Rule 2: Inline text for the level must be filled.
      if (!levelData.inlineText || levelData.inlineText.trim() === '') {
        return true;
      }

      // Rule 3: At least one mechanism must be selected.
      if (!levelData.mechanisms || levelData.mechanisms.length === 0) {
        return true;
      }
      
      // Rule 4: If "Inflammation" is selected, its sub-option must be chosen.
      if (levelData.mechanisms.includes('Inflammation||sub')) {
        if (!levelData.subs || !levelData.subs['Inflammation']) {
          return true;
        }
      }
    }
    
    // If all rules pass for all selected levels, the button is enabled.
    return false;
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

      if (hasCritInput(originalOption)) {
        const optionIndex = q.options?.indexOf(originalOption);
        const dropdownValue =
          answer.inlineText?.[`${q.id}-${optionIndex}-select`];
        // Rule 1: Dropdown must be selected
        if (!dropdownValue) return true;

        // Rule 2: All text inputs must be filled
        const listCount = Number(dropdownValue);
        for (let i = 1; i <= listCount; i++) {
          const listInputValue =
            answer.inlineText?.[`${q.id}-${optionIndex}-list-${i}`];
          if (!listInputValue || String(listInputValue).trim() === "")
            return true;
        }

        // Rule 3: A file must be attached
        // const fileData = answer.fileData?.[getCleanOptionLabel(originalOption)];
        // if (!fileData || !fileData.files || fileData.files.length === 0)
        //   return true;
      }

      // if (hasSubOptions(originalOption)) {
      //   const mainLabel = getCleanOptionLabel(originalOption);
      //   const subAnswer = answer.subs?.[mainLabel];
      //   if (!subAnswer || subAnswer.length === 0) return true;
      // }
      if (hasSubOptions(originalOption)) {
        const mainLabel = getCleanOptionLabel(originalOption);
        const subSelection = answer.subs?.[mainLabel];

        // Rule 1: A sub-option must be selected.
        if (!subSelection || subSelection.length === 0) return true;

        // This handles both radio and checkbox sub-options
        const selectedSubOptionString = Array.isArray(subSelection)
          ? subSelection[0]
          : subSelection;

        // Rule 2: If the selected sub-option requires a file, check that it's attached.
        // (This is now optional based on your last request, so this block can be removed if files are not required)
        // if (hasFileInput(selectedSubOptionString)) {
        //     const subLabel = getCleanOptionLabel(selectedSubOptionString);
        //     const fileData = answer.fileData?.[subLabel];
        //     if (!fileData || !fileData.files || fileData.files.length === 0) return true;
        // }

        // Rule 3: If the selected sub-option requires inline text, check if it's filled.
        if (selectedSubOptionString.includes("___")) {
          const subOptions = q.subOptions?.[mainLabel];
          if (subOptions) {
            const optionIndex = q.options?.indexOf(originalOption);
            const subIndex = subOptions.indexOf(selectedSubOptionString);

            if (
              optionIndex !== undefined &&
              subIndex !== undefined &&
              optionIndex > -1 &&
              subIndex > -1
            ) {
              const key = `${q.id}-${optionIndex}-sub-${subIndex}-0`;

              if (!answer.inlineText || !answer.inlineText[key]?.trim()) {
                return true;
              }
            }
          }
        }
      }

      // if (hasFileInput(originalOption)) {
      //   const mainLabel = getCleanOptionLabel(originalOption);
      //   const fileData = answer.fileData?.[mainLabel];
      //   if (!fileData || !fileData.files || fileData.files.length === 0)
      //     return true;
      // }

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

const firstFormSummary = computed(() => {
  return questionnaireData1[0].sections
    .flatMap((s) => s.questions)
    .map((q) => ({ ...q, answer: answers.value[q.id] }))
    .filter(
      (q) => q.answer !== undefined && q.answer !== null && q.answer !== ""
    );
});

const secondFormSummary = computed(() => {
  return props.questionnaire.sections
    .flatMap((s) => s.questions)
    .map((q) => ({ ...q, answer: answers.value[q.id] }))
    .filter(
      (q) => q.answer !== undefined && q.answer !== null && q.answer !== ""
    );
});

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

const formatSubAnswer = (
  question: Question2,
  mainAnswer: any,
  mainOptionKey: string
): string => {
  const subSelection = mainAnswer.subs?.[mainOptionKey];

  // Guard against empty/invalid sub-selections
  if (!subSelection || (Array.isArray(subSelection) && subSelection.length === 0)) {
    return "";
  }

  // WHY: This new block handles the array from your new checkboxes
  if (Array.isArray(subSelection)) {
    return ` (${subSelection.join(", ")})`;
  }

  // This is the existing logic for single-string/radio button sub-options
  if (typeof subSelection === "string") {
    if (subSelection.includes("___")) {
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
  }

  return ""; // Fallback for any other unexpected types
};

interface FormattedCritAnswer {
  label: string;
  count: number;
  criteria: string[];
}
const formatCritAnswer = (
  question: Question2,
  answer: any
): FormattedCritAnswer | null => {
  if (
    !answer ||
    typeof answer !== "object" ||
    !answer.selectedOption ||
    !answer.inlineText ||
    !question.options
  )
    return null;
  const optionIndex = question.options.findIndex(
    (opt) => opt === answer.selectedOption
  );
  if (optionIndex === -1) return null;
  const count = Number(
    answer.inlineText[`${question.id}-${optionIndex}-select`] || 0
  );
  const criteria: string[] = [];
  for (let i = 1; i <= count; i++) {
    criteria.push(
      answer.inlineText[`${question.id}-${optionIndex}-list-${i}`] || "..."
    );
  }
  const label = `${
    answer.selectedOption.split("||")[0]
  } (Number of criteria: ${count})`;
  return { label, count, criteria };
};

const countTotalFiles = (answer: any): number => {
  if (!answer || typeof answer !== "object") return 0;
  let count = 0;
  if (answer.fileData) {
    Object.values(answer.fileData).forEach((fileInfo: any) => {
      if (fileInfo && Array.isArray(fileInfo.files))
        count += fileInfo.files.length;
    });
  }
  if (Array.isArray(answer.files)) count += answer.files.length;
  return count;
};

const formatCheckboxAnswer = (question: Question2, answer: any): string => {
  // This helper is for complex checkboxes, like in Q207
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

const handleSaveDraft = async () => {
  if (isSavingDraft.value) return;
  isSavingDraft.value = true;

  try {
    // --- Step 1 & 2: Process researcher info (same as final submission) ---
    store.processResearcherInfo(answers.value as Record<string, string>);
    let researcherID = store.researcherID;

    // Create researcher if they don't exist yet
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
      if (!researcherResponse.ok)
        throw new Error("Failed to save researcher info for draft");
      researcherID = researcherResult.researcher.id;
      store.setResearcherID(researcherID!);
    }

    // --- Step 3: Gather file information ---
    const newFilesToUpload: { questionId: string; file: File }[] = [];
    const existingFileIds: number[] = [];

    // WHY: This new, combined loop finds BOTH new files and existing files.
    Object.entries(answers.value).forEach(([id, value]) => {
      if (value && typeof value === "object") {
        const processFiles = (files: any[]) => {
          if (files && Array.isArray(files)) {
            files.forEach((file: any) => {
              if (file instanceof File) {
                // Found a NEW file to upload
                newFilesToUpload.push({ questionId: id, file: file });
              } else if (file && file.rehydrated) {
                // Found an EXISTING file to keep
                existingFileIds.push(file.id);
              }
            });
          }
        };

        // Check for files in both possible locations
        if (value.fileData) {
          Object.values(value.fileData).forEach((fileInfo: any) =>
            processFiles(fileInfo.files)
          );
        }
        if (value.files) {
          processFiles(value.files);
        }
      }
    });

    // --- Step 4: Prepare answers payload (same as final submission) ---
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

    // --- Step 5: Create the Response Record with Status -5 ---
    const response = await fetch(`${VITE_API_BASE_URL}/api/response`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        researcher_id: researcherID,
        questionnaire_id: 1,
        answers: otherAnswers,
        status: -5,
        token: store.currentToken,
        // version is no longer needed, backend handles it for drafts
        existing_file_ids: existingFileIds,
        final_route:
          store.suggestedRoutes.length > 0
            ? store.suggestedRoutes.join(", ")
            : "incomplete",
        disease_name: answers.value[1006] || "",
        intervention: answers.value[1007] || "",
        research_context: researchContext,
        confidentiality_level: confidentialityLevel,
        researcher_name: store.researcher.name,
        researcher_email: store.researcher.email,
      }),
    });

    const responseResult = await response.json();
    if (!response.ok)
      throw new Error(responseResult.error || "Failed to save draft");

    draftEditUrl.value = `${window.location.origin}/edit-response/${responseResult.token}`;
    store.setCurrentTokenAndVersion(
      responseResult.token,
      responseResult.version
    );

    // --- Step 6: Upload NEW Files (same as final submission) ---
    const responseID = responseResult.id;
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
      await Promise.all(uploadPromises);
    }

    // --- Step 7: Finalize and show success ---
    await fetch(`${VITE_API_BASE_URL}/api/response/${responseID}/finalize`, {
      method: "POST",
    });

    showDraftModal.value = false;
    showDraftSuccessModal.value = true;
  } catch (err: any) {
    console.error("Error saving draft:", err);
    showDraftModal.value = false;
    showDraftErrorModal.value = true;
  } finally {
    isSavingDraft.value = false;
  }
};

// watch(
//   currentQuestion,
//   (q) => {
//     if (q && q.id === 207) {
//       const currentAnswer = answers.value[207];
//       if (
//         typeof currentAnswer !== "object" ||
//         currentAnswer === null ||
//         !("radioSelection" in currentAnswer)
//       ) {
//         answers.value[207] = {
//           radioSelection: "",
//           checkboxes: [],
//           subs: {},
//           inlineText: {},
//         };
//       }
//     }
//   },
//   { immediate: true }
// );


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
      if (currentQuestion.value?.id === 207) return; // <-- ADD THIS LINE

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

watch(radioSelection, (newSelection, oldSelection) => {
    if (currentQuestion.value?.id === 207) return; 
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
      }
    }
  },
  { deep: true }
);

watch(
  currentQuestion,
  (newQuestion) => {
    if (newQuestion) {
      store.setCurrentQuestionId(newQuestion.id);
    } else {
      store.setCurrentQuestionId(null);
    }
  },
  { immediate: true }
);

onMounted(() => {
    if (currentQuestion.value?.id === 207 && !answers.value[207]) {
        answers.value[207] = {};
    }
});

watch(currentQuestion, (q) => {
    if (q && q.id === 207 && !answers.value[207]) {
        answers.value[207] = {};
    }
});

// ADD THIS NEW WATCHER
watch(
  () => answers.value[207],
  (newAnswer, oldAnswer) => {
    // Safety checks
    if (!newAnswer || !oldAnswer || typeof newAnswer !== 'object' || typeof oldAnswer !== 'object') {
      return;
    }

    // This logic cleans up data when a "Pathogenesis Mechanism" is deselected
    const allLevels = currentQuestion.value?.levelOptions || [];
    
    allLevels.forEach(level => {
      // We only care about levels that exist in the new answer
      if (newAnswer[level]) {
                if (newAnswer[level].mechanisms?.includes('Inflammation||sub') && !Array.isArray(newAnswer[level].subs['Inflammation'])) {
            // If it exists but isn't an array, make it one. If it doesn't exist, create it.
            newAnswer[level].subs['Inflammation'] = [];
        }

        const newMechanisms = newAnswer[level].mechanisms || [];
        const oldMechanisms = oldAnswer[level]?.mechanisms || [];
        
        // Find which mechanisms were deselected
        const deselected = oldMechanisms.filter((mech: string) => !newMechanisms.includes(mech));

        deselected.forEach((deselectedMech: string) => {
          // If "Inflammation" is deselected, remove its sub-answer
          // if (deselectedMech.startsWith('Inflammation') && newAnswer[level].subs?.['Inflammation']) {
          //   delete newAnswer[level].subs['Inflammation'];
          // }
          Object.keys(newAnswer).forEach(levelKey => {
      const levelData = newAnswer[levelKey];
      if (levelData && levelData.mechanisms) {
        
        // WHY: This is the new logic.
        // If "Inflammation" is a selected mechanism and its sub-answer is not an array,
        // we initialize it as an empty array.
        if (levelData.mechanisms.includes('Inflammation||sub') && !Array.isArray(levelData.subs['Inflammation'])) {
          levelData.subs['Inflammation'] = [];
        }
      }
    });
          
          // If "Other" is deselected, remove its inlineText
          // (This is for the future "Other : ___" option you had)
          if (deselectedMech.includes('___') && newAnswer[level].inlineTextOther) {
             delete newAnswer[level].inlineTextOther;
          }
        });
      }
    });
  },
  { deep: true } // "deep: true" is critical for watching nested objects
);

// In QuestionnairesForm2.vue, inside <script setup>

// FOR DEBUGGING ONLY: This will log the entire answer for Q207 whenever it changes.
watch(() => answers.value[207], (newAnswer) => {
    // We use JSON.parse(JSON.stringify(...)) to get a clean, readable copy in the console.
}, { deep: true }); // 'deep: true' is essential to watch for changes inside the object



const handleLevelSelection = (levelOption: string, event: Event) => {
  const isChecked = (event.target as HTMLInputElement).checked;

  // WHY: This is the key change. We create a "deep copy" of the old answer.
  // This ensures that nested objects like 'subs' are not shared between levels.
  const oldAnswer = JSON.parse(JSON.stringify(answers.value[207] || {}));
  
  const validLevels = currentQuestion.value?.levelOptions || [];
  const cleanOldAnswer: { [key: string]: any } = {};
  Object.keys(oldAnswer).forEach(key => {
    if (validLevels.includes(key)) {
      cleanOldAnswer[key] = oldAnswer[key];
    }
  });


  if (isChecked) {
    const newAnswer = {
      ...cleanOldAnswer,
      [levelOption]: {
        inlineText: "",
        mechanisms: [],
        subs: {}
      }
    };
    answers.value[207] = newAnswer;
  } else {
    const newAnswer = { ...cleanOldAnswer };
    delete newAnswer[levelOption];
    answers.value[207] = newAnswer;
  }
};
</script>

<template>
  <!-- <div v-if="showContradictionPreamble" class="questionnaire">
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
  </div>  v-else-->

  <div class="questionnaire">
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
        <div v-if="currentInstruction" class="question-instruction">
          {{ currentInstruction }}
        </div>

        <input
          v-if="currentQuestion.type === 'text'"
          v-model="answers[currentQuestion.id]"
          type="text"
          class="input-text"
        />

        <div v-if="currentQuestion.type === 'files'" class="file-input-wrapper">
          <div class="file-list-container">
            <div
              v-for="(file, index) in answers[currentQuestion.id]?.fileData?.[
                'main'
              ]?.files || []"
              :key="file.name"
              class="file-preview"
            >
              <a
                :href="
                  file.rehydrated
                    ? getFileDownloadUrl(file.id)
                    : createObjectURL(file)
                "
                target="_blank"
                rel="noopener noreferrer"
                class="file-link"
              >
                {{ file.name }}
              </a>
              <button
                @click="removeFile(currentQuestion.id, undefined, index)"
                class="remove-file-btn"
                type="button"
              >
                &times;
              </button>
            </div>
          </div>

          <div
            v-if="
              !answers[currentQuestion.id]?.fileData?.['main']?.files ||
              answers[currentQuestion.id].fileData['main'].files.length < 3
            "
          >
            <input
              type="file"
              multiple
              @change="handleFileChange($event, currentQuestion.id)"
              class="input-file-conditional"
              accept=".pdf,.png,.jpeg,.jpg,.docx,.ppt,.pptx,.xlsx"
            />
            <div class="file-format-text">
              (Max 3 files. Allowed types: pdf, png, jpg, docx, ppt, xlsx)
            </div>
          </div>
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

              <label v-else-if="hasCritInput(option)" class="radio-label">
                <span
                  >{{ getCleanOptionLabel(option) }} (Please select the number
                  of criteria :
                </span>
                <select
                  v-model="
                    inlineInputAnswers[
                      `${currentQuestion.id}-${optionIndex}-select`
                    ]
                  "
                  :disabled="radioSelection !== option"
                  class="inline-select"
                  @click.stop
                >
                  <option disabled value="">Select</option>
                  <option v-for="i in 5" :key="i" :value="i">{{ i }}</option>
                </select>
                <span>)</span>
              </label>

              <label v-else class="radio-label">{{
                getCleanOptionLabel(option)
              }}</label>
            </div>

            <div
              v-if="
                answers[currentQuestion.id]?.selectedOption === option &&
                hasCritInput(option)
              "
              class="dynamic-list-container"
            >
              <div
                v-for="i in Number(
                  inlineInputAnswers[
                    `${currentQuestion.id}-${optionIndex}-select`
                  ] || 0
                )"
                :key="i"
                class="dynamic-list-item"
              >
                <label>{{ i }}.</label>
                <DynamicInlineInput
                  v-model="
                    inlineInputAnswers[
                      `${currentQuestion.id}-${optionIndex}-list-${i}`
                    ]
                  "
                  placeholder="Enter criteria..."
                  :disabled="radioSelection !== option"
                />
              </div>

              <div class="file-input-wrapper">
                <div class="file-list-container">
                  <div
                    v-for="(file, index) in (answers[currentQuestion.id]?.fileData?.[getCleanOptionLabel(option)]?.files || []).filter((f: File | null) => f)"
                    :key="file.name + index"
                    class="file-preview"
                  >
                    <a
                      v-if="file.rehydrated"
                      :href="getFileDownloadUrl(file.id)"
                      target="_blank"
                      class="file-link"
                      >{{ file.name }}</a
                    >
                    <a
                      v-else-if="file instanceof File"
                      :href="createObjectURL(file)"
                      target="_blank"
                      class="file-link"
                      >{{ file.name }}</a
                    >
                    <span
                      v-else-if="file.isNewUnsavedFile"
                      class="unsaved-file-placeholder"
                      >{{ file.name }}</span
                    >
                    <button
                      @click="
                        removeFile(
                          currentQuestion.id,
                          getCleanOptionLabel(option),
                          index
                        )
                      "
                      class="remove-file-btn"
                      type="button"
                    >
                      &times;
                    </button>
                  </div>
                </div>
                <div
                  v-if="
                    !answers[currentQuestion.id]?.fileData?.[
                      getCleanOptionLabel(option)
                    ]?.files ||
                    answers[currentQuestion.id].fileData[
                      getCleanOptionLabel(option)
                    ].files.length < 3
                  "
                >
                  <input
                    type="file"
                    multiple
                    @change="
                      handleFileChange(
                        $event,
                        currentQuestion.id,
                        getCleanOptionLabel(option)
                      )
                    "
                    class="input-file-conditional"
                    accept=".pdf,.png,.jpeg,.jpg,.docx,.ppt,.pptx,.xlsx"
                  />
                  <div class="file-format-text">
                    (Max 3 files. Allowed types: pdf, png, jpg, docx, ppt, xlsx)
                  </div>
                </div>
              </div>
            </div>

            <div v-if="radioSelection === option" class="sub-option-container">
              <div
                v-if="
                  hasSubOptions(option) &&
                  currentQuestion.subOptions &&
                  currentQuestion.subOptions[getCleanOptionLabel(option)]
                "
              >
                <div
                  v-for="(subOpt, subIndex) in currentQuestion.subOptions[
                    getCleanOptionLabel(option)
                  ]"
                  :key="subOpt"
                  class="sub-option-wrapper"
                >
                  <div class="sub-radio-option" style="align-items: center">
                    <input
                      v-if="
                        currentQuestion.subOptionsType?.[
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

                    <label class="radio-label inline-input-label">
                      <span
                        v-for="(part, partIndex) in parseOptionForInline(
                          getCleanOptionLabel(subOpt)
                        )"
                        :key="partIndex"
                      >
                        {{ part }}
                        <DynamicInlineInput
                          v-if="
                            partIndex <
                            parseOptionForInline(getCleanOptionLabel(subOpt))
                              .length -
                              1
                          "
                          v-model="
                            inlineInputAnswers[
                              `${currentQuestion.id}-${optionIndex}-sub-${subIndex}-${partIndex}`
                            ]
                          "
                          :disabled="
                            answers[currentQuestion.id].subs[
                              getCleanOptionLabel(option)
                            ] !== subOpt
                          "
                          @click.stop
                        />
                      </span>
                    </label>
                  </div>

                  <div
                    v-if="
                      answers[currentQuestion.id].subs[
                        getCleanOptionLabel(option)
                      ] === subOpt && hasFileInput(subOpt)
                    "
                    class="file-input-wrapper"
                  >
                    <div class="file-list-container">
                      <div
                        v-for="(file, index) in (answers[currentQuestion.id]?.fileData?.[getCleanOptionLabel(subOpt)]?.files || []).filter((f: File | null) => f)"
                        :key="file.name + index"
                        class="file-preview"
                      >
                        <a
                          v-if="file.rehydrated"
                          :href="getFileDownloadUrl(file.id)"
                          target="_blank"
                          class="file-link"
                          >{{ file.name }}</a
                        >
                        <a
                          v-else-if="file instanceof File"
                          :href="createObjectURL(file)"
                          target="_blank"
                          class="file-link"
                          >{{ file.name }}</a
                        >
                        <span
                          v-else-if="file.isNewUnsavedFile"
                          class="unsaved-file-placeholder"
                          >{{ file.name }}</span
                        >
                        <button
                          @click="
                            removeFile(
                              currentQuestion.id,
                              getCleanOptionLabel(subOpt),
                              index
                            )
                          "
                          class="remove-file-btn"
                          type="button"
                        >
                          &times;
                        </button>
                      </div>
                    </div>
                    <div
                      v-if="
                        !answers[currentQuestion.id]?.fileData?.[
                          getCleanOptionLabel(subOpt)
                        ]?.files ||
                        answers[currentQuestion.id].fileData[
                          getCleanOptionLabel(subOpt)
                        ].files.length < 3
                      "
                    >
                      <input
                        type="file"
                        multiple
                        @change="
                          handleFileChange(
                            $event,
                            currentQuestion.id,
                            getCleanOptionLabel(subOpt)
                          )
                        "
                        class="input-file-conditional"
                        accept=".pdf,.png,.jpeg,.jpg,.docx,.ppt,.pptx,.xlsx"
                      />
                      <div class="file-format-text">
                        (Max 3 files. Allowed types: pdf, png, jpg, docx, ppt,
                        xlsx)
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div v-if="hasFileInput(option)" class="file-input-wrapper">
                <div class="file-list-container">
                  <div
                    v-for="(file, index) in (answers[currentQuestion.id]?.fileData?.[getCleanOptionLabel(option)]?.files || []).filter((f: any) => f)"
                    :key="file.name + index"
                    class="file-preview"
                  >
                    <a
                      v-if="file.rehydrated"
                      :href="
                        file.rehydrated
                          ? getFileDownloadUrl(file.id)
                          : createObjectURL(file)
                      "
                      target="_blank"
                      rel="noopener noreferrer"
                      class="file-link"
                    >
                      {{ file.name }}
                    </a>
                    <a
                      v-else-if="file instanceof File"
                      :href="createObjectURL(file)"
                      target="_blank"
                      rel="noopener noreferrer"
                      class="file-link"
                    >
                      {{ file.name }}
                    </a>
                    <span
                      v-else-if="file.isNewUnsavedFile"
                      class="unsaved-file-placeholder"
                    >
                      {{ file.name }}
                    </span>

                    <button
                      @click="
                        removeFile(
                          currentQuestion.id,
                          getCleanOptionLabel(option),
                          index
                        )
                      "
                      class="remove-file-btn"
                      type="button"
                    >
                      &times;
                    </button>
                  </div>
                </div>

                <div
                  v-if="
                    !answers[currentQuestion.id]?.fileData?.[
                      getCleanOptionLabel(option)
                    ]?.files ||
                    answers[currentQuestion.id].fileData[
                      getCleanOptionLabel(option)
                    ].files.length < 3
                  "
                >
                  <input
                    type="file"
                    multiple
                    @change="
                      handleFileChange(
                        $event,
                        currentQuestion.id,
                        getCleanOptionLabel(option)
                      )
                    "
                    class="input-file-conditional"
                    accept=".pdf,.png,.jpeg,.jpg,.docx,.ppt,.pptx,.xlsx"
                  />
                  <div class="file-format-text">
                    (Max 3 files. Allowed types: pdf, png, jpg, docx, ppt, xlsx)
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <!-- <div
          v-else-if="currentQuestion.type === 'checkbox'"
          class="checkbox-group"
          :data-question-id="currentQuestion.id"
        >
          <div
            v-for="(option, index) in currentQuestion.options"
            :key="index"
            class="checkbox-option-container"
          >
            <h4 v-if="index === 0" class="option-group-title">
              Site of Disease Development
            </h4>
            <h4
              v-if="
                parseOption(option).type === 'checkbox' &&
                index > 0 &&
                currentQuestion?.options?.[index - 1] &&
                parseOption(currentQuestion.options[index - 1]).type === 'radio'
              "
              class="option-group-title"
            >
              Pathogenesis Mechanisms
            </h4>
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
        </div> -->
        <div
          v-else-if="currentQuestion.type === 'checkbox'"
          class="checkbox-group"
        >
          <template v-if="currentQuestion.id === 207">
            <p class="level-selection-prompt">
              Please select the Site of Disease Development
            </p>

            <div
              v-for="(levelOpt, levelIndex) in currentQuestion.levelOptions"
              :key="levelOpt"
              class="level-container"
            >
              <div class="option-item">
                <input
                  type="checkbox"
                  :checked="answers[207] && answers[207][levelOpt]"
                  @change="handleLevelSelection(levelOpt, $event)"
                  class="checkbox-input"
                />
                <!-- <label class="checkbox-label inline-input-label">
                  <span>{{ levelOpt.split("___")[0] }}</span>
                  <template v-if="answers[207] && answers[207][levelOpt]">
                    <DynamicInlineInput
                      v-model="answers[207][levelOpt].inlineText"
                    />
                  </template>
                  <template v-else>
                    <DynamicInlineInput :modelValue="''" :disabled="true" />
                  </template>
                  <span>{{ levelOpt.split("___")[1] || "" }}</span>
                </label> -->
                <label class="checkbox-label inline-input-label">
  <span class="level-label-text">{{ levelOpt.split('___')[0] }}</span>
  <template v-if="answers[207] && answers[207][levelOpt]">
    <DynamicInlineInput
      v-model="answers[207][levelOpt].inlineText"
    />
  </template>
  <template v-else>
      <DynamicInlineInput
      :modelValue="''"
      :disabled="true"
      />
  </template>
  <span>{{ levelOpt.split('___')[1] || '' }}</span>
</label>
              </div>

              <div
                v-if="answers[207] && answers[207][levelOpt]"
                class="mechanisms-panel"
              >
                <h5 class="option-group-title">Pathogenesis Mechanisms</h5>
                <div
                  v-for="mechOpt in currentQuestion.mechanismOptions"
                  :key="mechOpt"
                  class="mechanism-item"
                >
                  <div class="option-item">
                    <input
                      type="checkbox"
                      :value="mechOpt"
                      v-model="answers[207][levelOpt].mechanisms"
                      class="checkbox-input"
                    />
                    <label class="checkbox-label inline-input-label">
                      {{ getCleanOptionLabel(mechOpt.split("___")[0]) }}
                      <template
                        v-if="
                          mechOpt.includes('___') &&
                          answers[207][levelOpt].mechanisms.includes(mechOpt)
                        "
                      >
                        <DynamicInlineInput
                          v-model="answers[207][levelOpt].inlineTextOther"
                        />
                      </template>
                      <template v-else-if="mechOpt.includes('___')">
                        <DynamicInlineInput :modelValue="''" :disabled="true" />      
                      </template>
                    </label>
                  </div>

                  <div
                    v-if="
                      mechOpt.startsWith('Inflammation') &&
                      answers[207][levelOpt].mechanisms.includes(mechOpt)
                    "
                    class="sub-options-panel"
                  >
                    <div
                      v-for="subOpt in currentQuestion.subOptions?.[
                        'Inflammation'
                      ]"
                      :key="subOpt"
                      class="sub-option"
                    >
                      <input
                        type="checkbox"
                        :name="`q207-${levelIndex}-inflammation-sub`"
                        :value="subOpt"
                        v-model="answers[207][levelOpt].subs['Inflammation']"
                        class="checkbox-input"
                      />
                      <label class="checkbox-label">{{ subOpt }}</label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </template>

          <template v-else>
            <div
              v-for="option in currentQuestion.options"
              :key="option"
              class="checkbox-option"
            >
              <input
                type="checkbox"
                :value="option"
                v-model="checkboxModel"
                class="checkbox-input"
              />
              <label class="checkbox-label">{{ option.split("||")[0] }}</label>
            </div>
          </template>
        </div>
      </div>

      <div class="btn-container">
        <button type="button" class="back-btn" @click="prevQuestion">
          Back
        </button>
        <button type="submit" class="next-btn" :disabled="isNextDisabled">
          Next
        </button>
        <button type="button" class="draft-btn" @click="showDraftModal = true">
          Save Draft
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
    <div v-if="showDraftModal" class="modal-overlay">
      <div class="modal-content draft-summary">
        <h3 class="modal-title">Save Draft</h3>
        <p>
          This will save your current progress. You will receive a unique link
          to continue later. Your answered questions are summarized below:
        </p>

        <div class="draft-summary-content">
          <div v-if="firstFormSummary.length > 0" class="summary-section">
            <div
              v-for="section in questionnaireData1[0].sections"
              :key="section.name"
            >
              <h4 class="summary-section-title">{{ section.name }}</h4>
              <div
                v-for="q in firstFormSummary.filter((item) =>
                  section.questions.some((sq) => sq.id === item.id)
                )"
                :key="q.id"
                class="summary-item"
              >
                <h5>{{ q.question }}:</h5>

                <p v-if="q.id === 1004" class="summary-answer">
                  {{
                    typeof q.answer === "string"
                      ? formatPhoneNumber(q.answer)
                      : q.answer
                  }}
                </p>

                <p v-else class="summary-answer">{{ q.answer }}</p>
              </div>
            </div>
          </div>

          <div v-if="secondFormSummary.length > 0" class="summary-section">
            <h4>Questionnaire Answers</h4>
            <div
              v-for="q in secondFormSummary"
              :key="q.id"
              class="answer-block"
            >
              <label class="question-label">{{ q.question }}</label>
              <div class="answer-text">
                <template v-if="typeof q.answer === 'string'">
                  <span class="answer-prefix">Answer : </span>
                  {{ q.answer.split("||")[0] }}
                </template>
                <template
                  v-else-if="q.options?.some((opt) => opt.includes('||crit'))"
                >
                  <template v-if="q.answer.inlineText">
                    <div>
                      <span class="answer-prefix">Answer : </span
                      >{{ formatCritAnswer(q, q.answer)?.label }}
                    </div>
                    <ol>
                      <li
                        v-for="item in formatCritAnswer(q, q.answer)?.criteria"
                      >
                        {{ item }}
                      </li>
                    </ol>
                  </template>
                  <template v-else
                    ><span class="answer-prefix">Answer : </span
                    >{{ q.answer.selectedOption.split("||")[0] }}</template
                  >
                </template>
<template v-else-if="q.id === 207 && q.answer">
    <div v-for="(levelData, levelName) in q.answer" :key="levelName" class="q207-summary-level">
        <span class="answer-prefix">Site of Disease Development - </span><strong> {{ String(levelName).split('___')[0] }}</strong>
        <span v-if="levelData.inlineText"> {{ levelData.inlineText }}</span>
        
        <div v-if="levelData.mechanisms && levelData.mechanisms.length > 0" class="q207-part">
            <span class="answer-prefix">Pathogenesis Mechanisms</span>
            <ul class="mechanism-list">
                <li v-for="mechanism in levelData.mechanisms" :key="mechanism">
                    {{ getCleanOptionLabel(mechanism) }}
                    <!-- <template v-if="mechanism.startsWith('Inflammation') && levelData.subs?.['Inflammation']">
                        ({{ levelData.subs['Inflammation'] }})
                    </template> -->
                    <template v-if="mechanism.startsWith('Inflammation') && levelData.subs?.['Inflammation']">
                        <template v-if="Array.isArray(levelData.subs['Inflammation'])">
    <ul class="sub-mechanism-list">
        <li v-for="sub in levelData.subs['Inflammation']" :key="sub">
            {{ sub }}
        </li>
    </ul>                        </template>
                        <template v-else>
                            ({{ levelData.subs['Inflammation'] }})
                        </template>
                    </template>
                     <template v-if="mechanism.includes('___') && levelData.inlineTextOther">
                       : {{ levelData.inlineTextOther }}
                    </template>
                </li>
            </ul>
        </div>
    </div>
</template>
                <template v-else-if="q.answer.selectedOption">
                  <span class="answer-prefix">Answer : </span>
                  {{ getConstructedAnswer(q, q.answer) }}
                  <span v-for="(subAnswer, key) in q.answer.subs" :key="key">
                    {{ formatSubAnswer(q, q.answer, String(key)) }}
                  </span>
                </template>
                <template v-else>{{ JSON.stringify(q.answer) }}</template>

                <div
                  v-if="countTotalFiles(q.answer) > 0"
                  style="margin-top: 8px"
                >
                  <strong>Attached Files:</strong>
                  <ul>
                    <template
                      v-for="(fileInfo, key) in q.answer.fileData"
                      :key="key"
                    >
                      <li v-for="file in fileInfo.files" :key="file.name">
                        <a
                          v-if="file.rehydrated"
                          :href="getFileDownloadUrl(file.id)"
                          target="_blank"
                          rel="noopener noreferrer"
                          >{{ file.name }}</a
                        >
                        <a
                          v-else-if="file instanceof File"
                          :href= "createObjectURL(file)"
                          target="_blank"
                          rel="noopener noreferrer"
                          >{{ file.name }}</a
                        >
                        <span v-else-if="file.isNewUnsavedFile">{{
                          file.name
                        }}</span>
                      </li>
                    </template>

                    <template v-for="file in q.answer.files">
                      <li v-for="file in q.answer.files" :key="file.name">
                        <a
                          v-if="file.rehydrated"
                          :href="getFileDownloadUrl(file.id)"
                          target="_blank"
                          rel="noopener noreferrer"
                          >{{ file.name }}</a
                        >
                        <a
                          v-else-if="file instanceof File"
                          :href= "createObjectURL(file)"
                          target="_blank"
                          rel="noopener noreferrer"
                          >{{ file.name }}</a
                        >
                        <span v-else-if="file.isNewUnsavedFile">{{
                          file.name
                        }}</span>
                      </li>
                    </template>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="modal-buttons">
          <button
            @click="showDraftModal = false"
            class="modal-btn cancel-btn"
            :disabled="isSavingDraft"
          >
            Cancel
          </button>
          <button
            @click="handleSaveDraft"
            class="modal-btn confirm-btn"
            :disabled="isSavingDraft"
          >
            {{ isSavingDraft ? "Saving..." : "Confirm & Save" }}
          </button>
        </div>
      </div>
    </div>

    <div v-if="showDraftSuccessModal" class="modal-overlay">
      <div class="modal-content">
        <h3 class="modal-title">Draft Saved Successfully!</h3>
        <p>
          Please copy and save this link to continue your questionnaire later.
          You can now continue filling out the form.
        </p>
        <div class="edit-url-box">
          <input type="text" :value="draftEditUrl" readonly />
        </div>
        <div class="modal-buttons-center">
          <button
            @click="showDraftSuccessModal = false"
            class="modal-btn confirm-btn"
          >
            Close
          </button>
        </div>
      </div>
    </div>

    <div v-if="showDraftErrorModal" class="modal-overlay">
      <div class="modal-content">
        <h3 class="modal-title">Error</h3>
        <p>
          There was a problem saving your draft. Please check your connection
          and try again.
        </p>
        <div class="modal-buttons-center">
          <button
            @click="showDraftErrorModal = false"
            class="modal-btn cancel-btn"
          >
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
  align-items: center;
  margin: 12px 0px;
  gap: 10px;
  accent-color: #eb4648;
  cursor: pointer;
}

.checkbox-input {
  accent-color: #eb4648;
  cursor: pointer;
  margin-top: 12px;
}

.radio-input{
  accent-color: #eb4648;
  cursor: pointer;
  margin-top: 8px;
}

.btn-container {
  display: flex;
  margin-top: 40px;
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

.next-btn {
  background-color: #eb4648;
  color: white;
}

.next-btn:hover {
  background-color: #c9302c;
}

.back-btn:disabled {
  cursor: not-allowed;
}
.next-btn:disabled {
  background-color: #eb46496b;
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

.file-input-wrapper {
  margin-left: 30px;
  margin-top: 0;
}

.file-preview {
  display: flex;
  align-items: center;
  gap: 10px;
}

.file-link {
  color: #007bff;
  text-decoration: none;
  font-weight: 500;
}

.file-link:hover {
  text-decoration: underline;
}

.remove-file-btn {
  font-size: 36px;
  color: #eb4648;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  line-height: 1;
}

.file-format-text {
  margin-top: 8px;
  font-style: italic;
  font-size: 14px;
  color: #6c757d;
}
.sub-radio-option input,
.sub-checkbox-option input {
  margin-top: 8px;
}

.checkbox-option-container {
  display: block;
  width: 100%;
}

.option-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  width: 100%;
}

.sub-options-panel {
  padding-left: 42px;
  margin-top: 8px;
}

.sub-option {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
  font-size: 16px;
}

.option-group-title {
  color: #374151;
  margin-top: 1.5rem;
  margin-bottom: 0.5rem;
  padding-bottom: 0.25rem;
  border-bottom: 1px solid #e5e7eb;
}

.file-list-container {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.input-file-conditional {
  display: block;
  margin-top: 0.5rem;
}

.unsaved-file-placeholder {
  color: #6b7280;
  font-style: italic;
  text-decoration: none;
}

.dynamic-list-container {
  margin-left: 42px;
  padding: 0 1rem;
}

.dynamic-list-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.dynamic-list-item label {
  font-size: 18px;
  color: #333;
}

.dynamic-list-container .file-input-wrapper {
  margin-top: 1rem;
}

.question-instruction {
  font-style: italic;
  color: #6c757d;
  font-size: 16px;
  margin: 0 0 0.5rem 32px;
  white-space: pre-wrap;
  line-height: 1.6;
}

.draft-btn {
  height: 100%;
  width: 120px; /* A bit wider */
  padding: 8px;
  border: 1px solid #fbbf24; /* Amber/Yellow */
  background-color: #fffbeb;
  color: #d97706;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
}
.draft-btn:hover {
  background-color: #fef3c7;
}

/* Styles for the new modals */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
}
.modal-content {
  background: white;
  border-radius: 8px;
  padding: 2rem;
  width: 90%;
  max-width: 1000px;
  text-align: left;
}
.modal-title {
  font-size: 1.5rem;
  margin-bottom: 1rem;
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
  padding: 0.5rem 1rem;
  border-radius: 4px;
  border: none;
  cursor: pointer;
}
.cancel-btn {
  background-color: #e5e7eb;
}
.confirm-btn {
  background-color: #eb4648;
  color: white;
}

/* Styles for the draft summary modal */
.draft-summary {
  max-height: 80vh;
  display: flex;
  flex-direction: column;
}
.draft-summary-content {
  flex-grow: 1;
  overflow-y: auto;
  border-top: 1px solid #eee;
  border-bottom: 1px solid #eee;
  padding: 1rem 0;
}
.summary-item {
  margin-bottom: 8px;
  margin-left: 16px;
}
.summary-item strong {
  display: block;
}
.summary-item p {
  margin: 0 0 0 0;
  color: #555;
  font-style: italic;
}
.edit-url-box input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  background-color: #f8f9fa;
  font-family: monospace;
}

.summary-answer {
  margin: 0 0 0 0;
  color: #555;
  font-style: italic;
  white-space: pre-wrap;
}
.summary-answer ol {
  margin: 0.5rem 0 0 1rem;
}
.summary-answer ul {
  margin: 0.5rem 0 0 1rem;
  list-style-type: disc;
}
.summary-section-title {
  margin-bottom: 16px;
}

/* --- Styles for the Draft Modal Summary (mimicking Q3) --- */
.draft-summary-content .summary-section {
  margin-top: 1.5rem;
}
.draft-summary-content .summary-section:first-child {
  margin-top: 0;
}
.draft-summary-content h4 {
  font-weight: 600;
  color: #444;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #eee;
}
.draft-summary-content .answer-block {
  margin-bottom: 1.5rem;
}
.draft-summary-content .question-label {
  font-size: 1rem;
  font-weight: 500;
  color: #333;
  margin-bottom: 0.5rem;
  display: block;
}
.draft-summary-content .answer-text {
  font-size: 0.95rem;
  color: #555;
  padding-left: 1rem;
  white-space: pre-wrap;
  word-wrap: break-word;
}
.draft-summary-content .answer-prefix {
  color: #d84315;
  font-weight: 500;
}
.draft-summary-content ol,
.draft-summary-content ul {
  margin: 0.5rem 0 0 1.5rem;
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

.level-container {
  margin-bottom: 1.5rem;
  padding-bottom: 1.5rem;
}
.level-container:last-child {
  border-bottom: none;
}
.mechanisms-panel {
  padding-left: 42px; /* Indent mechanisms under their level */
  margin-top: 1rem;
}
.mechanism-item {
  margin-bottom: 0.5rem;
}

.level-selection-prompt {
  color: #555;
  margin: 0 0 1rem 0px;
}

/* Find this existing class */
.level-container {
  margin-bottom: 1.5rem;
  padding-bottom: 1.5rem;
  /* WHY: 4. Remove the border to get rid of the separator lines */
  /* border-bottom: 1px solid #e5e7eb; */
}

/* This existing class should also be updated to a smaller font-size if needed */
.option-group-title {
  color: #374151;
  margin-top: 1.5rem;
  margin-bottom: 0.5rem;
  padding-bottom: 0.25rem;
  font-size: 1.1rem; /* Adjust size as needed */
}

/* Find the existing .inline-input-label rule and modify it */
.inline-input-label {
  display: flex;         /* Use Flexbox for alignment */
  align-items: center;   /* Vertically center the items */
  width: 100%;           /* Make the label take up all available space */
}

/* Add this new rule for the label text */
.level-label-text {
  flex-grow: 1;          /* Allows the text to take up all free space */
  /* text-align: right;     Aligns the text to the right */
  margin-right: 0.5rem;  /* Adds a small gap before the input box */
  max-width: 9%;
}

/* Add this new rule to give the inline input a fixed width */
.inline-input-label .dynamic-input {
  width: 250px; /* Adjust this value as needed */
  flex-shrink: 0; /* Prevents the input from shrinking */
}

.q207-summary-level {
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #eee;
}
.q207-summary-level:last-child {
  border-bottom: none;
  padding-bottom: 0;
  margin-bottom: 0;
}

.sub-mechanism-list {
  padding-left: 1rem;
  list-style-type: circle;
  font-style: italic;
  color: #555;
}
</style>
