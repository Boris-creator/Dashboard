<template>
  <div id="app">
    <dashboard></dashboard>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "@vue/composition-api";
import Dashboard from "./components/Dashboard.vue";
export default defineComponent({
  components: { Dashboard },
});
</script>

<style lang="scss" scoped>
#app {
  height: 100vh;
}
</style>
