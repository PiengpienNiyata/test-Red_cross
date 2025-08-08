import { createApp } from 'vue'
import './assets/main.css'
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

// @ts-ignore
import BootstrapVue3 from 'bootstrap-vue-3';
import 'bootstrap-icons/font/bootstrap-icons.css';
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate' 
import App from './App.vue'
import router from './router';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { createPinia } from "pinia"; 

const pinia = createPinia();
pinia.use(piniaPluginPersistedstate)
const app = createApp(App);
app.use(pinia);
app.use(router);
app.use(BootstrapVue3);
app.mount('#app');
