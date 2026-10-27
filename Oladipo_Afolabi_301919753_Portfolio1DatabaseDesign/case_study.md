# Selected organisation: AfolabiPay

## About the organisation

AfolabiPay is a fictional fintech platform for individual customers. It offers digital accounts, deposits, withdrawals, and transfers between its customers. Customers need to see their balances and payment history. Staff need enough detail to trace a payment, resolve a problem, or reverse a transaction when the rules allow it.

The database will hold customer details, accounts, transactions, account postings, and audit events. A posting records the amount added to or taken from an account. Audit events record actions such as requesting a reversal or changing an account’s status. The users below need different access to that information.

## Database users

| User | Required operations |
| --- | --- |
| Customer | Check balances, request transfers and withdrawals, and view payment history |
| Operations staff | Record deposits, change account status, and request authorised reversals |
| Customer support staff | Look up a customer or payment to help resolve a problem, with limited access |
| Auditor | Trace transactions, review reversals, and check that balances agree with the ledger |
| Database administrator | Maintain the schema, manage access, and look after backups |

These roles explain who would use the database. Implementing logins, a user interface, or a full permissions system is outside this portfolio’s core scope.

## Data to store

| Data | Examples |
| --- | --- |
| Customers | Customer ID, name, unique email, phone number, verification status, and registration time |
| Accounts | Account ID, unique account number, owner, account kind, currency, and status |
| Transactions | Payment reference, type, status, request and posting times, and the original transaction for a reversal |
| Account postings | The transaction, affected account, and amount added or taken away |
| Audit events | When an action happened, who performed it, the related transaction where relevant, and an explanation |

## Main operations

1. Register a customer and record their verification status using fictional data.
2. Open an account for a verified customer.
3. Record a deposit from a system clearing account into a customer account.
4. Record a withdrawal from a customer account into the clearing account.
5. Transfer value between two different active customer accounts.
6. Reject requests with invalid details or insufficient funds.
7. Reverse an eligible completed transaction by adding opposite entries linked to the original.
8. Show account history and calculate balances from completed postings.
9. Check that the amount leaving an account matches the amount entering the other account in each successful transaction.

The point at which a payment fails matters. Before commit, a rollback should leave balances unchanged. After commit, correcting the payment needs an authorised reversal with new, opposite entries. Keeping the original and reversal makes the history easier to trace.

## Scope of the project

These are the working assumptions for this course project:

- All amounts use NGN and are stored as whole kobo. For example, NGN 1,250.00 is stored as 125000.
- A customer can own several accounts, but each customer account has only one owner. Joint accounts are outside the scope.
- A system clearing account supplies the other side of deposits and withdrawals. It has no customer owner and may go below zero in this simplified wallet model.
- Customer accounts start at zero. Opening funds come through recorded deposits.
- Customer balances must stay at zero or above, including after a reversal. Debt recovery is outside the scope.
- A completed transaction can be fully reversed once. Partial reversals and reversals of reversals are outside the scope.
- Payments stay within AfolabiPay. Transfers to other banks, foreign exchange, loans, interest, fees, card networks, and a customer-facing application are outside the scope.
- PostgreSQL will hold the main financial record. The MongoDB exercise will use fictional profiles and events from the same scenario. Automatic synchronisation between the two databases is outside the initial scope.
- Verification status is a sample-data attribute. There is no external identity-checking service. Request-retry handling and a production payment API are also outside the core scope.

## How the design will be checked

I’ll use focused examples to check that a transfer moves the right amount and a rollback leaves balances unchanged. A two-session locking example will show how access to the same account is controlled. A short reversal example can reuse the same entries and preserve the original payment. These checks are still to run; the listed business operations describe the scenario rather than requiring a complete application for every operation.
