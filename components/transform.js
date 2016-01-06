import Component from 'iron/ces/component';
import {vec3, vec4} from 'glMatrix';

class Transform extends Component {
    constructor() {
        let position = vec3.create();
        let rotation = vec4.create();
        let scale = vec3.create();

        super({position, rotation, scale});
    }
}

export default Transform;
