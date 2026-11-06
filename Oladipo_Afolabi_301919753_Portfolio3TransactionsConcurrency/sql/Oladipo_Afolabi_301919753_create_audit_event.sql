-- This event belongs to the same database transaction as the payment.
INSERT INTO audit_events (transaction_id, actor_reference, action, details)
VALUES ($1, 'portfolio-3-script', 'payment_posted', $2);
