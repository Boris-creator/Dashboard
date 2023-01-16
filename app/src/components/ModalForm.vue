<template>
  <b-form @submit.stop.prevent>
    <b-container>
      <b-row>
        <b-col>
          <h2>Добавление сотрудника</h2>
        </b-col>
      </b-row>
      <b-row>
        <b-col>
          <b-form-group
            label="Имя"
            :invalid-feedback="personNameValidity.error"
          >
            <b-form-input
              v-model.trim="personName"
              :state="personNameValidity.success"
              trim
              @focus="displayErrors.personName = false"
              @blur="displayErrors.personName = true"
              @keyup.enter="displayErrors.personName = true"
              autofocus
            ></b-form-input>
          </b-form-group>
          <b-form-group label="Возраст" :invalid-feedback="ageValidity.error">
            <b-form-input
              v-model.number="age"
              :state="ageValidity.success"
              type="number"
              @focus="displayErrors.age = false"
              @blur="displayErrors.age = true"
              @keyup.enter="displayErrors.age = true"
            ></b-form-input>
          </b-form-group>
          <b-form-group label="Телефон" :invalid-feedback="phoneValidity.error">
            <b-form-input
              v-model.trim="phone"
              :state="phoneValidity.success"
              trim
              @focus="displayErrors.phone = false"
              @blur="displayErrors.phone = true"
              @keyup.enter="displayErrors.phone = true"
            ></b-form-input>
          </b-form-group>
          <b-form-group :invalid-feedback="sexValidity.error" class="mt-2">
            <b-form-select
              v-model="sex"
              :options="sexOptions"
              :state="sexValidity.success"
              class="w-50"
            ></b-form-select>
          </b-form-group>
          <b-form-group class="mt-2">
            <b-form-select
              v-model="chiefId"
              :options="chiefOptions"
              class="w-50"
            ></b-form-select>
          </b-form-group>
        </b-col>
      </b-row>
      <b-row
      align-h="end"
        ><b-col cols="6">
          <b-button @click.stop="submit" class="w-100">Сохранить</b-button>
        </b-col></b-row
      >
    </b-container>
  </b-form>
</template>

<script lang="ts">
import { Component, Vue, Prop, Emit } from "vue-property-decorator";
import * as zod from "zod";
import { Fellow, NewFellow } from "../types";

type SelectOptions = { value: string | number | null; text: string }[];

@Component({})
export default class Form extends Vue {
  @Prop({ type: Array, required: true })
  chiefs!: Fellow[];

  personName: Fellow["name"] | null = null;
  sex: Fellow["sex"] | null = null;
  age: Fellow["age"] | null = null;
  phone: Fellow["phone"] | null = null;
  chiefId: Fellow["chief"] | null = null;

  @Emit("add")
  addFellow() {
    const { personName: name, sex, age, phone, chiefId: chief } = this;
    return { name, sex, age, phone, chief } as NewFellow;
  }
  submit() {
    const fields = ["personName", "sex", "age", "phone"] as const;
    for (let key of fields) {
      this.displayErrors[key] = true;
    }
    if (!this.formValidity.success) {
      return;
    }
    this.addFellow();
  }
  get personNameValidity() {
    return this.getFieldValidity("personName", this.validationSchema.name);
  }
  get ageValidity() {
    return this.getFieldValidity("age", this.validationSchema.age);
  }
  get phoneValidity() {
    return this.getFieldValidity("phone", this.validationSchema.phone);
  }
  get sexValidity() {
    return this.getFieldValidity("sex", this.validationSchema.sex);
  }
  get formValidity() {
    const { personName: name, sex, age, phone } = this;
    return zod
      .object(this.validationSchema)
      .safeParse({ name, sex, age, phone });
  }
  private getFieldValidity(field: keyof this, schema: zod.Schema) {
    const fieldName = field as keyof typeof this.displayErrors;
    const { success, error, data } = this.formatValidationResult(
      schema.safeParse(this[field])
    );
    return {
      data,
      error,
      success: success || !this.displayErrors[fieldName],
    };
  }
  private formatValidationResult(check: zod.SafeParseReturnType<any, any>) {
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
  private validationSchema = {
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

  get chiefOptions(): SelectOptions {
    return [
      { value: null, text: "Выберите начальника" },
      ...this.chiefs.map(({ name, id }) => ({ text: name, value: id })),
    ];
  }
  sexOptions: SelectOptions = [
    { value: null, text: "Пол" },
    { value: 0, text: "Мужской" },
    { value: 1, text: "Женский" },
  ];
  displayErrors = {
    personName: false,
    age: false,
    phone: false,
    sex: false,
  };
}
</script>

<style></style>
