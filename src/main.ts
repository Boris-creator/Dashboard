import Vue from "vue";
import Vuex from "vuex";
import Router from "vue-router";
import { BootstrapVue } from "bootstrap-vue";
import "bootstrap/dist/css/bootstrap.css";
import "bootstrap-vue/dist/bootstrap-vue.css";
import VueI18n from "vue-i18n";
import { createI18n } from "vue-i18n-composable";
import { glossary, locale } from "./locales";
import App from "./App.vue";
import List from "./components/EmployeeList.vue";
import Stats from "./components/EmployeeStats.vue";
import { store } from "./store";
import directives from "./directives";

Vue.use(Vuex);
Vue.use(BootstrapVue);
Vue.use(Router);
Vue.use(VueI18n);

Vue.config.productionTip = false;

Vue.directive("cleave", directives.cleave);

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
const i18n = createI18n({
  locale,
  messages: glossary,
});

new Vue({
  router,
  store,
  i18n,
  render: (h) => h(App),
}).$mount("#app");