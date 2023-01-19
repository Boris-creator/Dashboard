<template>
  <b-form @submit.stop.prevent>
    <b-container>
      <b-row>
        <b-col>
          <h2>
            {{
              {
                create: $t("Добавление сотрудника"),
                update: $t("Редактирование данных"),
              }[destination]
            }}
          </h2>
        </b-col>
      </b-row>
      <b-row>
        <b-col>
          <b-form-group
            :label="$t('Имя')"
            :invalid-feedback="$t(fieldsValidity.name.error)"
          >
            <b-form-input
              v-model.trim="fellow.name"
              :state="fieldsValidity.name.success || !displayErrors.name"
              trim
              @focus="displayErrors.name = false"
              @blur="displayErrors.name = true"
              @keyup.enter="displayErrors.name = true"
              autofocus
            ></b-form-input>
          </b-form-group>
          <b-form-group
            :label="$t('Возраст')"
            :invalid-feedback="$t(fieldsValidity.age.error)"
          >
            <b-form-input
              v-model.number="fellow.age"
              :state="fieldsValidity.age.success || !displayErrors.age"
              type="number"
              min="1"
              @focus="displayErrors.age = false"
              @blur="displayErrors.age = true"
              @keyup.enter="displayErrors.age = true"
            ></b-form-input>
          </b-form-group>
          <b-form-group
            :label="$t('Телефон')"
            :invalid-feedback="$t(fieldsValidity.phone.error)"
          >
            <b-form-input
              v-model.trim="fellow.phone"
              v-cleave="{
                phone: true,
                phoneRegionCode: { ru: 'RU', en: 'US' }[locale],
              }"
              :state="fieldsValidity.phone.success || !displayErrors.phone"
              trim
              @focus="displayErrors.phone = false"
              @blur="displayErrors.phone = true"
              @keyup.enter="displayErrors.phone = true"
            ></b-form-input>
          </b-form-group>
          <b-form-group
            :invalid-feedback="fieldsValidity.sex.error"
            class="mt-2"
          >
            <b-form-select
              v-model="fellow.sex"
              :options="sexOptions"
              :state="fieldsValidity.sex.success || !displayErrors.sex"
              class="w-50"
            ></b-form-select>
          </b-form-group>
          <b-form-group class="mt-2">
            <b-form-select
              v-model="fellow.chief"
              :options="chiefOptions"
              class="w-50"
            ></b-form-select>
          </b-form-group>
        </b-col>
      </b-row>
      <b-row align-h="end"
        ><b-col cols="6">
          <b-button
            @mousedown="submit"
            :disabled="!dataChanged"
            class="w-100"
            :class="{ 'my-disabled': !formValidity.success }"
            >{{ $t("Сохранить") }}</b-button
          >
        </b-col></b-row
      >
    </b-container>
  </b-form>
</template>

<script setup lang="ts">
//TO DO: fix input mask internationalization
import { computed, ref, defineProps, defineEmits } from "vue";
import { useI18n } from "vue-i18n-composable";
import * as _ from "lodash";
import * as zod from "zod";
import { Fellow, NewFellow, Node } from "../types";
const { t, locale } = useI18n();

const props = defineProps<{ chiefs: Fellow[]; node?: Node<Fellow> | null }>();
const emit = defineEmits<{
  (e: "add", value: NewFellow): void;
  (e: "add", value: Fellow): void;
}>();

const fellow = ref(
  props.node
    ? { ...props.node.person }
    : {
        name: null,
        sex: null,
        age: null,
        phone: null,
        chief: null,
        id: null,
      }
);
const chiefsUnavailableFinder = (node: Node<Fellow>) => {
  const res: Fellow["id"][] = [node.person.id];
  node.subordinates.forEach((s) => {
    res.push(s.person.id, ...chiefsUnavailableFinder(s));
  });
  return res;
};
const chiefsUnAvailable = computed(() => {
  if (!props.node) {
    return [];
  }
  return chiefsUnavailableFinder(props.node);
});
type SelectOptions = { value: string | number | null; text: string }[];
const sexOptions: SelectOptions = [
    { value: null, text: "Пол" },
    { value: 0, text: "Мужской" },
    { value: 1, text: "Женский" },
  ].map(({ value, text }) => {
    return { value, text: t(text).toString() };
  }),
  chiefOptions: SelectOptions = [
    { value: null, text: t("Выберите начальника").toString() },
    ...props.chiefs.map(({ name, id }) => ({
      text: name,
      value: id,
      disabled: chiefsUnAvailable.value.includes(id),
    })),
  ];
const displayErrors = ref({
  name: false,
  age: false,
  phone: false,
  sex: false,
});

const validationSchema = {
  name: zod
    .string({
      invalid_type_error: "Введите имя",
    })
    .min(1, "Заполните это поле")
    .regex(/^[а-яa-z]+$/i, "Только буквы"),
  sex: zod.number({ invalid_type_error: "Укажите пол" }),
  age: zod
    .number({ invalid_type_error: "Укажите возраст" })
    .int()
    .min(18, "Старше 18"),
  phone: zod
    .string({ invalid_type_error: "Заполните это поле" })
    .regex(
      /^((\\+[1-9]{1,4}[ \\-]*)|(\\([0-9]{2,3}\\)[ \\-]*)|([0-9]{2,4})[ \\-]*)*?[0-9]{3,4}?[ \\-]*[0-9]{3,4}?$/,
      "Некорректный номер"
    )
    .transform((phone: string) => phone.replace(/\D/g, "")), //телефон целесообразно будет хранить без форматирования
};
const fieldsValidity = computed(() => {
  const { name, age, phone, sex } = fellow.value;
  return {
    name: getFieldValidity(name, validationSchema.name),
    age: getFieldValidity(age, validationSchema.age),
    phone: getFieldValidity(phone, validationSchema.phone),
    sex: getFieldValidity(sex, validationSchema.sex),
  };
});

const formValidity = computed(() => {
  return zod.object(validationSchema).safeParse(fellow.value);
});

function formatValidationResult(check: zod.SafeParseReturnType<any, any>) {
  if (!check.success) {
    return {
      success: false,
      error: check.error.issues[0].message,
      data: null,
    };
  }
  return {
    success: true,
    error: "",
    data: check.data,
  };
}
function getFieldValidity(value: any, schema: zod.Schema) {
  const { success, error, data } = formatValidationResult(
    schema.safeParse(value)
  );
  return {
    data,
    error,
    success: success,
  };
}

const destination = props.node ? "update" : "create";
const dataChanged = computed(() => {
  const data = props.node;
  if (!data) {
    return true;
  }
  return !_.isEqual(data.person, fellow.value);
  //return JSON.stringify(data.person) != JSON.stringify(fellow.value);
});

function submit() {
  const fields = ["name", "sex", "age", "phone"] as const;
  for (let key of fields) {
    displayErrors.value[key] = true;
  }
  if (!formValidity.value.success) {
    return;
  }
  addFellow();
}
function addFellow() {
  const { name, sex, age, phone, chief, id } = fellow.value;
  const output = {
    name,
    sex,
    age,
    phone,
    chief,
    id,
  } as NewFellow;
  emit("add", output);
}
</script>

<style lang="scss" scoped>
.my-disabled {
  opacity: 0.7;
  cursor: default;
}
</style>
