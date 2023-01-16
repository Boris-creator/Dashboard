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
          "
          v-html="column.sortingOrder + 1 ? '&uarr;' : '&darr;'"
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
        :sortBy="sortByOwn"
        :observer="observerOwn"
      ></sortable-table>
    </div>
  </div>
</template>

<script lang="ts">
/*
 Таблицу решил реализовать своим компонентом, это должно дать больше свободы стилизации, управления.
 Но возможно это не лучшее решение, и следовало использовать b-table с нормальной сортировкой из коробки.
*/
import { Component, Vue, Prop, Watch } from "vue-property-decorator";
import { Fellow, Node, Sort } from "../types";

@Component({
  components: {},
})
export default class SortableTable extends Vue {
  @Prop({
    type: Object,
    required: true,
  })
  item!: Node<any>;
  @Prop({
    type: Array,
    required: true,
  })
  columns!: {
    key: string;
    title: string;
    size: number;
    transform?: Function;
    sortingOrder: Sort<any>["direction"];
  }[];
  @Prop({
    type: Object,
    default(): Sort<Fellow> {
      return { key: "name", direction: 1 };
    },
  })
  sortBy!: Sort<any>;
  @Prop({
    type: Boolean,
    default: false,
  })
  isRoot!: boolean;
  @Prop(IntersectionObserver)
  observer!: IntersectionObserver;

  showHead: boolean = false;
  sortByOwn: Sort<typeof this.item.person> = { key: "name", direction: 1 };
  observerOwn: IntersectionObserver | null = null;

  get sortedItems() {
    const { key, direction } = this.sortByOwn;
    return this.item.subordinates.sort(({ person: p1 }, { person: p2 }) => {
      const order = p1[key] > p2[key] ? 1 : p1[key] == p2[key] ? 0 : -1;
      return order * direction;
    });
  }
  @Watch("sortBy.key")
  updateSortingKey(sortKey: typeof this.item.person) {
    this.sortByOwn.key = sortKey;
  }
  @Watch("sortBy.direction")
  updateSortingDirection(sortDir: Sort<any>["direction"]) {
    this.sortByOwn.direction = sortDir;
    const column = this.columns.find(
      ({ key }) => key == this.sortByOwn.key
    ) as (typeof this.columns)[number];
    column.sortingOrder = sortDir;
  }
  get targets() {
    return this.observerOwn?.takeRecords().map((e) => e.target);
  }
  created() {
    this.showHead = this.isRoot;
    this.sortByOwn = { ...this.sortBy };
    // Хотел организовать централизованное слежение, чтобы сортировать только таблицы в зоне видимости.
    // TO DO: закончить и оценить, будет ли выигрыш в производительности или наоборот
    if (this.isRoot) {
      this.observerOwn = new IntersectionObserver(() => {}, { threshold: 0.1 });
    } else {
      this.observerOwn = this.observer;
    }
  }
  mounted() {
    if (!this.observerOwn) {
      return;
    }
    const block = this.$refs["table-body"] as HTMLElement;
    this.observerOwn.observe(block);
  }
  beforeDestroy() {
    this.observerOwn?.disconnect();
  }
}
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
