<template>
  <div class="app-wrapper">
    <b-container fluid="lg" class="h-100">
      <b-row class="wrapper h-100">
        <b-col cols="3" class="sidebar">
          <b-container>
            <b-row class="mt-5">
              <b-button to="/list">Список сотрудников</b-button>
            </b-row>
            <b-row class="mt-5">
              <b-button to="/stats">Статистика</b-button>
            </b-row>
          </b-container>
        </b-col>
        <b-col cols="9">
          <router-view> </router-view>
        </b-col>
      </b-row>
    </b-container>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import DB from "./utils/dataBase";
import { store, storeEvents } from "./store";
import constants from "./constants";
import fellows from "./examples/fellows.json";

export default defineComponent({
  async setup() {
    const db = new DB();
    const storedData = await db.findAll(constants.IDBBase, constants.IDBStore);
    // Это для демонстрации, чтобы потом показать получение данных из базы. На самом деле достаточно один раз добавить.
    if (!storedData.length) {
      await db.bulkCreate(constants.IDBBase, constants.IDBStore, fellows);
    }
    store.commit(storeEvents.initialize);
  },
});
</script>

<style lang="scss" scoped>
.app-wrapper {
  height: 100vh;
}
.router-link-active {
  opacity: 0.6;
  cursor: default;
}
.sidebar {
  background: lightsteelblue;
}
</style>
