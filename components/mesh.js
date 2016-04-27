import Component from 'iron/ces/component';

const MESH_TYPES = ['box', 'sphere', 'cylinder', 'plane', 'torus', 'torusknot', 'circle', 'asset'];

const defaults = {
    type: 'box'
};

export default class MeshComponent extends Component {
    constructor(config = {}) {
        super(Object.assign({}, defaults, config));

        this.type = this.type.toLowerCase();

        if (MESH_TYPES.indexOf(this.type) < 0) {
            throw new Error('Invalid mesh type!', this.type);
        }
    }
}