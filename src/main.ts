import { createApp } from 'vue'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import App from './App.vue'
/* Vuetify（如果你有用 Vuetify 才需要） */
import 'vuetify/styles'

const vuetify = createVuetify({
  components,
  directives,
})

createApp(App)
  .use(vuetify)
  .mount('#app')
