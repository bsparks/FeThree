import World from 'iron/ces/world';
import THREE from 'three.js';

export default class ThreeWorld extends World {
    constructor() {
        super();
        
        this.scene = new THREE.Scene();
    }
    
    
}