import '@babel/polyfill';
// Import Component hooks before component definitions
import './component-hooks';
import './plugins/firebase';
import { auth } from './plugins/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import Vue from 'vue';
import './plugins/vuetify';
import './plugins/vee-validate';
import App from './App.vue';
import router from './router';
import store from '@/store';
import './registerServiceWorker';
import 'vuetify/dist/vuetify.min.css';


Vue.config.productionTip = false;

onAuthStateChanged(auth, (user) => {
  console.log('All time initialise');
  console.log(user);

  new Vue({
    router,
    store,
    render: (h) => h(App),
  }).$mount('#app');

});


