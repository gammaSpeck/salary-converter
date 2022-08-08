<template>
  <!-- <n-config-provider> -->
  <div class="container">
    <n-h1>
      <n-text type="primary"> Salary Converter </n-text>
    </n-h1>

    <n-p depth="3">
      Currency converters tell you that you can get £82.65 for $100. But how
      much money would you need in London to buy the same things you'd buy in
      New York? This is where
      <n-a :href="HREF" target="_blank">
        <n-text type="info">Purchasing Power Parity</n-text>
      </n-a>
      is useful.
    </n-p>

    <ConverterForm @submit="onSubmit" @reset="reset" />

    <n-space vertical>
      <n-alert type="success" :show-icon="false">
        <n-statistic label="Value" tabular-nums>
          <n-number-animation
            ref="numberAnimationInstRef"
            :from="0"
            :to="targetState.currencyValue"
            :precision="2"
            :duration="500"
          />
        </n-statistic>
      </n-alert>

      <n-alert v-if="targetState.currencyValue" type="info" :show-icon="false">
        <n-p depth="3">
          In {{ srcState.name }}, {{ srcState.currencyValue }}
          {{ srcState.code }} ({{ srcState.codeName }}) will allow you to buy
          the same things you'd buy with
          {{ targetState.currencyValue }}
          {{ targetState.code }} ({{ targetState.codeName }}) in
          {{ targetState.name }}.
        </n-p>
      </n-alert>
    </n-space>
  </div>
  <!-- </n-config-provider> -->
</template>

<script setup lang="ts">
// This starter template is using Vue 3 <script setup> SFCs
// Check out https://vuejs.org/api/sfc-script-setup.html#script-setup
import {
  darkTheme,
  NH1,
  NText,
  NA,
  NPageHeader,
  NP,
  NumberAnimationInst,
  NAlert,
  NNumberAnimation,
  NStatistic,
  NSpace
} from "naive-ui";
import { onMounted, reactive, ref } from "vue";
import ConverterForm from "./components/ConverterForm.vue";
import { CountryKeyType, COUNTRY_MAP } from "./interfaces";
import cc from "currency-codes";

interface IState {
  name: string;
  currencyValue: number;
  code: string;
  codeName: string;
}

const HREF = "http://simple.wikipedia.org/wiki/Purchasing_power_parity";
/**
 * This is the year we consider
 */
const YEAR = 2021;
const ALL_COUNTRIES: readonly string[] = cc.countries();

const numberAnimationInstRef = ref<NumberAnimationInst | null>(null);

const srcState = ref<IState>({
  name: "",
  currencyValue: 0,
  code: "",
  codeName: ""
});
const targetState = ref<IState>({
  name: "",
  currencyValue: 0,
  code: "",
  codeName: ""
});

function approximateCurrencyUnits(name: string) {
  const codes = cc.country(name);
  if (codes.length)
    return {
      countryMatch: name,
      currency: codes[0].currency,
      code: codes[0].code
    };

  const countryNameRegex = new RegExp(name, "i");
  const [countryMatch = "no_match"] = ALL_COUNTRIES.filter((c) =>
    countryNameRegex.test(c)
  );
  const [{ currency, code } = { currency: "units", code: "units" }] =
    cc.country(countryMatch);

  return { countryMatch, currency, code };
}

function onSubmit(
  srcKey: CountryKeyType,
  srcCurrency: number,
  targetKey: CountryKeyType
) {
  const { countryName: srcName, pppMap: srcMap } = COUNTRY_MAP[srcKey];
  const { countryName: targetName, pppMap: targetMap } = COUNTRY_MAP[targetKey];

  const sourcePPA = parseFloat(srcMap[YEAR]);
  const targetPPA = parseFloat(targetMap[YEAR]);

  const ans = (srcCurrency / sourcePPA) * targetPPA;
  const targetCurrency = Math.round((ans + Number.EPSILON) * 100) / 100;

  const src = approximateCurrencyUnits(srcName);
  const target = approximateCurrencyUnits(targetName);

  numberAnimationInstRef.value?.play();

  srcState.value = {
    name: srcName,
    currencyValue: srcCurrency,
    code: src.code,
    codeName: src.currency
  };
  targetState.value = {
    name: targetName,
    currencyValue: targetCurrency,
    code: target.code,
    codeName: target.currency
  };
}

function reset() {
  srcState.value = {
    name: "",
    currencyValue: 0,
    code: "",
    codeName: ""
  };
  targetState.value = {
    name: "",
    currencyValue: 0,
    code: "",
    codeName: ""
  };
}

onMounted(() => {
  window.cc = cc;

  const all = cc.countries();
  console.log({ all });
  console.log(all.filter((c) => c.includes("Czech")));
});
</script>

<style scoped>
.container {
  margin: 0 20vw 0 20vw;
  /* background-color: aliceblue; */
}
</style>
