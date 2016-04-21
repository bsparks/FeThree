import Component from 'iron/ces/component';

const defaults = {
    type: 'DirectionalLight',
    color: 0xffffff,
    intensity: 1,
    distance: 0,
    angle: Math.PI * 0.1,
    exponent: 10,
    skyColor: 0x00aaff,
    groundColor: 0xffaa00,
    visible: true,
    flicker: false
};

export default class LightComponent extends Component {
    constructor(config = {}) {
        super(Object.assign({}, defaults, config));
    }
}