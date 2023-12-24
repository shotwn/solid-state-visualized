import { boot } from 'quasar/wrappers'
// import VueMathjax from 'vue-mathjax-next'
import 'mathjax/es5/tex-svg-full.js'

// "async" is optional;
// more info on params: https://v2.quasar.dev/quasar-cli/boot-files
export default boot(async ({ app }/* { app, router, ... } */) => {
  // something to do
  // app.use(VueMathjax)
  window.MathJax.config = {
    tex: {
      inlineMath: [['$', '$'], ['\\(', '\\)']]
    },
    svg: {
      fontCache: 'global'
    }
  }
  window.MathJax.startup.getComponents()
  console.log('Mathjax boot file loaded')
})
