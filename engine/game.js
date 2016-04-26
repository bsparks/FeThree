import World from 'iron/ces/world';
import Signal from 'iron/core/signal';
import THREE from 'three.js';
import GameObject from './gameObject';
import {StateMachine} from 'javascript-state-machine';

let updateClock = new THREE.Clock();

function loop() {
    requestAnimationFrame(loop.bind(this));

    let delta = updateClock.getDelta();
    this.update(delta);
}

export default class Game extends World {
    constructor(domElement = document.body, {ambient = '0xffffff'} = {}) {
        super();

        this.options = { ambient, domElement };

        this.started = false;

        this.scene = null;
        this.renderer = null;

        this.state = StateMachine.create({
            events: [
                { name: 'startup', from: 'none', to: 'initializing'},
                { name: 'init', from: 'initializing', to: 'initialized' },
                { name: 'preload', from: 'initialized', to: 'loaded'},
                { name: 'create', from: 'loaded', to: 'ready'}
            ],
            callbacks: {
                onstartup: this._init.bind(this),
                oninitialized: this._preload.bind(this),
                onloaded: this._create.bind(this),
                onready: this._start.bind(this)
            }
        });

        this.init = new Signal();
        this.create = new Signal();
        this.preload = new Signal();
    }

    run() {
        this.state.startup();
    }

    _start() {
        if (this.started) {
            console.warn('loop already started!');
            return;
        }
        this.started = true;
        requestAnimationFrame(loop.bind(this));
    }

    _create() {
        this.create.post(this);

        this.state.create();
    }

    _preload() {
        this.preload.post(this);

        this.state.preload();
    }

    _init() {
        this.scene = new THREE.Scene();

        this.renderer = new THREE.WebGLRenderer({
            precision: 'lowp'
        });
        // TODO: the following set via options
        this.renderer.setPixelRatio(1.0);
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        //this.renderer.setClearColor(new THREE.Color(0xEEEEEE, 1.0));

        this.options.domElement.appendChild(this.renderer.domElement);

        window.addEventListener('resize', () => {
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        }, false);

        // now apply any user init
        this.init.post(this);

        // TODO: should this be passed in via options or custom create method?
        if (this.options.ambient) {
            let ambientLight = new THREE.AmbientLight(this.options.ambient);
            this.scene.add(ambientLight);
        }

        this.state.init();
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