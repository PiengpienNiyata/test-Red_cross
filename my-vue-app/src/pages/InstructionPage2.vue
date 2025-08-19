<template>
  <div class="instruction-container">
    <div class="instruction-content">
      <h2>Part-1: Instructions for Filling Out the RIRM Questionnaire</h2>

      <h3>Step 1: Understand questions about the purpose</h3>
      <ul>
        <li>
          Carefully review each question and understand its intent before
          answering.
        </li>
        <li>
          Carefully review the glossary thoroughly before answering the
          questions to ensure accurate understanding of the terms.
        </li>
      </ul>

      <h3>Step 2: Fill in general information</h3>
      <ul>
        <li>Specify the personal information.</li>
        <li>
          Identify the disease under investigation, or the target disease for
          the intended intervention.
        </li>
        <li>
          Specify the intended intervention being studied, or the most promising
          intervention for the disease of interest.
        </li>
        <li>
          Describe research questions in terms of:
          <ul>
            <li>
              <strong>Principle:</strong> What is the conceptual or logical
              foundation behind your research question? Why is this question
              important to ask?
            </li>
            <li>
              <strong>Factual Statement:</strong> What is already known,
              observed, or published related to this question?
            </li>
            <li>
              <strong>Implication:</strong> If this question is answered, what
              could it lead to in terms of understanding or therapeutic
              application?
            </li>
          </ul>
        </li>
        <li>
          Describe molecular signaling principle in terms of:
          <ul>
            <li>
              <strong>Principle:</strong> What general signaling mechanism or
              rule does this pathway follow (e.g., receptor activation, cascade,
              feedback)?
            </li>
            <li>
              <strong>Factual Statement:</strong> What evidence supports this
              pathway's activity or role (e.g., experimental data, literature)?
            </li>
            <li>
              <strong>Implication:</strong> Why is this signaling important?
              What are the biological or therapeutic consequences if it is
              altered?
            </li>
          </ul>
        </li>
      </ul>

       <h3>Step 3: Complete Section A – Intervention-Related Information</h3>
      <ul>
        <li>
          <strong>A-1:</strong> Describe the molecular mechanism of the
          selected intervention.
        </li>
        <li>
          <strong>A-2:</strong> Indicate whether the expected remission
          efficiency of the designated intervention is approximately 80%.
        </li>
        <li>
          <strong>A-3:</strong> Provide any reported therapeutic efficacy (or
          remission rate, if available) of the intervention.
        </li>
        <li>
          <strong>A-4:</strong> Provide evidence suggesting that the selected
          treatment/intervention is effective across all clinical types of the
          disease—supporting the hypothesis that these types share a common
          molecular pathway, and differ only by initial triggers(s).
        </li>
        <li>
          <strong>A-5:</strong> Evaluate whether the response time of the
          intervention is significantly shorter than the national resolution
          time.
        </li>
      </ul>

      <h3>Step 4: Complete Section B – Disease-Related Information</h3>
      <ul>
        <li>
          <strong>B-1:</strong> Based on your understanding of the disease's
          molecular signaling mechanisms (e.g., autocrine, paracrine, endocrine
          interactions), how many distinct cell types are involved in
          initiating or driving the disease process? (Refer to Glossary:
          Autocrine / Paracrine / Endocrine signaling)
          <ul>
            <li>
              <strong>B-1.1:</strong> Before answering, refer to the glossary on
              “Molecular Stages” and “Molecular Types.” If more than one cell
              type contributes to disease development, consider whether their
              involvement reflects a disease progression (molecular stages), a
              trigger-specific differentiation (molecular types), or neither.
            </li>
            <li>
              <strong>B-1.2:</strong> If the disease doesn’t include both
              molecular stages and types (see B-1.1), do any contradictions
              exist in their natural courses? For example, do some lesions
              appear self-limiting while others are progressive? If such
              contradictions exist, consider whether the disease should be
              separated into distinct conditions and revise your answers
              accordingly.
            </li>
          </ul>
        </li>
        <li>
          <strong>B-2:</strong> Refer to A-4 answer, please state the
          diagnostic criteria used for the disease, particularly if the chosen
          intervention is likely to induce remission.
        </li>
        <li>
          <strong>B-3:</strong> Please assess whether the remission criteria
          for this disease are clearly defined—either clinically, molecularly,
          or both. Refer to the glossary entry for “Remission.”
          <p style="margin-top: 0.5rem; margin-bottom: 0.5rem">Select one:</p>
          <ul class="checkbox-list">
            <li>◻ Yes — Both molecular and clinical remission criteria are clearly defined</li>
            <li>◻ Yes — Clinical remission is defined, but molecular remission remains uncertain</li>
            <li>◻ No — Remission criteria are not clearly defined</li>
            <li>◻ No — Originating cell is unknown, so molecular remission cannot be assessed</li>
          </ul>
        </li>
        <li>
          <strong>B-4:</strong> Please indicate whether a natural endpoint
          timeframe for the disease is known. This refers to the typical time it
          takes for the disease to reach resolution or plateau without
          intervention. Understanding this timeframe is essential for
          determining whether a remission is stable and exceeds the disease’s
          natural course (see Glossary: Remission).
        </li>
        <li>
          <strong>B-5:</strong> Review the glossary. If the molecular cascade
          matches all diagnostic criteria, select “completed”. You may select
          multiple options if endocrine pathways are involved; otherwise, select
          only one.
        </li>
        <li>
          <strong>B-6:</strong> Multiple mechanisms may be selected
          corresponding to symptoms and signs of the designated disease.
        </li>
      </ul>

      <h3>Step 5: Verify Information</h3>
      <ul>
        <li>
          Review all the information that has been entered to ensure it is
          complete and accurate. This step is important to confirm that all
          details are correct before proceeding.
        </li>
      </ul>

      <h3>Step 6: Steps of Extrapolation</h3>
      <ul>
        <li>
          The system will select the route based on the information submitted.
        </li>
      </ul>

      <div class="btn-container">
        <button @click="goBack" class="back-btn">Back</button>

        <button @click="goToNext" class="next-btn">Next</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from "vue-router";
const router = useRouter();
const goBack = () => {
  router.push("/instruction-1");
};
const goToNext = () => {
  router.push("/glossary");
};
</script>

<style scoped>
/* You can copy the exact same styles from InstructionPage1.vue for consistency */
.instruction-container {
  padding: 2rem;
  display: flex;
  justify-content: center;
}
.instruction-content {
  /* max-width: 800px; */
  width: 100%;
}
/* h2 {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 2rem;
  text-align: center;
} */
h3 {
  font-size: 1.25rem;
  /* font-weight: 600; */
  margin-top: 2rem;
  margin-bottom: 1rem;
  border-bottom: 1px solid #eee;
  padding-bottom: 0.5rem;
}

.title {
  font-size: 24px;
  font-weight: 500;
  color: #333;
  margin-bottom: 8px;
}
.subtitle {
  font-size: 16px;
  color: #555;
  margin-bottom: 24px;
}

ul {
  line-height: 1.7;
  margin-bottom: 1rem;
  padding-left: 2rem;
  list-style-type: disc;
}
ul ul {
  list-style-type: circle;
  margin-top: 0.5rem;
}
.nav-buttons {
  margin-top: 2rem;
  display: flex;
  justify-content: space-between;
}
.nav-btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 500;
  background-color: #eb4648;
  color: white;
}

.btn-container {
  margin-top: 40px;
  margin-bottom: 20px;
  text-align: left;
}
.next-btn {
  height: 100%;
  width: 144px;
  background-color: #eb4648;
  color: white;
  padding: 10px;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
  /* margin-right: 8px; */
}
.next-btn:hover {
  background-color: #c9302c;
}

.back-btn {
  height: 100%;
  width: 144px;
  padding: 8px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  background-color: white;
  color: #eb4648;
  border: 1px solid #eb4648;
  margin-right: 8px;
}
.back-btn:hover {
  background-color: #c9302c;
}

/* .nav-btn-secondary {
  padding: 0.75rem 1.5rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 500;
  background-color: #f9fafb;
  color: #374151;
} */
</style>
