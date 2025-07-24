
import { createRouter, createWebHistory } from 'vue-router';
// import Home from '@/pages/Home.vue';
import QuestionnairesResearcher from '@/pages/QuestionnairesResearcher.vue';
import QuestionnairesResearcher2 from '@/pages/QuestionnairesResearcher2.vue';
import QuestionnairesResearcher3 from '@/pages/QuestionnairesResearcher3.vue';
import AdminDashboard from '@/pages/AdminDashboard.vue';
import GlossaryPage from '@/pages/GlossaryPage.vue';
import EditResponsePage from '@/pages/EditResponse.vue';

const routes = [
  { path: '/', redirect: '/glossary' },

  { path: '/glossary', name: 'Glossary', component: GlossaryPage }, 
  { path: '/questionnairesResearcher', name: 'QuestionnairesResearcher', component: QuestionnairesResearcher },
  { path: '/questionnairesResearcher2', name: 'QuestionnairesResearcher2', component: QuestionnairesResearcher2 },
  { path: '/questionnairesResearcher3', name: 'QuestionnairesResearcher3', component: QuestionnairesResearcher3 },
    { path: '/admin/dashboard', name: 'AdminDashboard', component: AdminDashboard },
{ path: '/edit-response/:token', name: 'EditResponse', component: EditResponsePage },]
;

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    return { top: 0 };
  },
});
export default router;
