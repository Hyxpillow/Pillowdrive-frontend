import './assets/base.css'

import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import App from './App.vue'

import { createWebHistory, createRouter } from 'vue-router'
import Home from './components/Home.vue'
import Login from './components/Login.vue'
import Register from './components/Register.vue'
import Reset from './components/Reset.vue'

const router = createRouter({
    history: createWebHistory(),
    routes: [
        { path: '/', redirect: "/home" },
        { path: '/home', component: Home },
        { path: '/login', component: Login },
        { path: '/register', component: Register },
        { path: '/reset', component: Reset },
    ]
})
const app = createApp(App)
app.use(ElementPlus)
app.use(router)
app.mount('#app')
