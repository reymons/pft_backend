CREATE TYPE currency_code AS ENUM (
    'USD', 'EUR', 'GBP', 'RSD', 'CHF', 'CAD', 'AUD', 'JPY', 'CNY', 
    'INR', 'PLN', 'CZK', 'HUF', 'RON', 'SEK', 'NOK', 'DKK', 'TRY'
);

CREATE TABLE exchange_rates (
    currency currency_code NOT NULL,
    usd_rate numeric(18, 8) NOT NULL,
    rate_date date NOT NULL,

    PRIMARY KEY (currency, rate_date),
    CHECK (usd_rate > 0)
);
