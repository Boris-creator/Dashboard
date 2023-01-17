<template>
  <div>
    <div class="bar-wrapper">
      <Bar :options="chartOptions" :data="ageSlice.value" />
    </div>
    <div class="bar-wrapper">
      <Bar :options="chartOptions" :data="sexSlice.value" />
    </div>

    <div class="bar-wrapper"></div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "@vue/composition-api";
import { store } from "../store";
import { Bar } from "vue-chartjs";
//import { BarChart } from "vue-chart-3";
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
} from "chart.js";

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale
);

function getSlice<T>(
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
const persons = computed(() => store.state.fellows);
const chartOptions = {
  responsive: true,
  y: {
    ticks: {
      stepSize: 1,
    },
  },
};

const labels = {
  age: ["Призывной", "Предпенсионный", "пенсионный"],
  sex: ["Мужчины", "Женщины"],
};

const ageSlice = computed(() => {
  const statsAge = getSlice(persons.value, labels.age, ({ age }) => {
    const diapasons = [
      [18, 25],
      [26, 60],
      [60, Infinity],
    ];
    return labels.age[
      diapasons.findIndex(
        ([min, max]) => Math.max(Math.min(age, max), min) == age
      )
    ];
  });
  return {
    labels: labels.age,
    datasets: [
      {
        data: statsAge,
        label: "Возраста сотрудников",
        backgroundColor: "darkgrey",
      },
    ],
  };
});
const sexSlice = computed(() => {
  const statsSex = getSlice(
    persons.value,
    labels.sex,
    ({ sex }) => labels.sex[sex],
    "percent"
  );
  return {
    labels: labels.sex,
    datasets: [
      {
        data: statsSex,
        label: "Пол сотрудников, %",
        backgroundColor: ["lightblue", "lightcoral"],
      },
    ],
  };
});
</script>

<style lang="scss" scoped>
.bar-wrapper {
  width: 50vw;
}
</style>
