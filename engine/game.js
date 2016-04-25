import World from 'iron/ces/world';
import Signal from 'iron/core/signal';
import THREE from 'three.js';
import GameObject from './gameObject';
import StateMachine from 'javascript-state-machine';

let updateClock = new THREE.Clock();

function loop() {
    requestAnimationFrame(loop.bind(this));

    let delta = updateClock.getDelta();
    this.update(delta);
}

export default class Game extends World {
    constructor(domElement = document.body, {ambient = '0xffffff'} = {}) {
        super();

        this.options = { ambient };

        this.scene = new THREE.Scene();

        this.renderer = new THREE.WebGLRenderer({
            precision: 'lowp'
        });
        this.renderer.setPixelRatio(1.0);
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setClearColor(new THREE.Color(0xEEEEEE, 1.0));

        this.started = false;

        domElement.appendChild(this.renderer.domElement);

        window.addEventListener('resize', () => {
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        }, false);

        this.state = new StateMachine({
            initial: 'preload',
            events: [
                { name: 'load', from: 'preload', to: 'loaded' }
            ]
        });

        this.init();
    }

    init() {
        if (this.options.ambient) {
            let ambientLight = new THREE.AmbientLight(this.options.ambient);
            this.scene.add(ambientLight);
        }
    }

    addEntity(entity) {
        // entity should only be a GameObject
        super.addEntity(entity);

        entity.onChildAdded.add((entity, child) => {
            this._onEntityAddChild(entity, child);
        });
        entity.onChildRemoved.add((entity, child) => {
            this._onEntityRemoveChild(entity, child);
        });

        this._onEntityAddChild(null, entity);

        // only add top level ents to the scene
        if (!entity.parent) {
            this.scene.add(entity);
        }
    }

    removeEntity(entity) {
        super.removeEntity(entity);
        this._onEntityRemoveChild(null, entity);
        this.scene.remove(entity);
    }

    start() {
        if (this.started) {
            console.warn('loop already started!');
            return;
        }
        this.started = true;
        requestAnimationFrame(loop.bind(this));
    }

    _onEntityAddChild(entity, child) {
        if (child.children) {
            for (let c of child.children) {
                if (c instanceof GameObject) {
                    super.addEntity(c);
                }
            }
        }
    }

    _onEntityRemoveChild(entity, child) {
        if (child.children) {
            for (let c of child.children) {
                if (c instanceof GameObject) {
                    super.removeEntity(c);
                }
            }
        }
    }
}