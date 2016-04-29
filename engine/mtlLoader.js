/**
 * Loads a Wavefront .mtl file specifying materials
 *
 * @author angelxuanchang
 */
import THREE from 'three.js';
import {material as materialCache} from './assetCache';

function parseMtlFile(text) {
    let lines = text.split('\n'),
        delimiter_pattern = /\s+/,
        info = {},
        materialsInfo = {};

    for (let line of lines) {
        line = line.trim();

        if (line.length === 0 || line.charAt(0) === '#') {
            // Blank line or comment ignore
            continue;
        }

        let pos = line.indexOf(' ');
        let key = (pos >= 0) ? line.substring(0, pos) : line;
        key = key.toLowerCase();
        let value = (pos >= 0) ? line.substring(pos + 1) : '';
        value = value.trim();

        if (key === 'newmtl') {
            // New material
            info = { name: value };
            materialsInfo[value] = info;
        } else if (info) {
            if (key === 'ka' || key === 'kd' || key === 'ks') {
                let ss = value.split(delimiter_pattern, 3);
                info[key] = [parseFloat(ss[0]), parseFloat(ss[1]), parseFloat(ss[2])];
            } else {
                info[key] = value;
            }
        }
    }

    return materialsInfo;
}

class MtlCreator {
    /**
     * @param path {string} Url relative to which textures are loaded
     * @param options
     *
     * side: Which side to apply the material
     * THREE.FrontSide (default), THREE.BackSide, THREE.DoubleSide
     *
     * wrap: What type of wrapping to apply for textures
     * THREE.RepeatWrapping (default), THREE.ClampToEdgeWrapping, THREE.MirroredRepeatWrapping
     *
     * normalizeRGB: RGBs need to be normalized to 0-1 from 0-255
     * Default: false, assumed to be already normalized
     *
     * ignoreZeroRGBs: Ignore values of RGBs (Ka,Kd,Ks) that are all 0's
     * Default: false
     */
    constructor(path, options) {
        this.path = path;
        this.options = options;
        this.materialsInfo = {};
        this.materials = {};
        this.materialsArray = [];
        this.nameLookup = {};

        this.side = (this.options && this.options.side) ? this.options.side : THREE.FrontSide;
        this.wrap = (this.options && this.options.wrap) ? this.options.wrap : THREE.RepeatWrapping;
    }

    setManager(value) {
        this.manager = value;
    }

    setCrossOrigin(value) {
        this.crossOrigin = value;
    }

    setMaterials(materialsInfo) {
        this.materialsInfo = this.convert(materialsInfo);
        this.materials = {};
        this.materialsArray = [];
        this.nameLookup = {};
    }

    convert(materialsInfo) {
        if (!this.options) {
            return materialsInfo;
        }

        let converted = {};

        for (let mn in materialsInfo) {
            // Convert materials info into normalized form based on options
            let mat = materialsInfo[mn];
            let covmat = {};

            converted[mn] = covmat;

            for (let prop in mat) {
                let save = true,
                    value = mat[prop],
                    lprop = prop.toLowerCase();

                switch (lprop) {
                    case 'kd':
                    case 'ka':
                    case 'ks':
                        // Diffuse color (color under white light) using RGB values
                        if (this.options && this.options.normalizeRGB) {
                            value = [value[0] / 255, value[1] / 255, value[2] / 255];
                        }

                        if (this.options && this.options.ignoreZeroRGBs) {
                            if (value[0] === 0 && value[1] === 0 && value[1] === 0) {
                                // ignore
                                save = false;
                            }
                        }
                        break;

                    default:
                        break;
                }

                if (save) {
                    covmat[lprop] = value;
                }
            }
        }

        return converted;
    }

    preload() {
        for (let mn in this.materialsInfo) {
            this.create(mn);
        }
    }

    getIndex(materialName) {
        return this.nameLookup[materialName];
    }

    getAsArray() {
        let index = 0;

        for (let mn in this.materialsInfo) {
            this.materialsArray[index] = this.create(mn);
            this.nameLookup[mn] = index;
            index++;
        }

        return this.materialsArray;
    }

    create(materialName) {
        if (this.materials[materialName] === undefined) {
            this._createMaterial(materialName);
        }

        return this.materials[materialName];
    }

    _createMaterial(materialName) {
        // Create material
        var mat = this.materialsInfo[materialName];
        var params = {
            name: materialName,
            side: this.side
        };

        for (var prop in mat) {
            var value = mat[prop];
            if (value === '') {
                continue;
            }

            switch (prop.toLowerCase()) {
                // Ns is material specular exponent
                case 'kd':
                    // Diffuse color (color under white light) using RGB values
                    params['color'] = new THREE.Color().fromArray(value);
                    break;

                case 'ks':
                    // Specular color (color when light is reflected from shiny surface) using RGB values
                    params['specular'] = new THREE.Color().fromArray(value);
                    break;

                case 'map_kd':
                    // Diffuse texture map
                    params['map'] = this.loadTexture(value);
                    params['map'].wrapS = this.wrap;
                    params['map'].wrapT = this.wrap;
                    break;

                case 'ns':
                    // The specular exponent (defines the focus of the specular highlight)
                    // A high exponent results in a tight, concentrated highlight. Ns values normally range from 0 to 1000.
                    params['shininess'] = parseFloat(value);
                    break;

                case 'd':
                    if (value < 1) {
                        params['opacity'] = value;
                        params['transparent'] = true;
                    }
                    break;

                case 'Tr':
                    if (value > 0) {
                        params['opacity'] = 1 - value;
                        params['transparent'] = true;
                    }
                    break;

                case 'map_bump':
                case 'bump':
                    // Bump texture map
                    if (params['bumpMap']) {
                        // Avoid loading twice.
                        break;
                    }
                    params['bumpMap'] = this.loadTexture(value);
                    params['bumpMap'].wrapS = this.wrap;
                    params['bumpMap'].wrapT = this.wrap;
                    break;

                default:
                    break;
            }
        }

        this.materials[materialName] = new THREE.MeshPhongMaterial(params);
        materialCache[materialName] = this.materials[materialName];
        return this.materials[materialName];
    }

    loadTexture(url, mapping, onLoad, onProgress, onError) {
        var texture;
        var loader = THREE.Loader.Handlers.get(url);
        var manager = (this.manager !== undefined) ? this.manager : THREE.DefaultLoadingManager;
        if (loader === null) {
            loader = new THREE.TextureLoader(manager);
        }
        if (loader.setCrossOrigin) {
            loader.setCrossOrigin(this.crossOrigin);
        }
        loader.setPath(this.path);
        texture = loader.load(url, onLoad, onProgress, onError);

        if (mapping !== undefined) {
            texture.mapping = mapping;
        }

        return texture;
    }
}

class MtlLoader {
    constructor(manager = THREE.DefaultLoadingManager) {
        this.manager = manager;
    }

    load(url, onLoad, onProgress, onError) {
        console.debug('mtlLoader load: ', url);
        let loader = new THREE.XHRLoader(this.manager);
        loader.setPath(this.path);
        loader.load(url, text => onLoad(this.parse(text)), onProgress, onError);
    }

    setPath(value) {
        this.path = value;
    }

    setCrossOrigin(value) {
        this.crossOrigin = value;
    }

    setMaterialOptions(value) {
        this.materialOptions = value;
    }

    parse(text) {
        let materialsInfo = parseMtlFile(text);
        let materialCreator = new MtlCreator(this.path, this.materialOptions);
        materialCreator.setCrossOrigin(this.crossOrigin);
        materialCreator.setManager(this.manager);
        materialCreator.setMaterials(materialsInfo);
        return materialCreator;
    }
}

// export to THREE namespace
THREE.MTLLoader = MtlLoader;