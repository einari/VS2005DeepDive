/// <summary>Base controller</summary>
function controller($scope, localizer) {
    $scope.strings = localizer.getFor($scope.$currentControllerName);
    this.$scope = $scope;
    this.localizer = localizer;
}

(function () {
    function ensureDependency(dependencies, dependency) {
        var dependencyIndex = -1;
        dependencies.forEach(function (parameter, index) {
            if (parameter === dependency) {
                dependencyIndex = index;
                return;
            }
        });

        if (dependencyIndex === -1) {
            dependencies.push(dependency);
            dependencyIndex = dependencies.length - 1;
        }

        return dependencyIndex;

    }

    controller.extend = function (originalDependencies, ctor) {

        var dependencies = originalDependencies.slice(0);
        var $scopeIndex = ensureDependency(dependencies, "$scope");
        var localizerIndex = ensureDependency(dependencies, "localizer");

        var constructor = function () {
            this._ctor = ctor;

            this.createInstance = function (dependencies) {
                var controllerSuper = new controller(dependencies[$scopeIndex], dependencies[localizerIndex]);

                this._ctor.prototype = controllerSuper;

                var firstParameter = true;
                var body = "return new definition(";
                for (var index = 0; index < dependencies.length; index++) {
                    if (!firstParameter) {
                        body += ", ";
                    }
                    body += "dependencies[" + index + "]";
                    firstParameter = false;
                }
                body += ");";

                var createFunction = new Function("definition", "dependencies", body);

                var instance = createFunction(this._ctor, dependencies);

                return instance;
            };
        };

        var bodyFunction = function () {
            var instance = this.createInstance(arguments);
            return instance;
        };

        var entire = bodyFunction.toString();
        var body = entire.slice(entire.indexOf("{") + 1, entire.lastIndexOf("}"));

        var newFunction = new Function(dependencies, body);
        newFunction.prototype = new constructor();

        var definition = dependencies.slice(0);
        definition.push(newFunction);
        return definition;
    };
})();