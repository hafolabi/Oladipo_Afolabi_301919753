import { Long } from 'mongodb';

// Reuse Ada, Bello, and the first three completed payments from Portfolio 1.
export async function loadSampleData(database) {
  await database.collection('customer_profiles').insertMany([
    {
      _id: 1,
      name: { first: 'Ada', last: 'Okafor' },
      contact: { email: 'ada@example.test', phone: '+2340000000001' },
      verification_status: 'verified',
    },
    {
      _id: 2,
      name: { first: 'Bello', last: 'Musa' },
      contact: { email: 'bello@example.test', phone: '+2340000000002' },
      verification_status: 'verified',
    },
  ]);

  // Each payment keeps both money entries in one document.
  // Long stores exact 64-bit whole kobo, including negative amounts.
  await database.collection('transaction_events').insertMany([
    {
      _id: 1,
      transaction_reference: 'DEP-001',
      transaction_type: 'deposit',
      status: 'posted',
      requested_at: new Date('2026-10-02T09:00:00Z'),
      posted_at: new Date('2026-10-02T09:00:01Z'),
      entries: [
        { account_number: '0000000000', customer_id: null, amount_minor: Long.fromString('-1000000') },
        { account_number: '1000000001', customer_id: 1, amount_minor: Long.fromString('1000000') },
      ],
    },
    {
      _id: 2,
      transaction_reference: 'DEP-002',
      transaction_type: 'deposit',
      status: 'posted',
      requested_at: new Date('2026-10-02T09:05:00Z'),
      posted_at: new Date('2026-10-02T09:05:01Z'),
      entries: [
        { account_number: '0000000000', customer_id: null, amount_minor: Long.fromString('-500000') },
        { account_number: '1000000002', customer_id: 2, amount_minor: Long.fromString('500000') },
      ],
    },
    {
      _id: 3,
      transaction_reference: 'TRF-001',
      transaction_type: 'transfer',
      status: 'posted',
      requested_at: new Date('2026-10-02T10:00:00Z'),
      posted_at: new Date('2026-10-02T10:00:01Z'),
      entries: [
        { account_number: '1000000001', customer_id: 1, amount_minor: Long.fromString('-200000') },
        { account_number: '1000000002', customer_id: 2, amount_minor: Long.fromString('200000') },
      ],
    },
  ]);
}
