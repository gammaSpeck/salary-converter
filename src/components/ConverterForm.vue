<template>
  <n-form ref="formRef" :rules="rules" :model="formValue" size="large">
    <n-form-item
      label="Select Source Country"
      :show-feedback="false"
      required
      path="srcCountry"
    >
      <n-select
        v-model:value="formValue.srcCountry"
        @input="$event.target.composing = false"
        :options="srcOptions"
        filterable
      />
    </n-form-item>

    <n-form-item
      label="Amount in source country's local currency"
      required
      :show-feedback="false"
      path="srcCurrency"
    >
      <n-input-number
        placeholder="Local Currency value"
        v-model:value="formValue.srcCurrency"
        class="width-100-per"
      />
    </n-form-item>

    <n-form-item
      label="Select Target Country"
      :show-feedback="false"
      required
      path="targetCountry"
    >
      <n-select
        v-model:value="formValue.targetCountry"
        @input="$event.target.composing = false"
        :options="targetOptions"
        filterable
      />
    </n-form-item>

    <n-form-item>
      <n-space>
        <n-button type="primary" @click.prevent="submitForm">
          Calculate
        </n-button>
        <n-button type="error" @click="resetForm"> Reset </n-button>
      </n-space>
    </n-form-item>
  </n-form>
</template>

<script setup lang="ts">
import {
  NSelect,
  NSpace,
  NFormItem,
  NButton,
  NInputNumber,
  NForm,
  FormInst,
  FormRules
} from "naive-ui";
import { computed, reactive, ref } from "vue";
import { COUNTRY_MAP, CountryKeyType } from "../interfaces";

const emit = defineEmits<{
  (
    e: "submit",
    src: CountryKeyType,
    srcCurrency: number,
    target: CountryKeyType
  ): void;
  (e: "reset"): void;
}>();

interface IFormValue {
  srcCountry: CountryKeyType | null;
  srcCurrency: number | null;
  targetCountry: CountryKeyType | null;
}

const initialValues: IFormValue = {
  srcCountry: null,
  srcCurrency: null,
  targetCountry: null
};

const formRef = ref<FormInst | null>(null);
const formValue = reactive<IFormValue>(initialValues);

const options = computed(() => {
  return Object.values(COUNTRY_MAP).map((c) => ({
    label: c.countryName,
    value: c.countryCode
  }));
});

const srcOptions = computed(() =>
  options.value.map((o) => ({
    ...o,
    disabled: formValue.targetCountry === o.value
  }))
);

const targetOptions = computed(() =>
  options.value.map((o) => ({
    ...o,
    disabled: formValue.srcCountry === o.value
  }))
);

const rules: FormRules = {
  srcCountry: {
    required: true,
    trigger: ["input"]
  },
  srcCurrency: {
    required: true,
    trigger: ["input"],
    type: "number"
  },
  targetCountry: {
    required: true,
    trigger: ["input"]
  }
};

function submitForm() {
  formRef.value?.validate((errs) => {
    if (errs?.length) return;
    if (
      !formValue.srcCountry ||
      !formValue.srcCurrency ||
      !formValue.targetCountry
    )
      return;

    emit(
      "submit",
      formValue.srcCountry,
      formValue.srcCurrency,
      formValue.targetCountry
    );
  });
}

function resetForm() {
  formValue.srcCurrency = null;
  formValue.srcCountry = null;
  formValue.targetCountry = null;
  formRef.value?.restoreValidation();
  emit("reset");
}
</script>

<style scoped>
.width-100-per {
  width: 100%;
}
</style>
