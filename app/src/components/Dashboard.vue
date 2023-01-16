<template>
  <b-container fluid="lg" class="wrapper">
    <b-row class="wrapper">
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
        <router-view name="main"> </router-view>
      </b-col>
    </b-row>
  </b-container>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import { Store } from "../types";

import { apiURLs } from "../constants";
import fellows from "../examples/fellows.json";
@Component({})
export default class Dashboard extends Vue {
  $store!: Store;
  private apiURLs = apiURLs;
  async created() {
    const response = await fetch(`${this.apiURLs.api}${this.apiURLs.getAll}`, {
      method: "POST",
    });
    if (response.ok) {
      const dataFromDB = await response.json();
      this.$store.commit("setFellows", dataFromDB.fellows);
    } else {
      this.$store.commit("setFellows", fellows);
    }
  }
}
</script>
<style lang="scss" scoped>
.router-link-active {
  opacity: 0.6;
  cursor: default;
}
.wrapper {
  min-height: 100vh;
}
.sidebar {
  background: lightsteelblue;
}
</style>
