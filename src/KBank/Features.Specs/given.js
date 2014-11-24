var contextsByName = {};

function given(name, context) {
    if (contextsByName.hasOwnProperty(name)) {
        function weaved() {
            contextsByName[name].prototype = this;
            context.prototype = new contextsByName[name]();
            return new context();
        }

        return weaved;

    } else {
        contextsByName[name] = context;
    }

    return context;
}