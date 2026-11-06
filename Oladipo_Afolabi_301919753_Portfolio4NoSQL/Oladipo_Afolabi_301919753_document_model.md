# AfolabiPay document model

This model uses two MongoDB collections: `customer_profiles` and `transaction_events`. A collection holds documents, much like a table holds rows. Documents can contain objects and arrays, so related details can be stored together.

## Customer profiles

The profile keeps a customer's name, contact details, and verification status together. For example:

```js
{
  _id: 1,
  name: { first: 'Ada', last: 'Okafor' },
  contact: { email: 'ada@example.test', phone: '+2340000000001' },
  verification_status: 'verified',
}
```

`name` and `contact` are **embedded documents**: objects stored inside this document. A profile lookup returns them in one read. The query `{ 'contact.email': email }` uses a dot to search the nested email field.

## Payment events

Each completed payment stores its details and two entries in one document. This excerpt shows the transfer from Ada to Bello; the full document also has request and posting dates:

```js
{
  _id: 3,
  transaction_reference: 'TRF-001',
  transaction_type: 'transfer',
  status: 'posted',
  entries: [
    { account_number: '1000000001', customer_id: 1, amount_minor: Long.fromString('-200000') },
    { account_number: '1000000002', customer_id: 2, amount_minor: Long.fromString('200000') },
  ],
}
```

`Long` comes from the MongoDB driver. It stores a signed 64-bit integer. Here, `200000` kobo means NGN 2,000. Dates are BSON dates, created with JavaScript's `new Date(...)`.

The entries are embedded because they belong to one payment and are read together. A history query searches `'entries.account_number'` and returns the whole matching payment, including both sides.

## How the IDs match the SQL example

Profile `_id` values `1` and `2` match Ada's and Bello's SQL customer IDs. Event `_id` values `1`, `2`, and `3` match `DEP-001`, `DEP-002`, and `TRF-001`. The amounts and timestamps reuse those SQL examples.

An entry's `customer_id` references a profile's `_id`. Clearing uses `null` because it has no customer owner. Account numbers match the existing SQL accounts. MongoDB does not automatically enforce these references as SQL foreign keys would. The two databases are loaded separately; there is no automatic synchronisation.

## Why this structure fits

- A customer lookup reads the profile and its small contact details together.
- A payment lookup reads both entries with their payment details, without joining separate entry rows.
- Each payment's entries array stays at two items in this model. Growing account history stays in separate event documents instead of one ever-growing customer array.
- References keep customer contact details in the profile rather than repeating them in every payment.

MongoDB can insert one event document atomically, keeping its entries in the same write. That does not enforce balanced amounts or prevent an overdraft across separate events. The runner checks the sample's entry pairs; PostgreSQL remains the main financial record in this case study. This activity demonstrates a document model for profile and payment-history reads.

These choices follow MongoDB's guidance on [embedding](https://www.mongodb.com/docs/manual/data-modeling/embedding/) and [document relationships](https://www.mongodb.com/docs/v8.0/applications/data-models-relationships/).
