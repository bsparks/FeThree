import World from 'iron/ces/world';
import THREE from 'three.js';

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
    constructor(domElement = document.body) {
        super();
        
        this.scene = new THREE.Scene();
        this.renderer = new THREE.WebGLRenderer({
            precision: 'lowp'
        });
        this.renderer.setPixelRatio(1.0);
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.started = false;

        domElement.appendChild(this.renderer.domElement);

        window.addEventListener('resize', () => {
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        }, false);
    }

    start() {
        if (this.started) {
            console.warn('loop already started!');
            return;
        }
        this.started = true;
        requestAnimationFrame(loop.bind(this));
    }
}