<template>
  <b-container fluid>
    <b-row class="add-btn my-4">
      <b-col cols="2">
        <b-button @click="actionAdd.value = true">Добавить</b-button>
      </b-col>
    </b-row>
    <sortable-table
      :item="fellowTree.value"
      :columns="fellowTableColumns"
      :isRoot="true"
    ></sortable-table>
    <b-modal v-model="actionAdd.value" hide-footer>
      <add-fellow-form
        :chiefs="fellows.value"
        @add="addFellow"
      ></add-fellow-form>
    </b-modal>
  </b-container>
</template>

<script setup lang="ts">
import { ref, Ref } from "@vue/composition-api";
import AddFellowForm from "./ModalForm.vue";
import SortableTable from "./SortableTable.vue";
import { store, storeEvents } from "../store";
import { Node, Fellow, NewFellow } from "../types";

type FellowNode = Node<Fellow | null>;

const persons: Map<number, FellowNode> = new Map();
const fellows = ref(store.state.fellows);
let fellowTree: Ref<FellowNode> = ref({ person: null, subordinates: [] });
let actionAdd = ref(false);

function addFellow(fellow: NewFellow) {
  addToTree(fellow as Fellow);
  actionAdd.value = false;
  store.commit("addFellow", fellow);
}
function addToTree(
  fellow: Fellow,
  tree: FellowNode = fellowTree.value as FellowNode
) {
  const { chief: chiefId, id } = fellow;
  const node: FellowNode = { person: fellow, subordinates: [] };
  persons.set(id, node);
  if (!chiefId) {
    tree.subordinates.push(node);
  } else {
    const chief = persons.get(chiefId);
    if (chief) {
      chief.subordinates.push(node);
    }
  }
  return node;
}
function buildFellowTree() {
  const fellowTree: FellowNode = { person: null, subordinates: [] };
  const orphans: Map<number, FellowNode[]> = new Map();
  for (let fellow of fellows.value) {
    const { chief: chiefId, id } = fellow;
    const node = addToTree(fellow, fellowTree);
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
function initTree() {
  fellowTree.value = buildFellowTree();
}
store.subscribe((mutation) => {
  if (mutation.type == storeEvents.setFellows) {
    fellows.value = mutation.payload;
    initTree();
  }
});

const fellowTableColumns = [
  { key: "name", title: "Имя", size: 0.4 },
  { key: "age", title: "Возраст", size: 0.2 },
  {
    key: "sex",
    title: "Пол",
    size: 0.1,
    transform: (s: Fellow["sex"]) => ["М", "Ж"][s],
  },
  { key: "phone", title: "Телефон", size: 0.3 },
].map((col) => ({ ...col, sortingOrder: 1 }));

initTree();

/*
defineComponent({
  setup() {
    watch(()=>fellows.value.length, (v)=>{
      initTree()
    })
  },
});
*/
</script>

<style lang="scss" scoped>
.add-btn {
  position: sticky;
  top: 0;
}
</style>
