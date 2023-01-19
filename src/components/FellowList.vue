<template>
  <b-container fluid>
    <b-row class="panel my-4">
      <b-col cols="2">
        <b-button @click="actionAdd = true">{{ $t("Добавить") }}</b-button>
      </b-col>
      <b-col>
        <b-button
          @click="exportData"
          :disabled="!fellows.length"
          variant="outline-primary"
          >{{ $t("Экспорт данных") }}</b-button
        >
      </b-col>
    </b-row>
    <sortable-table
      :item="fellowTree"
      :columns="fellowTableColumns"
      :columnsSorting="columnsSorting"
      :isRoot="true"
      @edit="editRow"
    ></sortable-table>
    <b-modal v-model="actionAdd" hide-footer>
      <add-fellow-form :chiefs="fellows" @add="addFellow"></add-fellow-form>
    </b-modal>
    <b-modal v-model="actionEdit" hide-footer>
      <add-fellow-form
        :chiefs="fellows"
        @add="editFellow"
        :node="fellowToEdit"
      ></add-fellow-form>
    </b-modal>
  </b-container>
</template>

<script setup lang="ts">
import { ref, Ref, watch } from "vue";
import { useI18n } from "vue-i18n-composable";
import AddFellowForm from "./ModalForm.vue";
import SortableTable from "./SortableTable.vue";
import FileHelper from "../utils/file-helper";
import { store, storeEvents } from "../store";
import { Node, Fellow, NewFellow, Sort } from "../types";

const { t } = useI18n();

type FellowNode = Node<Fellow | null>;

const persons: Map<number, FellowNode> = new Map();
const fellows = ref(store.state.fellows);
const fellowTree: Ref<FellowNode> = ref({ person: null, subordinates: [] });
const actionAdd = ref(false);
const actionEdit = ref(false);
const fellowToEdit: Ref<Node<Fellow> | null> = ref(null);

function addFellow(fellow: NewFellow) {
  store.commit("addFellow", fellow);
  addToTree(fellow as Fellow);
  actionAdd.value = false;
}
function editFellow(fellowUpdates: Fellow) {
  const fellow = persons.get(fellowUpdates.id) as FellowNode;
  const person = fellow.person as Fellow;
  let chiefChanged = false;
  if (person.chief !== fellowUpdates.chief) {
    chiefChanged = true;
  }
  Object.assign(person, fellowUpdates);
  chiefChanged && updateTree();
  actionEdit.value = false;
  store.commit(storeEvents.updateFellow, person);
}

function editRow(fellowNode: Node<Fellow>) {
  fellowToEdit.value = fellowNode;
  actionEdit.value = true;
}
function exportData() {
  const fellowList = fellows.value;
  const formattedFellowsData = fellowList.map(
      ({ name, phone, age, sex, id, chief }) => ({
        name,
        phone,
        age,
        sex: { male: "М", female: "Ж" }[sex],
        id,
        chief: fellowList.find(({ id }) => id == chief)?.name || "-",
      })
    ),
    glossary = {
      name: "Имя",
      phone: "Телефон",
      age: "Возраст",
      sex: "Пол",
      chief: "Руководитель",
      id: "ID",
    };
  const exportHelper = new FileHelper();
  const linkUrl = exportHelper.exportXlsm(formattedFellowsData, glossary);
  const link = document.createElement("a");
  link.href = linkUrl;
  link.setAttribute("download", "Сотрудники.xlsm");
  link.click();
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
function updateTree() {
  persons.clear();
  initTree(); //Надо бы конечно только часть дерева перестроить...
}
function initTree() {
  fellowTree.value = buildFellowTree();
}

const columns = [
  { key: "name", title: "Имя", size: 0.4 },
  { key: "age", title: "Возраст", size: 0.2 },
  {
    key: "sex",
    title: "Пол",
    size: 0.1,
    transform: (s: Fellow["sex"]) => t({ male: "М", female: "Ж" }[s]),
  },
  { key: "phone", title: "Телефон", size: 0.3 },
];
const fellowTableColumns = ref(columns);
const columnsSorting = ref(
  Object.fromEntries(columns.map((col) => [col.key, 1]))
) as Ref<{ [key: string]: Sort<any>["direction"] }>;

store.subscribe(({ type, payload }) => {
  if (type == storeEvents.setFellows) {
    fellows.value = payload;
    initTree();
  }
});

initTree();
</script>
<style lang="scss" src="../assets/main.scss"></style>
<style lang="scss" scoped>
.panel {
  position: sticky;
  top: 0;
}
</style>
