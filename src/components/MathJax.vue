<template>
  <span ref="mathjaxRef" />
</template>

<script>
import { defineComponent, reactive, toRefs, watch, onMounted } from 'vue'
export default defineComponent({
  name: 'MathJax',
  props: {
    formula: {
      type: String,
      default: ''
    },
    safe: {
      type: Boolean,
      default: true
    },
    options: {
      type: Object,
      default: function () {
        return {}
      }
    }
  },
  setup (props) {
    const state = reactive({
      mathjaxRef: null
    })

    const renderContent = () => {
      if (props.safe) {
        state.mathjaxRef.textContent = '$$' + props.formula + '$$'
      } else {
        state.mathjaxRef.innerHTML = props.formula
      }
    }

    const renderMathJax = () => {
      renderContent()
      if (window.MathJax) {
        window.MathJax.typeset()
      }
    }

    watch(
      () => props.formula,
      () => {
        renderMathJax()
      }
    )

    onMounted(() => {
      renderMathJax()
    })

    return {
      ...toRefs(state)
    }
  }
})
</script>
