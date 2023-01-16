import Vue from "vue";
import Vuex from "vuex";
import { Fellow, NewFellow } from "./types";

Vue.use(Vuex);

type state = { fellows: Fellow[] } & { [key: string]: any };
export enum storeEvents  {
  addFellow = "addFellow",
  setFellows = "setFellows"
}
const storeOptions = {
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
};

export const store = new Vuex.Store(storeOptions);
