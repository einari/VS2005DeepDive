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