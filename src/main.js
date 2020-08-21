import Vue from 'vue'
import App from './App.vue'
import router from './router' // index.js 파일은 생략 가능하다.

Vue.config.productionTip = false

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
