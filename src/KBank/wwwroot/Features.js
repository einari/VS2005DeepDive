namespace("Web.Features.Accounts", {
    Overview: controller.extend(["$scope", "accountsHub"], function ($scope, accountsHub) {

        $scope.accounts = [];

        accountsHub.server.getAll().continueWith(function (result) {
            $scope.accounts = result;
            $scope.$apply();
        });

        accountsHub.client.debited = accountsHub.client.credited = function (accountNumber, balance) {
            $scope.accounts.forEach(function (account) {
                if (account.AccountNumber === accountNumber) {
                    account.Balance = balance;
                }
            });
            $scope.$apply();
        };
    })
});
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
namespace("Web.Directives.BottomBar", {
    Controller: controller.extend([],function () {

    })
});
namespace("Web.Directives.TopBar", {
    Controller: controller.extend([],function () {

    })
});