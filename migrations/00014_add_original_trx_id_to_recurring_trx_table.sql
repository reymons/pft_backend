ALTER TABLE recurring_transactions
ADD COLUMN original_trx_id integer,
ADD FOREIGN KEY (original_trx_id) REFERENCES transactions(id) ON DELETE CASCADE;
