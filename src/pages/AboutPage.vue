<template>
  <q-page class="flex flex-center">
    <q-card
      style="width: 100%; height: 100%; max-width: 640px; max-height: 640px;"
      class="text-body1"
    >
      <q-card-section class="bg-primary text-white text-h3">
        {{ $t('About') }}
      </q-card-section>
      <q-card-section
        v-if="currentLang == 'tr-TR'"
        class="q-py-xl"
      >
        Bu proje FIZ4690 - Katı Hal Fiziği 2 dersi için hazırlanmıştır.

        <br><br><br>
        <b>Geliştirici</b><br>
        Fikret Anıl Haksever
        <br>
        YILDIZ TEKNİK ÜNİVERSİTESİ
        <br>
        Fizik Bölümü
        <br>
      </q-card-section>
      <q-card-section
        v-else
        class="q-py-xl"
      >
        This project is prepared for FIZ4690 - Solid State Physics 2 course.

        <br><br><br>
        <b>Developer</b><br>
        Fikret Anıl Haksever
        <br>
        YILDIZ TECHNICAL UNIVERSITY
        <br>
        Department of Physics
        <br>
      </q-card-section>
      <q-card-actions class="bg-primary text-white">
        <div class="text-h6 q-pl-sm">
          Contact
        </div>
        <q-space />
        <q-btn
          v-for="contact in contacts"
          :key="contact.label"
          :href="contact.href"
          dense
          outline
        >
          <q-icon
            v-if="contact.icon"
            :name="contact.icon"
            class="q-mr-sm"
            size="xs"
          />
          <q-icon
            v-if="!contact.icon"
            name="open_in_new"
            class="q-mr-sm"
            size="xs"
          />
          {{ contact.label }}
        </q-btn>
      </q-card-actions>
    </q-card>
  </q-page>
</template>

<script>
import { defineComponent } from 'vue'
export default defineComponent({
  name: 'AboutPage'
})

</script>

<script setup>
import { useI18n } from 'vue-i18n'

const i18nLocale = useI18n({ useScope: 'global' })
const currentLang = i18nLocale.locale

const contacts = [
  {
    label: 'email',
    href: 'mailto:anilhaksever@gmail.com',
    icon: 'email'
  },
  {
    label: 'github',
    href: 'https://github.com/shotwn',
    icon: 'mdi-github'
  },
  {
    label: 'forgezero.com',
    href: 'https://forgezero.com/contact'
  }
]

</script>
