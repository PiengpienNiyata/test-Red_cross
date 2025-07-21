<script setup lang="ts">
import { ref, onMounted } from 'vue';
import ResponseDisplay from '@/components/ResponseDisplay.vue';
import { VITE_API_BASE_URL } from '@/stores/config';

const submissions = ref<any[]>([]);
const isLoading = ref(true);

onMounted(async () => {
  try {
    const res = await fetch(`${VITE_API_BASE_URL}/api/submissions`);
    if (!res.ok) throw new Error('Failed to fetch data');
    submissions.value = await res.json();
  } catch (error) {
    console.error("Error fetching submissions:", error);
  } finally {
    isLoading.value = false;
  }
});
</script>

<template>
  <div class="dashboard-page">
    <h2>Submissions Dashboard</h2>
    <div v-if="isLoading">Loading data...</div>
    <div v-else-if="submissions.length === 0">No submissions found.</div>
    <div v-else>
      <div v-for="researcher in submissions" :key="researcher.id" class="researcher-card">
        <h3>{{ researcher.name }} - {{ researcher.project_name }}</h3>
        <div v-if="researcher.responses && researcher.responses.length > 0">
          <ResponseDisplay 
            v-for="response in researcher.responses" 
            :key="response.id"
            :response="response" 
          />
        </div>
        <div v-else>
          <p>No responses submitted for this researcher.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.dashboard-page {
  padding: 16px;
}
.researcher-card {
  background-color: #f9f9f9;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
}
</style>