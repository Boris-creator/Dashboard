<template>
  <b-container fluid>
    <b-row class="panel my-4">
      <b-col cols="2">
        <b-button @click="actionAdd = true">{{ $t("Добавить") }}</b-button>
      </b-col>
      <b-col>
        <b-button
          @click="exportData"
          :disabled="!employees.length"
          variant="outline-primary"
          >{{ $t("Экспорт данных") }}</b-button
        >
      </b-col>
    </b-row>
    <sortable-table
      :item="employeeTree"
      :columns="employeeTableColumns"
      :columnsSorting="columnsSorting"
      :isRoot="true"
      @edit="editRow"
    ></sortable-table>
    <b-modal v-model="actionAdd" hide-footer>
      <add-employee-form
        :chiefs="employees"
        @add="addEmployee"
      ></add-employee-form>
    </b-modal>
    <b-modal v-model="actionEdit" hide-footer>
      <add-employee-form
        :chiefs="employees"
        @add="editEmployee"
        :node="employeeToEdit"
      ></add-employee-form>
    </b-modal>
  </b-container>
</template>

<script setup lang="ts">
import { ref, Ref, watch } from "vue";
import { useI18n } from "vue-i18n-composable";
import AddEmployeeForm from "./ModalForm.vue";
import SortableTable from "./SortableTable.vue";
import FileHelper from "../utils/file-helper";
import { store, storeEvents } from "../store";
import { Node, Employee, NewEmployee, Sort } from "../types";

const { t } = useI18n();

type EmployeeNode = Node<Employee | null>;

const persons: Map<number, EmployeeNode> = new Map();
const employees = ref(store.state.employees);
const employeeTree: Ref<EmployeeNode> = ref({ person: null, subordinates: [] });
const actionAdd = ref(false);
const actionEdit = ref(false);
const employeeToEdit: Ref<Node<Employee> | null> = ref(null);

function addEmployee(employee: NewEmployee) {
  store.commit("addEmployee", employee);
  addToTree(employee as Employee);
  actionAdd.value = false;
}
function editEmployee(employeeUpdates: Employee) {
  const employee = persons.get(employeeUpdates.id) as EmployeeNode;
  const person = employee.person as Employee;
  let chiefChanged = false;
  if (person.chief !== employeeUpdates.chief) {
    chiefChanged = true;
  }
  Object.assign(person, employeeUpdates);
  chiefChanged && updateTree();
  actionEdit.value = false;
  store.commit(storeEvents.updateEmployee, person);
}

function editRow(employeeNode: Node<Employee>) {
  employeeToEdit.value = employeeNode;
  actionEdit.value = true;
}
function exportData() {
  const employeeList = employees.value;
  const formattedEmployeesData = employeeList.map(
      ({ name, phone, age, sex, id, chief }) => ({
        name,
        phone,
        age,
        sex: { male: "М", female: "Ж" }[sex],
        id,
        chief: employeeList.find(({ id }) => id == chief)?.name || "-",
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
  const linkUrl = exportHelper.exportXlsm(formattedEmployeesData, glossary);
  const link = document.createElement("a");
  link.href = linkUrl;
  link.setAttribute("download", "Сотрудники.xlsm");
  link.click();
}

function addToTree(
  employee: Employee,
  tree: EmployeeNode = employeeTree.value as EmployeeNode
) {
  const { chief: chiefId, id } = employee;
  const node: EmployeeNode = { person: employee, subordinates: [] };
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
function buildEmployeeTree() {
  const employeeTree: EmployeeNode = { person: null, subordinates: [] };
  const orphans: Map<number, EmployeeNode[]> = new Map();
  for (let employee of employees.value) {
    const { chief: chiefId, id } = employee;
    const node = addToTree(employee, employeeTree);
    if (orphans.has(id)) {
      const subordinates = orphans.get(id) as EmployeeNode[];
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
      const siblings = orphans.get(chiefId) as EmployeeNode[];
      siblings.push(node);
    }
  }
  return employeeTree;
}
function updateTree() {
  persons.clear();
  initTree(); //Надо бы конечно только часть дерева перестроить...
}
function initTree() {
  employeeTree.value = buildEmployeeTree();
}

const columns = [
  { key: "name", title: "Имя", size: 0.4 },
  { key: "age", title: "Возраст", size: 0.2 },
  {
    key: "sex",
    title: "Пол",
    size: 0.1,
    transform: (s: Employee["sex"]) => t({ male: "М", female: "Ж" }[s]),
  },
  { key: "phone", title: "Телефон", size: 0.3 },
];
const employeeTableColumns = ref(columns);
const columnsSorting = ref(
  Object.fromEntries(columns.map((col) => [col.key, 1]))
) as Ref<{ [key: string]: Sort<any>["direction"] }>;

store.subscribe(({ type, payload }) => {
  if (type == storeEvents.setEmployees) {
    employees.value = payload;
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
