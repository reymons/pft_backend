ALTER TABLE recurring_transactions
DROP COLUMN updated_at;

ALTER TABLE recurring_transactions
ADD COLUMN updates_at timestamptz NOT NULL DEFAULT NOW();
