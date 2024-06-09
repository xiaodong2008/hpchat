import { createMemoryHistory, createRouter } from "vue-router";

import HomeView from "./pages/home/index.vue";

const routes = [{ path: "/", component: HomeView }];

export default createRouter({
	history: createMemoryHistory(),
	routes,
});
