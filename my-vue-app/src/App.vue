<template>
  <div class="app-container">
    <Header />

    <div class="content-wrapper">
      <div class="content-section">
        <h1 class="section-title" v-if="isAdminDashboard">
          Reviewer's Dashboard
        </h1>
        <h1 class="section-title" v-else-if="isReviewPage">
          Researcher's Response
        </h1>
        <h1 class="section-title" v-else-if="isInstruction">
          Introduction for Researcher
        </h1>
        <h1 class="section-title" v-else-if="!isLoginPage">
          Questionnaire for Researcher
        </h1>
        
        <div class="content-body" :class="{ 'center-content': isLoginPage }">
          <Sidebar v-if="!isLoginPage" />
          <div
            class="page-content"
            ref="pageContent"
            :class="{ 'full-width': isLoginPage }"
          >
            <router-view />
          </div>
        </div>
      </div>
    </div>
    <div v-if="isSessionExpiredModalVisible" class="session-modal-overlay">
      <div class="session-modal-content">
        <h3>Session Expired</h3>
        <p>Your session has expired. Please log in again to continue.</p>
        <button @click="handleLogoutAndRedirect" class="relogin-btn">
          Login
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import Sidebar from "@/components/Sidebar.vue";
import Header from "@/components/Header.vue";
import "@/assets/main.css";
import { computed, ref, onMounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useQuestionnaireStore } from "@/stores/useQuestionnaireStore";
import { jwtDecode } from "jwt-decode"; // <-- IMPORT DECODER

const pageContent = ref<HTMLElement | null>(null);
const route = useRoute();
const router = useRouter();
const store = useQuestionnaireStore(); // <-- GET THE STORE INSTANCE

const isInstruction = computed(() => {
  return ["Instruction1", "Instruction2", "Glossary"].includes(
    route.name as string
  );
});

// --- NEW STATE FOR SESSION MODAL ---
const isSessionExpiredModalVisible = ref(false);
let sessionTimeout: number | undefined;

// --- NEW SESSION MANAGEMENT FUNCTIONS ---
const handleLogoutAndRedirect = () => {
  store.clearAuthToken();
  clearTimeout(sessionTimeout);
  isSessionExpiredModalVisible.value = false;
  router.push("/login");
};

const startSessionTimer = (token: string) => {
  try {
    const decoded: { exp: number } = jwtDecode(token);
    const expirationTime = decoded.exp * 1000; // Convert to milliseconds
    const currentTime = Date.now();
    const timeoutDuration = expirationTime - currentTime;

    if (timeoutDuration <= 0) {
      // Token is already expired
      isSessionExpiredModalVisible.value = true;
      return;
    }

    // Set a timer to show the modal just as the token expires
    sessionTimeout = setTimeout(() => {
      isSessionExpiredModalVisible.value = true;
    }, timeoutDuration);
  } catch (error) {
    console.error("Failed to decode token, logging out.", error);
    handleLogoutAndRedirect();
  }
};

const clearSessionTimer = () => {
  clearTimeout(sessionTimeout);
};

// --- WATCHER TO START/STOP TIMER BASED ON TOKEN ---
watch(
  () => store.authToken,
  (newToken, oldToken) => {
    if (newToken && newToken !== oldToken) {
      clearSessionTimer();
      startSessionTimer(newToken);
    }
    if (!newToken && oldToken) {
      clearSessionTimer();
    }
  },
  { immediate: true }
); // `immediate: true` runs the watcher on component load

// --- EXISTING LOGIC ---
const isLoginPage = computed(() => route.name === "AdminLogin");
const isReviewPage = computed(() => route.path === "/Review");
const isAdminDashboard = computed(() => route.path === "/admin/dashboard");

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
  /* This allows the sidebar and content to stretch to their full height. */
  align-items: stretch;
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

.page-content.full-width {
  width: 100%;
  max-height: none;
  overflow: visible;
  padding-bottom: 0;

  /* ADD THESE LINES to center the content (the login page) */
  /* display: flex;
  justify-content: center;
  align-items: center; */
}

.session-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
}

.session-modal-content {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  text-align: center;
  max-width: 400px;
}

.session-modal-content h3 {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 1rem;
}

.session-modal-content p {
  margin-bottom: 2rem;
  color: #4b5563;
}

.relogin-btn {
  width: 100%;
  padding: 0.75rem;
  border: none;
  border-radius: 4px;
  background-color: #eb4648;
  color: white;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
}
</style>
