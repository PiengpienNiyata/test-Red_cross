<script setup lang="ts">
import { VITE_API_BASE_URL } from "@/stores/config";
import { ref, computed, onMounted, watch } from "vue";
import { useRouter } from "vue-router";
// In <script setup>
import { formatPhoneNumber } from "@/utils/formatters";
import { useRoute } from "vue-router";
import CustomDateInput from "@/components/CustomDateInput.vue";

// Define the structure of a submission object
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

// --- STATE MANAGEMENT ---
const allSubmissions = ref<Submission[]>([]);
const searchQuery = ref("");
const selectedStatus = ref(""); // Default to show all
const selectedRoute = ref(""); // Default to show all
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
  // Split the string into an array, sort it, and join it back
  return routeString.split(', ').sort().join(', ');
};

// --- DATA FETCHING ---
onMounted(() => {
  fetchSubmissions();
});

const fetchSubmissions = async () => {
  try {
    // NOTE: You must create this API endpoint on your Go backend.
    // It should return an array of all submissions.
    const response = await fetch(`${VITE_API_BASE_URL}/api/submissions`); // Assuming VITE_API_BASE_URL is configured
    if (!response.ok) throw new Error("Failed to fetch submissions");
    const data = await response.json();
    allSubmissions.value = data;
  } catch (error) {
    console.error("Error fetching submissions:", error);
    // You might want to set some mock data here for development if the API isn't ready
    // allSubmissions.value = MOCK_DATA;
  }
};

// --- FILTERING AND SEARCHING ---
const filteredAndSortedSubmissions = computed(() => {
  let submissions = allSubmissions.value;

  // --- FILTERING LOGIC (This part is correct) ---
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

  // --- SORTING LOGIC (This part has been fixed) ---
  const statusOrder: { [key: number]: number } = {
    0: 1, // New Submit
    1: 2, // Need Revise
    2: 3, // Approve
    "-2": 4, // Reject - Keys must be in quotes
    "-1": 5, // Cancel - Keys must be in quotes
  };

  // Use a temporary variable for the sorted array
  const sortedSubmissions = [...submissions].sort((a, b) => {
    const statusComparison = statusOrder[a.status] - statusOrder[b.status];
    if (statusComparison !== 0) {
      return statusComparison;
    }
    // If statuses are the same, sort by date (newest first)
    return (
      new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime()
    );
  });
 scrollToTop();
  return sortedSubmissions; // Return the sorted array
});

const paginatedSubmissions = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return filteredAndSortedSubmissions.value.slice(start, end);
});

// --- ADD: Computed properties for pagination controls ---
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

// --- HELPER FUNCTIONS ---

// This function centralizes all the logic for status display
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
  // Navigate to the review page, which will fetch the data using the token
  router.push(`/review-response/${token}`);
};

const resetFilters = () => {
  searchQuery.value = "";
  selectedStatus.value = "";
  selectedRoute.value = "";
  selectedDate.value = ""; // --- ADD: Reset the date filter ---
  currentPage.value = 1; // Reset to the first page
};

const scrollToTop = () => {
  // Find the scrollable container from the parent App.vue
  const contentArea = document.querySelector('.page-content');
  if (contentArea) {
    contentArea.scrollTo({ top: 0, behavior: 'smooth' });
  }
};

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++;
    scrollToTop(); // Use the new function
  }
};
const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--;
    scrollToTop(); // Use the new function
  }
};

// --- STATIC OPTIONS FOR FILTERS ---
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
    <!-- <h1 class="dashboard-title">Reviewer Dashboard</h1> -->

    <div class="filter-bar">
      <!-- <select v-model="selectedStatus" class="filter-select">
        <option value="">All Statuses</option>
        <option
          v-for="opt in statusOptions"
          :key="opt.value"
          :value="opt.value"
        >
          {{ opt.text }}
        </option>
      </select> -->
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
        <span class="detail-value">{{ formatDate(submission.first_submitted_at) }}</span>
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
    <span class="font-bold">{{ sortRouteString(submission.final_route) }}</span>
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
  /* background-color: #F9FAFB; */
  min-height: 100vh;
}

.dashboard-title {
  font-size: 1.5rem;
  line-height: 2rem;
  font-weight: 600;
  color: #1f2937;
}

/* --- Filter Bar --- */
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
  width: 300px; /* Default width for larger screens */
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

/* --- Submissions Grid --- */
.submissions-grid {
  margin-top: 1.5rem;
  display: grid;
  gap: 1.5rem;
  /* Default to 3 columns on large screens */
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
  font-size: 1.125rem; /* 18px */
  font-weight: 700;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.card-subtitle {
  font-size: 0.875rem; /* 14px */
  color: #6b7280;
}
.card-details {
  margin-top: 0.75rem;
  font-size: 0.875rem;
  color: #374151;
  flex-grow: 1; /* Pushes status to the bottom */
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

/* --- Status Bar --- */
.status-bar-container {
  margin-top: 0.75rem;
  height: 0.5rem; /* 8px */
  width: 100%;
  background-color: #e5e7eb;
  border-radius: 9999px;
  overflow: hidden;
}
.status-bar {
  height: 100%;
  border-radius: 9999px;
}

/* --- Canceled State --- */
.item-canceled {
  filter: grayscale(80%) brightness(0.9);
  opacity: 0.7;
}

.no-results {
  margin-top: 2.5rem;
  text-align: center;
  color: #6b7280;
}

/* --- Filter Bar --- */
.filter-bar {
  padding-top: 0.5rem;
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  align-items: center;
  /* ADD: Justify content to push items apart */
  /* justify-content: space-between; */
}

/* ADD: A new container for the left-side filters */
.filter-group {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  align-items: center;
}

/* --- ADD: Styles for Pagination Controls --- */
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
  margin-left: auto; /* Add this line */
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

/* --- RESPONSIVENESS --- */
/* For screens 768px wide or smaller (iPad portrait and phones) */
@media (max-width: 768px) {
  .submissions-grid {
    /* Change to 1 column */
    grid-template-columns: repeat(1, minmax(0, 1fr));
  }
  .filter-input,
  .filter-select {
    width: 100%;
  }
}
</style>
