-- The history query starts with one account and then finds its payment entries.
-- Put account_id first so PostgreSQL can find those entries through an index.
-- The original primary-key index starts with transaction_id, which serves a different lookup.
CREATE INDEX idx_entries_account_transaction
ON transaction_entries (account_id, transaction_id);
