function configureRoutes(routeProvider) {
	routeProvider.when("/Accounts/Overview", { templateUrl: "Features/Accounts/Overview.html", controller: "Web.Features.Accounts.Overview" });
	routeProvider.when("/Accounts/Transfer", { templateUrl: "Features/Accounts/Transfer.html", controller: "Web.Features.Accounts.Transfer" });
}
