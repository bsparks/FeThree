import THREE from 'three.js';
import './objLoader';
import {
    texture as textureCache,
    material as materialCache,
    mesh as meshCache,
    geometry as geometryCache,
    script as scriptCache
} from './assetCache';

export default class AssetLoader {
    constructor() {
        this._assetsToLoad = {
            texture: [],
            image: [],
            material: [],
            geometry: [],
            sound: [],
            mesh: [],
            script: []
        };

        this._loaders = {
            texture: bulkLoadTextures,
            material: bulkLoadMaterials,
            mesh: bulkLoadMeshes,
            script: bulkLoadScripts
        };
    }

    setLoader(contentType, loader) {
        this._loaders[contentType] = loader;
    }

    add(assetType, key, assetUrl) {
        // each type will have its own bank
        this._assetsToLoad[assetType] = this._assetsToLoad[assetType] || [];

        let bank = this._assetsToLoad[assetType];

        bank.push({key, assetUrl});
    }

    load() {
        // first, load all the images (needed by materials)
        // for now we'll merge image & texture (later support texture metadata)
        let imageAssets = this._assetsToLoad.image.concat(this._assetsToLoad.texture);
        let materialsLoad = this._loaders.texture(imageAssets)
            .then((textures) => this._loaders.material(this._assetsToLoad.material));

        let meshLoad = this._loaders.mesh(this._assetsToLoad.mesh);

        let scriptsLoad = this._loaders.script(this._assetsToLoad.script);

        return Promise.all([materialsLoad, meshLoad, scriptsLoad]);
    }
}

function bulkLoadMaterials(assets) {
    let loader = new THREE.MaterialLoader();
    loader.setTextures(textureCache);

    let items = assets.map(function(asset) {
        let promise = new Promise((resolve, reject) => {
            loader.load(asset.assetUrl, function(material) {
                materialCache[asset.key] = material;
                resolve(material);
            }, undefined, reject);
        });

        return promise;
    });

    return Promise.all(items);
}

function bulkLoadTextures(assets) {
    // TODO: THREE TextureLoader expects a url to an image
    // instead load JSON with additional parameters for the texture,
    // include url or image cache key for image?
    let loader = new THREE.TextureLoader();
    let items = assets.map(function(asset) {
        let promise = new Promise((resolve, reject) => {
            loader.load(asset.assetUrl, function(texture) {
                textureCache[asset.key] = texture;
                resolve(texture);
            }, undefined, reject);
        });

        return promise;
    });

    return Promise.all(items);
}

function bulkLoadMeshes(assets) {
    let jsonLoader = new THREE.JSONLoader(), // three.js js file
        objLoader = new THREE.OBJLoader(); // .obj model

    let items = assets.map(function(asset) {
        let promise = new Promise((resolve, reject) => {
            if (asset.assetUrl.indexOf('.js') > 0) {
                jsonLoader.load(asset.assetUrl, function(geometry, materials) {
                    geometryCache[geometry.uuid] = geometry;

                    let mesh = new THREE.Mesh(geometry, materials);
                    console.debug('load js model: ', geometry, materials, mesh);
                    meshCache[asset.key] = mesh;
                    resolve(mesh);
                }, undefined, reject);
            }

            if (asset.assetUrl.indexOf('.obj') > 0) {
                let path = asset.assetUrl.substring(0, asset.assetUrl.lastIndexOf('/') + 1),
                    file = asset.assetUrl.substring(asset.assetUrl.lastIndexOf('/') + 1);
                objLoader.setPath(path);
                objLoader.load(file, function(mesh) {
                    meshCache[asset.key] = mesh;
                    resolve(mesh);
                }, undefined, reject);
            }
        });

        return promise;
    });

    return Promise.all(items);
}

function bulkLoadScripts(assets) {
    let items = assets.map(function(asset) {
        let promise = new Promise((resolve, reject) => {
            fetch(asset.assetUrl)
                .then(function(response) {
                    return response.text();
                })
                .then(function(text) {
                    scriptCache[asset.key] = text;
                    resolve(text);
                });
        });

        return promise;
    });

    return Promise.all(items);
}