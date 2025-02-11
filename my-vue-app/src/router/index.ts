
import { createRouter, createWebHistory } from 'vue-router';
import Home from '@/pages/Home.vue';
import QuestionnairesResearcher from '@/pages/QuestionnairesResearcher.vue';

const routes = [
  { path: '/', name: 'Home', component: Home },
  { path: '/questionnairesResearcher', name: 'QuestionnairesResearcher', component: QuestionnairesResearcher },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});
export default router;
