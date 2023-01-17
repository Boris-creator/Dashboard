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
import { defineComponent } from "@vue/composition-api";
export default defineComponent({});
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
