-- $1 is the payment ID, $2 the source ID, $3 the destination ID, and $4 the kobo amount.
-- The same amount leaves one account and enters the other, so their sum is zero.
INSERT INTO transaction_entries (transaction_id, account_id, amount_minor)
VALUES
    ($1, $2, -($4::bigint)),
    ($1, $3, $4::bigint);
