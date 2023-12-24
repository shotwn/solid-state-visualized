<template>
  <q-tr class="semi-conductor-row">
    <q-td>
      <div class="q-pb-lg">
        <q-btn
          icon="colorize"
          dense
          outline
          :style="{ color: semi.color }"
        >
          <q-popup-proxy
            cover
            transition-show="scale"
            transition-hide="scale"
          >
            <q-color
              v-model="semi.color"
              dense
              outlined
              class="q-ma-none"
              hint=""
            />
          </q-popup-proxy>
        </q-btn>
      </div>
    </q-td>
    <q-td>
      <q-input
        v-model="semi.name"
        dense
        outlined
        class="q-ma-none"
        :hint="semi.semiConductorType.label"
      />
    </q-td>
    <q-td>
      <q-input
        :model-value="semi.bandGapEV"
        type="number"
        dense
        outlined
        class="q-ma-none"
        step="0.01"
        :hint="`~${eVToJoules(semi.bandGapEV).toPrecision(4)} J`"
        @update:model-value="semi.bandGapEV = Number($event)"
      />
    </q-td>
    <q-td>
      <q-input
        :model-value="semi.temperature"
        min="0"
        type="number"
        dense
        outlined
        class="q-ma-none"
        :hint="`~${kelvinToCelsius(semi.temperature).toPrecision(4)} °C`"
        style="min-width: 120px;"
        @update:model-value="semi.temperature = Number($event)"
      >
        <template #after>
          <q-knob
            :model-value="semi.temperature"
            :min="0"
            :max="5000"
            :step="1"
            size="md"
            show-value
            :style="{ color: temperatureGradualColorRGB }"
            @update:model-value="semi.temperature = Number($event)"
          >
            <q-icon
              name="mdi-thermometer"
              size="xs"
              :color="temperatureGradualColorRGB"
              @click.stop="semi.temperature = 300"
            />
          </q-knob>
        </template>
      </q-input>
    </q-td>
    <q-td style="min-width: 210px;">
      <div
        class="row flex no-wrap overflow-hidden"
        style="max-width: 100%; width: min-content; min-width: 100%"
      >
        <q-input
          v-model="semi.addedAcceptorDensityBase"
          type="number"
          dense
          outlined
          min="0"
          class="q-ma-none flex-grow"
          style="min-width: 105px;"
          :hint="`~${semi.addedAcceptorDensity.toPrecision(4)} / m³`"
          clearable
          @clear="semi.addedAcceptorDensityBase = 0; semi.addedAcceptorDensityExponent = 0"
        />
        <q-input
          :model-value="semi.addedAcceptorDensityExponent"
          type="number"
          step="1"
          min="0"
          max="64"
          flat
          dense
          outlined
          class="q-ma-none flex-grow"
          style="min-width: 105px;"
          @update:model-value="semi.addedAcceptorDensityExponent = Number($event)"
        >
          <template #prepend>
            <div class="q-mt-sm">
              x10
            </div>
          </template>
        </q-input>
      </div>
    </q-td>
    <q-td
      style="min-width: 210px;"
    >
      <div
        class="flex no-wrap overflow-hidden"
        style="max-width: 100%; width: min-content; min-width: 100%"
      >
        <q-input
          v-model="semi.addedDonorDensityBase"
          type="number"
          dense
          outlined
          min="0"
          class="q-ma-none flex-grow"
          style="min-width: 105px;"
          :hint="`~${semi.addedDonorDensity.toPrecision(4)} / m³`"
          clearable
          @clear="semi.addedDonorDensityBase = 0; semi.addedDonorDensityExponent = 0"
        />
        <q-input
          :model-value="semi.addedDonorDensityExponent"
          type="number"
          step="1"
          min="0"
          max="64"
          flat
          dense
          outlined
          class="q-ma-none flex-grow"
          style="min-width: 105px;"
          @update:model-value="semi.addedDonorDensityExponent = Number($event)"
        >
          <template #prepend>
            <div class="q-mt-sm">
              x10
            </div>
          </template>
        </q-input>
      </div>
    </q-td>
    <q-td>
      <q-input
        :model-value="semi.valenceBandOffsetEV"
        type="number"
        dense
        outlined
        class="q-ma-none"
        :hint="`~${eVToJoules(semi.valenceBandOffsetEV).toPrecision(4)} J`"
        step="0.1"
        @update:model-value="semi.valenceBandOffsetEV = Number($event)"
      />
    </q-td>
    <q-td>
      <q-input
        v-model="semi.holeEffectiveMassMultiplier"
        type="number"
        dense
        outlined
        class="q-ma-none"
        step="0.01"
        :hint="`~${electronMassToKg(semi.holeEffectiveMassMultiplier).toPrecision(4)} kg`"
      />
    </q-td>
    <q-td>
      <q-input
        v-model="semi.electronEffectiveMassMultiplier"
        type="number"
        dense
        outlined
        class="q-ma-none"
        step="0.01"
        :hint="`~${electronMassToKg(semi.electronEffectiveMassMultiplier).toPrecision(4)} kg`"
      />
    </q-td>
    <q-td>
      <div class="q-pb-lg">
        <q-btn
          color="negative"
          icon="o_delete"
          outline
          dense
          @click="$emit('delete:semi-conductor', semiConductor)"
        />
        <q-btn
          dense
          :outline="!semi.showInGraphs"
          :color="semi.showInGraphs ? 'primary' : 'grey'"
          class="q-ml-sm"
          icon="mdi-chart-bell-curve-cumulative"
          @click="semi.showInGraphs = !semi.showInGraphs"
        >
          <q-tooltip>
            Show in Graphs
          </q-tooltip>
        </q-btn>
      </div>
    </q-td>
  </q-tr>
</template>

<script>
import { defineComponent } from 'vue'

import {
  eVToJoules,
  kelvinToCelsius,
  electronMassToKg
}
  from 'src/composables/solid-state-calculations.js'

export default defineComponent({
  props: {
    semiConductor: {
      type: Object,
      default: () => ({
        uuid: '',
        name: '',
        bandGapEV: '',
        temperature: '',
        fermiLevel: '',
        donorConcentration: '',
        acceptorConcentration: '',
        electronConcentration: '',
        holeConcentration: ''
      })
    }
  },
  emits: ['update:semi-conductor', 'delete:semi-conductor'],
  setup () {
    return {
      eVToJoules,
      kelvinToCelsius,
      electronMassToKg
    }
  },
  computed: {
    semi () {
      return this.semiConductor
    },
    temperatureGradualColorRGB () {
      const temperature = this.semi.temperature
      const color = {
        r: 0,
        g: 0,
        b: 0
      }

      color.r =// max on 5000 K
        Math.min(255, Math.max(0, Math.round(temperature * 255 / 5000)))
      color.g = // min on 2500 K
        Math.min(255, Math.max(0, Math.round(255 - Math.abs(temperature - 2500) * 255 / 2500)))
      color.b = // min on 5000 K
        Math.min(255, Math.max(0, Math.round(255 - temperature * 255 / 5000)))

      return `rgb(${color.r}, ${color.g}, ${color.b})`
    }
  }
})

</script>

<style lang="scss" scoped>
.semi-conductor-row {
  .q-input {
    max-width: 100%;
    min-width: 75px
  }
}
</style>
