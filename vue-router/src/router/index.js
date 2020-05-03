import Vue from 'vue'
import VueRouter from '../vue-router'
import Home from '../views/Home.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/about',
    name: 'About',
    component: () => import(/* webpackChunkName: "about" */ '../views/About.vue'),
    children: [
      {
        path: 'a',
        component: {
          render(h) { return <h1>this is about a</h1> }
        }
      },
      {
        path: 'b',
        component: {
          render(h) { return <h1>this is about b</h1> }
        }
      }
    ]
  }
]

const router = new VueRouter({
  routes
})

router.beforeEach((to, from, next) => {
  console.log('切换--')
  next()
})

router.beforeEach((to, from, next) => {
  console.log('切换++')
  next()
})

export default router
