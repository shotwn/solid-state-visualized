import { create, all } from 'mathjs'
import { reactive, computed } from 'vue'

export const mathJs = create(all)

export const globalConstants = reactive({
  boltzmannConstant: 1.380649e-23, // J/K
  planckConstant: 6.62607015e-34, // J*s
  electronMass: 9.1093837015e-31, // kg
  hBar: 1.054571817e-34 // J*s
})

export const fermiDistributionFormula = mathJs.parse('1 / (1 + exp((E - E_f) / (k * T)))')

/**
 *
 * @param {*} energy J
 * @param {*} fermiLevel J
 * @param {*} temperature K
 * @returns probability
 */
export function fermiDistribution (energy, fermiLevel, temperature) {
  // return 1 / (1 + Math.exp((energy - fermiLevel) / (this.boltzmannConstant * temperature)))
  return fermiDistributionFormula.evaluate({
    E: energy,
    E_f: fermiLevel,
    k: globalConstants.boltzmannConstant,
    T: temperature
  })
}

const conductionBandDensityOfEnergyStatesFormula = mathJs.parse('1/(2 * pi^2 * hBar^3) * (2 * m_e)^(3/2) * sqrt(E - E_c)')
/**
 * N_CB
 * @param {*} energy J
 * @param {*} conductionBandEnergy J
 * @param {*} electronEffectiveMassMultiplier
 * @returns
*/
export function conductionBandDensityOfEnergyStates (energy, conductionBandEnergy, electronEffectiveMassMultiplier) {
  return conductionBandDensityOfEnergyStatesFormula.evaluate({
    E: energy,
    E_c: conductionBandEnergy,
    m_e: electronMassToKg(electronEffectiveMassMultiplier),
    hBar: globalConstants.hBar
  })
}

const valenceBandDensityOfEnergyStatesFormula = mathJs.parse('1/(2 * pi^2 * hBar^3) * (2 * m_h)^(3/2) * sqrt(E_v - E)')
/**
 * N_VB
 *
 * @param {*} energy J
 * @param {*} valenceBandEnergy J
 * @param {*} holeEffectiveMassMultiplier
 * @returns
 */
export function valenceBandDensityOfEnergyStates (energy, valenceBandEnergy, holeEffectiveMassMultiplier) {
  return valenceBandDensityOfEnergyStatesFormula.evaluate({
    E: energy,
    E_v: valenceBandEnergy,
    m_h: electronMassToKg(holeEffectiveMassMultiplier),
    hBar: globalConstants.hBar
  })
}

export const conductionBandStatesDensityFormula = mathJs.parse('2 * (2 * pi * m_e * k * T / h^2)^(3/2)')
/**
 * N_c
 * @param {*} electronEffectiveMass
 * @param {*} temperature
 * @returns
 */
export function conductionBandStatesDensity (electronEffectiveMass, temperature) {
  return conductionBandStatesDensityFormula.evaluate({
    k: globalConstants.boltzmannConstant,
    m_e: electronEffectiveMass,
    T: temperature,
    h: globalConstants.planckConstant
  })
}

export const valanceBandStatesDensityFormula = mathJs.parse('2 * (2 * pi * m_h * k * T / h^2)^(3/2)')
/**
 * N_v
 * @param {*} holeEffectiveMass
 * @param {*} temperature
 * @returns
 */
export function valanceBandStatesDensity (holeEffectiveMass, temperature) {
  return valanceBandStatesDensityFormula.evaluate({
    k: globalConstants.boltzmannConstant,
    m_h: holeEffectiveMass,
    T: temperature,
    h: globalConstants.planckConstant
  })
}

export const intrinsicCarrierConcentrationFormula = mathJs.parse('sqrt(N_c * N_v) * exp(-E_g / (2 * k * T))')
/**
 * n_i
 * @param {*} conductionBandStatesDensity N_c
 * @param {*} valanceBandStatesDensity N_v
 * @param {*} bandGap E_g
 * @param {*} temperature T
 * @returns
 */
export function intrinsicCarrierConcentration (conductionBandStatesDensity, valanceBandStatesDensity, bandGap, temperature) {
  // Check if the values are not NaN
  if (isNaN(conductionBandStatesDensity) || isNaN(valanceBandStatesDensity)) {
    console.warn('conductionBandStatesDensity or valanceBandStatesDensity is NaN')
    // return 0
  }

  const input = {
    N_c: conductionBandStatesDensity,
    N_v: valanceBandStatesDensity,
    E_g: bandGap,
    k: globalConstants.boltzmannConstant,
    T: temperature
  }

  return intrinsicCarrierConcentrationFormula.evaluate(input)
}

export function semiConductorType (electronConcentration, holeConcentration, addedAcceptorDensity, addedDonorDensity, intrinsicCarrierConcentration) {
  // Solar energy book section 6B
  // For intrinsic n_i^2 / n = p
  // For n-type n_i^2 / N_D = p should be << n
  const isNType = (intrinsicCarrierConcentration ** 2 / addedDonorDensity) < electronConcentration

  // For p-type n_i^2 / N_A = n should be << p
  const isPType = (intrinsicCarrierConcentration ** 2 / addedAcceptorDensity) < holeConcentration

  if (!isNType && !isPType) {
    return {
      type: 'intrinsic',
      isCompensated: false,
      label: 'Intrinsic' + (electronConcentration === holeConcentration ? '' : ' Low Doping') // If not pure but still not n or p type
    }
  } else if (isNType && isPType) {
    if (electronConcentration > holeConcentration) {
      return {
        type: 'n-type-compensated',
        isCompensated: true,
        label: 'N-type Compensated'
      }
    } else if (electronConcentration <= holeConcentration) {
      return {
        type: 'p-type-compensated',
        isCompensated: true,
        label: 'P-type Compensated'
      }
    }
  } else if (isNType) {
    return {
      type: 'n-type',
      isCompensated: false,
      label: 'N-Type'
    }
  } else if (isPType) {
    return {
      type: 'p-type',
      isCompensated: false,
      label: 'P-Type'
    }
  }
}

export const fermiLevelFormulaForIntrinsicFormula = mathJs.parse('(E_v + E_c) / 2 + k * T * log(N_v / N_c)')
export const fermiLevelFormulaForNTypeFormula = mathJs.parse('E_c - k * T * log(N_c / N_D)')
export const fermiLevelFormulaForPTypeFormula = mathJs.parse('E_v + k * T * log(N_v / N_A)')
/**
 *
 * @param {*} bandGap
 * @param {*} conductionBandStatesDensity
 * @param {*} valanceBandStatesDensity
 * @param {*} temperature
 * @param {*} electronConcentration
 * @param {*} holeConcentration
 * @returns Fermi Level (E_f) in eV
 */
export function fermiLevel (
  bandGap,
  conductionBandStatesDensity,
  valanceBandStatesDensity,
  temperature,
  electronConcentration,
  holeConcentration,
  valenceBandOffset,
  addedDonorDensity,
  addedAcceptorDensity,
  semiConductorType
) {
  const conductionBandEnergy = valenceBandOffset + bandGap

  if (temperature === 0) {
    return valenceBandOffset + bandGap / 2
  }

  if (semiConductorType.type === 'intrinsic' || electronConcentration === holeConcentration) {
    // Intrinsic
    return fermiLevelFormulaForIntrinsicFormula.evaluate({
      E_v: valenceBandOffset,
      E_c: conductionBandEnergy,
      k: globalConstants.boltzmannConstant,
      T: temperature,
      N_v: valanceBandStatesDensity,
      N_c: conductionBandStatesDensity
    })
  } else if (semiConductorType.type === 'n-type' || semiConductorType.type === 'n-type-compensated') {
    // n-type
    const fermiLevel = fermiLevelFormulaForNTypeFormula.evaluate({
      E_c: conductionBandEnergy,
      k: globalConstants.boltzmannConstant,
      T: temperature,
      N_D: electronConcentration - holeConcentration,
      N_c: conductionBandStatesDensity
    })

    return fermiLevel
  } else if (semiConductorType.type === 'p-type' || semiConductorType.type === 'p-type-compensated') {
    // p-type
    return fermiLevelFormulaForPTypeFormula.evaluate({
      E_v: valenceBandOffset,
      k: globalConstants.boltzmannConstant,
      T: temperature,
      N_A: holeConcentration - electronConcentration,
      N_v: valanceBandStatesDensity
    })
  }

  // return valenceBandOffset + bandGap / 2
}

export function electronConcentration (addedAcceptorDensity, addedDonorDensity, intrinsicCarrierConcentration) {
  // https://inst.eecs.berkeley.edu/~ee105/sp08/lectures/lecture2_6.pdf
  if (addedAcceptorDensity > addedDonorDensity) {
    // Assume p-type | obtain p from n_i^2 / (N_A - N_D)
    // n was added as an acceptor to stabilize low doping levels
    return intrinsicCarrierConcentration ** 2 / (addedAcceptorDensity - addedDonorDensity + intrinsicCarrierConcentration)
  } else {
    // Assume n-type or intrinsic
    return addedDonorDensity - addedAcceptorDensity + intrinsicCarrierConcentration
  }
}

export function holeConcentration (addedAcceptorDensity, addedDonorDensity, intrinsicCarrierConcentration) {
  // https://inst.eecs.berkeley.edu/~ee105/sp08/lectures/lecture2_6.pdf
  if (addedDonorDensity > addedAcceptorDensity) {
    // Assume n-type | obtain p from n_i^2 / (N_D - N_A)
    // n was added as a donor to stabilize low doping levels
    return intrinsicCarrierConcentration ** 2 / (addedDonorDensity - addedAcceptorDensity + intrinsicCarrierConcentration)
  } else {
    // Assume p-type or intrinsic
    return addedAcceptorDensity - addedDonorDensity + intrinsicCarrierConcentration
  }
}

export function eVToJoules (eV) {
  return Number(eV) * 1.602176634e-19
}

export function joulesToeV (joules) {
  return Number(joules) / 1.602176634e-19
}

export function celsiusToKelvin (celsius) {
  return Number(celsius) + 273.15
}

export function kelvinToCelsius (kelvin) {
  return Number(kelvin) - 273.15
}

export function electronMassToKg (multiplier) {
  return globalConstants.electronMass * multiplier
}

export function randomMaterialColor () {
  const colors = [
    '#e53935',
    '#d81b60',
    '#8e24aa',
    '#5e35b1',
    '#3949ab',
    '#1e88e5',
    '#039be5',
    '#00acc1',
    '#00897b',
    '#43a047',
    '#7cb342',
    '#c0ca33',
    '#fdd835',
    '#ffb300',
    '#fb8c00',
    '#f4511e',
    '#6d4c41',
    '#757575',
    '#546e7a'
  ]

  return colors[Math.floor(Math.random() * colors.length)]
}

/**
 * @typedef {Object} SemiConductor
 * @property {String} name
 * @property {String} uuid
 * @property {Number} bandGapEV
 * @property {Number} valenceBandOffsetEV
 * @property {Number} temperature
 * @property {Number} addedAcceptorDensityBase
 * @property {Number} addedDonorDensityBase
 * @property {Number} addedAcceptorDensityExponent
 * @property {Number} addedDonorDensityExponent
 * @property {Number} holeEffectiveMassMultiplier
 * @property {Number} electronEffectiveMassMultiplier
 * @property {Number} conductionBandOffset
 * @property {Number} addedAcceptorDensity
 * @property {Number} addedDonorDensity
 * @property {Number} conductionBandStatesDensity
 * @property {Number} valanceBandStatesDensity
 * @property {Number} intrinsicCarrierConcentration
 * @property {Number} electronConcentration
 * @property {Number} holeConcentration
 * @property {Number} fermiLevel
 * @property {Number} bandGap
 * @property {Number} valenceBandOffset
 * @property {Number} conductionBandEnergy
 */

export function createSemiConductor (parameters) {
  /**
   * @type {SemiConductor}
  */
  const semiConductor = reactive({
    name: parameters?.name || 'Silicon',
    color: parameters?.color || randomMaterialColor(),
    uuid: parameters?.uuid || self.crypto.randomUUID(),
    bandGapEV: parameters?.bandGapEV || 1.12,
    valenceBandOffsetEV: parameters?.valenceBandOffsetEV || 0,
    temperature: parameters?.temperature || 300,
    addedAcceptorDensityBase: parameters?.addedAcceptorDensityBase || 0,
    addedDonorDensityBase: parameters?.addedDonorDensityBase || 0,
    addedAcceptorDensityExponent: parameters?.addedAcceptorDensityExponent || 0,
    addedDonorDensityExponent: parameters?.addedDonorDensityExponent || 0,
    holeEffectiveMassMultiplier: parameters?.holeEffectiveMass || 0.81,
    electronEffectiveMassMultiplier: parameters?.electronEffectiveMass || 1.18,

    bandGap: computed(() => {
      return eVToJoules(semiConductor.bandGapEV)
    }),

    valenceBandOffset: computed(() => {
      return eVToJoules(semiConductor.valenceBandOffsetEV)
    }),

    // E_c (J)
    conductionBandEnergy: computed(() => {
      return semiConductor.valenceBandOffset + semiConductor.bandGap
    }),

    // E_c (J) -> E_c (eV)
    conductionBandEnergyEV: computed(() => {
      return joulesToeV(semiConductor.conductionBandEnergy)
    }),
    // N_A (m ^ -3)
    addedAcceptorDensity: computed(() => {
      return semiConductor.addedAcceptorDensityBase * Math.pow(10, semiConductor.addedAcceptorDensityExponent)
    }),
    // N_D (m ^ -3)
    addedDonorDensity: computed(() => {
      return semiConductor.addedDonorDensityBase * Math.pow(10, semiConductor.addedDonorDensityExponent)
    }),
    // N_CB
    conductionBandStatesDensity: computed(() => {
      return conductionBandStatesDensity(
        electronMassToKg(semiConductor.electronEffectiveMassMultiplier),
        semiConductor.temperature
      )
    }),
    // N_VB
    valanceBandStatesDensity: computed(() => {
      return valanceBandStatesDensity(
        electronMassToKg(semiConductor.holeEffectiveMassMultiplier),
        semiConductor.temperature
      )
    }),
    // n_i (m ^ -3)
    intrinsicCarrierConcentration: computed(() => {
      return intrinsicCarrierConcentration(
        semiConductor.conductionBandStatesDensity,
        semiConductor.valanceBandStatesDensity,
        semiConductor.bandGap,
        semiConductor.temperature
      )
    }),
    electronConcentration: computed(() => {
      return electronConcentration(
        semiConductor.addedAcceptorDensity,
        semiConductor.addedDonorDensity,
        semiConductor.intrinsicCarrierConcentration
      )
    }),
    holeConcentration: computed(() => {
      return holeConcentration(
        semiConductor.addedAcceptorDensity,
        semiConductor.addedDonorDensity,
        semiConductor.intrinsicCarrierConcentration
      )
    }),
    semiConductorType: computed(() => {
      return semiConductorType(
        semiConductor.electronConcentration,
        semiConductor.holeConcentration,
        semiConductor.addedAcceptorDensity,
        semiConductor.addedDonorDensity,
        semiConductor.intrinsicCarrierConcentration
      )
    }),
    fermiLevel: computed(() => {
      return fermiLevel(
        semiConductor.bandGap,
        semiConductor.conductionBandStatesDensity,
        semiConductor.valanceBandStatesDensity,
        semiConductor.temperature,
        semiConductor.electronConcentration,
        semiConductor.holeConcentration,
        semiConductor.valenceBandOffset,
        semiConductor.addedDonorDensity,
        semiConductor.addedAcceptorDensity,
        semiConductor.semiConductorType
      )
    }),
    fermiLevelEV: computed(() => {
      return joulesToeV(semiConductor.fermiLevel)
    }),

    showInGraphs: true
  })

  return semiConductor
}
