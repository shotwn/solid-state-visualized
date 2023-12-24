<template>
  <div
    class="flex q-pa-xs justify-between"
    style="font-size: 14px;"
  >
    <div
      class="value-grid col-grow"
    >
      <div
        v-for="(value, index) in values"
        :key="index"
        class="q-px-xs"
        :class="{
          'second-column': index > values.length / 3,
          'third-column': index > values.length / 3 * 2
        }"
      >
        <math-jax
          :formula="value"
        />
      </div>
    </div>
    <div
      class="text-center col-grow"
    >
      <div>
        Valance Band States Density
      </div>
      <math-jax
        :formula="valanceBandStatesDensityFormulaTex"
      />
      <div class="q-pt-md">
        Conduction Band States Density
      </div>
      <math-jax
        :formula="conductionBandStatesDensityFormulaTex"
      />
    </div>
    <div class="text-center col-grow">
      <div class="">
        Intrinsic Carrier Concentration
      </div>
      <math-jax
        :formula="intrinsicCarrierConcentrationFormulaTex"
      />
      <div class="q-pt-md">
        Fermi Energy for {{ semiConductor.semiConductorType.label }} Semi Conductor
      </div>
      <math-jax
        :formula="fermiLevelFormula"
      />
    </div>
  </div>
</template>

<script>
import { defineComponent } from 'vue'
import MathJax from '../MathJax.vue'
import {
  mathJs,
  valanceBandStatesDensityFormula,
  conductionBandStatesDensityFormula,
  intrinsicCarrierConcentrationFormula,
  fermiLevelFormulaForNTypeFormula,
  fermiLevelFormulaForPTypeFormula,
  fermiLevelFormulaForIntrinsicFormula
} from 'src/composables/solid-state-calculations.js'

const subscriptHandler = (node, options) => {
  if (node.type === 'SymbolNode' && node.name.includes('_')) {
    const index = node.name.indexOf('_')
    return ` ${node.name.substring(0, index + 1)}{${node.name.substring(index + 1)}}`
  }

  if (node.type === 'NumberNode') {
    return node.value.toFixed(2)
  }
}

const valueMap = {
  name: {
    label: 'Name',
    unit: '',
    symbol: 'Name'
  },
  semiConductorType: {
    label: 'Type',
    unit: '',
    symbol: 'Type',
    formatter (value) {
      return `\\text{${value.label}}`
    }
  },
  bandGap: {
    label: 'Band Gap',
    unit: 'J',
    symbol: 'E_g'
  },
  conductionBandEnergy: {
    label: 'Conduction Band Energy',
    unit: 'J',
    symbol: 'E_c'
  },
  valenceBandOffset: {
    label: 'Valence Band Energy',
    unit: 'J',
    symbol: 'E_v'
  },
  fermiLevel: {
    label: 'Fermi Energy',
    unit: 'J',
    symbol: 'E_F'
  },
  fermiLevelEV: {
    label: 'Fermi Energy',
    unit: 'eV',
    symbol: 'E_F'
  },
  temperature: {
    label: 'Temperature',
    unit: 'K',
    symbol: 'T'
  },
  valanceBandStatesDensity: {
    label: 'Valance Band States Density',
    unit: 'm^{-3}',
    convertToUnit: 'cm^{-3}',
    symbol: 'N_V'
  },
  conductionBandStatesDensity: {
    label: 'Conduction Band States Density',
    convertToUnit: 'cm^{-3}',
    unit: 'm^{-3}',
    symbol: 'N_C'
  },
  addedDonorDensity: {
    label: 'Added Donor Density',
    convertToUnit: 'cm^{-3}',
    unit: 'm^{-3}',
    symbol: 'N_D'
  },
  addedAcceptorDensity: {
    label: 'Added Acceptor Density',
    unit: 'm^{-3}',
    convertToUnit: 'cm^{-3}',
    symbol: 'N_A'
  },
  electronConcentration: {
    label: 'Electron Concentration',
    unit: 'm^{-3}',
    convertToUnit: 'cm^{-3}',
    symbol: 'n'
  },
  holeConcentration: {
    label: 'Hole Concentration',
    unit: 'm^{-3}',
    convertToUnit: 'cm^{-3}',
    symbol: 'p'
  },
  intrinsicCarrierConcentration: {
    label: 'Intrinsic Carrier Concentration',
    unit: 'm^{-3}',
    convertToUnit: 'cm^{-3}',
    symbol: 'n_i'
  }
}

export default defineComponent({
  components: {
    MathJax
  },
  props: {
    semiConductor: {
      type: Object,
      required: true
    }
  },
  computed: {
    values () {
      const semi = this.semiConductor
      const values = []
      for (const [key, value] of Object.entries(valueMap)) {
        if (value?.formatter) {
          values.push(`${value.symbol}: ${value.formatter(semi[key])}`)
          continue
        }

        if (value?.unit) {
          const unit = value.unit
          const magnitude = semi[key]

          // Ingest the unit as a mathjs unit
          const cleanedUnit = unit.replace(/[{}]/g, '')
          const asMathUnit = mathJs.unit(magnitude, cleanedUnit)

          // Convert to the target unit
          const targetUnit = value.convertToUnit || unit
          const cleanedTargetUnit = targetUnit.replace(/[{}]/g, '')

          // Pretty print the number
          const asNumber = asMathUnit.toNumber(cleanedTargetUnit).toPrecision(4)
          values.push(`${value.symbol}: ${asNumber} ${targetUnit}`)
          continue
        }
        values.push(`${value.symbol}: ${semi[key]}  ${value.unit}`)
      }

      return values
    },
    valanceBandStatesDensityFormulaTex () {
      const formulaAsText = valanceBandStatesDensityFormula.toTex({ parenthesis: 'keep', handler: subscriptHandler })
      return `N_{V} = ${formulaAsText} = ${this.semiConductor.valanceBandStatesDensity.toPrecision(4)} \\text{m}^{-3}`
    },
    conductionBandStatesDensityFormulaTex () {
      const formulaAsText = conductionBandStatesDensityFormula.toTex({ parenthesis: 'keep', handler: subscriptHandler })
      return `N_{C} = ${formulaAsText} = ${this.semiConductor.conductionBandStatesDensity.toPrecision(4)} \\text{m}^{-3}`
    },
    intrinsicCarrierConcentrationFormulaTex () {
      const formulaAsText = intrinsicCarrierConcentrationFormula.toTex({ parenthesis: 'keep', handler: subscriptHandler })
      return `n_{i} = p_{i} = ${formulaAsText} = ${this.semiConductor.intrinsicCarrierConcentration.toPrecision(4)} \\text{m}^{-3}`
    },
    fermiLevelFormula () {
      const semiConductor = this.semiConductor
      let formula = ''
      if (semiConductor.temperature === 0) {
        formula = 'E_v + E_g/2'
      }

      if (semiConductor.semiConductorType.type === 'intrinsic' || semiConductor.electronConcentration === semiConductor.holeConcentration) {
        // Intrinsic
        formula = fermiLevelFormulaForIntrinsicFormula.toTex({ parenthesis: 'keep', handler: subscriptHandler })
      } else if (semiConductor.semiConductorType.type === 'n-type' || semiConductor.semiConductorType.type === 'n-type-compensated') {
        // n-type
        formula = fermiLevelFormulaForNTypeFormula.toTex({ parenthesis: 'keep', handler: subscriptHandler })
      } else if (semiConductor.semiConductorType.type === 'p-type' || semiConductor.semiConductorType.type === 'p-type-compensated') {
        // p-type
        formula = fermiLevelFormulaForPTypeFormula.toTex({ parenthesis: 'keep', handler: subscriptHandler })
      }

      return `E_F = ${formula} = ${this.semiConductor.fermiLevel.toPrecision(4)} J`
    }

  }
})
</script>

<style lang="scss">
.value-grid {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  grid-auto-flow: row dense;

  @media (max-width: 1450px) {
    grid-template-columns: 1fr 1fr;
  }

  /* extra styles */
  grid-gap: 0px;

  div {
    grid-column-start: 1;
  }

  .second-column {
    grid-column-start: 2;
  }

  .third-column {
    grid-column-start: 3;
    @media (max-width: 1450px) {
      grid-column-start: 2;
    }
  }

  .fourth-column {
    grid-column-start: 4;
    @media (max-width: 1450px) {
      grid-column-start: 2;
    }
  }
}
</style>
