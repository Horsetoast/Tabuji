import Vue from 'vue';
import App from './components/App.vue';

export default new Vue({
  el: '#app2',
  render: h => h(App),
  data() {
    return {
      message: 'test',
    };
  }
});
