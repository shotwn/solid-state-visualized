<template>
  <q-item
    clickable
    tag="a"
    :to="!href ? to : null"
    :href="href"
    :target="target"
  >
    <q-item-section
      v-if="icon"
      avatar
    >
      <q-icon :name="icon" />
    </q-item-section>

    <q-item-section>
      <q-item-label>{{ title }}</q-item-label>
      <q-item-label caption>
        {{ caption }}
      </q-item-label>
    </q-item-section>
  </q-item>
</template>

<script>
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'EssentialLink',
  props: {
    title: {
      type: String,
      required: true
    },

    caption: {
      type: String,
      default: ''
    },

    to: {
      type: Object,
      default: () => ({ name: 'index' })
    },

    icon: {
      type: String,
      default: ''
    },

    href: {
      type: String,
      default: undefined
    },

    target: {
      type: String,
      default: undefined
    }
  }
})
</script>
