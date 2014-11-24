namespace("Web.Features.Accounts", {
    Transfer: controller.extend(["$scope", "$routeParams", "accountsHub"], function ($scope, $routeParams, accountsHub) {
        
        $scope.from = $routeParams.from;
        $scope.to = "";
        $scope.amount = 0;

        $scope.transfer = function () {
            accountsHub.server.transfer($scope.from, $scope.to, $scope.amount).continueWith(function () {
                window.location = "/";
            });
        };
    })
});