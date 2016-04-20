import GameObject from '../three/gameObject';
import Game from '../three/game';
import CameraSystem from '../systems/camera';

let go = new GameObject('GameObject');

window.go = go;
let game = window.game = new Game();

game.addSystem(new CameraSystem());
