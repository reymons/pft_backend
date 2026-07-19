ALTER TABLE budgets
ADD COLUMN starts_at timestamptz NOT NULL DEFAULT NOW()
