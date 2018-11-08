import Vue from 'vue'
import axios from 'axios'

import App from './App'
import router from './router'
import store from './store'
import BootstrapVue from 'bootstrap-vue'

import { library } from '@fortawesome/fontawesome-svg-core'
import { faHome, faChevronDown } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'

import ECharts from 'vue-echarts/components/ECharts'
// import ECharts modules manually to reduce bundle size
import 'echarts/lib/echarts'
import 'echarts/lib/chart/line'
import 'echarts/lib/component/tooltip'
import 'echarts/lib/component/legend'
import 'echarts/lib/component/axisPointer'
import 'echarts/lib/component/title'
import 'echarts/lib/component/toolbox'

Vue.use(BootstrapVue)
Vue.component('v-chart', ECharts)
library.add(faHome)
library.add(faChevronDown)
Vue.component('font-awesome-icon', FontAwesomeIcon)

if (!process.env.IS_WEB) Vue.use(require('vue-electron'))
Vue.http = Vue.prototype.$http = axios
Vue.config.productionTip = false

window.Event = new Vue()

/* eslint-disable no-new */
new Vue({
  components: { App },
  router,
  store,
  template: '<App/>'
}).$mount('#app')
