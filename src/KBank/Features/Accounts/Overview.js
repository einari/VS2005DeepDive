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