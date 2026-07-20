ALTER TABLE transactions
ADD COLUMN added_at timestamptz NOT NULL DEFAULT NOW();
