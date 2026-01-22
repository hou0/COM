import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

// PrimeVue
import PrimeVue from 'primevue/config'
import 'primevue/resources/themes/lara-light-blue/theme.css'
import 'primevue/resources/primevue.min.css'
import 'primeicons/primeicons.css'

// PrimeVue Components
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Panel from 'primevue/panel'
import Menubar from 'primevue/menubar'
import Card from 'primevue/card'
import Dialog from 'primevue/dialog'
import InputNumber from 'primevue/inputnumber'
import Textarea from 'primevue/textarea'
import SelectButton from 'primevue/selectbutton'
import Checkbox from 'primevue/checkbox'
import Toolbar from 'primevue/toolbar'
import Divider from 'primevue/divider'

const app = createApp(App)

// Register PrimeVue components
app.use(PrimeVue)
app.use(router)

// Global components
app.component('Button', Button)
app.component('InputText', InputText)
app.component('DataTable', DataTable)
app.component('Column', Column)
app.component('Panel', Panel)
app.component('Menubar', Menubar)
app.component('Card', Card)
app.component('Dialog', Dialog)
app.component('InputNumber', InputNumber)
app.component('Textarea', Textarea)
app.component('SelectButton', SelectButton)
app.component('Checkbox', Checkbox)
app.component('Toolbar', Toolbar)
app.component('Divider', Divider)

app.mount('#app')
