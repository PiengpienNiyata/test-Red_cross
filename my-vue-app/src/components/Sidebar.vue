<template>
  <div class="sidebar d-flex flex-column">
    <template v-if="isAdminDashboard">
      <div class="status-filter">
        <div
          v-for="status in statusOptions"
          :key="status.value"
          class="status-item"
          :class="{
            'active-status':
              String($route.query.status || '') === String(status.value),
          }"
          @click="filterByStatus(status.value)"
        >
          <span>{{ status.text }}</span>
        </div>
      </div>
      <div class="sidebar-footer">
        <button @click="openLogoutConfirmModal" class="dashboard-btn">
          Logout
        </button>
      </div>
    </template>
    <template v-else-if="isReviewPage">
      <div class="version-history">
        <div
          v-for="item in store.versionHistory"
          :key="item.version"
          class="version-item"
          :class="{ 'active-version': store.currentVersion === item.version }"
          @click="selectVersion(item)"
        >
          <span>Version {{ item.version }}</span>
          <small>{{ new Date(item.submitted_at).toLocaleDateString() }}</small>
        </div>
      </div>
      <div class="sidebar-footer">
        <button @click="goToDashboard" class="dashboard-btn">Dashboard</button>
      </div>
    </template>
    <div v-else-if="isFetchingPage" class="version-history"></div>

    <template v-else-if="isInstruction">
      <div class="sidebar-item">
        <div
          class="sidebar-item-2"
          :style="{
            color: isActive('/instruction-1') ? '#EB4648' : '#A4A4A4',
          }"
        >
          <img
            :src="isActive('/instruction-1') ? icon1 : icon2"
            alt="icon"
            class="icon"
          />
          <span style="text-align: center">What is RIRM?</span>
        </div>
      </div>
      <div class="divider"></div>

      <div class="sidebar-item">
        <div
          class="sidebar-item-2"
          :style="{
            color: isActive('/instruction-2') ? '#EB4648' : '#A4A4A4',
          }"
        >
          <img
            :src="isActive('/instruction-2') ? icon1 : icon2"
            alt="icon"
            class="icon"
          />
          <span style="text-align: center"
            >Instructions for<br />Filling Out <br />the RIRM
            Questionnaire</span
          >
        </div>
      </div>
      <div class="divider"></div>

      <div class="sidebar-item">
        <div
          class="sidebar-item-2"
          :style="{
            color: isActive('/glossary') ? '#EB4648' : '#A4A4A4',
          }"
        >
          <img
            :src="isActive('/glossary') ? icon4 : icon3"
            alt="icon"
            class="icon"
          />
          <span style="display: inline-block; width: 80px; text-align: center"
            >Important Glossary</span
          >
        </div>
      </div>
    </template>

    <template v-else-if="isContradiction">
      <div class="sidebar-item">
        <div
          class="sidebar-item-2"
          :style="{
            color: contradictionStep === 1 ? '#EB4648' : '#A4A4A4',
          }"
        >
          <img
            :src="contradictionStep === 1 ? icon1 : icon2"
            alt="icon"
            class="icon"
          />
          <span style="text-align: center">Contradiction Identified</span>
        </div>
      </div>
      <div class="divider"></div>

      <div class="sidebar-item">
        <div
          class="sidebar-item-2"
          :style="{
            color: contradictionStep === 2 ? '#EB4648' : '#A4A4A4',
          }"
        >
          <img
            :src="contradictionStep === 2 ? icon4 : icon3"
            alt="icon"
            class="icon"
          />
          <span style="text-align: center">Restudy Questionnaire </span>
        </div>
      </div>
    </template>

    <template v-else>
      <div class="sidebar-item">
        <div
          class="sidebar-item-2"
          :style="{
            color: isActive('/questionnairesResearcher')
              ? '#EB4648'
              : '#A4A4A4',
          }"
        >
          <img
            :src="isActive('/questionnairesResearcher') ? icon1 : icon2"
            alt="icon"
            class="icon"
          />
          <span style="text-align: center">General Information</span>
        </div>
      </div>
      <div class="divider"></div>

      <div class="sidebar-item">
        <div
          class="sidebar-item-2"
          :style="{ color: isSectionA_Active ? '#EB4648' : '#A4A4A4' }"
        >
          <img
            :src="isSectionA_Active ? icon1 : icon2"
            alt="icon"
            class="icon"
          />
          <span style="text-align: center"
            >Section A<br />Treatment/ Intervention-Related
            <br />Information</span
          >
        </div>
      </div>
      <div class="divider"></div>
      <div class="sidebar-item">
        <div
          class="sidebar-item-2"
          :style="{ color: isSectionB_Active ? '#EB4648' : '#A4A4A4' }"
        >
          <img
            :src="isSectionB_Active ? icon1 : icon2"
            alt="icon"
            class="icon"
          />
          <span style="text-align: center"
            >Section B<br />Disease-Related <br />Information</span
          >
        </div>
      </div>
      <div class="divider"></div>
      <div class="sidebar-item">
        <div
          class="sidebar-item-2"
          :style="{
            color: isActive('/questionnairesResearcher3')
              ? '#EB4648'
              : '#A4A4A4',
          }"
        >
          <img
            :src="isActive('/questionnairesResearcher3') ? icon4 : icon3"
            alt="icon"
            class="icon"
          />
          <span style="display: inline-block; width: 80px; text-align: center"
            >Verify information</span
          >
        </div>
      </div>
      <div class="divider"></div>

      <div class="sidebar-item">
        <div
          class="sidebar-item-2"
          :style="{ color: isActive('/summary') ? '#EB4648' : '#A4A4A4' }"
        >
          <img
            :src="isActive('/summary') ? icon4 : icon3"
            alt="icon"
            class="icon"
          />
          <span style="display: inline-block; width: 80px; text-align: center"
            >Steps of<br />extrapolation</span
          >
        </div>
      </div>
    </template>
    <div v-if="showLogoutConfirmModal" class="modal">
      <div class="modal-content">
        <h3>Confirm Logout</h3>
        <p>Are you sure you want to log out?</p>
        <div class="modal-buttons">
          <button
            @click="showLogoutConfirmModal = false"
            class="modal-btn cancel-btn"
          >
            Cancel
          </button>
          <button @click="handleLogout" class="modal-btn confirm-btn">
            Logout
          </button>
        </div>
      </div>
    </div>

    <div v-if="showLogoutSuccessModal" class="modal">
      <div class="modal-content">
        <h3>Logout Successful</h3>
        <p>You have been successfully logged out.</p>
        <div class="modal-buttons-center">
          <button @click="redirectToLogin" class="modal-btn confirm-btn">
            OK
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import icon1 from "@/assets/icon1.png";
import icon2 from "@/assets/icon2.png";
import icon3 from "@/assets/icon3.png";
import icon4 from "@/assets/icon4.png";
import { useQuestionnaireStore } from "@/stores/useQuestionnaireStore";
import { useRoute, useRouter } from "vue-router";
import { computed, ref } from "vue";
import { storeToRefs } from "pinia";

const showLogoutConfirmModal = ref(false);
const showLogoutSuccessModal = ref(false);

interface VersionHistoryItem {
  id: number;
  version: number;
  submitted_at: string;
  status: number;
}

const router = useRouter();
const store = useQuestionnaireStore();
const route = useRoute();
const { currentQuestionId } = storeToRefs(store);

const isReviewPage = computed(() => route.path === "/Review");
const isAdminDashboard = computed(() => route.path === "/admin/dashboard");
const isFetchingPage = computed(() => {
  return ["ReviewResponseByVersion", "ReviewResponse"].includes(
    route.name as string
  );
});
const isInstruction = computed(() => {
  return ["Instruction1", "Instruction2", "Glossary"].includes(
    route.name as string
  );
});

const isContradiction = computed(() => route.path === "/contradiction");
const { contradictionStep } = storeToRefs(store);

const isActive = (path: string) => {
  return route.path === path;
};

const selectVersion = (versionItem: VersionHistoryItem) => {
  if (store.currentVersion !== versionItem.version) {
    const token = store.currentToken;
    router.push(`/review-response/${token}/${versionItem.version}`);
  }
};
const isSectionA_Active = computed(() => {
  if (route.name !== "QuestionnairesResearcher2") return false;

  if (!currentQuestionId.value) return false;
  return currentQuestionId.value >= 100 && currentQuestionId.value < 200;
});

const isSectionB_Active = computed(() => {
  if (route.name !== "QuestionnairesResearcher2") return false;

  if (!currentQuestionId.value) return false;
  return currentQuestionId.value >= 200 && currentQuestionId.value < 300;
});

const statusOptions = [
  { value: "", text: "All Statuses" },
  { value: 0, text: "New Submit" },
  { value: 1, text: "Need Revise" },
  { value: 2, text: "Approve" },
  { value: -2, text: "Reject" },
  { value: -1, text: "Cancel" },
];

const filterByStatus = (statusValue: number | string) => {
  router.push({ path: "/admin/dashboard", query: { status: statusValue } });
};

const openLogoutConfirmModal = () => {
  showLogoutConfirmModal.value = true;
};

const goToDashboard = () => {
  store.resetServey();
  router.push("/admin/dashboard");
};

const handleLogout = () => {
  showLogoutConfirmModal.value = false;
  store.clearAuthToken();
  showLogoutSuccessModal.value = true;
};

const redirectToLogin = () => {
  showLogoutSuccessModal.value = false;
  router.push("/login");
};
</script>

<style scoped>
.sidebar {
  width: 206px;
  align-items: center;
  background-color: #fff;
  border-right: 1px dashed #ccc;
  text-align: left;
}

.sidebar-item {
  max-height: 100px;
  display: flex;
  width: 200px;
  padding: 8px;
  justify-content: space-evenly;
}

.sidebar-item-2 {
  max-width: 160px;
  cursor: default;
  max-height: 100px;
  display: flex;
  align-items: center;
}

.icon {
  width: 40px;
  height: 40px;
  margin-right: 8px;
}

.divider {
  height: 64px;
  border-left: 1px dotted #999;
  margin: 11px;
}

.span {
  text-align: left;
  font-size: 18px;
}

.version-history {
  width: 100%;
  padding: 16px;
  text-align: center;
  overflow-y: auto;
}

.version-title {
  margin-bottom: 1rem;
  color: #333;
}

.version-item {
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  margin-bottom: 0.5rem;
  background-color: #f9f9f9;
  cursor: pointer;
  transition: background-color 0.2s;
}

.version-item:hover {
  background-color: #f0f0f0;
}

.version-item.active-version {
  background-color: #fee2e2;
  border-color: #eb4648;
  color: #eb4648;
}

.version-item span {
  display: block;
}

.version-item small {
  font-size: 0.8rem;
  color: #666;
}
.status-filter {
  width: 100%;
  padding: 16px;
  text-align: center;
}

.status-title {
  margin-bottom: 1rem;
  color: #333;
}

.status-item {
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  margin-bottom: 0.5rem;
  background-color: #f9f9f9;
  cursor: pointer;
  transition: background-color 0.2s;
  text-align: left;
  padding-left: 24px;
}

.status-item:hover {
  background-color: #f0f0f0;
}

.status-item.active-status {
  background-color: #fee2e2;
  border-color: #eb4648;
  color: #eb4648;
}

.sidebar-footer {
  margin-top: auto;
  padding: 16px;
  text-align: center;
  width: 100%;
}

.dashboard-btn {
  width: 188px;
  background-color: #eb4648;
  color: #ffffff;
  padding: 8px;
  border: 1px solid #eb4648;
  border-radius: 4px;
  cursor: pointer;
}

.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6);
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
  align-items: center;
}

.modal-content h3 {
  font-size: 1.5rem;
  margin-bottom: 1rem;
}

.modal-content p {
  margin-bottom: 1.5rem;
  color: #4b5563;
  line-height: 1.6;
}

.modal-buttons {
  display: flex;
  justify-content: space-between;
  margin-top: 1.5rem;
}

.modal-buttons-center {
  display: flex;
  justify-content: center;
  margin-top: 1.5rem;
}

.modal-btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1rem;
  min-width: 120px;
  transition: background-color 0.2s;
}

.cancel-btn:hover {
  background-color: #c2c2c2;
}

.confirm-btn:hover,
.dashboard-btn:hover {
  background-color: #c9302c;
}
</style>
