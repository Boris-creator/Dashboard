import Vue from "vue";
import Vuex from "vuex";
import Router from "vue-router";
import { BootstrapVue } from "bootstrap-vue";
import "bootstrap/dist/css/bootstrap.css";
import "bootstrap-vue/dist/bootstrap-vue.css";
import App from "./App.vue";
import List from "./components/FellowList.vue";
import Stats from "./components/FellowsStats.vue";
import { store } from "./store";

Vue.use(Vuex);
Vue.use(BootstrapVue);
Vue.use(Router);

Vue.config.productionTip = false;
const router = new Router({
  routes: [
    {
      path: "",
      redirect: "/list",
    },
    {
      path: "/list",
      component: List,
    },
    {
      path: "/stats",
      component: Stats,
    },
  ],
});
new Vue({
  router,
  store,
  render: (h) => h(App),
}).$mount("#app");
