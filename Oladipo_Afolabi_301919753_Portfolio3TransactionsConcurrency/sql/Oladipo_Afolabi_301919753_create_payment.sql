-- RETURNING gives JavaScript the ID needed for the entries and audit event.
INSERT INTO transactions (transaction_reference, transaction_type, status, posted_at)
VALUES ($1, $2, 'posted', CURRENT_TIMESTAMP)
RETURNING transaction_id;
