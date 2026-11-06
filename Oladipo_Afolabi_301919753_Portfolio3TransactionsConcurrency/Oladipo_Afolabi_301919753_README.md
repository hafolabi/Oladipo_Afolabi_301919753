# Portfolio 3: Transactions and Concurrency

**Marks:** 7

**Results:** The four demonstrations passed on 30 October 2026. The commands below reproduce their output.

This activity demonstrates **commit, rollback, Read Committed isolation, and account locking during competing withdrawals**. Saved terminal output and JSON record the results.

## Run the four demonstrations

To try your own amounts and account numbers, use the [terminal menu guide in the root README](../Oladipo_Afolabi_301919753_README.md#run-the-terminal-menu). The checks below demonstrate transaction and concurrency behaviour automatically.

From the repository root, with Node.js 20 or later and npm:

```sh
cd Oladipo_Afolabi_301919753_Portfolio3TransactionsConcurrency/tools
npm ci
npm run verify
```

The first installation needs npm access or cached packages. Keep installation scripts enabled: the PostgreSQL package uses them to restore required file links. Run as a normal user, not root.

The runner starts a temporary native PostgreSQL server on `127.0.0.1:55329`, loads Portfolio 1's unchanged schema, and adds [three mock accounts](Oladipo_Afolabi_301919753_sample_data.sql): clearing (`0000000000`), Ada (`1000000001`), and Bello (`1000000002`). It resets the payment history and Ada's starting funds before each example. It never uses an existing database service. After the checks it stops the server and removes the temporary database.

If the port is occupied, use `P3_PORT=55330 npm run verify` in a macOS/Linux shell. The recorded environment is PostgreSQL 18.4, embedded-postgres 18.4.0-beta.17, pg 8.16.3, and Node.js 26.0.0 on macOS x64. Package versions are pinned in the lockfile; [Oladipo_Afolabi_301919753_environment.json](evidence/Oladipo_Afolabi_301919753_environment.json) records the actual run. Only macOS x64 has been tested here.

## Demonstrations and results

| Demonstration | Checked result | Output |
| --- | --- | --- |
| Commit | Ada sends NGN 2,000 from NGN 10,000. `COMMIT` saves both entries: Ada has NGN 8,000 and Bello has NGN 2,000. | [Oladipo_Afolabi_301919753_01_commit.json](evidence/Oladipo_Afolabi_301919753_01_commit.json) |
| Rollback | A transfer is staged, then division by zero causes an error before commit. `ROLLBACK` removes its payment, entries, and audit event. All balances remain unchanged. | [Oladipo_Afolabi_301919753_02_rollback.json](evidence/Oladipo_Afolabi_301919753_02_rollback.json) |
| Isolation | Under Read Committed, B cannot see A's uncommitted transfer. After A commits, B's next read in the same transaction sees the new balance. | [Oladipo_Afolabi_301919753_03_isolation.json](evidence/Oladipo_Afolabi_301919753_03_isolation.json) |
| Concurrency control | Two requests each want NGN 800 from NGN 1,000. The second waits for an account lock, then reads NGN 200 and rejects its withdrawal. Only the first is saved. | [Oladipo_Afolabi_301919753_04_concurrency.json](evidence/Oladipo_Afolabi_301919753_04_concurrency.json) |
| Output evidence | The log records session order and passing checks. JSON records before/after balances, saved-row counts, and the observed lock wait. | [Oladipo_Afolabi_301919753_transaction_validation.txt](evidence/Oladipo_Afolabi_301919753_transaction_validation.txt) |

The isolation example demonstrates **no dirty read**: B does not see unfinished changes. Its later changed result is a **nonrepeatable read**, which Read Committed allows. Account locking and the subsequent balance check prevent both competing withdrawals from spending the same funds.

## Reading the code

Start with [the short reading guide](Oladipo_Afolabi_301919753_start_here.md), then [Oladipo_Afolabi_301919753_payments.mjs](tools/Oladipo_Afolabi_301919753_payments.mjs).

| File | Purpose |
| --- | --- |
| [Oladipo_Afolabi_301919753_payments.mjs](tools/Oladipo_Afolabi_301919753_payments.mjs) | Begin a transaction, lock accounts, check funds, save the payment, then commit or roll back |
| [sql/](sql/) | Small statements for locking, balances, payment details, entries, and audit events |
| [Oladipo_Afolabi_301919753_check_commit_rollback.mjs](tools/Oladipo_Afolabi_301919753_check_commit_rollback.mjs) | Check saving and undoing a transfer |
| [Oladipo_Afolabi_301919753_check_isolation.mjs](tools/Oladipo_Afolabi_301919753_check_isolation.mjs) | Check what two sessions can see |
| [Oladipo_Afolabi_301919753_check_concurrency.mjs](tools/Oladipo_Afolabi_301919753_check_concurrency.mjs) | Run the competing withdrawals and confirm a real lock wait |
| [Oladipo_Afolabi_301919753_test_helpers.mjs](tools/Oladipo_Afolabi_301919753_test_helpers.mjs) | Reset starting funds and check balances, entry pairs, and saved-row counts |
| [Oladipo_Afolabi_301919753_run_transactions.mjs](tools/Oladipo_Afolabi_301919753_run_transactions.mjs) | Start PostgreSQL, open the connections, run the four examples, and save output |

The SQL uses `$1`, `$2`, and similar placeholders. JavaScript supplies their values through `database.query(sql, values)`. Use the Node runner to execute these files; they are not standalone `psql -f` scripts. All amounts are whole kobo: `200000` means NGN 2,000.

## Session order and the balance check

One terminal command opens separate PostgreSQL connections A and B, plus an observer. They have distinct backend process IDs; this is genuine server concurrency, not two requests queued on one PGlite connection.

1. A begins Read Committed, locks the two relevant accounts in ID order, checks NGN 1,000, and stages its NGN 800 withdrawal.
2. B begins Read Committed and requests the same locks.
3. The observer uses `pg_stat_activity` and `pg_blocking_pids` to confirm B is blocked by A.
4. A commits and releases its locks.
5. B gets the locks, runs a **separate new balance query**, sees NGN 200, rejects the withdrawal, and rolls back.
6. The observer checks that only A's withdrawal remains and the ledger balances.

The code starts B's waiting request without immediately awaiting it, so A can still commit. A timed delay alone is not proof of blocking; PostgreSQL must report the lock wait. Reading the balance after acquiring the lock matters: the new Read Committed statement sees the payment that committed while B waited.

## Scope and supporting notes

The checks directly support the four demonstrations. Basic payment validation and ledger checks keep the examples using valid accounts, amounts, and balanced entries.

The payment helper supports the three operations used here: a deposit sets up starting funds, a transfer demonstrates commit/rollback/isolation, and withdrawals demonstrate locking. The terminal menu reuses these functions with values supplied by the user.

This is a focused local demonstration. Every cooperating payment writer must follow the same lock-then-check order; arbitrary direct SQL can bypass it. Locking clearing too means some otherwise unrelated payments can wait for each other.

[Oladipo_Afolabi_301919753_server_log.txt](evidence/Oladipo_Afolabi_301919753_server_log.txt) records startup, the deliberate division-by-zero error, and shutdown. Rerunning replaces the generated results and changes timestamps and process IDs.

The method follows PostgreSQL's [transactions tutorial](https://www.postgresql.org/docs/18/tutorial-transactions.html), [Read Committed documentation](https://www.postgresql.org/docs/18/transaction-iso.html), and [row-locking guide](https://www.postgresql.org/docs/18/explicit-locking.html), plus the [node-postgres guidance](https://node-postgres.com/features/transactions) to keep a transaction on one connection.
