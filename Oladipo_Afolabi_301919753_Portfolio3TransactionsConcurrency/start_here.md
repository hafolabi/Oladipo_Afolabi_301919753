# Start here: four transaction examples

Portfolio 2 read data. Portfolio 3 shows how database writes behave when they succeed, fail, or overlap with another request. Read the [requirements and results table](README.md#how-the-work-meets-the-brief) first.

## What is a database transaction?

The `transactions` table stores a payment. A **database transaction** groups several SQL commands into one operation:

```text
BEGIN -> write payment + two entries + audit event -> COMMIT
```

If an error happens before commit, `ROLLBACK` undoes those writes. JavaScript's `try/catch` catches the error; the SQL rollback is what actually undoes the database work.

## Follow the payment code

[payments.mjs](tools/payments.mjs) accepts an object containing a reference, type, source account number, destination account number, and amount in kobo. Ada sending Bello NGN 2,000 uses accounts `1000000001` and `1000000002`, with `amountMinor: 200000`.

`postPayment` starts a database transaction and calls `writePayment`. That function locks the accounts, checks the available funds, and inserts the payment, money entries, and audit event. `postPayment` then commits, or rolls back if something throws an error. The experiments sometimes call `writePayment` inside their own transaction so they can pause before committing.

The small files in [sql/](sql/) contain the statements. For example:

```js
const balanceResult = await database.query(queries.balance, [sourceAccountNumber]);
const availableMinor = balanceResult.rows[0].balance_minor;
```

`$1` in the balance SQL receives the account number. `await` waits for the answer. `database` is one connected `pg.Client`; all commands in a transaction must use that same connection. PostgreSQL returns the summed balance as text, and `BigInt` compares whole-number amounts without losing precision.

## What each example teaches

| Example | Lesson |
| --- | --- |
| Commit | Both money entries and the payment details are saved together |
| Rollback | A deliberate error before commit leaves no new payment rows or balance changes |
| Read Committed isolation | B cannot see A's unfinished payment, but its next read can see that payment after A commits |
| Account locking | The second withdrawal waits, then checks the reduced balance and rejects insufficient funds |

Read Committed prevents a **dirty read**, meaning a read of someone else's uncommitted work. It allows a **nonrepeatable read**, where a later statement sees a newly committed balance. The locks and fresh balance check provide the overdraft control; isolation at this level alone does not.

## Why does the lock come first?

If Ada has NGN 1,000, two requests for NGN 800 could both make their decision using the original amount. `SELECT ... FOR UPDATE` makes cooperating requests take turns on those account rows until commit or rollback.

The waiting request must read the balance in a **new statement after getting the lock**. In our example, it then sees NGN 200 and refuses the second withdrawal. Accounts are locked in ID order to reduce deadlock risk between these payment paths.

One terminal command opens separate A and B connections. An observer confirms PostgreSQL reports B waiting for A, then checks that only the first withdrawal was saved. Open [transaction_validation.txt](evidence/transaction_validation.txt) to follow the order, and the four numbered JSON files for the actual balances and rows.

The experiments use fixed inputs for repeatable checks. The interactive account-and-amount menu remains planned for after the last portfolio task.
