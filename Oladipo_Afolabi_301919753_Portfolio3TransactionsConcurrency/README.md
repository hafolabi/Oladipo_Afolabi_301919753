# Portfolio 3: Transactions and Concurrency

**Marks:** 7  
**Database:** PostgreSQL  
**Progress:** The experiments are planned but have not been run.

Moving money involves several changes that need to succeed together. This activity will check what happens when a transfer succeeds, when it fails partway through, and when two sessions try to spend from the same account at once.

The amounts below describe the expected results. Each experiment will start from a fresh copy of the relevant fictional data so an earlier run does not affect the next one.

| Experiment | What to do | What should happen |
| --- | --- | --- |
| Commit | Give A NGN 10,000 and B zero, then transfer NGN 2,000 in one transaction | A has NGN 8,000 and B has NGN 2,000; both entries are saved |
| Rollback | Start the same transfer and trigger a failure before commit | Neither entry remains, and both balances stay as they were |
| Insufficient funds | Try to withdraw more than A has | The request fails without leaving part of a payment behind |
| Isolation | Use two sessions to read an uncommitted change, then commit it and read again | Record what each statement can see and explain it using the chosen isolation level |
| Concurrent withdrawals without the lock | In a separate teaching experiment, let both sessions read NGN 1,000 and try to withdraw NGN 800 without the planned account lock | Record whether this sequence allows the account to go below zero; keep this experiment separate from the normal posting routine |
| Concurrent withdrawals with the lock | Repeat using account-row locks in a consistent order, checking the balance after acquiring the locks | One withdrawal can succeed; the other sees the reduced balance and is rejected |
| Reversal | Fully reverse the NGN 2,000 transfer while B still has enough money | A returns to NGN 10,000 and B to zero; the original payment and its reversal remain in the history |
| Retrying a request | Send the same request twice, then reuse its key with different payment details | The matching retry creates no second payment, and the changed request is rejected |

## What to save from the experiments

- [ ] Posting and reversal routines, with their checks and permissions.
- [ ] Scripts showing `BEGIN`, `COMMIT`, and `ROLLBACK`.
- [ ] Commands for sessions A and B, including the order in which they were run.
- [ ] The isolation level and an explanation of what each session could see.
- [ ] Results from the withdrawal experiment before and after adding the lock.
- [ ] Account balances and checks that the entries balance before and after each run.
- [ ] Terminal outputs or screenshots with short explanations.
- [ ] README instructions covering setup, software versions, and how to run the session scripts in the right order.
- [ ] An explanation of the checks performed and any corrections or limits found.

There is also a logging detail to check: an audit event written inside a transaction disappears if that transaction rolls back. To keep a record of the failure, the failure event needs to be saved in a separate transaction after the rollback.

The explanations will draw on PostgreSQL's [transaction tutorial](https://www.postgresql.org/docs/current/tutorial-transactions.html) and [isolation documentation](https://www.postgresql.org/docs/current/transaction-iso.html), alongside the results from the two sessions.
