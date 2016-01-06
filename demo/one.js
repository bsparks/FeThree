import Transform from '../components/transform';
import * as glMatrix from 'glMatrix';

window.foo = new Transform();

window.glMatrix = glMatrix;

glMatrix.vec3.set(foo.position, 120, 33, 55);
