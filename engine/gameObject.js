import THREE from 'three.js';
import {EntityMixin} from 'iron/ces/entity';
import Signal from 'iron/core/signal';
import {script as scriptCache} from './assetCache';

export default class GameObject extends EntityMixin(THREE.Object3D) {
    constructor(name = 'GameObject') {
        super();

        this.onChildAdded = new Signal();
        this.onChildRemoved = new Signal();

        this.initEntity(name);
    }

    addScriptComponent(scriptName) {
        let componentName = `_script_${scriptName}`;
        // script should be constructor function
        let scriptFn = scriptCache[scriptName];

        let script = new scriptFn(this);

        this.addComponent(componentName, script);
    }

    removeScriptComponent(scriptName) {
        let componentName = `_script_${scriptName}`;

        this.removeComponent(componentName);
    }

    getScriptComponent(scriptName) {
        let componentName = `_script_${scriptName}`;
        return this.getComponent(componentName);
    }

    add(child, ...more) {
        let self = this;
        child.addEventListener('added', function () {
            if (child instanceof GameObject) {
                self.onChildAdded.post(self, child);
            }
        });

        super.add(...[child, ...more]);
    }

    remove(child, ...more) {
        let self = this;
        child.addEventListener('removed', function () {
            if (child instanceof GameObject) {
                self.onChildRemoved.post(self, child);
            }
        });

        super.remove(...[child, ...more]);
    }
}