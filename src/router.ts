import Router from "vue-router";

import List from "./components/EmployeeList.vue";
import Stats from "./components/EmployeeStats.vue";
const routes = [
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
];
export default new Router({ routes });
