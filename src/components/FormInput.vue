<template>
  <ValidationProvider
    :name="$attrs.name"
    ref="validator"
    :rules="rules"
    v-slot="{ valid, errors }"
  >
    <b-form-group v-bind="$attrs">
      <b-form-select
        v-if="elementType == 'select'"
        v-model="ownValue"
        v-bind="$attrs"
        :state="errors[0] ? false : valid ? true : null"
        class="w-50"
      />

      <b-form-input
        v-if="elementType == 'input'"
        v-model="ownValue"
        v-bind="$attrs"
        v-mask="props.mask || null"
        :state="errors[0] ? false : valid ? true : null"
      />
      <b-form-invalid-feedback>{{ errors[0] }}</b-form-invalid-feedback>
    </b-form-group>
  </ValidationProvider>
</template>

<script setup lang="ts">
import { ref, defineProps, withDefaults, defineEmits, watch } from "vue";
import { ValidationProvider } from "vee-validate";

const props = withDefaults(
  defineProps<{
    rules?: object | string;
    value: any;
    elementType?: "input" | "select";
    mask?: string;
    validate?: boolean;
  }>(),
  {
    elementType: "input",
  }
);

const ownValue = ref(props.value);
const emit = defineEmits<{
  (e: "input", value: typeof props.value): void;
}>();
watch(
  () => ownValue.value,
  (value) => {
    emit("input", value);
  }
);
watch(
  () => props.validate,
  (value) => {
    if (value) {
      validateField();
    }
  }
);

const validator = ref(null);
function validateField() {
  if (!validator.value) {
    return;
  }
  const input = validator.value as InstanceType<typeof ValidationProvider>;
  input.validate();
}
</script>
