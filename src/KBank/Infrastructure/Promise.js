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
