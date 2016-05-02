export default class Script {
    
    init() {
        // implement in subclass
    }
    
    update() {
        // implement in subclass
    }
    
    remove() {
        // implement in subclass
    }
    
    exec(method, ...args) {
        let fn = this[method];
        if(fn && typeof fn === 'function') {
            return fn.call(this, ...args);
        } else {
            console.warn('no method found: ', method);
        }        
    }
}