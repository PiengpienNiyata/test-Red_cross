<template>
  <div class="instruction-container">
    <div class="instruction-content">
  <h2>Full workshop</h2>

  <h3>What is RIRM?</h3>
  <p>
    The Remission Therapy Inquiry-Based Research Model (RIRM) is a research
    framework centered on investigation and problem-solving to achieve
    disease remission. Unlike traditional research approaches that present
    information or solutions upfront, this model begins with scenarios,
    questions, and challenges, guiding researchers to systematically explore
    the molecular and clinical requirements necessary for true molecular
    remission. By shifting the focus beyond symptom management to cellular
    normalization, researchers can aim for an 80% or higher remission
    success rate in precision therapy.
  </p>
  <h3>RIRM Workshop or self-assessment</h3>
  <p><strong>Instructions for Completing the RIRM Questionnaire Form</strong></p>
  <p>Please fill out the RIRM Questionnaire or review a previously completed form.</p>
  <p>The form is designed to gather critical information across Fields A-1 to B-7 which is essential for initiating the extrapolation process—a method aimed at identifying the originating cell type and initial signal responsible for disease evolution after birth.</p>

  <h3>RIRM Questionnaire</h3>
  <p>
    RIRM questionnaire is composed of 3 sections:
  </p>
  <ol>
    <li>General Information</li>
    <li>
      Section A – Treatment/ Intervention-Related Information (Fields A-1 to A-5)
    </li>
    <li>
      Section B – Disease-Related Information (Fields B-1 to B-7)
    </li>
  </ol>
  <p>
    The form is designed to gather critical information across Fields A-1 to B-7 which is
    essential for initiating the extrapolation process—a method aimed at
    identifying the originating cell type and initial signal responsible for
    disease evolution after birth, thereby
    allowing precise reversal targeting.
  </p>

  <div class="btn-container">
    <button @click="goToNext" class="next-btn">Next</button>
  </div>
</div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
const router = useRouter();
const goToNext = () => {
  router.push('/instruction-2');
};
</script>

<style scoped>
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

p, ol {
  line-height: 1.7;
  margin-bottom: 1rem;
}
ol {
  padding-left: 2rem;
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
}
.next-btn:hover {
  background-color: #c9302c;
}
</style>