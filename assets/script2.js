(function(){
    function Foo(entity) {
        this.entity = entity;

        this.init = function() {
            var otherScript = this.entity.getScriptComponent('TestController');
            console.debug('cross script access: ', otherScript);
        };
    }

    iron.script(Foo);
})();