const routes = [
  /*
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/IndexPage.vue') }
    ]
  },
  */

  {
    path: '/band-theory-visualizer',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { name: 'band-theory-visualizer', meta: { title: 'Band Theory Visualizer' }, path: '', component: () => import('pages/BandTheoryVisualizer.vue'), title: 'Band Theory Visualizer' }
    ]
  },

  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { name: 'about', meta: { title: 'About' }, path: '', component: () => import('pages/AboutPage.vue') }
    ]
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue')
  }
]

export default routes
