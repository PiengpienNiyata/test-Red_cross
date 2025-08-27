<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import { useQuestionnaireStore } from "@/stores/useQuestionnaireStore";
import { questionnaireData } from "@/stores/questionnaires1";
import { toRefs } from "vue";
import GlossaryModal from "@/components/GlossaryModal.vue";
import { instructions } from "@/stores/instructions1";

const store = useQuestionnaireStore();
const questionnaire = ref(questionnaireData[0]);
const router = useRouter();
const { answers } = toRefs(store);

const warningModal = ref(false);
const missingQuestions = ref<number[]>([]);
const invalidQuestions = ref<number[]>([]);
const completeAnswer = ref(true);
const invalidForm = ref(true);

const isGlossaryVisible = ref(false);

const openGlossaryModal = () => {
  isGlossaryVisible.value = true;
};

const closeGlossaryModal = () => {
  isGlossaryVisible.value = false;
};

const isFormValid = computed(() => {
  invalidQuestions.value = [];

  return questionnaire.value.sections.every((section) =>
    section.questions.every((q) => {
      const answer = answers.value[q.id];

      if (q.type === "radio" && (answer === undefined || answer === "")) {
        invalidQuestions.value.push(q.id);
        return false;
      }

      if (!answer || (Array.isArray(answer) && answer.length === 0)) {
        invalidQuestions.value.push(q.id);
        return false;
      }

      if (
        typeof answer === "string" &&
        answer.trim().length < 3 &&
        q.id <= 1007
      ) {
        invalidQuestions.value.push(q.id);
        return false;
      }

      if (q.id === 1005 && typeof answer === "string") {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(answer)) {
          invalidQuestions.value.push(q.id);
          return false;
        }
      }

      if (q.id === 1004 && typeof answer === "string") {
        const phoneRegex = /^(?:02|05)\d{7,8}$|^(0[689])\d{8}$/;
        if (!phoneRegex.test(answer)) {
          invalidQuestions.value.push(q.id);
          return false;
        }
      }

      return true;
    })
  );
});

// const highlightErrors = () => {
//   document
//     .querySelectorAll(".error-border")
//     .forEach((el) => el.classList.remove("error-border"));

//   [...missingQuestions.value, ...invalidQuestions.value].forEach((id) => {
//     const inputElement =
//       document.querySelector(`input[data-question-id="${id}"]`) ||
//       document.querySelector(`.radio-group[data-question-id="${id}"]`) ||
//       document.querySelector(`.checkbox-group[data-question-id="${id}"]`);

//     if (inputElement) {
//       inputElement.classList.add("error-border");
//     }
//   });
// };

const highlightErrors = () => {
  document
    .querySelectorAll(".error-border")
    .forEach((el) => el.classList.remove("error-border"));

  [...missingQuestions.value, ...invalidQuestions.value].forEach((id) => {
    const inputElement = document.querySelector(
      `input[data-question-id="${id}"]`
    );
    const radioGroup = document.querySelector(
      `.radio-group[data-question-id="${id}"]`
    );
    const checkboxGroup = document.querySelector(
      `.checkbox-group[data-question-id="${id}"]`
    );

    if (inputElement) inputElement.classList.add("error-border");
    if (radioGroup && radioGroup.parentElement) {
      radioGroup.parentElement.classList.add("error-border");
    }
    if (checkboxGroup && checkboxGroup.parentElement) {
      checkboxGroup.parentElement.classList.add("error-border");
    }
  });
};

const scrollToFirstError = () => {
  const firstErrorId =
    missingQuestions.value.length > 0
      ? missingQuestions.value[0]
      : invalidQuestions.value[0];

  if (!firstErrorId) return;

  const firstErrorElement =
    document.querySelector(`input[data-question-id="${firstErrorId}"]`) ||
    document.querySelector(
      `.radio-group[data-question-id="${firstErrorId}"]`
    ) ||
    document.querySelector(
      `.checkbox-group[data-question-id="${firstErrorId}"]`
    );
  if (firstErrorElement) {
    firstErrorElement.scrollIntoView({ behavior: "smooth", block: "center" });
  }
};

// const validateForm = () => {
//   missingQuestions.value = [];
//   invalidQuestions.value = [];

//   const optionalQuestionIds = [1008, 1009, 1010, 1011, 1012, 1013];

//   missingQuestions.value = questionnaire.value.sections
//     .flatMap((section) => section.questions)
//     .filter((q) => {
//         // --- THIS IS THE KEY CHANGE ---
//         // If the question is in our optional list, don't check if it's missing.
//         if (optionalQuestionIds.includes(q.id)) {
//             return false;
//         }

//         // For all other questions, perform the original check.
//         return !answers.value[q.id] ||
//                String(answers.value[q.id]).trim() === "" ||
//                (Array.isArray(answers.value[q.id]) && answers.value[q.id].length === 0);
//     })
//     .map((q) => q.id);

//   invalidQuestions.value = questionnaire.value.sections
//     .flatMap((section) => section.questions)
//     .filter((q) => {
//       const answer = answers.value[q.id];

//       if (q.type === "radio" && (answer === undefined || answer === ""))
//         return true;
//       if (!answer || (Array.isArray(answer) && answer.length === 0))
//         return true;
//       if (typeof answer === "string" && answer.trim().length < 3 && q.id <= 1007)
//         return true;

//       if (q.id === 1002 && typeof answer === "string") {
//         const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//         return !emailRegex.test(answer);
//       }

//       if (q.id === 1004 && typeof answer === "string") {
//         const phoneRegex = /^(?:02|05)\d{7,8}$|^(0[689])\d{8}$/;
//         return !phoneRegex.test(answer);
//       }

//       return false;
//     })
//     .map((q) => q.id);

//   completeAnswer.value = missingQuestions.value.length === 0;
//   invalidForm.value = invalidQuestions.value.length === 0;

//   if (!isFormValid.value) {
//     highlightErrors();
//     scrollToFirstError();
//     warningModal.value = true;
//   } else {
//     saveAnswers();
//   }
// };

const validateForm = () => {
  missingQuestions.value = [];
  invalidQuestions.value = [];

  const optionalQuestionIds = [1008, 1009, 1010, 1011, 1012, 1013];

  const allQuestions = questionnaire.value.sections.flatMap(
    (section) => section.questions
  );

  allQuestions.forEach((q) => {
    const answer = answers.value[q.id];

    // --- STEP 1: Check if the question is MISSING ---
    // (Only for non-optional questions)
    const isMissing =
      !answer ||
      String(answer).trim() === "" ||
      (Array.isArray(answer) && answer.length === 0);
    if (isMissing && !optionalQuestionIds.includes(q.id)) {
      missingQuestions.value.push(q.id);
      return; // No need to check for invalid format if it's missing
    }

    // --- STEP 2: Check if the answer is INVALID ---
    // (This runs for all questions that have an answer)
    if (answer) {
      if (
        typeof answer === "string" &&
        answer.trim().length < 3 &&
        q.id <= 1007
      ) {
        invalidQuestions.value.push(q.id);
      }
      if (q.id === 1005 && typeof answer === "string") {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(answer)) invalidQuestions.value.push(q.id);
      }
      if (q.id === 1004 && typeof answer === "string") {
        // We check the unformatted number here
        const phoneRegex = /^(?:02|05)\d{7,8}$|^(0[689])\d{8}$/;
        if (!phoneRegex.test(answer)) invalidQuestions.value.push(q.id);
      }
    }
  });

  // --- STEP 3: Final decision ---
  if (missingQuestions.value.length > 0 || invalidQuestions.value.length > 0) {
    highlightErrors();
    scrollToFirstError();
    warningModal.value = true;
  } else {
    saveAnswers();
  }
};

const closeWarningModal = () => {
  warningModal.value = false;
  setTimeout(() => {
    scrollToFirstError();
  }, 100);
};

const saveAnswers = () => {
  // Create a temporary copy of the answers to modify
  const answersToSave = { ...answers.value };

  // Define the IDs of the optional questions
  const optionalQuestionIds = [1008, 1009, 1010, 1011, 1012, 1013];

  // Loop through the optional questions
  optionalQuestionIds.forEach((id) => {
    // If the answer is missing, blank, or just whitespace, set it to "N/A"
    if (!answersToSave[id] || String(answersToSave[id]).trim() === "") {
      answersToSave[id] = "N/A";
    }
  });

  // Save the modified answers object to the store
  store.setAnswers(answersToSave);
  router.push("/questionnairesResearcher2");
};

const initializeAnswers = () => {
  questionnaire.value.sections.forEach((section) => {
    section.questions.forEach((q) => {
      if (q.type === "checkbox" && !Array.isArray(answers.value[q.id])) {
        answers.value[q.id] = [];
      }
      if (q.type === "radio" && !answers.value[q.id]) {
        answers.value[q.id] = "";
      }
    });
  });
};

// Add this computed property to your script

const formattedPhoneNumber = computed({
  // GET: Takes the raw number from the store and adds spaces for display
  get() {
    const rawNumber = answers.value[1004];
    if (!rawNumber) return "";
    const cleaned = String(rawNumber).replace(/\D/g, ""); // Remove non-digits

    // Format for 10-digit mobile numbers (0xx-xxx-xxxx)
    if (cleaned.length === 10) {
      return cleaned.replace(/(\d{3})(\d{3})(\d{4})/, "$1 $2 $3");
    }
    // Format for 9-digit Bangkok numbers (0x-xxx-xxxx)
    if (cleaned.length === 9) {
      return cleaned.replace(/(\d{2})(\d{3})(\d{4})/, "$1 $2 $3");
    }

    return rawNumber; // Return as-is if it doesn't match
  },
  // SET: Takes the formatted input from the user and saves only the numbers
  set(newValue) {
    answers.value[1004] = String(newValue).replace(/\D/g, "");
  },
});

onMounted(() => {
  initializeAnswers();
});
</script>

<template>
  <div class="questionnaire">
    <h3 v-if="questionnaire.title !== 'null'" class="title">
      {{ questionnaire.title }}
    </h3>

    <form @submit.prevent="validateForm" class="form-container">
      <div
        v-for="section in questionnaire.sections"
        :key="section.name"
        class="section"
      >
        <h4 v-if="section.name !== 'null'" class="section-title">
          {{ section.name }}
        </h4>

        <div class="row">
          <div
            v-for="q in section.questions ?? []"
            :key="q.id"
            :class="{
              'col-md-6':
                q.id === 1001 ||
                q.id === 1002 ||
                q.id === 1003 ||
                q.id === 1004 ||
                q.id === 1005,
              'col-md-12': q.id === 1003 || q.id === 1006 || q.id === 1007,
              'no-margin': q.id === 1001 || q.id === 1002 || q.id === 1003,
              'padding-left': q.id === 1001 || q.id === 1004,
              'padding-right': q.id === 1002 || q.id === 1005,
            }"
            class="question-container"
          >
            <div class="label-wrapper">
              <label class="question-label">{{ q.question }}</label>
              <span
                v-if="[1001, 1002, 1003, 1004, 1005, 1006, 1007].includes(q.id)"
                class="optional-remark"
              >
                <span class="asterisk">*</span>
              </span>
            </div>
            <div v-if="instructions[q.id]" class="question-instruction">
              {{ instructions[q.id] }}
            </div>
            <!-- phone input -->
            <input
              v-if="q.type === 'text' && q.id === 1004"
              v-model="formattedPhoneNumber"
              :placeholder="q.question"
              type="tel"
              class="input-text"
              :data-question-id="q.id"
              :class="{
                'error-border': invalidQuestions.includes(q.id),
              }"
            />

            <!-- Text Input -->
            <input
              v-if="q.type === 'text' && q.id !== 1004"
              v-model="answers[q.id]"
              :placeholder="q.question"
              type="text"
              class="input-text"
              :data-question-id="q.id"
              :class="{
                'error-border':
                  missingQuestions.includes(q.id) ||
                  invalidQuestions.includes(q.id),
              }"
            />

            <!-- Radio Button Group -->
            <div
              v-else-if="q.type === 'radio'"
              class="radio-group"
              :data-question-id="q.id"
            >
              <div
                v-for="option in q.options"
                :key="option"
                class="radio-option"
              >
                <input
                  type="radio"
                  :name="'q' + q.id"
                  :value="option"
                  v-model="answers[q.id]"
                  class="radio-input"
                />
                <label class="radio-label">{{ option }}</label>
              </div>
            </div>

            <!-- Checkbox Group -->
            <div
              v-else-if="q.type === 'checkbox'"
              class="checkbox-group"
              :data-question-id="q.id"
            >
              <div
                v-for="option in q.options"
                :key="option"
                class="checkbox-option"
              >
                <input
                  type="checkbox"
                  :value="option"
                  v-model="answers[q.id]"
                  class="checkbox-input"
                />
                <label class="checkbox-label">{{ option }}</label>
              </div>
            </div>

            <!-- text area Input -->
            <textarea
              v-else-if="q.type === 'textarea'"
              v-model="answers[q.id]"
              :placeholder="q.question"
              class="input-textarea"
              :data-question-id="q.id"
              :class="{
                'error-border':
                  missingQuestions.includes(q.id) ||
                  invalidQuestions.includes(q.id),
                'padding-left': q.id === 1011 || q.id === 1012 || q.id === 1013,
              }"
            ></textarea>
          </div>
        </div>
      </div>

      <button type="submit" class="submit-btn">Next</button>
      <span>
        <a
          class="gls-btn"
          @click="openGlossaryModal"
          style="color: #eb4648; cursor: pointer"
        >
          Show all glossary
        </a>
      </span>

      <GlossaryModal
        :isVisible="isGlossaryVisible"
        @close="closeGlossaryModal"
      />
    </form>

    <div v-if="warningModal" class="modal">
      <div class="modal-content">
        <h3 v-if="missingQuestions.length > 0" class="noti">
          Please answer all questions before proceeding.
        </h3>
        <h3 v-else-if="invalidQuestions.length > 0" class="noti">
          Please enter the correct information.
        </h3>

        <ul v-if="invalidQuestions.length > 0"></ul>

        <button @click="closeWarningModal" class="close-btn">Close</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.questionnaire {
  padding-left: 16px;
  padding-right: 16px;
}

.question-container {
  margin-top: 8px;
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

.noti {
  font-weight: 400;
  font-size: 20px;
}

.padding-right {
  padding-right: 16px !important;
}

.question-label {
  font-size: 18px;
  /* display: block;
  padding: 8px; */
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

.input-textarea {
  font-size: 18px;
  margin-bottom: 24px;
  width: 100%;
  min-height: 96px;
  padding: 8px;
  border: 1px solid #a4a4a4;
  border-radius: 4px;
  resize: none;

  /* This is the magic property */
  field-sizing: content;
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
  width: 144px;
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

.error-border {
  border: 2px solid #eb4648 !important;
  border-radius: 4px;
}

.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
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
}

.close-btn {
  margin-top: 10px;
  padding: 8px 16px;
  background: #eb4648;
  color: white;
  border: none;
  cursor: pointer;
}

/* For text inputs: Highlight only the box */
input.error-border {
  border: 2px solid #eb4648 !important;
  border-radius: 4px;
}

/* For radio and checkbox questions: Highlight the entire question block */
.radio-group.error-border,
.checkbox-group.error-border {
  border: 2px solid #eb4648 !important;
  padding: 10px;
  border-radius: 6px;
}

.optional-remark {
  display: inline; /* This brings it onto the same line as the label */
  font-size: 24px;
  color: #6c757d;
  margin-left: 4px;
}

.optional-remark .asterisk {
  color: #eb4648; /* Your theme's red color */
}
.label-wrapper {
  display: flex;
  align-items: baseline; /* Vertically aligns the text nicely */
  padding: 8px; /* Move padding from the label to the wrapper */
}
.question-instruction {
  font-style: italic;
  color: #6c757d; /* A lighter grey color */
  font-size: 16px;
  margin: 0 0 0.5rem 4px; /* Adds space around the instruction */
  /* padding: 12px; */
  /* background-color: #f8f9fa; A very light grey background */
  /* border-left: 3px solid #dee2e6; A subtle left accent border */
  white-space: pre-wrap; /* This is critical for showing the line breaks */
  line-height: 1.6;
}
</style>
