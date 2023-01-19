<template>
  <div>
    <div class="bar-wrapper">
      <Bar :options="chartOptions" :data="ageSlice" />
    </div>
    <div class="pie-wrapper">
      <Pie :options="chartOptions" :data="sexSlice" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n-composable";
import { store } from "../store";
import { Bar, Pie } from "vue-chartjs";
import * as _ from "lodash";
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
  ArcElement,
} from "chart.js";
const { t } = useI18n();

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
  ArcElement
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

const labels = computed(() => ({
  age: ["призывной", "предпенсионный", "пенсионный"].map((s) =>
    _.startCase(t(s).toString())
  ),
  sex: ["Мужчины", "Женщины"].map((s) => _.startCase(t(s).toString())),
}));

const ageSlice = computed(() => {
  const statsAge = getSlice(persons.value, labels.value.age, ({ age }) => {
    const diapasons = [
      [18, 25],
      [26, 60],
      [60, Infinity],
    ];
    return labels.value.age[
      diapasons.findIndex(
        ([min, max]) => Math.max(Math.min(age, max), min) == age
      )
    ];
  });
  return {
    labels: labels.value.age,
    datasets: [
      {
        data: statsAge,
        label: t("Возраста сотрудников").toString(),
        backgroundColor: "darkgrey",
      },
    ],
  };
});
const sexSlice = computed(() => {
  const statsSex = getSlice(
    persons.value,
    ["male", "female"],
    ({ sex }) => sex,
    "percent"
  );
  return {
    labels: labels.value.sex,
    datasets: [
      {
        data: statsSex,
        label: t("Пол сотрудников, %").toString(),
        backgroundColor: ["lightblue", "lightcoral"],
      },
    ],
  };
});
</script>

<style lang="scss" scoped>
.bar-wrapper {
  width: 50vw;
  margin: 0 auto;
}
.pie-wrapper {
  width: 30vw;
  margin: 0 auto;
}
</style>
