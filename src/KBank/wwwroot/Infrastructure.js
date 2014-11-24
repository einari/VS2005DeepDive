namespace("Web.Infrastructure.Localization", {
    localizer: function () {
        var self = this;
        var resourcesForViewsAndLocale = {};

        this.currentLocale = "en";
        

        this.register = function (view, locale, resources) {
            var forView;

            locale = locale.toLowerCase();

            if (resourcesForViewsAndLocale.hasOwnProperty(view)) {
                forView = resourcesForViewsAndLocale[view];
            } else {
                forView = {};
            }

            resourcesForViewsAndLocale[view] = forView;

            forView[locale] = resources;
        };


        this.getFor = function (view) {
            if (resourcesForViewsAndLocale.hasOwnProperty(view)) {
                if (resourcesForViewsAndLocale[view].hasOwnProperty(self.currentLocale)) {
                    return resourcesForViewsAndLocale[view][self.currentLocale];
                }
            }

            return {};
        };
    }
});
(function () {
    function Promise() {
        var self = this;

        this.signalled = false;
        this.callback = null;
        this.error = null;
        this.hasFailed = false;
        this.failedCallback = null;

        function onSignal() {
            if (self.callback != null && typeof self.callback !== "undefined") {
                if (typeof self.signalParameter !== "undefined") {
                    self.callback(self.signalParameter, $promise.create());
                } else {
                    self.callback($promise.create());
                }
            }
        }

        this.fail = function (error) {
            if (self.failedCallback != null) {
                self.failedCallback(error);
            }
            self.hasFailed = true;
            self.error = error;
        };

        this.onFail = function (callback) {
            if (self.hasFailed) {
                callback(self.error);
            } else {
                self.failedCallback = callback;
            }
            return self;
        };


        this.signal = function (parameter) {
            self.signalled = true;
            self.signalParameter = parameter;
            onSignal();
        };

        this.continueWith = function (callback) {
            this.callback = callback;
            if (self.signalled === true) {
                onSignal();
            }
            return self;
        };
    }

    $promise = {
        create: function () {
            var promise = new Promise();
            return promise;
        }
    };
})();

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
(function (global) {

    var delayedServerInvocations = [];
    var connected = false;

    function callDelayedServerInvocations() {
        delayedServerInvocations.forEach(function (invocationFunction) {
            invocationFunction();
        });
    }

    function hubProxy(proxy) {
        function makeInvocationFunction(promise, method, args) {
            return function () {
                var argumentsAsArray = [];
                for (var arg = 0; arg < args.length; arg++) {
                    argumentsAsArray.push(args[arg]);
                }

                var allArguments = [method].concat(argumentsAsArray);
                proxy.invoke.apply(proxy, allArguments).done(function (result) {
                    promise.signal(result);
                });
            };
        }

        proxy.client = {};

        proxy.connection.received(function (data) {
            if (!data.H) return;
            var hubName = data.H.toLowerCase();
            if (proxy.hubName === hubName) {
                for (var property in proxy.client) {
                    if (property === data.M &&
                        proxy.client.hasOwnProperty(property) && 
                        typeof proxy.client[property] === "function") {

                        proxy.client[property].apply(this, data.A);
                    }
                }
            }
        });

        function serverMethod(method) {

            this.invoke = function () {
                var promise = $promise.create();

                var invocationFunction = makeInvocationFunction(promise, method, arguments);


                if (connected === false) {
                    delayedServerInvocations.push(invocationFunction);
                } else {
                    invocationFunction();
                }

                return promise;
            };
        }

        for (var serverCall in proxy.server) {
            proxy.server[serverCall] = new serverMethod(serverCall).invoke;
        }
    }

    function registerHubFactory($provide, hubName) {
        $provide.factory(hubName, function () {
            var proxy = $.connection.hub.createHubProxy(hubName);

            var hp = new hubProxy(proxy);
            return proxy;
        });
    }

    function __nothing() { }

    function setupAndRegisterProxies($provide) {

        for (var property in $.connection) {
            var value = $.connection[property];
            if (typeof value !== "undefined" && value !== null) {
                if( typeof value.hubName !== "undefined" && value !== null ) {
                    var hubName = property;
                    var proxy = $.connection.hub.createHubProxy(hubName);

                    // Remarks about the following line:
                    // - SignalR tells the server what hubs its interested in on startup. 
                    //   If there are no client calls, it won't receive messages
                    proxy.client.__need_this_for_subscription__ = __nothing;
                    registerHubFactory($provide, hubName);
                }
            }
        }
    }

    //$.connection.hub.logging = true;
    $(function () {
        $.connection.hub.start().done(function () {
            connected = true;
            callDelayedServerInvocations();
        });
    });


    global.hubsSetup = {
        setupAndRegisterProxies: setupAndRegisterProxies
    };
})(window);

namespace("Web.Infrastructure.Messaging", {
    messenger: function () {
        var subscribers = [];

        this.publish = function (topic, message) {
            if (subscribers.hasOwnProperty(topic)) {
                subscribers[topic].subscribers.forEach(function (item) {
                    item(message);
                });
            }
        };

        this.subscribeTo = function (topic, subscriber) {
            var subscribersByTopic;

            if (subscribers.hasOwnProperty(topic)) {
                subscribersByTopic = subscribers[topic];
            } else {
                subscribersByTopic = { subscribers: [] };
                subscribers[topic] = subscribersByTopic;
            }

            subscribersByTopic.subscribers.push(subscriber);
        };
    }
});
function namespace(ns, content) {
    var parent = window;
    var name = "";
    var parts = ns.split('.');
    parts.forEach(function (part) {
        if (name.length > 0) {
            name += ".";
        }
        name += part;
        if (!Object.prototype.hasOwnProperty.call(parent, part)) {
            parent[part] = {};
            parent[part].parent = parent;
            parent[part].name = name;
        }
        parent = parent[part];
    });

    if (typeof content === "object") {
        namespace.current = parent;

        var property;

        for (property in content) {
            parent[property] = content[property];
        }

        for (property in parent) {
            if (parent.hasOwnProperty(property)) {
                parent[property]._namespace = parent;
                parent[property]._name = property;
            }
        }
        namespace.current = null;
    }

    return parent;

}
function observablesFor(target, properties) {
    function observable(initialValue) {
        var value = initialValue;

        this.get = function () {
            return value;
        };
        this.set = function (input) {
            if (input === value) {
                return;
            }

            value = input;

            if (typeof target.$apply === "function") {
                target.$apply();
            }
        };
    }

    for (var property in properties) {
        Object.defineProperty(target, property, new observable(properties[property]));
    }
}