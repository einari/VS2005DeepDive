describe("when initializing", given("an overview controller", function () {
    var context = this;

    it("should put the accounts into the scope", function () {
        expect(context.scope.accounts).toBe(context.accounts);
    });

    it("should apply the scope", function () {
        expect(context.scope.$apply.called).toBe(true);
    });
}));