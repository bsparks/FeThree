import THREE from 'three.js';
import {texture as textureCache, material as materialCache} from './assetCache';

export default class AssetLoader {
    constructor() {
        this._assetsToLoad = {
            texture: [],
            image: [],
            material: [],
            geometry: [],
            sound: []
        };

        this._loaders = {
            texture: bulkLoadTextures,
            material: bulkLoadMaterials
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

        return Promise.all([materialsLoad]);
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