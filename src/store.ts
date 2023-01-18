import Vue from "vue";
import Vuex from "vuex";
import DB from "./utils/database";
import constants from "./constants";
import { Fellow, NewFellow } from "./types";

Vue.use(Vuex);

type state = { fellows: Fellow[] } & { [key: string]: any };
export enum storeEvents {
  addFellow = "addFellow",
  updateFellow = "updateFellow",
  setFellows = "setFellows",
  initialize = "initialize",
}

const db = new DB();

function setFellows(state: state, fellows: Fellow[]) {
  state.fellows.splice(0, state.fellows.length, ...fellows);
  state.autoIncrement = Math.max(...fellows.map(({ id }) => id)) + 1;
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
      db.create(constants.IDBBase, constants.IDBStore, fellow);
    },
    updateFellow(state: state, fellow: Fellow) {
      const existing = state.fellows.find(({ id }) => id == fellow.id);
      if (existing) {
        Object.assign(existing, fellow);
      }
      db.create(constants.IDBBase, constants.IDBStore, fellow);
    },
    setFellows(state: state, fellows: Fellow[]) {
      setFellows(state, fellows);
    },

    async initialize(state: state) {
      const storedData = await db.findAll(
        constants.IDBBase,
        constants.IDBStore
      );
      setFellows(state, storedData);
    },
  },
};

export const store = new Vuex.Store(storeOptions);
