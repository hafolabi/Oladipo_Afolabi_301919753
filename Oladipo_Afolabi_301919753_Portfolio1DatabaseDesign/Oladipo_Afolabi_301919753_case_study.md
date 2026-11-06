# Selected organisation: AfolabiPay

## About the organisation

AfolabiPay is a fictional fintech platform for individual customers. It offers digital accounts, deposits, withdrawals, and transfers between its customers. Customers need to see their balances and payment history. Staff need enough detail to trace a payment and check its recorded outcome.

The database stores customer details, accounts, transactions, account postings, and audit events. A posting records the amount added to or taken from an account. The sample audit events record payment outcomes and an account-status change. The users below read and review that information.

## Database users

| User | Required operations |
| --- | --- |
| Customer | Check balances, request transfers and withdrawals, and view payment history |
| Operations staff | Record deposits and review account status and payment outcomes |
| Customer support staff | Look up customer and payment records to help resolve a problem |
| Auditor | Trace transactions and check that balances agree with the ledger |
| Database administrator | Maintain the schema and run the database checks |

These roles explain the information different users need. The terminal menu demonstrates the payment operations using the existing fictional accounts.

## Data to store

| Data | Examples |
| --- | --- |
| Customers | Customer ID, name, unique email, phone number, verification status, customer status (`active`, `deleted`, `suspended`), and creation/update times |
| Accounts | Account ID, unique account number, owner, account type, currency, and status |
| Transactions | Payment reference, type, status, request and posting times, and the original transaction for a reversal |
| Account postings | The transaction, affected account, and amount added or taken away |
| Audit events | When an action happened, who performed it, the related transaction where relevant, and an explanation |

## Main operations

1. Store fictional customer details, verification statuses, and account records.
2. Record a deposit from a system clearing account into a customer account.
3. Record a withdrawal from a customer account into the clearing account.
4. Send money between two different active customer accounts.
5. Reject payment requests with invalid details or insufficient funds.
6. Show account history and calculate balances from completed postings.
7. Check that the amount leaving an account matches the amount entering the other account in each successful transaction, and review the audit entries.

Before commit, a rollback leaves balances unchanged. The sample SQL also demonstrates correcting a completed withdrawal with a new reversal transaction and opposite entries linked to the original. Both records remain available in the payment history.

## Scope of the project

These are the working assumptions for this course project:

- All amounts use NGN and are stored as whole kobo. For example, NGN 1,250.00 is stored as 125000.
- A customer can own several accounts, but each customer account has only one owner.
- A system clearing account supplies the other side of deposits and withdrawals. It has no customer owner and may go below zero in this simplified wallet model.
- Customer accounts start at zero. Opening funds come through recorded deposits.
- The payment functions check available funds so customer balances stay at zero or above.
- Payments move between the customer and clearing accounts recorded in AfolabiPay.
- PostgreSQL holds the main financial record. The MongoDB exercise uses separately loaded fictional profiles and events from the same scenario.
- Verification status is an attribute of the fictional customer records.

## Design checks

Portfolio 1 includes made-up deposits, a transfer, a withdrawal, its reversal, and pending or failed requests. The [saved output](evidence/Oladipo_Afolabi_301919753_schema_validation.txt) shows the closing balances and the checks of payment entries and table rules. The reversal is demonstrated through the sample SQL inserts.

Portfolio 3's [saved checks](../Oladipo_Afolabi_301919753_Portfolio3TransactionsConcurrency/evidence/Oladipo_Afolabi_301919753_transaction_validation.txt) show that a transfer moves the right amount, a rollback leaves balances unchanged, and Read Committed hides uncommitted payments. Its two-session locking example makes a second withdrawal wait, then reject insufficient funds after the first commits. The terminal menu reuses the deposit, withdrawal, and transfer functions and provides balance and payment-history queries.
