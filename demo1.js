import GameObject from './engine/gameObject';
import Game from './engine/game';
import CameraSystem from './systems/camera';
import CameraComponent from './components/camera';
import LightSystem from './systems/light';
import LightComponent from './components/light';
import System from 'iron/ces/system';
import MeshComponent from './components/mesh';
import MeshSystem from './systems/mesh';

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
    game.addSystem(new MeshSystem());

    let fooSystem = new System();
    fooSystem.addedToWorld = function (world) {
        let cube = new GameObject('Cube');
        cube.addComponent('mesh', new MeshComponent({
            type: 'box',
            width: 4,
            height: 4,
            depth: 4
        }));

        // position the cube
        cube.position.x = 0;
        cube.position.y = 0;
        cube.position.z = -15;

        let cylinder = new GameObject('Cylinder');
        cylinder.addComponent('mesh', new MeshComponent({type: 'cylinder'}));
        cube.add(cylinder);
        cylinder.position.x = 2;
        cylinder.position.z = -375;

        this.cube = cube;

        // add the cube to the scene
        world.addEntity(cube);

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
