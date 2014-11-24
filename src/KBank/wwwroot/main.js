(function () {
    var localizer = new Web.Infrastructure.Localization.localizer();
    var messenger = new Web.Infrastructure.Messaging.messenger();

    var application = angular.module("KForum", ["ng", "ngRoute", "ngAnimate"]);
    application.config(["$provide", "$routeProvider", "$locationProvider",
            function ($provide, $routeProvider, $locationProvider) {
                $routeProvider.when("/", { templateUrl: "Features/Accounts/Overview.html", controller: "Web.Features.Accounts.Overview" });
                configureRoutes($routeProvider);
                $locationProvider.html5Mode(true);

                $provide.value("localizer", localizer);
                $provide.value("messenger", messenger);

                $provide.decorator("$controller", ["$delegate", "localizer",
                    function ($delegate, localizer) {
                        return function (constructor, locals, later, indent) {
                            if (typeof constructor == "string") {
                                var name = constructor;
                                var controllerIndex = name.indexOf(".Controller");
                                if (controllerIndex > 0) {
                                    name = name.substr(0, controllerIndex);
                                }

                                locals.$scope.$currentControllerName = name;
                            }
                            return $delegate(constructor, locals, later, indent);
                        };
                    }]);

                hubsSetup.setupAndRegisterProxies($provide);

            }]);
    application.controller("Web.Features.Home", Web.Features.Home);
    configureControllers(application);
    configureDirectives(application);
})();