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
      :sortBy="sortBy"
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
let actionAdd = ref(false);
let actionEdit = ref(false);
const fellowToEdit: Ref<Node<Fellow> | null> = ref(null);

function addFellow(fellow: NewFellow) {
  addToTree(fellow as Fellow);
  actionAdd.value = false;
  store.commit("addFellow", fellow);
}
function editFellow(fellowUpdates: Fellow) {
  const fellow = persons.get(fellowUpdates.id) as FellowNode;
  const person = fellow.person as Fellow;
  let povyshenie = false; // Да что вы знаете про именование переменных...
  if (person.chief !== fellowUpdates.chief) {
    povyshenie = true;
  }
  Object.assign(person, fellowUpdates);
  povyshenie && updateTree();
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
        sex: ["М", "Ж"][sex],
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
    transform: (s: Fellow["sex"]) => t(["М", "Ж"][s]),
  },
  { key: "phone", title: "Телефон", size: 0.3 },
];
const fellowTableColumns = ref(columns);
const sortBy = ref({ key: "name", direction: 1 });
const columnsSorting = ref(
  Object.fromEntries(columns.map((col) => [col.key, 1]))
) as Ref<{ [key: string]: Sort<any>["direction"] }>;

// Можно было использовать store.subscribe, но мутация storeEvents.initialize асинхронная, так что через watch получается проще.
watch(
  () => fellows.value.length,
  (amount, oldAmount) => {
    if (amount && !oldAmount) {
      initTree();
    }
  }
);
initTree();
</script>
<style lang="scss" src="../assets/main.scss"></style>
<style lang="scss" scoped>
.panel {
  position: sticky;
  top: 0;
}
</style>
