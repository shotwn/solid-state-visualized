<template>
  <Line
    :chart-data="temperatureGraph.data"
    :chart-options="temperatureGraph.options"
    style="width: 100%; height: 100%;"
  />
</template>

<script>
import { defineComponent } from 'vue'

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  LogarithmicScale
} from 'chart.js'

import zoomPlugin from 'chartjs-plugin-zoom'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  LogarithmicScale,
  zoomPlugin
)

import { Line } from 'vue-chartjs'

import { intrinsicCarrierConcentration, electronConcentration, holeConcentration, valanceBandStatesDensity, conductionBandStatesDensity, electronMassToKg } from 'src/composables/solid-state-calculations'

/**
 * @typedef {import('src/composables/solid-state-calculations').SemiConductor} SemiConductor
 */

export default defineComponent({
  name: 'TemperatureGraph',
  components: {
    Line
  },
  props: {
    /**
     * @type {SemiConductor[]}
     */
    semiConductors: {
      type: Array,
      required: true
    }
  },
  computed: {
    temperatureGraph () {
      const datasets = []
      let initialTemperature = 0 // K
      let finalTemperature = 2000 // K

      // Initial analysis for the graph
      for (const semiConductor of this.semiConductors) {
        if (!semiConductor.showInGraphs) {
          continue
        }

        if (semiConductor.temperature < initialTemperature) {
          initialTemperature = semiConductor.temperature
        } else if (semiConductor.temperature > finalTemperature) {
          finalTemperature = semiConductor.temperature + 100 // K
        }
      }

      for (const semiConductor of this.semiConductors) {
        if (!semiConductor.showInGraphs) {
          continue
        }

        const step = 100 // K
        const data = []
        for (let temperature = initialTemperature; temperature <= finalTemperature; temperature += step) {
          // These are related to temperature, so they need to be calculated at each step
          const valanceBandStatesDensityStep = valanceBandStatesDensity(
            electronMassToKg(semiConductor.holeEffectiveMassMultiplier),
            temperature
          )

          const conductionBandStatesDensityStep = conductionBandStatesDensity(
            electronMassToKg(semiConductor.electronEffectiveMassMultiplier),
            temperature
          )

          const intrinsicCarrierConcentrationStep = intrinsicCarrierConcentration(
            conductionBandStatesDensityStep,
            valanceBandStatesDensityStep,
            semiConductor.bandGap,
            temperature
          )

          data.push(
            {
              x: temperature,
              y: intrinsicCarrierConcentrationStep
            }
          )
        }

        datasets.push({
          label: semiConductor.name + ' ' + this.$t('Intrinsic Carrier Density'),
          data,
          borderColor: semiConductor.color
        })

        const nTypeData = []
        for (const intrinsicConcentrationStep of data) {
          nTypeData.push({
            x: intrinsicConcentrationStep.x,
            y: electronConcentration(
              semiConductor.addedAcceptorDensity,
              semiConductor.addedDonorDensity,
              intrinsicConcentrationStep.y // intrinsic carrier concentration
            )
          })
        }

        datasets.push({
          label: semiConductor.name + ' ' + this.$t('n-Type Carrier Concentration'),
          data: nTypeData,
          borderColor: semiConductor.color,
          borderDash: [5, 5],
          backgroundColor: 'red'
        })

        const pTypeData = []
        for (const intrinsicConcentrationStep of data) {
          pTypeData.push({
            x: intrinsicConcentrationStep.x,
            y: holeConcentration(
              semiConductor.addedAcceptorDensity,
              semiConductor.addedDonorDensity,
              intrinsicConcentrationStep.y // intrinsic carrier concentration
            )
          })
        }

        datasets.push({
          label: semiConductor.name + ' ' + this.$t('p-Type Carrier Concentration'),
          data: pTypeData,
          borderColor: semiConductor.color,
          backgroundColor: 'blue',
          borderDash: [2, 2]
        })

        // Mark selected temperature
        datasets.push({
          label: semiConductor.name + ' ' + this.$t('Selected Temperature'),
          data: [
            {
              x: semiConductor.temperature,
              y: 0.01
            },
            {
              x: semiConductor.temperature,
              y: 1e25
            }
          ],
          borderColor: semiConductor.color,
          borderDash: [5, 5]
        })
      }

      return {
        data: {
          datasets
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            x: {
              type: 'linear',
              position: 'bottom',
              title: {
                display: true,
                text: this.$t('Temperature') + ' (K)'
              }
            },
            y: {
              type: 'logarithmic',
              title: {
                display: true,
                text: `${this.$t('Intrinsic Carrier Density')} (m⁻³) (log)`
              },
              ticks: {
                callback: (val) => (val.toPrecision(1))
              }
            }
          }
        }
      }
    }
  }
})
</script>
