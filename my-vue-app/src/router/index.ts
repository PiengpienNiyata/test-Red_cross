import { createRouter, createWebHistory } from "vue-router";
// import Home from '@/pages/Home.vue';
import QuestionnairesResearcher from "@/pages/QuestionnairesResearcher.vue";
import QuestionnairesResearcher2 from "@/pages/QuestionnairesResearcher2.vue";
import QuestionnairesResearcher3 from "@/pages/QuestionnairesResearcher3.vue";
import AdminDashboard from "@/pages/AdminDashboard.vue";
import GlossaryPage from "@/pages/GlossaryPage.vue";
import EditResponsePage from "@/pages/EditResponse.vue";
import FetchResponseForReview from "@/pages/FetchResponseForReview.vue";
import Review from "@/pages/ResponseReview.vue";
import AdminLogin from "@/pages/AdminLogin.vue"; 
import SummaryPage from "@/pages/Summary.vue";
import { useQuestionnaireStore } from "@/stores/useQuestionnaireStore";
import InstructionPage1 from "@/pages/InstructionPage1.vue";
import InstructionPage2 from "@/pages/InstructionPage2.vue";
import ContradictionPage from "@/pages/ContradictionPage.vue";

const routes = [
  { path: "/", redirect: "/instruction-1" },

    { path: "/instruction-1", name: "Instruction1", component: InstructionPage1 },
  { path: "/instruction-2", name: "Instruction2", component: InstructionPage2 },

  { path: "/glossary", name: "Glossary", component: GlossaryPage },
  {
    path: "/questionnairesResearcher",
    name: "QuestionnairesResearcher",
    component: QuestionnairesResearcher,
  },
  {
    path: "/questionnairesResearcher2",
    name: "QuestionnairesResearcher2",
    component: QuestionnairesResearcher2,
  },
  {
    path: "/questionnairesResearcher3",
    name: "QuestionnairesResearcher3",
    component: QuestionnairesResearcher3,
  },
  {
    path: "/edit-response/:token",
    name: "EditResponse",
    component: EditResponsePage,
  },
   { path: "/login", name: "AdminLogin", component: AdminLogin },
  {
    path: "/admin/dashboard",
    name: "AdminDashboard",
    component: AdminDashboard,
    meta: { requiresAuth: true },
  },
  
  {
    path: "/review-response/:token",
    name: "ReviewResponse",
    component: FetchResponseForReview,
    meta: { requiresAuth: true },
  },
  {
    path: "/review-response/:token/:version",
    name: "ReviewResponseByVersion",
    component: FetchResponseForReview,
    meta: { requiresAuth: true },
  },

  { path: "/review", name: "Review", component: Review, meta: { requiresAuth: true }, },

  { path: "/summary", name: "Summary", component: SummaryPage },
  { path: "/contradiction", name: "Contradiction", component: ContradictionPage },
];
const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    return { top: 0 };
  },
});

router.beforeEach((to, from, next) => {
  const store = useQuestionnaireStore();
  const isAuthenticated = !!store.authToken;

  if (to.meta.requiresAuth && !isAuthenticated) {
    next({ name: 'AdminLogin', query: { redirect: to.fullPath }  });
  } else {
    next();
  }
});

export default router;
