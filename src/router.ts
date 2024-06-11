import { createRouter, createWebHistory } from "vue-router";

import HomeView from "./pages/home/index.vue";
import MainView from "./pages/app/index.vue";

const routes = [
	{ path: "/", component: HomeView },
	{
		path: "/app/:page?",
		component: MainView,
	},
];

export default createRouter({
	history: createWebHistory(),
	routes,
});
