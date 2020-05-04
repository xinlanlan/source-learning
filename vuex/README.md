- 根据`new Vuex.Store()`这个语法我们知道暴漏一个Store得类和一个install方法
- install得主要功能就是接受传入得vue，并且将`this.$store = this.$options.store`
- 在Store内部创建一个Vue实例，data中放入`options.state`实现state得响应式
- getters得实现主要通过`this.getters = {}`并且将传入得getters对象通过`Object.defineProperty`中得get拿到定义创建得Vue实例中得state值
- 同样的commit和dispatch方法一样实现

基本结构如下
```
let Vue;

let forEach = (obj, callback) => {
    Object.keys(obj).forEach(key => {
        callback(key, obj[key])
    })
}

class Store {
    constructor(options) {
        this.vm = new Vue({
            data: {
                state: options.state
            }
        })
        let getters = options.getters
        let mutations = options.mutations
        let actions = options.actions
        this.getters =  {}
        this.mutations = {}
        this.actions = {}
        forEach(getters, (getterName, value) => {
            Object.defineProperty(this.getters, getterName, {
                get: () => {
                    return value(this.state)
                }
            })
        })
        forEach(mutations, (mutationName, value) => {
            this.mutations[mutationName] = (payload) => {
                value(this.state, payload)
            }
        })
        forEach(actions, (actionName, value) => {
            this.actions[actionName] = (payload) => {
                value(this, payload)
            }
        })
    }
    get state () {
        return this.vm.state
    }
    commit = (mutationName, payload) => {
        this.mutations[mutationName](payload)
    }
    dispatch = (actionName, payload) => {
        this.actions[actionName](payload)
    }
}

const install = (_Vue) => {
    Vue = _Vue
    Vue.mixin({
        beforeCreate() {
            if(this.$options.store) {
                this.$store = this.$options.store
            } else {
                this.$store = this.$parent && this.$parent.$store
            }
        }
    })

}

export default {
    Store,
    install
}
```
---------------------
接下来是关于模块的
- 首先模块名不能和根节点下的state中的属性一致
- 模块化将用户传入的结构格式化如下这种结构
```
let root = {
    _raw: rootModule,
    state: rootModule.state,
    _children: {
        a: {
            _raw: aModule,
            state: aModule.state,
            _children: {}
        }, 
        b: {
            _raw: bModule,
            state: bModule.state,
            _children: {}
        }, 
    },
    
}
```
接下来就是模块的收集
```
this.modules = new ModuleCollection(options)

class ModuleCollection {
    constructor(options) {
        this.register([], options)
    }
    register(path, rootModule) {
        let rawModule = {
            _raw: rootModule,
            _children: {},
            state: rootModule.state
        }
        rootModule.rawModule = rawModule
        if(!this.root) {
            this.root = rawModule
        } else {
            let parentModule = path.slice(0, -1).reduce((root, current) => {
                return root._children[current]
            }, this.root)
            parentModule._children[path[path.length-1]] = rawModule
        }
        if(rootModule.modules) {
            forEach(rootModule.modules, (moduleName, module) => {
                this.register(path.concat(moduleName), module)
            })
        }
    }
}
```
接下来就是模块的安装
```
function installModule(store, rootState, path, rawModule) {
    let getters = rawModule._raw.getters
    if(path.length > 0) {
        let parentState = path.slice(0, -1).reduce((root, current) => {
            return root[current]
        }, rootState)
        Vue.set(parentState, path[path.length-1], rawModule.state)
    }

    if(getters) {
        forEach(getters, (getterName, value) => {
            Object.defineProperty(store.getters, getterName, {
                get: () => {
                    return value(rawModule.state)
                }
            })
        });
    }
    let mutations = rawModule._raw.mutations
    if(mutations) {
        forEach(mutations, (mutationName, value) => {
            let arr = store.mutations[mutationName] || (store.mutations[mutationName] = [])
            arr.push((payload) => {
                value(rawModule.state, payload)
            })
        })
    }
    let actions = rawModule._raw.actions
    if(actions) {
        forEach(actions, (actionName, value) => {
            let arr = store.actions[actionName] || (store.actions[actionName] = [])
            arr.push((payload) => {
                value(store, payload)
            })
        })
    }
    forEach(rawModule._children, (moduleName, rawModule) => {
        installModule(store, rootState, path.concat(moduleName), rawModule)
    })
}

// 并且需要修改store的commit\dispatch方法，因为都变成了一个数组
```
可以动态注册模块
```
// store中添加一个方法
registerModule(path, module) {
    if(!Array.isArray(path)) {
        path = [path]
    }
    this.modules.register(path, module)
    installModule(this, this.state, path, module.rawModule)
}
```
命名空间
```
// installModule中添加
let root = store.modules.root
let namespaced = path.reduce((str, current) => {
    root = root._children[current]
    str += root._raw.namespaced ? current + '/' : ''
    return str
}, '')
// 然后将getters mutations actions中的命名拼接上namespaced
```
插件
```
// 自定义一个插件
function logger(store) {
  let prevState = JSON.stringify(store.state)
  store.subscribe((mutations, newState) => {
    console.log(prevState)
    console.log(mutations)
    console.log(JSON.stringify(newState))
    prevState = JSON.stringify(newState)
  })
}
```
完成插件功能
```
this.subs = []
let plugins = options.plugins
plugins.forEach(fn => fn(this))

subscribe(fn) {
    this.subs.push(fn)
}

// 每次执行完mutation之后
store.subs.forEach(fn => fn({type: namespaced+mutationName, payload: payload}, store.state))
```
replaceState方法
```
replaceState(state) {
    this.vm.state = state
}

function getState(store, path) {
    let local = path.reduce((newState, current) => {
        return newState[current]
    }, store.state)
    return local
}
```
辅助函数(简化版的)
```
export const mapState = (stateArr) => {
    let obj = {}
    stateArr.forEach(stateName => {
        obj[stateName] = function() {
            return this.$store.state[stateName]
        }
    })

    return obj
}

export const mapGetters = (stateArr) => {
    let obj = {}
    stateArr.forEach(stateName => {
        obj[stateName] = function() {
            return this.$store.getters[stateName]
        }
    })

    return obj
}

export const mapMutations = (obj) => {
    let res = {}
    Object.entries(obj).forEach(([key, value]) => {
        res[key] = function(...args) {
        this.$store.commit(value, ...args)
        }
    });
    return res
}

export const mapActions = (obj) => {
    let res = {}
    Object.entries(obj).forEach(([key, value]) => {
        res[key] = function(...args) {
        this.$store.dispatch(value, ...args)
        }
    });
    return res
}
```
最后又`strict:true`防止在mutations中写异步代码
```
this.vm.$watch(() => {
    return this.vm.state
},() => {
    console.assert(this._committing, '不能异步调用')
}, {deep: true, sync: true})

_widthCommit(fn) {
    const committing = this._committing
    this._committing = true
    fn()
    this._committing = committing
}
```