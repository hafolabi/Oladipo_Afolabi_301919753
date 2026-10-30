-- Other payments using these accounts must wait until our transaction ends.
-- Always lock accounts in ID order, even when money travels the other way.
SELECT account_id, account_number, account_kind, status
FROM accounts
WHERE account_number IN ($1, $2)
ORDER BY account_id
FOR UPDATE;
