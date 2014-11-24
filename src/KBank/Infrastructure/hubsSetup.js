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
