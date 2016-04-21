import World from 'iron/ces/world';
import THREE from 'three.js';
import GameObject from './gameObject';

let timing = {
    scale: 1.0,
    last: 0,
    maxStep: 0.05,
    startTime: new Date(),
    elapsed: Number.MIN_VALUE,
    frameTime: Number.MIN_VALUE,
    step() {
        let current = window.performance.now(),
            frame = (current - this.last) / 1000.0;

        this.timestamp = current;
        this.frameTime = Math.min(frame, this.maxStep) * this.scale;
        this.elapsed += this.frameTime;
        this.last = current;
    }
}

function loop() {
    timing.step();
    this.update(timing.frameTime, timing.elapsed, timing.timestamp);

    requestAnimationFrame(loop.bind(this));
}

export default class Game extends World {
    constructor(domElement = document.body, {ambient = '0xffffff'} = {}) {
        super();
        
        this.options = {ambient};

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
        
        this.init();
    }
    
    init() {
        if (this.options.ambient) {
            let ambientLight = new THREE.AmbientLight(this.options.ambient);
            this.scene.add(ambientLight);
        }
        
        var cubeGeometry = new THREE.BoxGeometry(4, 4, 4);
        var cubeMaterial = new THREE.MeshLambertMaterial({color: 0xff0000});
        var cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
        // position the cube
        cube.position.x = 0;
        cube.position.y = 0;
        cube.position.z = -15;
        // add the cube to the scene
        this.scene.add(cube);
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