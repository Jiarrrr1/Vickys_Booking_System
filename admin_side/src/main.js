// src/main.js
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'

// Import global styles
import './assets/css/base.css'
import './assets/css/main.css'

const app = createApp(App)

// Use Pinia for state management
app.use(createPinia())

// Use Vue Router for navigation
app.use(router)

app.mount('#app')