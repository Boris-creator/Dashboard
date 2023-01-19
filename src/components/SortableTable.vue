<template>
  <div
    @contextmenu.prevent.stop="
      sortedItems.length && !isRoot && (showHead = !showHead)
    "
    class="my-table mt-1 border-3 border-start"
    :class="{ 'border-dark': showHead }"
    ref="table-body"
  >
    <div v-if="showHead" class="table-header">
      <div class="table-row table-head">
        <div
          class="table-cell"
          v-for="column of columns"
          :key="column.key"
          :class="{ active: column.key == sortByOwn.key }"
          :style="{ width: column.size * 100 + '%' }"
          @click="sortByOwn.key = column.key"
        >
          <span>{{ $t(column.title) }}</span>
          <span
            v-show="column.key == sortByOwn.key"
            @click="sortByOwn.direction *= -1"
            :class="{ 'sort-dir': 1, up: columnsSorting[column.key] == 1 }"
          ></span>
        </div>
      </div>
      <div class="table-manager" v-if="!isRoot">
        <b-button size="sm" variant="light" @click="hide = !hide">{{
          $t(hide ? "Развернуть" : "Свернуть")
        }}</b-button>
      </div>
    </div>
    <div class="table-row" v-if="item.person" @dblclick="editRow('edit', item)">
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
    <div
      class="child-table"
      :class="{ collapsed: hide }"
      v-if="sortedItems.length"
    >
      <Transition>
        <div v-show="!hide">
          <sortable-table
            v-for="node of sortedItems"
            :key="node.person.id"
            :item="node"
            :columns="columns"
            :columnsSorting="columnsSorting"
            :sortBy="sortByOwn"
            @edit="editRow('edit', $event)"
          ></sortable-table>
        </div>
      </Transition>
    </div>
  </div>
</template>
<script setup lang="ts">
/*
 Таблицу решил реализовать своим компонентом, это должно дать больше свободы стилизации, управления.
 Но возможно это не лучшее решение, и следовало использовать b-table с нормальной сортировкой из коробки.
*/
import SortableTable from "./SortableTable.vue";
import {
  computed,
  ref,
  defineProps,
  withDefaults,
  defineEmits,
  watch,
} from "vue";
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
  sortBy?: { key: string; direction: number };
};
const props = withDefaults(defineProps<props>(), {
  sortBy: () => ({ key: "name", direction: 1 }),
  isRoot: false,
});
const editRow = defineEmits<{ (e: "edit", value: Node<Fellow>): void }>();

const showHead = ref(props.isRoot);
const sortByOwn = ref({ key: "name", direction: 1 });
const columnsSorting = ref({ ...props.columnsSorting });
const sortedItems = computed(() => {
  const { key, direction } = sortByOwn.value;
  return props.item.subordinates.sort(({ person: p1 }, { person: p2 }) => {
    const order = p1[key] > p2[key] ? 1 : p1[key] == p2[key] ? 0 : -1;
    return order * direction;
  });
});
watch(
  () => props.sortBy.key,
  (key) => {
    sortByOwn.value.key = key;
    sortByOwn.value.direction = props.sortBy.direction;
  }
);
watch(
  () => props.sortBy.direction,
  (dir) => {
    sortByOwn.value.direction = dir;
  }
);
watch(
  () => sortByOwn.value.direction,
  (dir) => {
    const value = dir as 1 | -1;
    columnsSorting.value[sortByOwn.value.key] = value;
  }
);
watch(
  () => JSON.stringify(props.columnsSorting.value),
  (v) => {
    columnsSorting.value = JSON.parse(v);
  }
);

const hide = ref(false);
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
    cursor: pointer;
    &.active {
      color: white;
      background: grey;
    }
    .sort-dir {
      display: none;
      padding: 1em;
      &::after {
        content: "\25BC";
      }
      &.up {
        &::after {
          content: "\25B2";
        }
      }
    }
    &:hover {
      .sort-dir {
        display: inline;
      }
    }
  }
}
.table-header {
  .table-manager {
    display: flex;
  }
}
.child-table {
  margin-left: 1vw;
  padding: 0.2em 0 0 0;
  .collapsed {
    border-bottom: 0.1em solid grey;
  }
}
</style>
