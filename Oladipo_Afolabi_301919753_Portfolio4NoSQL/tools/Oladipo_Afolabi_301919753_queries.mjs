// A dot lets us search inside the embedded contact object.
export async function findCustomer(database, email) {
  return database.collection('customer_profiles').findOne({ 'contact.email': email });
}

// Match a payment if one of its entries uses this account number.
// Return the whole payment, including both sides, in posting-time order.
export async function findAccountHistory(database, accountNumber) {
  return database.collection('transaction_events')
    .find({ 'entries.account_number': accountNumber, status: 'posted' })
    .sort({ posted_at: 1, _id: 1 })
    .toArray();
}

export async function findCompletedTransfers(database) {
  return database.collection('transaction_events')
    .find({ transaction_type: 'transfer', status: 'posted' })
    .sort({ posted_at: 1, _id: 1 })
    .toArray();
}
