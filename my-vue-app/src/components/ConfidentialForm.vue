<script setup lang="ts">
import { ref, watch, computed } from "vue";
import { useQuestionnaireStore } from "@/stores/useQuestionnaireStore";
import { questionnaireData } from "@/stores/Confidential";
import type { Question2 } from "@/stores/Confidential";
import { toRefs } from "vue";

const store = useQuestionnaireStore();
const { answers } = toRefs(store);

const question = ref<Question2>(questionnaireData[0].sections[0].questions[0]);

const hasSubOptions = (option: string): boolean => {
  if (!question.value.subOptions) return false;
  return Object.prototype.hasOwnProperty.call(
    question.value.subOptions,
    option
  );
};

const initialSelection = answers.value[3001]?.selectedOption || null;
const localSelection = ref(initialSelection);

watch(localSelection, (newValue) => {
  if (!newValue) {
    delete answers.value[3001];
    return;
  }

  if (hasSubOptions(newValue)) {
    answers.value[3001] = {
      selectedOption: newValue,
      subs: {
        [newValue]: answers.value[3001]?.subs?.[newValue] || null,
      },
    };
  } else {
    answers.value[3001] = newValue;
  }
});
</script>

<template>
  <div>
    <p>
      <strong>Instructions:</strong> Please read the following guidelines to
      select the appropriate confidentiality level in the next section.
    </p>

    <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
      <thead>
        <tr style="background: #ffdddd">
          <th
            style="
              border: 1px solid #ccc;
              padding: 8px;
              text-align: left;
              font-weight: bold;
            "
          >
            Level
          </th>
          <th
            style="
              border: 1px solid #ccc;
              padding: 8px;
              text-align: left;
              font-weight: bold;
            "
          >
            What must be known (minimum evidence)
          </th>
          <th
            style="
              border: 1px solid #ccc;
              padding: 8px;
              text-align: left;
              font-weight: bold;
            "
          >
            Practical meaning for study design
          </th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td style="border: 1px solid #ccc; padding: 8px; text-align: left">
            1 – Single-axis knowledge
          </td>
          <td style="border: 1px solid #ccc; padding: 8px; text-align: left">
            Either (a) core disease mechanism or (b) how the intervention
            affects the originating cell type
          </td>
          <td style="border: 1px solid #ccc; padding: 8px; text-align: left">
            You can frame a question, but you still need confirmation
          </td>
        </tr>
        <tr>
          <td style="border: 1px solid #ccc; padding: 8px; text-align: left">
            2 – Cross-verification
          </td>
          <td style="border: 1px solid #ccc; padding: 8px; text-align: left">
            Both (a) and (b) above, showing that the same cell type / pathway
            links disease and intervention
          </td>
          <td style="border: 1px solid #ccc; padding: 8px; text-align: left">
            Strong rationale for a pilot / adaptive Phase I–II to quantify
            effect size, dose, biomarkers.
          </td>
        </tr>
        <tr>
          <td style="border: 1px solid #ccc; padding: 8px; text-align: left">
            3 – Principle-anchored confirmation
          </td>
          <td style="border: 1px solid #ccc; padding: 8px; text-align: left">
            Level 2 evidence plus validation against fundamental biological
            principles (e.g., evolutionary conservation, pathway redundancy
            tests, orthogonal models)
          </td>
          <td style="border: 1px solid #ccc; padding: 8px; text-align: left">
            Evidence is solid enough for a traditional Phase IIb–III or pivotal
            trial aimed at high-precision remission targets.
          </td>
        </tr>
      </tbody>
    </table>
    <ul>
      <li>
        If the treatment <strong>couldn't reach any remission</strong> of
        category → choose "<strong>Symptomatic treatment</strong>".
      </li>
      <li>
        If the treatment <strong>could reach remission</strong> but need
        additional control to prevent future symptoms → choose "
        <strong>Remission and control of the disease</strong>" also provide
        level of the remission part.
      </li>
    </ul>
  </div>

  <div class="confidential-form-container">
    <label class="question-label">{{ question.question }}</label>

    <div class="radio-group">
      <div
        v-for="option in question.options"
        :key="option"
        class="option-wrapper"
      >
        <div class="radio-option">
          <input
            type="radio"
            :name="'q' + question.id"
            :value="option"
            v-model="localSelection"
            class="radio-input"
          />
          <label class="radio-label">{{ option }}</label>
        </div>

        <div
          v-if="localSelection === option && hasSubOptions(option)"
          class="sub-option-container"
        >
          <div class="sub-radio-group">
            <div
              v-for="subOpt in question.subOptions![option]"
              :key="subOpt"
              class="radio-option"
            >
              <input
                type="radio"
                :name="'sub-q-' + option"
                :value="subOpt"
                v-model="answers[question.id].subs[option]"
                class="radio-input"
              />
              <label class="radio-label">{{ subOpt }}</label>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Scoped styles to avoid affecting other components */
.question-label {
  font-size: 18px;
  font-weight: 500;
  color: #333;
  margin-bottom: 8px;
}
.radio-group,
.sub-radio-group {
  display: flex;
  flex-direction: column;
}
.option-wrapper {
  margin: 6px 0;
}
.radio-option {
  font-size: 16px;
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 6px 0;
}
.radio-input {
  accent-color: #eb4648;
  cursor: pointer;
}
.sub-option-container {
  margin-left: 30px;
  padding-left: 15px;
  border-left: 2px solid #f0f0f0;
}
</style>
