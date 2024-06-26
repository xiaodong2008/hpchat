import "./style.scss";
import "primevue/resources/primevue.min.css";
import "primeicons/primeicons.css";

import App from "./App.vue";
import ConfirmationService from "primevue/confirmationservice";
import PrimeVue from "primevue/config";
import ToastService from "primevue/toastservice";
import { createApp } from "vue";
import router from "./router";

const app = createApp(App);
app.use(PrimeVue).use(ToastService).use(ConfirmationService).use(router);
app.mount("#app");
