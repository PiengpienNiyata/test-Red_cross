import { createApp } from 'vue'
import './assets/main.css'
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import BootstrapVue3 from 'bootstrap-vue-3';
import 'bootstrap-icons/font/bootstrap-icons.css';
import App from './App.vue'
import router from './router';
import 'bootstrap-icons/font/bootstrap-icons.css';



const app = createApp(App);
app.use(router);
app.use(BootstrapVue3);
app.mount('#app');
