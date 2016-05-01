import System from 'iron/ces/system';
import keyMap from './keys.js';

export default class KeyboardInputSystem extends System {
    constructor(domTarget = document) {
        super();
        
        this.domTarget = domTarget;
        
        this._keys = {};
        this._lastKeys = {};
        
        this._attachEvents();
    }
    
    isPressed(key) {
        return this._keys[keyMap[key]];
    }
    
    wasPressed(key) {
        return (!this._keys[keyMap[key]] && this._lastKeys[keyMap[key]]);
    }
    
    wasReleased(key) {
        (!this._keys[keyMap[key]] && !this._lastKeys[keyMap[key]]);
    }
    
    _attachEvents() {
        // store these so that they can be removed, yet still bound
        this._keydownBinding = this._onKeyDown.bind(this);
        this._keyupBinding = this._onKeyUp.bind(this);
        
        this.domTarget.addEventListener('keydown', this._keydownBinding, false);
        this.domTarget.addEventListener('keyup', this._keyupBinding, false);
    }
    
    _detachEvents() {
        this.domTarget.removeEventListener('keydown', this._keydownBinding);
        this.domTarget.removeEventListener('keyup', this._keyupBinding);
    }
    
    _onKeyDown(event) {
        let code = event.keyCode || event.charCode;
        if(event.shiftKey) {
            code = 'shift+' + code;
        }
        
        this._keys[code] = true;
    }
    
    _onKeyUp(event) {
        let code = event.keyCode || event.charCode;
        if(event.shiftKey) {
            code = 'shift+' + code;
        }
        
        this._keys[code] = false;
    }
    
    update() {
        this._lastKeys = Object.assign({}, this._keys);
    }
}