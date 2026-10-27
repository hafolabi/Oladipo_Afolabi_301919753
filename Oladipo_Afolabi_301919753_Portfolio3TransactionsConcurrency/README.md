# Portfolio 3: Transactions and Concurrency

**Marks:** 7  
**Database:** PostgreSQL  
**Progress:** Test cases planned; experiments still to run.

For a transfer to be correct, the money leaving one account and entering the other must be saved together. I’ll test that behaviour, then use two sessions to see what happens when requests compete for the same account balance.

Section 4 asks for commit, rollback, isolation, and a concurrency issue or control mechanism, supported by output. I’ll use account-row locking as the control example. Demonstrating every isolation level or both an unsafe and corrected implementation is not part of the core plan.

The table gives the expected outcomes. I’ll reset the fictional test data between experiments so one run does not affect the next.

| Experiment | What to do | What should happen |
| --- | --- | --- |
| Commit | Give A NGN 10,000 and B zero, then transfer NGN 2,000 in one transaction | A has NGN 8,000 and B has NGN 2,000; both entries are saved |
| Rollback | Start the same transfer and trigger a failure before commit | Neither entry remains, and both balances stay as they were |
| Isolation | Use two sessions to read an uncommitted change, then commit it and read again | Record what each statement can see and explain it using the chosen isolation level |
| Concurrent withdrawals with the lock | Start with NGN 1,000 and let two sessions each request NGN 800, using account-row locks and checking the balance after acquiring them | One withdrawal succeeds, leaving NGN 200; the other sees the reduced balance and is rejected |

## Results to keep

- [ ] Short SQL scripts for the transfer and locking examples, with the checks they use.
- [ ] Scripts showing `BEGIN`, `COMMIT`, and `ROLLBACK`.
- [ ] Commands for sessions A and B, including the order in which they were run.
- [ ] The isolation level and an explanation of what each session could see.
- [ ] Results showing how the account lock controls competing withdrawals.
- [ ] Account balances and checks that the entries balance before and after each run.
- [ ] Terminal outputs or screenshots with short explanations.
- [ ] Setup, software versions, and the order for running the session scripts.
- [ ] An explanation of what the checks showed, including any fixes or limits.

The rollback example can use a deliberate error or an insufficient-funds check. A log row written inside the same transaction will roll back too; implementing a separate durable failure-logging workflow is outside the core plan.

I’ll use PostgreSQL’s [transaction tutorial](https://www.postgresql.org/docs/current/tutorial-transactions.html) and [isolation documentation](https://www.postgresql.org/docs/current/transaction-iso.html) to explain the behaviour seen in the two sessions.

## Optional extensions

A short reversal example can reuse the same posting model. An unsafe concurrency example may help the explanation, but the planned locking demonstration already covers the control mechanism. Request-retry handling, automatic deadlock retries, and a full payment API are outside the core plan.
