function controller() {
}

controller.extend = function () {
    for (var argumentIndex = 0; argumentIndex < arguments.length; argumentIndex++) {
        if (typeof arguments[argumentIndex] == "function") {
            return arguments[argumentIndex];
        }
    }

    return undefined;
};