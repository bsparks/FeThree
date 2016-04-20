import THREE from 'three.js';
import {EntityMixin} from 'iron/ces/entity';

export default class GameObject extends EntityMixin(THREE.Object3D) {
    constructor(name = 'GameObject') {
        super();
        this.initEntity(name);
    }
}