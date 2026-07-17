CREATE TYPE transaction_type AS ENUM ('income', 'expense');

CREATE TABLE recurring_transactions (
    id serial,
    user_id integer NOT NULL,
    type transaction_type NOT NULL,
    name varchar(50) NOT NULL,
    category_id integer NOT NULL,
    description varchar(100),
    update_interval interval NOT NULL,
    updated_at timestamptz NOT NULL DEFAULT NOW(), 

    PRIMARY KEY (id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id)
);

CREATE TABLE transactions (
    id serial,
    user_id integer NOT NULL,
    type transaction_type NOT NULL,
    name varchar(50) NOT NULL,
    category_id integer NOT NULL,
    recurring_trx_id integer,
    description varchar(100),
    created_at timestamptz NOT NULL DEFAULT NOW(),

    PRIMARY KEY (id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id),
    FOREIGN KEY (recurring_trx_id) REFERENCES recurring_transactions(id) ON DELETE SET NULL
);
