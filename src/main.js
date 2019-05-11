import Vue from 'vue'
import App from './App'
import router from './router'
import store from './store/index.js'
import axios from './utils/http'
import { px2rem } from './utils/utils'

Vue.config.productionTip = false

Vue.prototype.axios = axios;
px2rem();

new Vue({
    el: '#app',
    router,
    store,
    template: '<App/>',
    components: { App }
})
