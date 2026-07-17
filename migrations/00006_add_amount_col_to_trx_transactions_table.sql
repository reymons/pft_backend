ALTER TABLE transactions
ADD amount numeric(12, 2) NOT NULL DEFAULT 0;

ALTER TABLE recurring_transactions
ADD amount numeric(12, 2) NOT NULL DEFAULT 0;
