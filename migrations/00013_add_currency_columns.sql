ALTER TABLE users 
ADD COLUMN default_currency currency_code NOT NULL DEFAULT 'USD';

ALTER TABLE transactions
ADD COLUMN currency currency_code NOT NULL DEFAULT 'USD';

ALTER TABLE recurring_transactions
ADD COLUMN currency currency_code NOT NULL DEFAULT 'USD';

ALTER TABLE budgets 
ADD COLUMN currency currency_code NOT NULL DEFAULT 'USD';
