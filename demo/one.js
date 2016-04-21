import GameObject from '../three/gameObject';
import Game from '../three/game';
import CameraSystem from '../systems/camera';
import CameraComponent from '../components/camera';
import LightSystem from '../systems/light';
import LightComponent from '../components/light';

import THREE from 'three.js';
window.THREE = THREE;

let go = new GameObject('GameObject');
go.addComponent('camera', new CameraComponent({aspectRatio: window.innerWidth / window.innerHeight}));

window.go = go;
let game = window.game = new Game(document.body, {ambient: '#ffffff'});

game.addSystem(new CameraSystem());

game.addEntity(go);
