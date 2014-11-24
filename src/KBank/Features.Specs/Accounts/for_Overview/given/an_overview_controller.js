given("an overview controller", function () {
    var context = this;
    var localizer = { getFor: function () { } }

    this.scope = {
        $currentControllerName: "Overview",
        $apply: sinon.stub()
    };
    
    this.accounts = [
        { AccountNumber: "123456", Balance: 1000 },
        { AccountNumber: "654321", Balance: 1000 }
    ];


    this.hub = {
        server: {
            getAll: function () {
                return {
                    continueWith: function (callback) {
                        callback(context.accounts);
                    }
                }
            }
        },
        client: {

        }
    };

    this.controller = new Web.Features.Accounts.Overview(this.scope, this.hub, localizer);

});