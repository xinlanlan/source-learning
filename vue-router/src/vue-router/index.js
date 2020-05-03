import install from './install'
import createMatcher from './create-matcher'
import HashHistory from './history/hash'

class VueRouter {
    constructor(options) {
        this.matcher = createMatcher(options.routes || [])
        this.history = new HashHistory(this)
        this.beforeEachs = []
    }
    match(location) {
        return this.matcher.match(location)
    }
    push(location) {
        this.history.push(location)
    }
    init(app) {
        const history = this.history
        const setupHashListener = () => {
            history.setupListener()
        }
        history.transitionTo(
            history.getCurrentLocation(),
            setupHashListener
        )
        history.listen(route => {
            app._route = route
        })
    }
   
    beforeEach(cb) {
        this.beforeEachs.push(cb)
    }
}

VueRouter.install =  install

export default VueRouter