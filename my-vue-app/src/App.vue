<template>
  <div class="app-container">
    <Header />

    <div class="content-wrapper">
      <div class="content-section">
        <h1 class="section-title" v-if="isAdminDashboard">Reviewer's Dashboard</h1>
        <h1 class="section-title" v-else-if="isReviewPage">Researcher's Response</h1>
        <h1 class="section-title" v-else>Questionnaire for Researcher</h1>

        <div class="content-body">
          <Sidebar />
          <div class="page-content" ref="pageContent">
            <router-view />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>


<script setup lang="ts">
import Sidebar from "@/components/Sidebar.vue";
import Header from "@/components/Header.vue";
import "@/assets/main.css";
import { computed, ref, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const pageContent = ref<HTMLElement | null>(null);
const route = useRoute();
const router = useRouter();

const isReviewPage = computed(() => route.path === '/Review');
const isAdminDashboard = computed(() => route.path === '/admin/dashboard');

watch(
  () => route.path,
  () => {
    if (pageContent.value) {
      pageContent.value.scrollTop = 0;
    }
  }
);
</script>

<style scoped>
.app-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
}

.content-wrapper {
  max-height: calc(100vh - 20px);
  box-shadow: 0px 0px 2px 0px #00000040;
  border-radius: 8px;
  margin: 26px 24px 63px 24px;
  display: flex;
  flex-direction: column;
}

.section-title {
  color: #000;
  display: flex;
  margin: 16px 24px;
  padding-top: 8px;
  padding-bottom: 8px;
  font-size: 20px;
  font-weight: 400;
  line-height: 24px;
  border-bottom: 1px dashed #ccc;
}

.content-section {
  display: flex;
  flex-direction: column;
}

.content-body {
  display: flex;
  width: 100%;
  align-items: flex-start;

}

.sidebar {
  height: calc(100vh - 250px);
  width: 230px;
  background-color: #fff;
  border-right: 1px dashed #ccc;
}

.page-content {
  flex: 1;
  background-color: #fff;
  overflow-y: auto;
  overflow-x: hidden;
  max-height: calc(100vh - 250px);
  padding-bottom: 20px;
}
</style>
