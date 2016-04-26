import GameObject from './engine/gameObject';
import Game from './engine/game';
import CameraSystem from './systems/camera';
import CameraComponent from './components/camera';
import LightSystem from './systems/light';
import LightComponent from './components/light';
import System from 'iron/ces/system';

import {StateMachine} from 'javascript-state-machine';
window.StateMachine = StateMachine;

import THREE from 'three.js';
window.THREE = THREE;

let game = window.game = new Game(document.body, { ambient: '#404040' });

game.create.add(function (game) {
    let go = new GameObject('GameObject');
    go.addComponent('camera', new CameraComponent({ aspectRatio: window.innerWidth / window.innerHeight }));

    game.addSystem(new CameraSystem());
    game.addSystem(new LightSystem());

    let fooSystem = new System();
    fooSystem.addedToWorld = function (world) {
        var cubeGeometry = new THREE.BoxGeometry(4, 4, 4);
        var cubeMaterial = new THREE.MeshLambertMaterial({ color: 0xff0000 });
        let cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
        // position the cube
        cube.position.x = 0;
        cube.position.y = 0;
        cube.position.z = -15;

        this.cube = cube;

        // add the cube to the scene
        world.scene.add(cube);

        let light = new GameObject('light1');
        light.addComponent('light', new LightComponent());
        light.position.x = 5;

        world.addEntity(light);
    };

    fooSystem.update = function (dt) {
        this.cube.rotation.y += 1 * dt;
    };

    game.addSystem(fooSystem);

    game.addEntity(go);
});

game.run();
