import './vendor';
import './app.css';

import Vue from 'nativescript-vue';

import HelloWorld from './components/HelloWorld';

// Uncommment the following to see NativeScript-Vue output logs
Vue.config.silent = false;
Vue.config.debug = true;

new Vue({

    render: h => h(HelloWorld),

}).$start();
