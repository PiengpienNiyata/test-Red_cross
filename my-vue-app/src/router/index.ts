
import { createRouter, createWebHistory } from 'vue-router';
import Home from '@/pages/Home.vue';
import QuestionnairesResearcher from '@/pages/QuestionnairesResearcher.vue';
import QuestionnairesResearcher2 from '@/pages/QuestionnairesResearcher2.vue';

const routes = [
  { path: '/', name: 'Home', component: Home },
  { path: '/questionnairesResearcher', name: 'QuestionnairesResearcher', component: QuestionnairesResearcher },
  { path: '/questionnairesResearcher2', name: 'QuestionnairesResearcher2', component: QuestionnairesResearcher2 },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});
export default router;
