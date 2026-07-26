import { createPinia } from "pinia";
import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";

import "bootstrap-icons/font/bootstrap-icons.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";

// Estilos propios van despues de Bootstrap para poder sobreescribir variables
import "./assets/styles.css";

createApp(App).use(createPinia()).use(router).mount("#app");

//Se usa Pinia y no Vuex porque Pinia es la librería oficial de estado global para Vue 3, mas simple y mas moderna y con mejor integración con Composition API.
//Decidimos no usar Vuex porque es más complejo y verboso, ademas de que no aprovecha al máximo las características de Vue 3.
