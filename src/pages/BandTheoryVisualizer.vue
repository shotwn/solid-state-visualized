<template>
  <q-page>
    <q-table
      :rows="semiConductors"
      :columns="columns"
      dense
      class="q-ma-xs"
    >
      <template #top>
        <div class="text-h6">
          {{ $t('Semi-Conductors') }}
        </div>
        <q-space />
        <q-btn
          color="primary"
          :label="$t('Add Semi-Conductor')"
          icon="mdi-plus"
          @click="addSemiConductor"
        />
      </template>

      <template #header-cell="props">
        <q-th
          :props="props"
          style="white-space: pre-wrap;"
          :auto-width="props.col.autoWidth"
        >
          {{ props.col.label }}
          <math-jax
            v-if="props.col.unit"
            :formula="`(${props.col.unit})`"
          />
        </q-th>
      </template>

      <template #header-cell-actions>
        <q-th />
      </template>

      <template #body="props">
        <semi-conductor-row
          :semi-conductor="props.row"
          @delete:semi-conductor="deleteSemiConductor($event)"
        />
      </template>
    </q-table>

    <div class="row">
      <div
        :class="{
          'col-6': calculationsHalfCol,
          'col-12': !calculationsHalfCol
        }"
      >
        <q-expansion-item
          class="q-ma-xs shadow-3 border-radius text-h6"
          :label="$t('Calculations')"
        >
          <template #header="">
            <div class="q-item__section flex q-item__section--main justify-center">
              <div class="text-h6">
                {{ $t('Calculations') }}
              </div>
              <q-space />
              <q-btn
                :color="calculationsHalfCol ? 'primary' : 'grey'"
                flat
                icon="mdi-arrow-collapse-horizontal"
                @click.stop="calculationsHalfCol = !calculationsHalfCol"
              />
            </div>
          </template>
          <q-tabs
            v-model="valueListTabViewUUID"
            class="q-ml-md"
            dense
            align="left"
          >
            <q-tab
              v-for="semiConductor in semiConductors"
              :key="semiConductor.uuid"
              :label="semiConductor.name"
              :name="semiConductor.uuid"
              :style="{ color: semiConductor.color }"
            />
          </q-tabs>
          <q-tab-panels
            v-if="valueListTabViewUUID"
            v-model="valueListTabViewUUID"
            class="text-body1"
          >
            <q-tab-panel
              v-for="semiConductor in semiConductors"
              :key="semiConductor.uuid"
              :name="semiConductor.uuid"
            >
              <semi-conductor-values-list
                :semi-conductor="semiConductor"
              />
            </q-tab-panel>
          </q-tab-panels>
        </q-expansion-item>
      </div>
      <div
        :class="{
          'col-6': bandGraphHalfCol,
          'col-12': !bandGraphHalfCol
        }"
      >
        <q-expansion-item
          :label="$t('Band Graph')"
          class="q-ma-xs shadow-3 border-radius text-h6 col-12"
          default-opened
        >
          <template #header="{expanded}">
            <div class="q-item__section flex q-item__section--main justify-center">
              <div class="text-h6">
                {{ $t('Band Graph') }}
              </div>
              <q-space />
              <q-btn
                :color="bandGraphHalfCol ? 'primary' : 'grey'"
                flat
                icon="mdi-arrow-collapse-horizontal"
                @click.stop="bandGraphHalfCol = !bandGraphHalfCol"
              />
              <q-btn
                v-if="expanded"
                :color="bandGraphFullscreen ? 'primary' : 'grey'"
                flat
                icon="expand"
                @click.stop="bandGraphFullscreen = !bandGraphFullscreen"
              />
            </div>
          </template>
          <distribution-chart
            :style="bandGraphStyle"
            :semi-conductors="semiConductors"
          />
        </q-expansion-item>
      </div>
      <div
        :class="{
          'col-6': temperatureGraphHalfCol,
          'col-12': !temperatureGraphHalfCol
        }"
      >
        <q-expansion-item
          :label="$t('Temperature - Carrier Graph')"
          class="q-ma-xs shadow-3 border-radius text-h6 col-12"
        >
          <template #header="{expanded}">
            <div class="q-item__section flex q-item__section--main justify-center">
              <div class="text-h6">
                {{ $t('Temperature - Carrier Graph') }}
              </div>
              <q-space />
              <q-btn
                :color="temperatureGraphHalfCol ? 'primary' : 'grey'"
                flat
                icon="mdi-arrow-collapse-horizontal"
                @click.stop="temperatureGraphHalfCol = !temperatureGraphHalfCol"
              />
              <q-btn
                v-if="expanded"
                :color="temperatureGraphFullscreen ? 'primary' : 'grey'"
                flat
                icon="expand"
                @click.stop="temperatureGraphFullscreen = !temperatureGraphFullscreen"
              />
            </div>
          </template>
          <temperature-graph
            :style="temperatureGraphStyle"
            :semi-conductors="semiConductors"
          />
        </q-expansion-item>
      </div>
    </div>
  </q-page>
</template>

<script>
import { defineComponent } from 'vue'
import {
  createSemiConductor
}
  from 'src/composables/solid-state-calculations.js'

import MathJax from 'components/MathJax.vue'
import SemiConductorRow from 'components/band-theory-visualizer/SemiConductorRow.vue'
import DistributionChart from 'components/band-theory-visualizer/DistributionGraph.vue'
import SemiConductorValuesList from 'components/band-theory-visualizer/SemiConductorValuesList.vue'
import TemperatureGraph from 'components/band-theory-visualizer/TemperatureGraph.vue'

export default defineComponent({
  components: {
    MathJax,
    SemiConductorRow,
    DistributionChart,
    SemiConductorValuesList,
    TemperatureGraph
  },
  setup () {
    return {

    }
  },
  data () {
    return {
      semiConductors: [],
      valueListTabViewUUID: 0,
      bandGraphFullscreen: false,
      temperatureGraphFullscreen: false,
      bandGraphHalfCol: false,
      temperatureGraphHalfCol: false,
      calculationsHalfCol: false
    }
  },
  computed: {
    columns () {
      return [
        {
          name: 'color',
          label: this.$t('Color'),
          field: 'color',
          align: 'left',
          autoWidth: true
        },
        {
          name: 'name',
          label: this.$t('Name'),
          field: 'name',
          align: 'left',
          sortable: true
        },
        {
          name: 'bandGap',
          label: this.$t('Band Gap'),
          unit: 'eV',
          field: 'bandGap',
          align: 'left',
          sortable: true
        },
        {
          name: 'temperature',
          label: this.$t('Temperature'),
          unit: 'K',
          field: 'temperature',
          align: 'left',
          sortable: true
        },
        {
          name: 'addedAcceptorDensity',
          label: this.$t('Doped Acceptor Density'),
          unit: 'm^{-3}',
          field: row => row.addedAcceptorDensityBase * Math.pow(10, row.addedAcceptorDensityExponent),
          align: 'left',
          sortable: true
        },
        {
          name: 'addedDonorDensity',
          label: this.$t('Doped Donor Density'),
          unit: 'm^{-3}',
          field: row => row.addedDonorDensityBase * Math.pow(10, row.addedDonorDensityExponent),
          align: 'left',
          sortable: true
        },
        {
          name: 'valenceBandOffset',
          label: this.$t('Valence Band Energy'),
          unit: 'eV',
          field: 'valenceBandOffset',
          align: 'left',
          sortable: true
        },
        {
          name: 'holeEffectiveMassMultiplier',
          label: this.$t('Hole Effective Mass'),
          unit: 'm_h',
          field: 'holeEffectiveMassMultiplier',
          align: 'left',
          sortable: true
        },
        {
          name: 'electronEffectiveMassMultiplier',
          label: this.$t('Electron Effective Mass'),
          unit: 'm_e',
          field: 'electronEffectiveMassMultiplier',
          align: 'left',
          sortable: true
        },
        {
          name: 'actions',
          label: '',
          field: 'uuid',
          align: 'right',
          sortable: false
        }
      ]
    },
    bandGraphStyle () {
      if (this.bandGraphFullscreen) {
        return {
          maxHeight: 'calc(95vh - 170px)',
          height: 'calc(95vh - 170px)'
        }
      } else {
        return {
          maxHeight: '40vh'
        }
      }
    },
    temperatureGraphStyle () {
      if (this.temperatureGraphFullscreen) {
        return {
          maxHeight: 'calc(95vh - 170px)',
          height: 'calc(95vh - 170px)'
        }
      } else {
        return {
          maxHeight: '40vh'
        }
      }
    }
  },
  mounted () {
    this.addSemiConductor()
    this.valueListTabViewUUID = this.semiConductors[0].uuid
  },
  methods: {
    addSemiConductor () {
      const countOtherSiliconSemiConductors = this.semiConductors.filter(sC => {
        return sC.name.includes('Silicon')
      }).length
      const name = countOtherSiliconSemiConductors > 0 ? `Silicon ${countOtherSiliconSemiConductors + 1}` : 'Silicon'
      const semiConductor = createSemiConductor({
        name
      })

      this.semiConductors.push(semiConductor)
    },
    deleteSemiConductor (semiConductor) {
      const index = this.semiConductors.findIndex(sC => {
        return sC.uuid === semiConductor.uuid
      })
      this.semiConductors.splice(index, 1)
    }
  }
})
</script>

<style lang="scss" scoped>
  :deep(mjx-container) {
    display: inline-block !important;
    margin: 0px !important;
  }
</style>
