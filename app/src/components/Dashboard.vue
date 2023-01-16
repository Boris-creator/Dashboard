<template>
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

  getFellowsOffline() {
    this.$store.commit("setFellows", fellows);
  }
  async created() {
    try {
      const response = await fetch(
        `${this.apiURLs.api}${this.apiURLs.getAll}`,
        {
          method: "POST",
        }
      );
      if (response.ok) {
        const dataFromDB = await response.json();
        this.$store.commit("setFellows", dataFromDB.fellows);
      } else {
        this.getFellowsOffline();
      }
    } catch (err) {
      this.getFellowsOffline();
    }
  }
}
</script>
<style lang="scss" scoped>
.router-link-active {
  opacity: 0.6;
  cursor: default;
}
.sidebar {
  background: lightsteelblue;
}
</style>
