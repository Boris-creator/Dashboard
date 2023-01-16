<template>
  <div>
    <div class="bar-wrapper">
      <Bar :options="chartOptions" :data="ageSlice" />
    </div>
    <div class="bar-wrapper">
      <Bar :options="chartOptions" :data="sexSlice" />
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import { Bar } from "vue-chartjs";
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
} from "chart.js";
import { Store } from "../types";

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale
);

@Component({
  components: { Bar },
})
export default class Stats extends Vue {
  $store!: Store;
  get persons() {
    return this.$store.state.fellows;
  }
  get ageSlice() {
    const labels = ["Призывной", "Предпенсионный", "пенсионный"];
    const stats = this.getSlice(this.persons, labels, ({ age }) => {
      const diapasons = [
        [18, 25],
        [26, 60],
        [60, Infinity],
      ];
      return labels[
        diapasons.findIndex(
          ([min, max]) => Math.max(Math.min(age, max), min) == age
        )
      ];
    });
    return {
      labels,
      datasets: [
        {
          data: stats,
          label: "Возраста сотрудников",
          backgroundColor: "darkgrey",
        },
      ],
    };
  }
  get sexSlice() {
    const labels = ["Мужчины", "Женщины"];
    const stats = this.getSlice(
      this.persons,
      labels,
      ({ sex }) => labels[sex],
      "percent"
    );
    return {
      labels,
      datasets: [
        {
          data: stats,
          label: "Пол сотрудников, %",
          backgroundColor: ["lightblue", "lightcoral"],
        },
      ],
    };
  }

  private getSlice<T>(
    items: T[],
    categories: string[],
    classificator: (item: T) => string,
    dataType: "absolute" | "percent" = "absolute"
  ) {
    const result = Object.fromEntries(categories.map((c) => [c, 0]));
    for (let item of items) {
      const category: string = classificator(item);
      result[category]++;
    }
    if (dataType == "percent") {
      for (let key in result) {
        result[key] /= items.length;
        result[key] *= 100;
      }
    }
    return categories.map((c) => result[c]);
  }
  chartOptions = {
    responsive: true,
    y: {
      ticks: {
        stepSize: 1,
      },
    },
  };
}
</script>

<style lang="scss" scoped>
.bar-wrapper {
  width: 50vw;
}
</style>
