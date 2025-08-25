<script setup lang="ts">
import { useQuestionnaireStore } from '@/stores/useQuestionnaireStore';
import { useRouter } from 'vue-router';

const store = useQuestionnaireStore();
const router = useRouter();

// This function will be called by the button to proceed to the summary
const goToSummary = () => {
  router.push('/questionnairesResearcher3');
}
</script>

<template>
  <div class="contradiction-page">
    <h2>Contradiction Identified (Route C)</h2>
    <p>
      Your responses indicate a significant contradiction within the diagnostic criteria for the disease.
      This suggests that what is currently defined as one disease may, in fact, be a collection of distinct conditions.
    </p>
    <p>
      Proceeding with the current data is not recommended. Further research is required to resolve this contradiction
      before a precision therapeutic strategy can be explored.
    </p>
    <button @click="goToSummary" class="next-btn">Continue to Summary</button>
  </div>
</template>

<style scoped>
.contradiction-page {
  padding: 2rem;
  max-width: 800px;
  margin: 0 auto;
  border: 1px solid #ffab91;
  background-color: #fbe9e7;
  border-radius: 8px;
}
h2 {
  color: #d84315;
  margin-bottom: 1rem;
}
p {
  line-height: 1.6;
  margin-bottom: 1rem;
}
.next-btn {
  height: 100%;
  width: auto;
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  background-color: #eb4648;
  color: white;
  margin-top: 1rem;
}
.next-btn:hover {
  background-color: #c9302c;
}
</style>