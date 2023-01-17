<template>
  <div
    @dblclick.stop="sortedItems.length && (showHead = !showHead)"
    class="table"
    ref="table-body"
  >
    <div v-if="showHead" class="table-row table-head">
      <div
        class="table-cell"
        v-for="column of columns"
        :key="column.key"
        :style="{ width: column.size * 100 + '%' }"
      >
        <span @click="sortByOwn.key = column.key">{{ column.title }}</span>
        <span
          @click="
            sortByOwn.key = column.key;
            sortByOwn.direction *= -1;
            columnsSorting[column.key] *= -1;
          "
          v-html="columnsSorting[column.key] == 1 ? '&uarr;' : '&darr;'"
          class="sort-dir"
        ></span>
      </div>
    </div>
    <div class="table-row" v-if="item.person">
      <div
        class="table-cell"
        v-for="column of columns"
        :key="column.key"
        :style="{ width: column.size * 100 + '%' }"
      >
        {{
          column.transform
            ? column.transform(item.person[column.key])
            : item.person[column.key]
        }}
      </div>
    </div>
    <div class="child-table" v-if="sortedItems.length">
      <sortable-table
        v-for="node of sortedItems"
        :key="node.person.id"
        :item="node"
        :columns="columns"
        :columnsSorting="columnsSorting"
        :sortBy="sortByOwn"
      ></sortable-table>
    </div>
  </div>
</template>
<script setup lang="ts">
/*
 Таблицу решил реализовать своим компонентом, это должно дать больше свободы стилизации, управления.
 Но возможно это не лучшее решение, и следовало использовать b-table с нормальной сортировкой из коробки.
*/
import { computed, ref, Ref, defineProps, withDefaults } from "vue";
import { Component, watch } from "vue";
import { Fellow, Node, Sort } from "../types";

type props = {
  item: Node<any>;
  isRoot?: boolean;
  columns: {
    key: string;
    title: string;
    size: number;
    transform?: Function;
  }[];
  columnsSorting: { [key: string]: Sort<any>["direction"] };
  sortBy: Ref<{ key: string; direction: number }>;
};
const props = withDefaults(defineProps<props>(), {
  sortBy: () => ref({ key: "name", direction: 1 }),
  isRoot: false,
});

const showHead = ref(props.isRoot);
const sortByOwn = ref({ key: "name", direction: 1 }) as props["sortBy"];
const columnsSorting = ref(props.columnsSorting);
const sortedItems = computed(() => {
  const { key, direction } = sortByOwn.value
  return props.item.subordinates.sort(({ person: p1 }, { person: p2 }) => {
    const order = p1[key] > p2[key] ? 1 : p1[key] == p2[key] ? 0 : -1;
    return order * direction;
  });
});
watch(
  () => props.sortBy.key,
  (v) => {
    sortByOwn.value.key = v;
  }
);
watch(
  () => props.sortBy.direction,
  (v) => {
    sortByOwn.value.direction = v;
  }
);
watch(
  () => JSON.stringify(props.columnsSorting.value),
  (v) => {
    columnsSorting.value = JSON.parse(v);
  }
);
</script>

<style lang="scss" scoped>
.table-row {
  display: flex;
  padding: 0;
  .table-cell {
    border: thin solid grey;
    padding: 0.5em;
  }
}
.table-head {
  .table-cell {
    font-weight: bolder;
    span {
      cursor: pointer;
    }
    .sort-dir {
      display: none;
    }
    &:hover {
      .sort-dir {
        display: inline;
      }
    }
  }
}
.child-table {
  margin-left: 1vw;
  padding: 0.2em 0 0 0;
}
</style>
