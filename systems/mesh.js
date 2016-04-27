import System from 'iron/ces/system';
import THREE from 'three.js';
import {material as materialCache} from '../engine/assetCache';

export default class MeshSystem extends System {
    addedToWorld(world) {
        super.addedToWorld(world);

        world.onEntityAdded('mesh').add(function (entity) {
            let meshData = entity.getComponent('mesh'),
                mesh,
                geometry,
                material;

            if (meshData.material) {
                material = materialCache[meshData.material];
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
            } else if (meshData.type === 'plane') {
                let {width = 1, height = 1, widthSegments, heightSegments} = meshData;
                geometry = new THREE.PlaneGeometry(width, height, widthSegments, heightSegments);
            } else if (meshData.type === 'circle') {
                let {radius, segments, thetaStart, thetaLength} = meshData;
                geometry = new THREE.CircleGeometry(radius, segments, thetaStart, thetaLength);
            } else if (meshData.type === 'torus') {
                let {radius, tube, radialSegments, tubularSegments, arc} = meshData;
                geometry = new THREE.TorusGeometry(radius, tube, radialSegments, tubularSegments, arc);
            } else if (meshData.type === 'torusknot') {
                let {radius, tube, tubularSegments, radialSegments, p, q} = meshData;
                geometry = new THREE.TorusKnotGeometry(radius, tube, tubularSegments, radialSegments, p, q);
            } else if (meshData.type === 'ring') {
                let {innerRadius, outerRadius, thetaSegments, phiSegments, thetaStart, thetaLength} = meshData;
                geometry = new THREE.RingGeometry(innerRadius, outerRadius, thetaSegments, phiSegments, thetaStart, thetaLength);
            }

            if (!geometry) {
                throw new Error('Invalid geometry');
            }

            mesh = new THREE.Mesh(geometry, material);

            entity.add(mesh);
        });
    }
}