<template>
  <Line
    :chart-data="fermiDistributionGraph.data"
    :chart-options="fermiDistributionGraph.options"
    style="width: 100%; height: 100%;"
  />
</template>

<script>
import { defineComponent } from 'vue'
import { Line } from 'vue-chartjs'
import zoomPlugin from 'chartjs-plugin-zoom'

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

import {
  fermiDistribution,
  conductionBandDensityOfEnergyStates,
  valenceBandDensityOfEnergyStates,
  eVToJoules
  // joulesToeV
} from 'src/composables/solid-state-calculations.js'

/**
 * @typedef {import('src/composables/solid-state-calculations').SemiConductor} SemiConductor
 */

export default defineComponent({
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
  setup () {
    return {

    }
  },
  data () {
    return {

    }
  },
  computed: {
    fermiDistributionGraph () {
      const datasets = []

      for (const /** @type {SemiConductor} */ semiConductor of this.semiConductors) {
        if (!semiConductor.showInGraphs) {
          continue
        }

        const data = []
        const topEnergyToPlot = semiConductor.conductionBandEnergyEV + 1
        const bottomEnergyToPlot = semiConductor.valenceBandOffsetEV - 1
        const energyStep = 0.01
        const pointBackgroundColors = []
        const pointSizesValance = []
        const pointSizesConduction = []
        const pointSizesNull = []

        for (let energy = bottomEnergyToPlot; energy <= topEnergyToPlot; energy += energyStep) {
          const fermiDistributionStepProbability = fermiDistribution(eVToJoules(energy), semiConductor.fermiLevel, semiConductor.temperature)

          data.push({
            x: energy,
            y: fermiDistributionStepProbability * 100
          })

          // Color if it is not in forbidden band and if it is not too small
          if ((energy > semiConductor.conductionBandEnergyEV && fermiDistributionStepProbability > 1e-10)) { //  || (energy < semiConductor.valenceBandOffsetEV && fermiDistributionStepProbability > 1e-9)
            pointBackgroundColors.push(semiConductor.color + '99')
          } else {
            pointBackgroundColors.push('rgba(0, 0, 0, 0.0)')
          }

          if (energy > semiConductor.conductionBandEnergyEV) {
            const densityOfEnergyStates = conductionBandDensityOfEnergyStates(eVToJoules(energy), semiConductor.conductionBandEnergy, semiConductor.electronEffectiveMassMultiplier)
            pointSizesValance.push(densityOfEnergyStates * fermiDistributionStepProbability)
          } else if (energy < semiConductor.valenceBandOffsetEV) {
            const densityOfEnergyStates = valenceBandDensityOfEnergyStates(eVToJoules(energy), semiConductor.valenceBandOffset, semiConductor.holeEffectiveMassMultiplier)
            pointSizesConduction.push(densityOfEnergyStates * fermiDistributionStepProbability)
          } else {
            pointSizesNull.push(1)
          }
        }

        // Normalize point sizes for the conduction band between 1 and 10
        const maxPointSizeConduction = Math.max(...pointSizesConduction)
        const minPointSizeConduction = Math.min(...pointSizesConduction)
        for (let i = 0; i < pointSizesConduction.length; i++) {
          pointSizesConduction[i] = (pointSizesConduction[i] - minPointSizeConduction) / (maxPointSizeConduction - minPointSizeConduction) * 10 + 1
        }

        // take the 3rd expected smallest point size and make it 1
        // since it is valance band we expect smallest near the fermi level
        const minPointSizeValance = pointSizesValance[pointSizesValance.length - 3]
        for (let i = 0; i < pointSizesValance.length; i++) {
          pointSizesValance[i] = pointSizesValance[i] / minPointSizeValance + 1 // min will be two

          // Make the max 10
          if (pointSizesValance[i] > 40) {
            pointSizesValance[i] = 1
          }
        }

        datasets.push({
          label: semiConductor.name + ' ' + this.$t('Fermi Distribution'),
          data,
          borderColor: semiConductor.color,
          backgroundColor: pointBackgroundColors,
          pointRadius: [...pointSizesValance, ...pointSizesNull, ...pointSizesConduction],
          percent: true
        })

        // Add the fermi level
        datasets.push({
          label: semiConductor.name + ' ' + this.$t('Fermi Energy'),
          data: [
            {
              x: semiConductor.fermiLevelEV,
              y: 0
            },
            {
              x: semiConductor.fermiLevelEV,
              y: 100
            }
          ],
          borderColor: semiConductor.color,
          borderDash: [25, 25]
        })

        // Add the conduction band
        datasets.push({
          label: semiConductor.name + ' ' + this.$t('Conduction Band'),
          data: [
            {
              x: semiConductor.conductionBandEnergyEV,
              y: 0
            },
            {
              x: semiConductor.conductionBandEnergyEV,
              y: 100
            },
            {
              x: topEnergyToPlot,
              y: 100
            }
          ],
          borderColor: semiConductor.color,
          borderDash: [25, 25],
          fill: true,
          backgroundColor: semiConductor.color + '33',
          hidden: true
        })

        // Add the conduction band density of states
        const conductionBandData = []
        for (let energy = semiConductor.conductionBandEnergyEV; energy <= topEnergyToPlot; energy += energyStep * 2) {
          const conductionBandDensityOfEnergyStatesStepProbability = conductionBandDensityOfEnergyStates(eVToJoules(energy), semiConductor.conductionBandEnergy, semiConductor.electronEffectiveMassMultiplier)
          conductionBandData.push({
            x: energy,
            y: conductionBandDensityOfEnergyStatesStepProbability * 100
          })
        }

        datasets.push({
          label: '△ ' + semiConductor.name + ' ' + this.$t('Conduction Band') + ' ' + this.$t('Density of States'),
          data: conductionBandData,
          borderColor: semiConductor.color,
          borderDash: [5, 30],
          fill: true,
          yAxisID: 'densityOfStates',
          pointStyle: 'triangle',
          pointRadius: 4
        })

        // Add the valence band
        datasets.push({
          label: semiConductor.name + ' ' + this.$t('Valence Band'),
          data: [
            {
              x: semiConductor.valenceBandOffsetEV,
              y: 0
            },
            {
              x: semiConductor.valenceBandOffsetEV,
              y: 100
            },
            {
              x: bottomEnergyToPlot,
              y: 100
            }
          ],
          borderColor: semiConductor.color,
          borderDash: [25, 25],
          fill: true,
          backgroundColor: semiConductor.color + '33',
          hidden: true
        })

        // Add the valence band density of states
        const valenceBandData = []
        for (let energy = bottomEnergyToPlot; energy <= semiConductor.valenceBandOffsetEV; energy += energyStep * 2) {
          const valenceBandDensityOfEnergyStatesStep = valenceBandDensityOfEnergyStates(eVToJoules(energy), semiConductor.valenceBandOffset, semiConductor.holeEffectiveMassMultiplier)
          valenceBandData.push({
            x: energy,
            y: valenceBandDensityOfEnergyStatesStep * 100
          })
        }

        datasets.push({
          label: '△ ' + semiConductor.name + ' ' + this.$t('Valence Band') + ' ' + this.$t('Density of States'),
          data: valenceBandData,
          borderColor: semiConductor.color,
          borderDash: [5, 30],
          fill: true,
          yAxisID: 'densityOfStates',
          pointStyle: 'triangle',
          pointRadius: 4
        })
      }

      return {
        data: {
          datasets
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          title: { display: true, text: this.$t('chart1Title') },
          scales: {
            y: {
              type: 'linear',
              title: {
                display: true,
                text: this.$t('probability') + ' (%)'
              }
              // min: minY,
              // max: maxY
            },
            x: {
              type: 'linear',
              title: {
                display: true,
                text: `${this.$t('energy')} (eV)`
              }
              // max: maxX,
              // min: minX
            },
            densityOfStates: {
              type: 'linear',
              title: {
                display: true,
                text: `△ ${this.$t('Density of Energy States')}`
              },
              axis: 'y',
              position: 'right',
              grid: {
                display: true,
                drawOnChartArea: false
              }
              // max: maxX,
              // min: minX
            }
          },
          plugins: {
            zoom: {
              /* limits: {
                x: { min: minX, max: maxX, minRange: 100 },
                y: { min: minY, max: maxY, minRange: 1 }
              }, */
              pan: {
                enabled: true,
                mode: 'xy'
              },
              zoom: {
                wheel: {
                  enabled: true
                },
                pinch: {
                  enabled: true
                },
                mode: 'xy'
              }

            },
            tooltip: {
              callbacks: {
                label: function (context) {
                  let label = context.dataset.label || ''
                  if (label) {
                    label += ': '
                  }
                  if (context.parsed.y !== null) {
                    if (!context.dataset.percent) {
                      label += context.parsed.y
                    } else {
                      label += context.parsed.y.toFixed(8) + '%'
                    }
                  }
                  return label
                }
              }
            },
            legend: {
              position: 'top',
              labels: {
                // This more specific font property overrides the global property
                font: {
                  size: 12
                },
                boxWidth: 22
              }
            }
          }
        }
      }
    }
  },
  methods: {

  }
})
</script>
