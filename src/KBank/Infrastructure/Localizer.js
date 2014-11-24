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