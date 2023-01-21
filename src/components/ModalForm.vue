<template>
  <ValidationObserver v-slot="{ handleSubmit }">
    <b-form @submit.prevent="handleSubmit(submit)">
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
            <FormInput
              rules="required|name"
              v-model="employee.name"
              :label="$t('Имя')"
              :placeholder="$t('Имя')"
              @input="employee.name = $event"
            />
            <FormInput
              rules="required|age"
              v-model.number="employee.age"
              type="number"
              :placeholder="$t('Возраст')"
              :label="$t('Возраст')"
              @input="employee.age = $event"
            />
            <FormInput
              rules="required|phone"
              v-model="employee.phone"
              :placeholder="$t('Телефон')"
              :label="$t('Телефон')"
              :mask="localeName"
              @input="employee.phone = $event"
            />
            <FormInput
              rules="required|sex"
              v-model="employee.sex"
              :options="sexOptions"
              :label="$t('Пол')"
              elementType="select"
              @input="employee.sex = $event"
            />
            <FormInput
              v-model="employee.chief"
              :options="chiefOptions"
              :label="t('Выберите начальника')"
              elementType="select"
              @input="employee.chief = $event"
            />
          </b-col>
        </b-row>
        <b-row align-h="end" class="mt-4"
          ><b-col cols="6">
            <b-button type="submit" :disabled="!dataChanged" class="w-100">{{
              $t("Сохранить")
            }}</b-button>
          </b-col></b-row
        >
      </b-container>
    </b-form>
  </ValidationObserver>
</template>

<script setup lang="ts">
import { computed, ref, defineProps, defineEmits } from "vue";
import { required } from "vee-validate/dist/rules";
import { extend } from "vee-validate";
import { useI18n } from "vue-i18n-composable";
import * as _ from "lodash";
import * as zod from "zod";
import { isPossiblePhoneNumber, CountryCode } from "libphonenumber-js";
import constants from "../constants";
import { Employee, NewEmployee, Node } from "../types";
import FormInput from "./FormInput.vue";
import { ValidationObserver } from "vee-validate";

type SelectOptions = { value: string | number | null; text: string }[];

const { t, locale } = useI18n();
const localeName = computed(() => {
  const locales = constants.locales as { [key: string]: string };
  return locales[locale.value] || "US";
});

const props = defineProps<{
  chiefs: Employee[];
  node?: Node<Employee> | null;
}>();
const emit = defineEmits<{
  (e: "add", value: NewEmployee): void;
  (e: "add", value: Employee): void;
}>();

const employee = ref(
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
const chiefsUnavailableFinder = (node: Node<Employee>) => {
  const res: Employee["id"][] = [node.person.id];
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
const sexOptions: SelectOptions = [
  { value: null, text: "Пол" },
  { value: "male", text: "Мужской" },
  { value: "female", text: "Женский" },
].map(({ value, text }) => {
  return { value, text: t(text).toString() };
});
const chiefOptions: SelectOptions = [
  { value: null, text: t("Выберите начальника").toString() },
  ...props.chiefs.map(({ name, id }) => ({
    text: name,
    value: id,
    disabled: chiefsUnAvailable.value.includes(id),
  })),
];

const validationSchema = {
  name: zod
    .string({
      invalid_type_error: "Введите имя",
    })
    .min(1, "Заполните это поле")
    .regex(/^[а-яa-z]+$/i, "Только буквы"),
  sex: zod.string({ invalid_type_error: "Укажите пол" }),
  age: zod.preprocess(
    (value) => (value ? Number(value) : null),
    zod
      .number({ invalid_type_error: "Укажите возраст" })
      .int()
      .min(18, "Старше 18")
  ),
  phone: zod
    .string({
      invalid_type_error: "Заполните это поле",
    })
    .refine(
      (phone) => isPossiblePhoneNumber(phone, localeName.value as CountryCode),
      "Некорректный номер"
    )
    .transform((phone: string) => phone.replace(/\D/g, "")), //телефон целесообразно будет хранить без форматирования
};

for (let key of ["name", "age", "phone", "sex"]) {
  extend(key, (value: string) => {
    const keyValidation = key as keyof typeof validationSchema;
    const check = formatValidationResult(
      validationSchema[keyValidation].safeParse(value)
    );
    return check.success || String(t(check.error));
  });
}
extend("required", {
  ...required,
  message: () => t("Заполните это поле").toString(),
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

const destination = props.node ? "update" : "create";
const dataChanged = computed(() => {
  const data = props.node;
  if (!data) {
    return true;
  }
  return !_.isEqual(data.person, employee.value);
});

function submit() {
  const { name, sex, age, phone, chief, id } = employee.value;
  const output = {
    name,
    sex,
    age,
    phone,
    chief,
    id,
  } as NewEmployee;
  emit("add", output);
}
</script>

<style lang="scss" scoped></style>
