let root = {
    _raw: rootModule,
    state: rootModule.state,
    children: {
        a: {
            _raw: aModule,
            state: aModule.state,
            children: {}
        }, 
        b: {
            _raw: bModule,
            state: bModule.state,
            children: {}
        }, 
    },
    
}