import Vue from 'vue'
import VueRouter from 'vue-router'

import Home from '@/views/Home'
import About from '@/views/About'
import TodoApp from '@/views/TodoApp'

Vue.use(VueRouter)

const routes = [
    {
        name: 'index',
        path: '/',
        component: Home
    },
    {
        name: 'about',
        path: '/about',
        component: About
    },
    {
        name: 'todos',
        path: '/todos',
        redirect: '/todos/all', // /todos/all 로 설정하여 처음에는 모든 항목 페이지로 이동하도록 한다.
        component: TodoApp,
        children: [
            {
                name: 'todos-filter',
                path: ':id'
            }
        ]
    }
]

export default new VueRouter({
    routes
})

/**
 * TodoApp.vue에 아래 router-link 설정 시 redirect: '/todos/all' 설정 안하면 화면이 보이지 않는다.
 * 경로에 /todos/all이 아니라ㅣ /all만 설정된다.
 * 아니면 to="/todos/all"로 설정해야 된다.
 * <router-link
        to="all"
        tag="button">
        모든 항목 ({{ total }})
    </router-link>
 */
