import GameObject from './engine/gameObject';
import Game from './engine/game';
import CameraSystem from './systems/camera';
import CameraComponent from './components/camera';
import LightSystem from './systems/light';
import LightComponent from './components/light';
import System from 'iron/ces/system';
import MeshComponent from './components/mesh';
import MeshSystem from './systems/mesh';
import ScriptSystem from './script/scriptSystem';

import {StateMachine} from 'javascript-state-machine';
window.StateMachine = StateMachine;

import THREE from 'three.js';
window.THREE = THREE;

import * as cache from './engine/assetCache';
window.assetCache = cache;

import KeyboardInputSystem from './input/keyboard';

let game = window.game = new Game(document.body, { ambient: '#404040' });

game.init.add(function (game) {
    game.entityCache = {};
});

game.preload.add(function (game) {
    game.assets.add('image', 'crateTexture', 'assets/crate.gif');
    game.assets.add('material', 'crateMaterial', 'assets/crateMaterial.json');
    game.assets.add('mesh', 'bridge', 'assets/bridge.obj');
    game.assets.add('script', 'TestController', 'assets/testController.js');
    game.assets.add('script', 'test2', 'assets/script2.js');
});

game.create.add(function (game) {
    let go = new GameObject('GameObject');
    go.addComponent('camera', new CameraComponent({ aspectRatio: window.innerWidth / window.innerHeight }));
    go.position.z = 15;
    go.position.y = 8;
    go.rotateX(-0.5);

    game.entityCache['mainCamera'] = go;

    window.keyboard = new KeyboardInputSystem(document.body);

    game.addSystem(new ScriptSystem());
    game.addSystem(new CameraSystem());
    game.addSystem(new LightSystem());
    game.addSystem(new MeshSystem());

    let fooSystem = new System();
    fooSystem.addedToWorld = function (world) {
        let cube = new GameObject('Cube');
        /*
        cube.addComponent('mesh', new MeshComponent({
            type: 'box',
            width: 4,
            height: 4,
            depth: 4,
            material: 'crateMaterial'
        }));*/

        // position the cube
        cube.position.x = 0;
        cube.position.y = 0;
        cube.position.z = -15;

        let bridge = new GameObject('bridge');
        bridge.addComponent('mesh', new MeshComponent({ type: 'mesh', meshId: 'bridge' }));
        bridge.addScriptComponent('TestController');
        bridge.addScriptComponent('test2');
        world.addEntity(bridge);

        this.cube = cube;

        // add the cube to the scene
        world.addEntity(cube);

        let light = new GameObject('light1');
        light.addComponent('light', new LightComponent());
        light.position.x = 5;
        light.position.y = 10;

        world.addEntity(light);

        let ground = new GameObject('ground');
        ground.addComponent('mesh', new MeshComponent({type: 'plane', width: 10, height: 10, material: 'crateMaterial'}));
        ground.rotation.x = -Math.PI / 2;
        world.addEntity(ground);

        game.entityCache['ground'] = ground;
    };

    fooSystem.update = function (dt) {
        this.cube.rotation.y += 1 * dt;

        if(window.keyboard.wasPressed('A')) {
            console.debug('pressed!');
        }
    };

    game.addSystem(fooSystem);

    let helperSystem = new System();
    helperSystem.addedToWorld = function (world) {
        let gridHelper = new THREE.GridHelper(14, 1);
        gridHelper.setColors(0x303030, 0x303030);
        gridHelper.position.set(0, - 0.04, 0);
        gridHelper.add(new THREE.AxisHelper(100));

        world.scene.add(gridHelper);
    };

    game.addSystem(helperSystem);

    game.addSystem(window.keyboard);

    game.addEntity(go);
});

game.run();
