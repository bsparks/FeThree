(function(iron) {
    function TestControllerScript(entity) {
        this.entity = entity;
        console.debug('script ctor', arguments);
    }

    TestControllerScript.prototype.init = function() {
        console.debug('script init', this);
    };

    TestControllerScript.prototype.remove = function() {
        console.debug('script remove');
    };

    TestControllerScript.prototype.update = function(dt) {
        //console.debug('script update', dt);
        this.entity.rotation.y += dt * 2;
    };

    iron.script(TestControllerScript);
})(iron);