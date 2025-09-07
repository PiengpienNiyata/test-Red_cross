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

<h3>Step 2: Fill in the general information</h3>

<ul>
  <template v-for="item in step2Instructions" :key="item.id">
    <li v-if="!item.isGroup" class="instruction-item">
      <span>{{ instructions1[item.id] }}</span>
    </li>
    <li v-else class="instruction-item">
      <span>{{ item.groupTitle }}</span>
      <ul>
        <li v-for="subId in item.groupItems" :key="subId">
          {{ instructions1[subId] }}
        </li>
      </ul>
    </li>
  </template>
</ul>

<p style="font-style: italic; margin-top: 2rem; color: #555;">
  Note: These instructions will also appear at the end of each relevant question as you fill out the form.
</p>

<div class="btn-container">
  </div>

<div v-for="section in instructionSections" :key="section.title">
  <h3>{{ section.title }}</h3>
  <ul>
    <li v-for="q in section.questions" :key="q.id" class="instruction-item">
      <strong>{{ q.label }}:</strong>
      <span>{{ instructions2[q.id]?.substring(1).trim() }}</span>
    </li>
  </ul>
</div>

<p style="font-style: italic; margin-top: 2rem; color: #555;">
  Note: These instructions will also appear at the end of each relevant question as you fill out the form.
</p>
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
import { instructions as instructions1 } from '@/stores/instructions1';
import { instructions as instructions2 } from '@/stores/instructions2';


const router = useRouter();
const goBack = () => {
  router.push("/instruction-1");
};
const goToNext = () => {
  router.push("/glossary");
};


const step2Instructions = [
  { id: 1007 },
  { id: 1006 },
  { 
    id: 1008,
    isGroup: true,
    groupTitle: "Describe research questions in terms of:",
    groupItems: [1008, 1009, 1010]
  },
  { 
    id: 1011,
    isGroup: true,
    groupTitle: "Describe molecular signaling principle in terms of:",
    groupItems: [1011, 1012, 1013]
  },
];

const instructionSections = [
  {
    title: 'Step 3: Complete Section A – Intervention-Related Information',
    questions: [
      { id: 101, label: 'A-1' },
      { id: 102, label: 'A-2' },
      { id: 103, label: 'A-3' },
      { id: 104, label: 'A-4' },
      { id: 105, label: 'A-5' },
    ]
  },
  {
    title: 'Step 4: Complete Section B – Disease-Related Information',
    questions: [
      { id: 201, label: 'B-1' },
      { id: 202, label: 'B-2' },
      { id: 203, label: 'B-3' },
      { id: 204, label: 'B-4' },
      { id: 205, label: 'B-5' },
      { id: 206, label: 'B-6' },
      { id: 207, label: 'B-7' },
    ]
  }
];

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

 /* Add this new style */
.instruction-item {
  white-space: pre-wrap; /* This preserves newlines from your data */
  word-wrap: break-word;
  margin-bottom: 1rem; /* Adds some space between each instruction */
}
.instruction-item span {
  padding-left: 0.5rem;
}
</style>
