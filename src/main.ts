import "primevue/resources/themes/aura-light-green/theme.css";
import "./style.scss";

import App from "./App.vue";
import PrimeVue from "primevue/config";
import { createApp } from "vue";
import router from "./router";

const app = createApp(App);
app.use(PrimeVue).use(router);
app.mount("#app");
