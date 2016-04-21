import THREE from 'three.js';
import {EntityMixin} from 'iron/ces/entity';
import Signal from 'iron/core/signal';

export default class GameObject extends EntityMixin(THREE.Object3D) {
    constructor(name = 'GameObject') {
        super();
        
        this.onChildAdded = new Signal();
        this.onChildRemoved = new Signal();
        
        this.initEntity(name);
    }

    add(child, ...more) {
        child.addEventListener('added', function () {
            if (child instanceof GameObject) {
                self.onChildAdded.emit(self, child);
            }
        });

        super.add(...[child, ...more]);
    }
    
    remove(child, ...more) {
        child.addEventListener('removed', function () {
            if (child instanceof GameObject) {
                self.onChildRemoved.emit(self, child);
            }
        });

        super.add(...[child, ...more]);
    }
}