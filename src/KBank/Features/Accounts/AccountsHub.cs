using System.Collections.Generic;
using System.Linq;
using Microsoft.AspNet.SignalR;

namespace KForum.Features.Accounts
{
    public class AccountsHub : Hub
    {
        static IEnumerable<Account> _accounts = new[]
        {
            new Account { AccountNumber = "123456", Balance = 1000 },
            new Account { AccountNumber = "654321", Balance = 500 }
        };


        public IEnumerable<Account> GetAll()
        {
            return _accounts;
        }

        public void Transfer(string from, string to, decimal amount)
        {
            var fromAccount = _accounts.Single(a => a.AccountNumber == from);
            fromAccount.Balance -= amount;

            var toAccount = _accounts.Single(a => a.AccountNumber == to);
            toAccount.Balance += amount;

            Clients.All.debited(from, fromAccount.Balance);
            Clients.All.credited(to, toAccount.Balance);
        }
    }
}