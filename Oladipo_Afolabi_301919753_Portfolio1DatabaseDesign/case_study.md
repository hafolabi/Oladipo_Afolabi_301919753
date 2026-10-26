# Selected organisation: AfolabiPay

## About the organisation

AfolabiPay is a fictional fintech platform that lets individual customers open digital accounts and make payments. A customer can deposit money, withdraw funds, transfer money to another customer, and check their account history. Staff need to manage accounts, investigate payment problems, reverse eligible transactions, and check that the records agree with account balances.

The database stores customer details, accounts, transaction records, the entries that move money between accounts, and audit events. Customers, operations staff, support staff, auditors, and database administrators need different levels of access. The business rules below are assumptions for this course project.

## Who uses the database?

| User | Required operations |
| --- | --- |
| Customer | Check balances, request transfers and withdrawals, and view payment history |
| Operations staff | Record deposits, change account status, and request authorised reversals |
| Customer support staff | Look up a customer or payment to help resolve a problem, with limited access |
| Auditor | Trace transactions, review reversals, and check that balances agree with the ledger |
| Database administrator | Maintain the schema, manage access, and look after backups |

These roles describe the access the system would need. Login handling and any database permissions included in the project still need to be built.

## What needs to be stored?

| Data | Examples |
| --- | --- |
| Customers | Customer ID, name, unique email, phone number, verification status, and registration time |
| Accounts | Account ID, unique account number, owner, account kind, currency, and status |
| Transactions | Payment reference, a key for recognising retries, type, status, request and posting times, and the original payment reference for a reversal |
| Account postings | The transaction, affected account, and amount added or taken away |
| Audit events | When an action happened, who performed it, the related transaction where relevant, and an explanation |

## What the database needs to do

1. Register a customer and record their verification status using fictional data.
2. Open an account for a verified customer.
3. Record a deposit from a system clearing account into a customer account.
4. Record a withdrawal from a customer account into the clearing account.
5. Transfer value between two different active customer accounts.
6. Reject requests with invalid details or insufficient funds.
7. Reverse an eligible completed transaction by adding opposite entries linked to the original.
8. Show account history and calculate balances from completed postings.
9. Check that the amount leaving an account matches the amount entering the other account in each successful transaction.

A payment that fails before its entries are committed should leave balances unchanged. If a failure is reported after the entries have committed, an authorised reversal adds a new record that offsets the original payment. A payment that has already rolled back needs no further money movement.

## Assumptions and limits

- All money is in NGN. Amounts are stored as whole kobo, so NGN 1,250.00 is stored as 125000.
- Each customer account has one owner, and a customer may own several accounts. Joint accounts are outside the project.
- A system clearing account provides the other side of deposits and withdrawals. It has no customer owner and may have a negative balance in this simplified wallet model.
- New customer accounts start at zero. Opening funds are added through deposits so their source appears in the history.
- Customer balances must stay at zero or above. This also applies to reversals; debt recovery is outside the project.
- A completed transaction can be fully reversed once. Partial reversals and reversing a reversal are outside the project.
- The project covers payments within AfolabiPay. It leaves out transfers to other banks, foreign exchange, loans, interest, fees, card networks, and a customer-facing application.
- PostgreSQL is planned as the main financial record. The MongoDB activity will represent part of the same scenario using fictional profile and event data. Automatic synchronisation between the databases is outside the initial scope.

## How the design will be checked

The practical work will check that a transfer moves the correct amount once, a failed payment leaves balances unchanged, and retrying a request does not create a second payment. It will also check that two simultaneous withdrawals cannot overdraw an account and that a reversal keeps the original transaction visible. These checks still need to be run.
