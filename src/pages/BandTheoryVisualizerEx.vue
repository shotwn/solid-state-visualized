<template>
  <q-page class="flex flex-center">
    <div class="col">
      <div class="row q-col-gutter-md">
        <div class="col">
          <q-input
            :model-value="bandGap"
            :label="$t('bandGap')"
            type="number"
            step="0.01"
            @update:model-value="bandGap = Number($event)"
          >
            <template #append>
              eV
            </template>
          </q-input>
        </div>

        <div class="col">
          <q-input
            :model-value="temperature"
            :label="$t('temperature')"
            type="number"
            :min="0"
            step="1"
            @update:model-value="temperature = Number($event)"
          >
            <template #append>
              K
            </template>
            <template #prepend>
              <q-knob
                :model-value="temperature"
                :min="0"
                :max="1000"
                :step="1"
                :color="temperature > 350 ? 'primary' : 'negative'"
                @update:model-value="temperature = Number($event)"
              >
                <q-icon
                  name="thermostat"
                  size="md"
                  color="primary"
                />
              </q-knob>
            </template>
          </q-input>
        </div>

        <div class="col">
          {{ semiconductorType }} | {{ fermiLevel }}
        </div>
        <div class="col">
          <div class="row">
            <q-input
              :model-value="addedDonorDensityBase"
              :label="$t('addedDonorDensity')"
              type="number"
              step="1"
              min="0"
              :hint="addedDonorDensity"
              @update:model-value="addedDonorDensityBase = Number($event)"
            >
              <template #append>
                x10
              </template>
            </q-input>

            <q-input
              :model-value="addedDonorDensityExponent"
              type="number"
              step="1"
              min="0"
              max="64"
              @update:model-value="addedDonorDensityExponent = Number($event)"
            />
          </div>
        </div>
        <div class="col">
          <div class="row">
            <q-input
              :model-value="addedAcceptorDensityBase"
              :label="$t('addedAcceptorDensity')"
              type="number"
              step="1"
              min="0"
              :hint="addedAcceptorDensity"
              @update:model-value="addedAcceptorDensityBase = Number($event)"
            >
              <template #append>
                x10
              </template>
            </q-input>

            <q-input
              :model-value="addedAcceptorDensityExponent"
              type="number"
              step="1"
              min="0"
              max="64"
              @update:model-value="addedAcceptorDensityExponent = Number($event)"
            />
          </div>
        </div>
      </div>

      <div class="row">
        <div class="col">
          <q-toggle
            v-model="showOnlyDistribution.belowValenceBand"
            :label="$t('showOnlyValenceBand')"
          />
          <q-toggle
            v-model="showOnlyDistribution.aboveConductionBand"
            :label="$t('showOnlyConductionBand')"
          />
          <math-jax
            :formula="fermiDistributionFormulaTex"
            :safe="false"
          />
          <div>
            <Line
              :chart-data="fermiDistributionGraph.data"
              :chart-options="fermiDistributionGraph.options"
              style="width: 100%; height: 100%;"
            />
          </div>
        </div>
        <div class="col">
          <math-jax
            :formula="electronConcentrationTemperatureFormulaTex"
            :safe="false"
          />
          <div>
            <Line
              :chart-data="carrierConcentrationTemperatureGraph.data"
              :chart-options="carrierConcentrationTemperatureGraph.options"
              style="width: 100%; height: 100%;"
            />
          </div>
        </div>
      </div>
    </div>
  </q-page>
  <q-drawer
    v-model="rightDrawerOpen"
    show-if-above
    bordered
    side="right"
  >
    <q-list>
      <q-item>
        <q-input
          v-model="boltzmannConstant"
          :label="$t('boltzmannConstant')"
        >
          <template #append>
            eV/K
          </template>
        </q-input>
      </q-item>
    </q-list>
  </q-drawer>
</template>

<script>
import { defineComponent } from 'vue'
import { Line } from 'vue-chartjs'
import zoomPlugin from 'chartjs-plugin-zoom'
import { create, all } from 'mathjs'
import MathJax from 'components/MathJax.vue'

import {
  fermiDistribution,
  electronStatesDensity,
  holeStatesDensity,
  intrinsicCarrierConcentration,
  eVToJoules,
  createSemiConductor
} from 'src/composables/solid-state-calculations.js'

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

const math = create(all)

const subscriptHandler = (node, options) => {
  if (node.type === 'SymbolNode' && node.name.includes('_')) {
    const index = node.name.indexOf('_')
    return ` ${node.name.substring(0, index + 1)}{${node.name.substring(index + 1)}}`
  }

  if (node.type === 'NumberNode') {
    return node.value.toFixed(2)
  }
}

export default defineComponent({
  name: 'IndexPage',
  components: {
    Line,
    MathJax
  },
  setup () {
    return {
      subscriptHandler,
      fermiDistribution,
      electronStatesDensity,
      holeStatesDensity,
      intrinsicCarrierConcentration,
      eVToJoules,
      createSemiConductor
    }
  },
  data () {
    return {
      leftDrawerOpen: false,
      bandGap: 1.12, // eV
      temperature: 300, // K
      valenceBand: 0, // eV
      massOfElectron: 9.11 * Math.pow(10, -31), // kg
      electronEffectiveMass: 9.11 * Math.pow(10, -31) * 1.58, // kg
      holeEffectiveMass: 9.11 * Math.pow(10, -31) * 0.56, // kg
      showOnlyDistribution: {
        belowValenceBand: false,
        aboveConductionBand: false
      },

      semiconductors: []
    }
  },
  computed: {
    conductionBand () {
      return this.valenceBand + this.bandGap
    },
    addedAcceptorDensity () {
      return this.addedAcceptorDensityBase * Math.pow(10, this.addedAcceptorDensityExponent)
    },
    addedDonorDensity () {
      return this.addedDonorDensityBase * Math.pow(10, this.addedDonorDensityExponent)
    },
    semiconductorType () {
      if (this.addedAcceptorDensity > this.addedDonorDensity) {
        return 'p-type'
      } else if (this.addedAcceptorDensity < this.addedDonorDensity) {
        return 'n-type'
      } else {
        return 'intrinsic'
      }
    },
    fermiLevel () {
      if (this.semiconductorType === 'intrinsic') {
        return this.valenceBand + this.bandGap / 2
      }

      if (this.semiconductorType === 'n-type') {
        const fermiLevelFormulaForNType = math.parse('E_c + k * T * log(n / N_c)')

        return fermiLevelFormulaForNType.evaluate({
          E_c: this.conductionBand,
          k: this.boltzmannConstant,
          T: this.temperature,
          n: this.electronCarrierConcentration(this.temperature),
          N_c: this.electronStatesDensity(this.temperature)
        })
      }

      // p-type
      const fermiLevelFormulaForPType = math.parse('E_v - k * T * log(p / N_v)')

      return fermiLevelFormulaForPType.evaluate({
        E_v: this.valenceBand,
        k: this.boltzmannConstant,
        T: this.temperature,
        p: this.holeCarrierConcentration(this.temperature),
        N_v: this.holeStatesDensity(this.temperature)
      })
    },
    fermiDistributionGraph () {
      const fermiLevel = this.fermiLevel
      const valenceBand = this.valenceBand
      const conductionBand = this.conductionBand
      const topEnergyToPlot = conductionBand + 0.2
      const bottomEnergyToPlot = valenceBand - 0.2
      const energyStep = 0.005
      const datasets = []
      const data = []
      const pointBackgroundColors = []
      for (let i = bottomEnergyToPlot; i < topEnergyToPlot; i += energyStep) {
        const y = this.fermiDistribution(i) * 100
        data.push({
          x: i,
          y
        })

        if (y > 1e-9) {
          pointBackgroundColors.push('blue')
        } else {
          pointBackgroundColors.push('red')
        }
      }

      // Apply filters to data
      // eslint-disable-next-line no-unused-vars
      const filteredData = data.filter(d => {
        if (d.x < valenceBand && this.showOnlyDistribution.aboveConductionBand) {
          return false
        }
        if (d.x > conductionBand && this.showOnlyDistribution.belowValenceBand) {
          return false
        }
        if (d.x > valenceBand && d.x < conductionBand && (this.showOnlyDistribution.belowValenceBand || this.showOnlyDistribution.aboveConductionBand)) {
          return false
        }
        return true
      })

      datasets.push({
        label: this.$t('fermiDistribution'),
        data: filteredData,
        borderColor: 'red',
        pointBackgroundColor: pointBackgroundColors
      })

      // Now do with predetermined temperatures 10, 100, 200, 300, 400, 500
      /*
      const temperatures = [10, 100, 200, 300, 400, 500]
      for (const temperature of temperatures) {
        const data = []
        for (let i = bottomEnergyToPlot; i < topEnergyToPlot; i += energyStep) {
          data.push(
            {
              x: i,
              y: this.fermiDistribution(i, temperature) * 100
            }
          )
        }

        datasets.push({
          label: `${this.$t('fermiDistribution')} @ ${temperature}K`,
          data
        })
      }
      */

      // Mark the fermi level
      datasets.push({
        label: this.$t('fermiLevel'),
        data: [
          {
            x: fermiLevel,
            y: 0
          },
          {
            x: fermiLevel,
            y: 100
          }
        ],
        borderColor: 'black',
        borderDash: [5, 5]
      })

      // Mark the band gap
      datasets.push({
        label: this.$t('valenceBand'),
        data: [
          {
            x: valenceBand,
            y: 0
          },
          {
            x: valenceBand,
            y: 100
          },
          {
            x: bottomEnergyToPlot - 0.1,
            y: 100
          },
          {
            x: bottomEnergyToPlot - 0.1,
            y: 0
          }
        ],
        borderColor: 'black',
        borderDash: [5, 5],
        fill: 'shape',
        backgroundColor: 'rgba(0, 255, 0, 0.1)'
      })

      // Mark the band gap
      datasets.push({
        label: this.$t('conductionBand'),
        data: [
          {
            x: conductionBand,
            y: 0
          },
          {
            x: conductionBand,
            y: 100
          },
          {
            x: topEnergyToPlot + 0.1,
            y: 100
          },
          {
            x: topEnergyToPlot + 0.1,
            y: 0
          }
        ],
        borderColor: 'black',
        borderDash: [5, 5],
        fill: 'shape',
        backgroundColor: 'rgba(0, 255, 0, 0.1)'
      })

      // Find Max X and Min X
      let maxX = -Infinity
      let minX = Infinity

      for (const point of filteredData) {
        if (point.x > maxX) {
          maxX = point.x
        }
        if (point.x < minX) {
          minX = point.x
        }
      }

      // Find max Y and min Y
      let maxY = -Infinity
      let minY = Infinity

      for (const point of filteredData) {
        if (point.y > maxY) {
          maxY = point.y
        }
        if (point.y < minY) {
          minY = point.y
        }
      }

      // Add some padding
      maxX += 0.01
      minX -= 0.01
      maxY += 0.01
      minY -= 0.01

      // console.log(datasets)
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
              },
              min: minY,
              max: maxY
            },
            x: {
              type: 'linear',
              title: {
                display: true,
                text: `${this.$t('energy')} (eV)`
              },
              max: maxX,
              min: minX
            }
          },
          plugins: {
            zoom: {
              limits: {
                x: { min: minX, max: maxX, minRange: 100 },
                y: { min: minY, max: maxY, minRange: 1 }
              },
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
                    label += context.parsed.y.toFixed(8) + '%'
                  }
                  return label
                }
              }
            }
          }
        }
      }
    },
    fermiDistributionFormulaTex () {
      const fermiLevel = this.fermiLevel
      return '$$' + this.fermiDistributionFormula.toTex({ handler: this.subscriptHandler }) + '$$ <br> $$ =' + math.resolve(this.fermiDistributionFormula, {
        E_f: fermiLevel,
        k: this.boltzmannConstant,
        T: this.temperature
      }).toTex({ handler: this.subscriptHandler }) + '$$'
    },
    electronConcentrationTemperatureFormulaTex () {
      return '$$ n_i=n_p=' + this.electronConcentrationTemperatureFormula.toTex({ handler: this.subscriptHandler }) + '$$ <br> $$ =' + math.resolve(this.electronConcentrationTemperatureFormula, {
        k: this.boltzmannConstantInJoules,
        m_e: this.electronEffectiveMass,
        m_h: this.holeEffectiveMass,
        h: this.plancksConstantInJoules,
        T: this.temperature,
        E_g: this.eVToJoules(this.bandGap)
      }).toTex({ handler: this.subscriptHandler }) + '$$<br>$$=' + this.intrinsicCarrierConcentration(this.temperature) + '$$'
    },
    carrierConcentrationTemperatureGraph () {
      const labels = []
      const datasets = []
      const data = []
      const maxTemperature = 700
      let maxReachedConcentration = 0

      // electron concentration for different temperatures
      for (let temperature = 50; temperature < maxTemperature; temperature += 5) {
        labels.push(temperature)
        const electronConcentration = this.electronCarrierConcentration(temperature)
        data.push({
          x: temperature,
          y: electronConcentration
        })
        if (electronConcentration > maxReachedConcentration) {
          maxReachedConcentration = electronConcentration
        }
      }

      datasets.push({
        label: this.$t('electronConcentration'),
        data,
        borderColor: 'red'
      })

      // hole concentration for different temperatures
      const holeData = []
      for (let temperature = 50; temperature < maxTemperature; temperature += 5) {
        const holeConcentration = this.holeCarrierConcentration(temperature)
        holeData.push({
          x: temperature,
          y: holeConcentration
        })
        if (holeConcentration > maxReachedConcentration) {
          maxReachedConcentration = holeConcentration
        }
      }

      datasets.push({
        label: this.$t('holeConcentration'),
        data: holeData,
        borderColor: 'blue'
      })

      // intrinsic carrier concentration
      const intrinsicCarrierConcentrationData = []
      for (let temperature = 50; temperature < maxTemperature; temperature += 5) {
        const intrinsicCarrierConcentration = this.intrinsicCarrierConcentration(temperature)
        intrinsicCarrierConcentrationData.push({
          x: temperature,
          y: intrinsicCarrierConcentration
        })
        if (intrinsicCarrierConcentration > maxReachedConcentration) {
          maxReachedConcentration = intrinsicCarrierConcentration
        }
      }

      datasets.push({
        label: this.$t('intrinsicCarrierConcentration'),
        data: intrinsicCarrierConcentrationData,
        borderColor: 'green'
      })

      // Mark selected temperature
      datasets.push({
        label: this.$t('temperature'),
        data: [
          {
            x: this.temperature,
            y: 0
          },
          {
            x: this.temperature,
            y: maxReachedConcentration
          }
        ],
        borderColor: 'black',
        borderDash: [5, 5]
      })

      return {
        data: {
          labels,
          datasets
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          title: { display: true, text: this.$t('chart2Title') },
          scales: {
            y: {
              type: 'linear',
              title: {
                display: true,
                text: this.$t('electronConcentration') + ' (m⁻³)'
              },
              min: 0,
              max: maxReachedConcentration
            },
            x: {
              type: 'linear',
              title: {
                display: true,
                text: `${this.$t('temperature')} (K)`
              },
              max: maxTemperature,
              min: 10
            }
          },
          plugins: {
            zoom: {
              limits: {
                x: { min: 10, max: maxTemperature, minRange: 100 },
                y: { min: 0, max: maxReachedConcentration, minRange: 1 }
              },
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
                    label += context.parsed.y.toFixed(8) + ' cm⁻³'
                  }
                  return label
                }
              }
            }
          }
        }
      }
    }
  },
  methods: {
    addSemiConductor () {
      this.semiconductors.push({
        uuid: self.crypto.randomUUID(),
        bandGap: 1.12, // eV
        valenceBand: 0, // eV
        temperature: 300 // K
      })
    },
    electronCarrierConcentration (temperature) {
      return this.intrinsicCarrierConcentration(temperature) + this.addedDonorDensity
    },
    holeCarrierConcentration (temperature) {
      return this.intrinsicCarrierConcentration(temperature) + this.addedAcceptorDensity
    }
  }
})
</script>
