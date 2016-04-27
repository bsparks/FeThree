import System from 'iron/ces/system';
import THREE from 'three.js';

export default class MeshSystem extends System {
    addedToWorld(world) {
        super.addedToWorld(world);

        world.onEntityAdded('mesh').add(function (entity) {
            let meshData = entity.getComponent('mesh'),
                mesh,
                geometry,
                material;

            if (meshData.material) {
                // TODO: load from material cache
            }

            if (meshData.type === 'box') {
                let {width = 1, height = 1, depth = 1, widthSegments, heightSegments, depthSegments} = meshData;
                geometry = new THREE.BoxGeometry(width, height, depth, widthSegments, heightSegments, depthSegments);
            } else if (meshData.type === 'sphere') {
                let {radius, widthSegments, heightSegments, phiStart, phiLength, thetaStart, thetaLength} = meshData;
                geometry = new THREE.SphereGeometry(radius, widthSegments, heightSegments, phiStart, phiLength, thetaStart, thetaLength);
            } else if (meshData.type === 'cylinder') {
                let {radiusTop, radiusBottom, height, radialSegments, heightSegments, openEnded, thetaStart, thetaLength} = meshData;
                geometry = new THREE.CylinderGeometry(radiusTop, radiusBottom, height, radialSegments, heightSegments, openEnded, thetaStart, thetaLength);
            }

            if (!geometry) {
                throw new Error('Invalid geometry');
            }

            mesh = new THREE.Mesh(geometry, material);

            entity.add(mesh);
        });
    }
}