# Portfolio 3: Transactions and Concurrency

**Marks:** 7

**Progress:** The four required demonstrations passed on 30 October 2026. Run the checks below to reproduce their output.

This activity follows the brief: transaction examples showing **commit, rollback, isolation, a concurrency issue or control mechanism, and screenshots/output evidence**. Saved terminal output and JSON provide the evidence.

## Run the four demonstrations

From the repository root, with Node.js 20 or later and npm:

```sh
cd Oladipo_Afolabi_301919753_Portfolio3TransactionsConcurrency/tools
npm ci
npm run verify
```

The first installation needs npm access or cached packages. Keep installation scripts enabled: the PostgreSQL package uses them to restore required file links. Run as a normal user, not root.

The runner starts a temporary native PostgreSQL server on `127.0.0.1:55329`, loads Portfolio 1's unchanged schema, and adds [three mock accounts](sample_data.sql): clearing (`0000000000`), Ada (`1000000001`), and Bello (`1000000002`). It resets the payment history and Ada's starting funds before each example. It never uses an existing database service. After the checks it stops the server and removes the temporary database.

If the port is occupied, use `P3_PORT=55330 npm run verify` in a macOS/Linux shell. The recorded environment is PostgreSQL 18.4, embedded-postgres 18.4.0-beta.17, pg 8.16.3, and Node.js 26.0.0 on macOS x64. Package versions are pinned in the lockfile; [environment.json](evidence/environment.json) records the actual run. Only macOS x64 has been tested here.

## How the work meets the brief

| Required evidence | Demonstration and checked result | Output |
| --- | --- | --- |
| Commit | Ada sends NGN 2,000 from NGN 10,000. `COMMIT` saves both entries: Ada has NGN 8,000 and Bello has NGN 2,000. | [01_commit.json](evidence/01_commit.json) |
| Rollback | A transfer is staged, then division by zero causes an error before commit. `ROLLBACK` removes its payment, entries, and audit event. All balances remain unchanged. | [02_rollback.json](evidence/02_rollback.json) |
| Isolation | Under Read Committed, B cannot see A's uncommitted transfer. After A commits, B's next read in the same transaction sees the new balance. | [03_isolation.json](evidence/03_isolation.json) |
| Concurrency control | Two requests each want NGN 800 from NGN 1,000. The second waits for an account lock, then reads NGN 200 and rejects its withdrawal. Only the first is saved. | [04_concurrency.json](evidence/04_concurrency.json) |
| Output evidence | The log records session order and passing checks. JSON records before/after balances, saved-row counts, and the observed lock wait. | [transaction_validation.txt](evidence/transaction_validation.txt) |

The isolation example demonstrates **no dirty read**: B does not see unfinished changes. Its later changed result is a **nonrepeatable read**, which Read Committed allows. One isolation level and one locking mechanism cover the selected examples; the brief does not require demonstrating every level or an additional unsafe implementation.

## Reading the code

Start with [the short reading guide](start_here.md), then [payments.mjs](tools/payments.mjs).

| File | Purpose |
| --- | --- |
| [payments.mjs](tools/payments.mjs) | Begin a transaction, lock accounts, check funds, save the payment, then commit or roll back |
| [sql/](sql/) | Small statements for locking, balances, payment details, entries, and audit events |
| [check_commit_rollback.mjs](tools/check_commit_rollback.mjs) | Check saving and undoing a transfer |
| [check_isolation.mjs](tools/check_isolation.mjs) | Check what two sessions can see |
| [check_concurrency.mjs](tools/check_concurrency.mjs) | Run the competing withdrawals and confirm a real lock wait |
| [test_helpers.mjs](tools/test_helpers.mjs) | Reset starting funds and check balances, entry pairs, and saved-row counts |
| [run_transactions.mjs](tools/run_transactions.mjs) | Start PostgreSQL, open the connections, run the four examples, and save output |

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

The payment helper supports the three operations used here: a deposit sets up starting funds, a transfer demonstrates commit/rollback/isolation, and withdrawals demonstrate locking. The interactive menu is still scheduled for after Portfolio 5.

This is a focused local demonstration. Every cooperating payment writer must follow the same lock-then-check order; arbitrary direct SQL can bypass it. Locking clearing too means some otherwise unrelated payments can wait for each other. Crash recovery, every isolation level, reversal workflows, and a full banking application are outside this activity.

[server_log.txt](evidence/server_log.txt) records startup, the deliberate division-by-zero error, and shutdown. Rerunning replaces the generated results and changes timestamps and process IDs.

The method follows PostgreSQL's [transactions tutorial](https://www.postgresql.org/docs/18/tutorial-transactions.html), [Read Committed documentation](https://www.postgresql.org/docs/18/transaction-iso.html), and [row-locking guide](https://www.postgresql.org/docs/18/explicit-locking.html), plus the [node-postgres guidance](https://node-postgres.com/features/transactions) to keep a transaction on one connection.
