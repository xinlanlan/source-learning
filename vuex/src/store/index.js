import Vue from 'vue'
import Vuex from '../vuex'
import createLogger from 'vuex/dist/logger'

Vue.use(Vuex)

function logger(store) {
  let prevState = JSON.stringify(store.state)
  store.subscribe((mutations, newState) => {
    console.log(prevState)
    console.log(mutations)
    console.log(JSON.stringify(newState))
    prevState = JSON.stringify(newState)
  })
}

function persists(store) {
  let local = localStorage.getItem('vuex')
  if(local) {
    store.replaceState(JSON.parse(local))
  }
  store.subscribe((mutations, newState) => {
    localStorage.setItem('vuex', JSON.stringify(newState))
  })
}

let store = new Vuex.Store({
  plugins: [
    persists
  ],
  strict: true,
  modules: {
    a: {
      namespaced: true,
      state: {
        age: 'a100'
      },
      mutations: {
        syncChange(state, payload) {
          console.log('a-syncChange')
        }
      }
    },
    b: {
      namespaced: true,
      state: {
        age: 'b100'
      },
      mutations: {
        syncChange(state, payload) {
          console.log('b-syncChange')
        }
      },
      modules: {
        c: {
          namespaced: true,
          state: {
            age: 'c100'
          },
          mutations: {
            syncChange(state, payload) {
              console.log('c-syncChange')
            }
          }
        }
      }
    }
  },
  state: {
    age: 10
  },
  
  getters: {
    myAge(state) {
      return state.age + 20
    }
  },
  mutations: {
    syncChange(state, payload) {
      state.age += payload
      // setTimeout(() => {
        
      // })
    }
  },
  actions: {
    asyncChange({commit}, payload) {
      setTimeout(function() {
        commit('syncChange', payload)
      })
    }
  }
})

store.registerModule('d', {
  state: {
    age: 'd100'
  }
})

export default store
