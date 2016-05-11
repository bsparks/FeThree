import System from 'iron/ces/system';
import {script as scriptCache} from '../engine/assetCache';

function safeExec(method, fn, ...args) {
    if (fn[method] && typeof fn[method] === 'function') {
        return fn[method].call(fn, ...args);
    }
}

export default class ScriptSystem extends System {
    addedToWorld(world) {
        super.addedToWorld(world);

        // for each script in assets, observe
        for(let scriptName in scriptCache) {
            let componentName = `_script_${scriptName}`;
            world.onEntityAdded(componentName).add(function(entity) {
                let script = entity.getComponent(componentName);
                safeExec('init', script);
            });

            world.onEntityRemoved(componentName).add(function(entity) {
                let script = entity.getComponent(componentName);
                safeExec('remove', script);
            });
        }
    }

    update(dt) {
        for(let scriptName in scriptCache) {
            let componentName = `_script_${scriptName}`;
            // for each we need to update
            this.world.getFamily(componentName).forEach(function(entity) {
                let script = entity.getComponent(componentName);
                safeExec('update', script, dt);
            });
        }
    }
}