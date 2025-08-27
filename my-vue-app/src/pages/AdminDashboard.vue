<script setup lang="ts">
import { VITE_API_BASE_URL } from "@/stores/config";
import { ref, computed, onMounted, watch } from "vue";
import { useRouter } from "vue-router";
import { formatPhoneNumber } from "@/utils/formatters";
import { useRoute } from "vue-router";
import CustomDateInput from "@/components/CustomDateInput.vue";
import { useQuestionnaireStore } from "@/stores/useQuestionnaireStore";

interface Submission {
  id: number;
  project_name: string;
  disease_name: string;
  researcher_name: string;
  branch_info: string;
  phone_number: string;
  email: string;
  submitted_at: string;
  first_submitted_at: string;
  version: number;
  final_route: string;
  status: number;
  token: string;
}

const router = useRouter();
const route = useRoute();
const store = useQuestionnaireStore();

const allSubmissions = ref<Submission[]>([]);
const searchQuery = ref("");
const selectedStatus = ref("");
const selectedRoute = ref("");
const selectedDate = ref("");
const dateInputType = ref("text");

const currentPage = ref(1);
const itemsPerPage = 12;

const formattedDate = computed({
  get: () => selectedDate.value,
  set: (val) => {
    selectedDate.value = val;
  },
});

const sortRouteString = (routeString: string): string => {
  if (!routeString) {
    return "N/A";
  }
  return routeString.split(", ").sort().join(", ");
};

const fetchSubmissions = async () => {
  try {
    const token = store.authToken;

    if (!token) {
      console.error("Authentication token not found.");
      router.push("/login");
      return;
    }

    const response = await fetch(`${VITE_API_BASE_URL}/api/submissions`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        store.clearAuthToken();
        router.push("/login");
      }
      throw new Error("Failed to fetch submissions");
    }

    const data = await response.json();
    allSubmissions.value = data;
  } catch (error) {
    console.error("Error fetching submissions:", error);
  }
};
onMounted(() => {
  fetchSubmissions();
});
const filteredAndSortedSubmissions = computed(() => {
  let submissions = allSubmissions.value;

  if (searchQuery.value.trim()) {
    const lowerCaseQuery = searchQuery.value.toLowerCase();
    submissions = submissions.filter(
      (s) =>
        s.project_name.toLowerCase().includes(lowerCaseQuery) ||
        s.disease_name.toLowerCase().includes(lowerCaseQuery) ||
        s.researcher_name.toLowerCase().includes(lowerCaseQuery)
    );
  }
  if (selectedStatus.value) {
    submissions = submissions.filter(
      (s) => s.status === Number(selectedStatus.value)
    );
  }
  if (selectedRoute.value) {
    submissions = submissions.filter(
      (s) => s.final_route && s.final_route.includes(selectedRoute.value)
    );
  }
  if (selectedDate.value) {
    submissions = submissions.filter((s) => {
      const submissionDate = new Date(s.submitted_at)
        .toISOString()
        .split("T")[0];
      return submissionDate === selectedDate.value;
    });
  }

  const statusOrder: { [key: number]: number } = {
    0: 1, // New Submit
    1: 2, // Need Revise
    2: 3, // Approve
    "-2": 4, // Reject - Keys must be in quotes
    "-1": 5, // Cancel - Keys must be in quotes
  };

  const sortedSubmissions = [...submissions].sort((a, b) => {
    const statusComparison = statusOrder[a.status] - statusOrder[b.status];
    if (statusComparison !== 0) {
      return statusComparison;
    }
    return (
      new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime()
    );
  });
  scrollToTop();
  return sortedSubmissions;
});

const paginatedSubmissions = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return filteredAndSortedSubmissions.value.slice(start, end);
});

const totalPages = computed(() => {
  return Math.ceil(filteredAndSortedSubmissions.value.length / itemsPerPage);
});

const paginationText = computed(() => {
  const total = filteredAndSortedSubmissions.value.length;
  if (total === 0) return "0 of 0";
  const start = (currentPage.value - 1) * itemsPerPage + 1;
  const end = Math.min(currentPage.value * itemsPerPage, total);
  return `${start}-${end} of ${total}`;
});

const getStatusInfo = (status: number) => {
  switch (status) {
    case 0:
      return { text: "New Submit", color: "#D1D5DB", itemClass: "" }; // Light Grey
    case 1:
      return { text: "Need Revise", color: "#FBBF24", itemClass: "" }; // Yellow
    case 2:
      return { text: "Approve", color: "#22C55E", itemClass: "" }; // Green
    case -2:
      return { text: "Reject", color: "#DC2626", itemClass: "" }; // Red
    case -1:
      return {
        text: "Cancel",
        color: "transparent",
        itemClass: "item-canceled",
      };
    default:
      return { text: "Unknown", color: "#6B7280", itemClass: "" }; // Dark Grey
  }
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const goToReview = (token: string) => {
  router.push(`/review-response/${token}`);
};

const resetFilters = () => {
  searchQuery.value = "";
  selectedStatus.value = "";
  selectedRoute.value = "";
  selectedDate.value = "";
  currentPage.value = 1;
};

const scrollToTop = () => {
  const contentArea = document.querySelector(".page-content");
  if (contentArea) {
    contentArea.scrollTo({ top: 0, behavior: "smooth" });
  }
};

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++;
    scrollToTop();
  }
};
const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--;
    scrollToTop();
  }
};

const statusOptions = [
  { value: 0, text: "New Submit" },
  { value: 1, text: "Need Revise" },
  { value: 2, text: "Approve" },
  { value: -2, text: "Reject" },
  { value: -1, text: "Cancel" },
];

const routeOptions = [
  "Route A",
  "Route B",
  "Route C",
  "Route D",
  "Route E",
  "Route F",
  "Route G",
  "Route H",
];

watch(
  () => route.query.status,
  (newStatus) => {
    selectedStatus.value = (newStatus as string) || "";
  },
  { immediate: true }
);
watch([searchQuery, selectedStatus, selectedRoute, selectedDate], () => {
  currentPage.value = 1;
});
</script>

<template>
  <div class="dashboard-container">
    <div class="filter-bar">
      <select v-model="selectedRoute" class="filter-select">
        <option value="">All Routes</option>
        <option v-for="route in routeOptions" :key="route" :value="route">
          {{ route }}
        </option>
      </select>
      <CustomDateInput v-model="selectedDate" />
      <input
        type="text"
        v-model="searchQuery"
        class="filter-input"
        placeholder="Search Project, Disease, Researcher..."
      />
      <button @click="resetFilters" class="reset-btn">
        <span>Reset</span>
      </button>
      <div class="pagination-controls" style="justify-self: flex-end">
        <button
          @click="prevPage"
          :disabled="currentPage === 1"
          class="page-btn"
        >
          &lt;
        </button>
        <span>{{ paginationText }}</span>

        <button
          @click="nextPage"
          :disabled="currentPage === totalPages"
          class="page-btn"
        >
          &gt;
        </button>
      </div>
    </div>

    <div class="submissions-grid">
      <div
        v-for="submission in paginatedSubmissions"
        :key="submission.id"
        @click="goToReview(submission.token)"
        class="submission-card"
        :class="getStatusInfo(submission.status).itemClass"
      >
        <div>
          <h3 class="card-title">{{ submission.project_name }}</h3>
          <span class="card-subtitle">({{ submission.disease_name }})</span>
        </div>

        <div class="card-details">
          <div class="detail-row">
            <span>Researcher:</span>
            <span class="detail-value"
              >{{ submission.researcher_name }} ({{
                submission.branch_info
              }})</span
            >
          </div>
          <div class="detail-row">
            <span>Phone:</span>
            <span class="detail-value">{{
              formatPhoneNumber(submission.phone_number)
            }}</span>
          </div>
          <div class="detail-row">
            <span>Email:</span>
            <span class="detail-value">{{ submission.email }}</span>
          </div>
          <div class="detail-row">
            <span>First Submit:</span>
            <span class="detail-value">{{
              formatDate(submission.first_submitted_at)
            }}</span>
          </div>
          <div class="detail-row">
            <span>Last Update:</span>
            <span class="detail-value"
              >{{ formatDate(submission.submitted_at) }} (version
              {{ submission.version }})</span
            >
          </div>
        </div>

        <div class="card-status-info">
          <div class="detail-row">
            <div class="detail-row">
              <span>
                Suggestion Route:
                <span class="font-bold">{{
                  sortRouteString(submission.final_route)
                }}</span>
              </span>
            </div>
          </div>
          <div class="detail-row">
            <span
              >Status:
              <span class="font-bold">{{
                getStatusInfo(submission.status).text
              }}</span></span
            >
          </div>
        </div>

        <div class="status-bar-container">
          <div
            class="status-bar"
            :style="{ backgroundColor: getStatusInfo(submission.status).color }"
          ></div>
        </div>
      </div>
    </div>

    <div v-if="filteredAndSortedSubmissions.length === 0" class="no-results">
      No submissions found.
    </div>
  </div>
  <div
    class="pagination-controls"
    style="justify-self: center; margin: 1rem auto"
  >
    <button @click="prevPage" :disabled="currentPage === 1" class="page-btn">
      &lt;
    </button>
    <span>{{ paginationText }}</span>

    <button
      @click="nextPage"
      :disabled="currentPage === totalPages"
      class="page-btn"
    >
      &gt;
    </button>
  </div>
</template>

<style scoped>
.dashboard-container {
  padding: 1.5rem;
  min-height: 100vh;
}

.dashboard-title {
  font-size: 1.5rem;
  line-height: 2rem;
  font-weight: 600;
  color: #1f2937;
}

.filter-bar {
  padding-top: 0.5rem;
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  align-items: center;
}

.filter-input,
.filter-select {
  height: 2.5rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  padding: 0 0.75rem;
  width: 300px;
}

.filter-select {
  background-color: white;
  width: 220px;
}

.filter-input:focus,
.filter-select:focus {
  outline: none;
  border-color: #ef4444;
  box-shadow: 0 0 0 2px rgba(239, 68, 68, 0.4);
}

.reset-btn {
  height: 2.5rem;
  padding: 0 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  border: 1px solid #ef4444;
  border-radius: 0.375rem;
  background-color: white;
  color: #ef4444;
  cursor: pointer;
  transition: background-color 0.2s;
}
.reset-btn:hover {
  background-color: #f3f4f6;
}

.submissions-grid {
  margin-top: 1.5rem;
  display: grid;
  gap: 1.5rem;
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.submission-card {
  padding: 1rem;
  background-color: white;
  border-radius: 0.5rem;
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
  cursor: pointer;
  transition: transform 0.2s ease-in-out;
  display: flex;
  flex-direction: column;
}
.submission-card:hover {
  transform: scale(1.05);
}

.card-title {
  font-size: 1.125rem;
  font-weight: 700;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.card-subtitle {
  font-size: 0.875rem;
  color: #6b7280;
}
.card-details {
  margin-top: 0.75rem;
  font-size: 0.875rem;
  color: #374151;
  flex-grow: 1;
}
.detail-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.25rem;
}
.detail-value {
  font-weight: 500;
  text-align: right;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  padding-left: 0.5rem;
}
.card-status-info {
  margin-top: 1rem;
  justify-items: end;
  font-size: 0.875rem;
  color: #6b7280;
}
.font-bold {
  font-weight: 700;
  color: #1f2937;
}

.status-bar-container {
  margin-top: 0.75rem;
  height: 0.5rem;
  width: 100%;
  background-color: #e5e7eb;
  border-radius: 9999px;
  overflow: hidden;
}
.status-bar {
  height: 100%;
  border-radius: 9999px;
}

.item-canceled {
  filter: grayscale(80%) brightness(0.9);
  opacity: 0.7;
}

.no-results {
  margin-top: 2.5rem;
  text-align: center;
  color: #6b7280;
}

.filter-bar {
  padding-top: 0.5rem;
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  align-items: center;
}

.filter-group {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  align-items: center;
}

.pagination-controls {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: #6b7280;
}

.pagination-controls {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: #6b7280;
  margin-left: auto;
}

.page-btn {
  height: 2.5rem;
  width: 2.5rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  background-color: white;
  cursor: pointer;
  transition: background-color 0.2s;
}

.page-btn:hover:not(:disabled) {
  background-color: #f3f4f6;
}

.page-btn:disabled {
  background-color: #f9fafb;
  color: #d1d5db;
  cursor: not-allowed;
}

.filter-select[type="date"]::-webkit-datetime-edit-month-field {
  display: none;
}
.filter-select[type="date"]::-webkit-datetime-edit-day-field {
  display: none;
}
.filter-select[type="date"]::-webkit-datetime-edit-year-field {
  display: none;
}

@media (max-width: 768px) {
  .submissions-grid {
    grid-template-columns: repeat(1, minmax(0, 1fr));
  }
  .filter-input,
  .filter-select {
    width: 100%;
  }
}
</style>
