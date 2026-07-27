CREATE EXTENSION pg_trgm;

CREATE TYPE currency_code AS ENUM (
    'USD', 'EUR', 'GBP', 'RSD', 'CHF', 'CAD', 'AUD', 'JPY', 'CNY', 
    'INR', 'PLN', 'CZK', 'HUF', 'RON', 'SEK', 'NOK', 'DKK', 'TRY'
);

CREATE TABLE users (
    id serial,
    name varchar(50) NOT NULL,
    password varchar(512) NOT NULL,
    default_currency currency_code NOT NULL,
    created_at timestamptz NOT NULL DEFAULT NOW(),

    PRIMARY KEY (id)
);

CREATE TABLE categories (
    id serial,
    user_id integer,
    type varchar(50),
    custom_name varchar(50),

    PRIMARY KEY (id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    UNIQUE (type),
    UNIQUE (user_id, custom_name)
);

INSERT INTO categories(type) VALUES ('groceries', 'furniture', 'sports', 'food');

CREATE TABLE exchange_rates (
    currency currency_code NOT NULL,
    usd_rate numeric(18, 8) NOT NULL,
    rate_date date NOT NULL,

    PRIMARY KEY (currency, rate_date),
    CHECK (usd_rate > 0)
);

CREATE TABLE budgets (
    id serial,
    user_id integer NOT NULL,
    name varchar(50) NOT NULL,
    amount numeric(12, 2) NOT NULL,
    period interval NOT NULL,
    currency currency_code NOT NULL,
    starts_at timestamptz NOT NULL,

    PRIMARY KEY (id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE budget_categories (
    budget_id integer,
    category_id integer,

    PRIMARY KEY (budget_id, category_id),
    FOREIGN KEY (budget_id) REFERENCES budgets(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE,
);

CREATE TYPE transaction_type AS ENUM ('income', 'expense');

CREATE TABLE recurring_transactions (
    id serial,
    user_id integer NOT NULL,
    type transaction_type NOT NULL,
    name varchar(50) NOT NULL,
    amount numeric(12, 2) NOT NULL,
    category_id integer NOT NULL,
    description varchar(100),
    currency currency_code NOT NULL,
    update_interval interval NOT NULL,
    updates_at timestamptz NOT NULL,

    PRIMARY KEY (id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id)
);

CREATE TABLE transactions (
    id serial,
    user_id integer NOT NULL,
    type transaction_type NOT NULL,
    name varchar(50) NOT NULL,
    amount numeric(12, 2) NOT NULL,
    category_id integer NOT NULL,
    recurring_trx_id integer,
    description varchar(100),
    currency currency_code NOT NULL,
    added_at timestamptz NOT NULL,
    created_at timestamptz NOT NULL DEFAULT NOW(),

    PRIMARY KEY (id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id),
    FOREIGN KEY (recurring_trx_id) REFERENCES recurring_transactions(id) ON DELETE SET NULL
);

CREATE TABLE notifications (
    id serial,
    user_id integer NOT NULL,
    data jsonb NOT NULL,
    is_read bool NOT NULL DEFAULT FALSE,
    created_at timestamptz NOT NULL DEFAULT NOW(),

    PRIMARY KEY (id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

