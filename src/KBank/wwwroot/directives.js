function configureDirectives(application) {
	application.controller("Web.Directives.BottomBar.Controller", Web.Directives.BottomBar.Controller);
	application.directive("bottombar", function() {
		return {
			templateUrl: "Directives/BottomBar/View.html",
			controller: "Web.Directives.BottomBar.Controller"
		}
	});
	application.controller("Web.Directives.TopBar.Controller", Web.Directives.TopBar.Controller);
	application.directive("topbar", function() {
		return {
			templateUrl: "Directives/TopBar/View.html",
			controller: "Web.Directives.TopBar.Controller"
		}
	});
}
