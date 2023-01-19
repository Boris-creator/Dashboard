import Vue from "vue";
import Vuex from "vuex";
import { StoreOptions } from "vuex";
import DB from "./utils/database";
import constants from "./constants";
import { Employee, NewEmployee } from "./types";

Vue.use(Vuex);

type state = { employees: Employee[] } & { [key: string]: any };
export enum storeEvents {
  addEmployee = "addEmployee",
  updateEmployee = "updateEmployee",
  setEmployees = "setEmployees",
  initialize = "initialize",
}

const db = new DB();

const storeOptions: StoreOptions<state> = {
  state(): state {
    return {
      employees: [],
      autoIncrement: 1,
    };
  },
  mutations: {
    addEmployee(state: state, employee: NewEmployee) {
      if (employee.id) {
        state.autoIncrement = employee.id + 1;
      } else {
        employee.id = state.autoIncrement;
        state.autoIncrement++;
      }
      state.employees.push(employee as Employee);
      db.create(constants.IDBBase, constants.IDBStore, employee);
    },
    updateEmployee(state: state, employee: Employee) {
      const existing = state.employees.find(({ id }) => id == employee.id);
      if (existing) {
        Object.assign(existing, employee);
      }
      db.create(constants.IDBBase, constants.IDBStore, employee);
    },
    setEmployees(state: state, employees: Employee[]) {
      state.employees = [...employees];
      state.autoIncrement = Math.max(...employees.map(({ id }) => id)) + 1;
    },
  },
  actions: {
    async initialize(context) {
      const storedData = await db.findAll(
        constants.IDBBase,
        constants.IDBStore
      );
      context.commit(storeEvents.setEmployees, storedData);
    },
  },
};

export const store = new Vuex.Store(storeOptions);
