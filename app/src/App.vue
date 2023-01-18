<template>
  <div class="app-wrapper">
    <b-container fluid="lg" class="h-100">
      <b-row class="wrapper h-100">
        <b-col cols="3" class="sidebar">
          <b-container>
            <b-row>
              <b-select
                v-model="locale"
                :options="[
                  { value: 'en', text: 'en' },
                  { value: 'ru', text: 'ru' },
                ]"
              ></b-select>
            </b-row>
            <b-row class="mt-5">
              <b-button to="/list">{{ $t("Список сотрудников") }}</b-button>
            </b-row>
            <b-row class="mt-5">
              <b-button to="/stats">{{ $t("Статистика") }}</b-button>
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

<script setup lang="ts">
import { useI18n } from "vue-i18n-composable";
import DB from "./utils/database";
import { store, storeEvents } from "./store";
import constants from "./constants";
import fellows from "./examples/fellows.json";
const { t, locale } = useI18n();

async function setup() {
  const db = new DB();
  const storedData = await db.findAll(constants.IDBBase, constants.IDBStore);
  // Это для демонстрации, чтобы потом показать получение данных из базы. На самом деле достаточно один раз добавить.
  if (!storedData.length) {
    await db.bulkCreate(constants.IDBBase, constants.IDBStore, fellows);
  }
  store.commit(storeEvents.initialize);
}
setup();
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
