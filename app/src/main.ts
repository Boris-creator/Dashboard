import Vue from "vue";
import Vuex from "vuex";
import Router from "vue-router";
import { BootstrapVue } from "bootstrap-vue";
import "bootstrap/dist/css/bootstrap.css";
import "bootstrap-vue/dist/bootstrap-vue.css";
import App from "./App.vue";
import List from "./components/FellowList.vue";
import Stats from "./components/FellowsStats.vue";
import { Fellow, NewFellow } from "./types";

Vue.use(Vuex);
Vue.use(BootstrapVue);
Vue.use(Router);

type state = { fellows: Fellow[] } & { [key: string]: any };
const store = new Vuex.Store({
  state(): state {
    return {
      fellows: [],
      autoIncrement: 1,
    };
  },
  mutations: {
    addFellow(state: state, fellow: NewFellow) {
      if (fellow.id) {
        state.autoIncrement = fellow.id + 1;
      } else {
        fellow.id = state.autoIncrement;
        state.autoIncrement++;
      }
      state.fellows.push(fellow as Fellow);
    },
    setFellows(state: state, fellows: Fellow[]) {
      state.fellows.splice(0, state.fellows.length, ...fellows);
      state.autoIncrement = Math.max(...fellows.map(({ id }) => id)) + 1;
    },
  },
});

Vue.config.productionTip = false;
const router = new Router({
  routes: [
    {
      path: "",
      redirect: "/list",
    },
    {
      path: "/list",
      components: {
        main: List,
      },
    },
    {
      path: "/stats",
      components: {
        main: Stats,
      },
    },
  ],
});
new Vue({
  router,
  store,
  render: (h) => h(App),
}).$mount("#app");
