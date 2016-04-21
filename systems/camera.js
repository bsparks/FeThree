import System from 'iron/ces/system';
import THREE from 'three.js';

export default class CameraSystem extends System {
    addedToWorld(world) {
        super.addedToWorld(world);

        world.onEntityAdded('camera').add(function (entity) {
            var camData = entity.getComponent('camera'),
                cam;

            if (camData.projection === 'perspective') {
                cam = new THREE.PerspectiveCamera(camData.fov, camData.aspectRatio, camData.nearClip, camData.farClip);

                // TODO: remove on destroy?
                window.addEventListener('resize', function () {
                    cam.aspect = window.innerWidth / window.innerHeight;
                    cam.updateProjectionMatrix();
                }, false);
            } else {
                cam = new THREE.OrthographicCamera(camData.left, camData.right, camData.top, camData.bottom, camData.nearClip, camData.farClip);
            }

            // track reference
            camData._camera = cam;
            entity.add(cam);
        });

        world.onEntityRemoved('camera').add(function (entity) {
            entity.remove(entity.getComponent('camera')._camera);
        });
    }

    update(dt) {
        super.update(dt);
        
        var world = this.world;
        var cameras = world.getFamily('camera');

        if (cameras.length === 0) {
            return;
        }

        cameras = cameras.entities.toArray().sort(function (a, b) {
            if (a.getComponent('camera').priority > b.getComponent('camera').priority) {
                return 1;
            }

            if (a.getComponent('camera').priority < b.getComponent('camera').priority) {
                return -1;
            }

            return 0;
        });

        cameras.forEach(function (camera) {
            world.renderer.render(world.scene, camera.getComponent('camera')._camera);
        });
    }
}