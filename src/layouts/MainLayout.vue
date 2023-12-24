<template>
  <q-layout
    view="lHh Lpr lFf"
    :style="{
      backgroundColor: $q.dark.isActive ? 'grey-9' : 'grey-1'
    }"
  >
    <q-header elevated>
      <q-toolbar class="header-toolbar">
        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          @click="toggleLeftDrawer"
        />

        <q-toolbar-title>
          {{ $t($route.meta.title) || 'Solid State: Visualized' }}
        </q-toolbar-title>

        <div class="flex">
          <!-- Language Toggle -->
          <q-select
            :model-value="currentLocaleAsOption"
            :options="localesList"
            dense
            borderless
            dark
            class="q-ma-none"
            @update:model-value="setLocale($event.value)"
          >
            <template #prepend>
              <q-icon name="language" />
            </template>
          </q-select>
          <!-- Light Dark Toggle-->
          <q-toggle
            :model-value="$q.dark.isActive"
            dense
            icon="mdi-theme-light-dark"
            size="lg"
            color="secondary"
            @update:model-value="$q.dark.toggle()"
          />
        </div>
      </q-toolbar>
    </q-header>

    <q-drawer
      v-model="leftDrawerOpen"
      show-if-above
      bordered
    >
      <q-list>
        <q-item-label
          header
        >
          Links
        </q-item-label>

        <EssentialLink
          v-for="link in essentialLinks"
          :key="link.title"
          v-bind="link"
        />
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script>
import { defineComponent, ref, reactive, computed } from 'vue'
import EssentialLink from 'components/EssentialLink.vue'
import { useI18n } from 'vue-i18n'

export default defineComponent({
  name: 'MainLayout',

  components: {
    EssentialLink
  },

  setup () {
    const leftDrawerOpen = ref(false)

    const i18nLocale = useI18n({ useScope: 'global' })

    console.log(i18nLocale.locale)

    const linksList = reactive([
      {
        title: i18nLocale.t('Band Theory Visualizer'),
        to: { name: 'band-theory-visualizer' },
        icon: 'grid_view',
        caption: i18nLocale.t('Application to visualize the band theory of semiconductors')
      },
      {
        title: i18nLocale.t('About'),
        to: { name: 'about' },
        icon: 'info',
        caption: i18nLocale.t('About the developer and the project')
      },
      {
        title: 'Github',
        href: 'https://github.com/shotwn/solid-state-visualized',
        icon: 'mdi-github',
        target: '_blank',
        caption: i18nLocale.t('Github repository of the project')
      }
    ])

    const localesList = [
      {
        label: 'English',
        value: 'en-US'
      },
      {
        label: 'Türkçe',
        value: 'tr-TR'
      }
    ]

    const currentLocaleAsOption = computed(() => localesList.find(
      locale => {
        console.log(locale.value, i18nLocale.locale.value, locale.value === i18nLocale.locale.value)
        return locale.value === i18nLocale.locale.value
      }
    ))

    function setLocale (locale) {
      i18nLocale.locale.value = locale
    }

    return {
      essentialLinks: linksList,
      leftDrawerOpen,
      toggleLeftDrawer () {
        leftDrawerOpen.value = !leftDrawerOpen.value
      },
      currentLocaleAsOption,
      localesList,
      i18nLocale,
      setLocale
    }
  }
})
</script>

<style>
.body--light {
  /* ... */
  background-color: rgba(250, 250, 250, 0.9);
}

.body--dark {
  /* ... */
  background-image: radial-gradient( circle 815px at 23.4% -21.8%,  rgba(9,29,85,1) 0.2%, var(--q-dark) 100.2% ) !important;
}

.header-toolbar {
  background: linear-gradient(90deg, #4b6cb7 0%, #182848 100%);
}
</style>
