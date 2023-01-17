<template>
  <div id="app">
    <dashboard></dashboard>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "@vue/composition-api";
import DB from "./utils/dataBase";
import { store, storeEvents } from "./store";
import constants from "./constants";
import Dashboard from "./components/Dashboard.vue";
import fellows from "./examples/fellows.json";

export default defineComponent({
  components: { Dashboard },
  async setup() {
    const db = new DB();
    const storedData = await db.findAll(constants.IDBBase, constants.IDBStore);
    // Это для демонстрации, чтобы потом показать получение данных из базы
    if (!storedData.length) {
      await db.bulkCreate(constants.IDBBase, constants.IDBStore, fellows);
    }
    store.commit(storeEvents.initialize);
  },
});
</script>

<style lang="scss" scoped>
#app {
  height: 100vh;
}
</style>
