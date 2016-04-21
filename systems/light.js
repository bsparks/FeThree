import System from 'iron/ces/system';
import THREE from 'three.js';

const LIGHTS = ['PointLight', 'DirectionalLight', 'SpotLight', 'AmbientLight', 'HemisphereLight'];

export default class LightSystem extends System {
    addedToWorld(world) {
        super.addedToWorld(world);

        world.entityAdded('light').add(function (entity) {
            var lightData = entity.getComponent('light'),
                light;

            if (LIGHTS.indexOf(lightData.type) === -1) {
                throw new TypeError('Invalid light type!');
            }

            switch (lightData.type) {
                case 'DirectionalLight':
                    light = new THREE.DirectionalLight(lightData.color, lightData.intensity);
                    break;
                case 'PointLight':
                    light = new THREE.PointLight(lightData.color, lightData.intensity, lightData.distance);
                    break;
                case 'SpotLight':
                    light = new THREE.SpotLight(lightData.color, lightData.intensity, lightData.distance, lightData.angle, lightData.exponent);
                    break;
                case 'AmbientLight':
                    light = new THREE.AmbientLight(lightData.color);
                    break;
                case 'HemisphereLight':
                    light = new THREE.HemisphereLight(lightData.skyColor, lightData.groundColor, lightData.intensity);
                    break;
            }

            if (lightData.visible !== undefined) {
                light.visible = lightData.visible;
            }

            if (!entity.visible) {
                light.visible = false;
            }

            if (lightData.flicker) {
                //lightData.flickerTimer = new Timer(0.2);
            }

            lightData._light = light;
            //$log.debug('building light: ', lightData, light);
            entity.add(light);
        });
    }
}