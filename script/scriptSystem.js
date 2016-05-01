import System from 'iron/ces/system';
import {script as scriptCache} from '../engine/assetCache';

export default class ScriptSystem extends System {
    constructor() {

    }

    addScript(scriptName, entity) {
        let componentName = `_script_${scriptName}`;
        // script should be typeof Script
        let script = scriptCache[scriptName];
        entity.addComponent(componentName, new script());
    }

    addedToWorld(world) {
        super.addedToWorld(world);

        // for each script in assets, observe
        for(let scriptName in scriptCache) {
            let componentName = `_script_${scriptName}`;
            world.onEntityAdded(componentName).add(function(entity) {
                let script = entity.getComponent(componentName);
                script.exec('init');
            });

            world.onEntityRemoved(componentName).add(function(entity) {
                let script = entity.getComponent(componentName);
                script.exec('remove');
            });
        }
    }

    update(dt) {
        // for each we need to update
        this.world.getFamily().forEach(function(entity) {

        });
    }
}