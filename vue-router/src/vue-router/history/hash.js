import History from './base'

function ensureSlash() {
    if(window.location.hash) {
        return
    }
    window.location.hash = '/'
}

class HashHistory extends History {
    constructor(router) {
        super(router)
        this.router = router
        ensureSlash()
    }
    getCurrentLocation() {
        return window.location.hash.slice(1)
    }
    setupListener() {
        window.addEventListener('hashchange', () => {
            this.transitionTo(window.location.hash.slice(1))
        })
    }
    push(location) {
        this.transitionTo(location, () => {
            window.location.hash = location
        })
    }
}

export default HashHistory