<template>
  <b-container fluid>
    <b-row class="add-btn my-4">
      <b-col cols="2">
        <b-button @click="actionAdd = true">Добавить</b-button>
      </b-col>
    </b-row>
    <sortable-table
      :item="fellowTree"
      :columns="fellowTableColumns"
      :isRoot="true"
    ></sortable-table>
    <b-modal v-model="actionAdd" hide-footer>
      <add-fellow-form :chiefs="fellows" @add="addFellow"></add-fellow-form>
    </b-modal>
  </b-container>
</template>

<script lang="ts">
import { Component, Vue, Watch } from "vue-property-decorator";
import AddFellowForm from "./ModalForm.vue";
import SortableTable from "./SortableTable.vue";
import { apiURLs } from "../constants";
import { Store, Node, Fellow, NewFellow } from "../types";

type FellowNode = Node<Fellow | null>;

@Component({
  components: { AddFellowForm, SortableTable },
})
export default class FellowList extends Vue {
  $store!: Store;
  private apiURLs = apiURLs;
  get fellows() {
    return this.$store.state.fellows;
  }
  private persons: Map<number, FellowNode> = new Map();
  async addFellow(fellow: NewFellow) {
    this.addToTree(fellow as Fellow);
    this.actionAdd = false;
    const response = await fetch(this.apiURLs.api + this.apiURLs.addOne, {
      //все эти fetch надо будет в отдельный метод вынести...
      method: "POST",
      headers: {
        "Content-Type": "application/json;charset=utf-8",
      },
      body: JSON.stringify(fellow),
    });
    if (response.ok) {
      const { id } = await response.json();
      fellow.id = id;
      this.$store.commit("addFellow", fellow);
    }
  }
  private addToTree(
    fellow: Fellow,
    tree: FellowNode = this.fellowTree as FellowNode
  ) {
    const { chief: chiefId, id } = fellow;
    const node: FellowNode = { person: fellow, subordinates: [] };
    this.persons.set(id, node);
    if (!chiefId) {
      tree.subordinates.push(node);
    } else {
      const chief = this.persons.get(chiefId);
      if (chief) {
        chief.subordinates.push(node);
      }
    }
    return node;
  }
  fellowTree: FellowNode = { person: null, subordinates: [] };
  private buildFellowTree() {
    //Я мог сделать это свойство вычисляемым, но тогда при добавлении сотрудника все дерево будет строиться заново
    const { persons } = this;
    const fellowTree: FellowNode = { person: null, subordinates: [] };
    const orphans: Map<number, FellowNode[]> = new Map();
    for (let fellow of this.fellows) {
      const { chief: chiefId, id } = fellow;
      const node = this.addToTree(fellow, fellowTree);
      if (orphans.has(id)) {
        const subordinates = orphans.get(id) as FellowNode[];
        node.subordinates = subordinates;
        orphans.delete(id);
      }
      if (!chiefId) {
        continue;
      }
      const chief = persons.get(chiefId);
      if (chief) {
        continue;
      }
      if (!orphans.has(chiefId)) {
        orphans.set(chiefId, [node]);
      } else {
        const siblings = orphans.get(chiefId) as FellowNode[];
        siblings.push(node);
      }
    }
    return fellowTree;
  }
  fellowTableColumns = [
    { key: "name", title: "Имя", size: 0.4 },
    { key: "age", title: "Возраст", size: 0.2 },
    {
      key: "sex",
      title: "Пол",
      size: 0.1,
      transform: (s: Fellow["sex"]) => ["М", "Ж"][s],
    },
    { key: "phone", title: "Телефон", size: 0.3 },
  ];
  actionAdd = false;

  private initTree() {
    this.fellowTree = this.buildFellowTree();
  }
  @Watch("fellows.length")
  init(value: number, oldValue: number) {
    if (value && !oldValue) {
      this.initTree();
    }
  }
  created() {
    this.initTree();
  }
}
</script>

<style lang="scss" scoped>
.add-btn {
  position: sticky;
  top: 0;
}
</style>
