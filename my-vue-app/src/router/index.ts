
import { createRouter, createWebHistory } from 'vue-router';
// import Home from '@/pages/Home.vue';
import QuestionnairesResearcher from '@/pages/QuestionnairesResearcher.vue';
import QuestionnairesResearcher2 from '@/pages/QuestionnairesResearcher2.vue';
import QuestionnairesResearcher3 from '@/pages/QuestionnairesResearcher3.vue';

const routes = [
  { path: '/', redirect: '/questionnairesResearcher' },
  { path: '/questionnairesResearcher', name: 'QuestionnairesResearcher', component: QuestionnairesResearcher },
  { path: '/questionnairesResearcher2', name: 'QuestionnairesResearcher2', component: QuestionnairesResearcher2 },
  { path: '/questionnairesResearcher3', name: 'QuestionnairesResearcher3', component: QuestionnairesResearcher3 },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});
export default router;
