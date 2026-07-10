CREATE TABLE budgets (
    id serial,
    user_id integer NOT NULL,
    amount numeric(12, 2) NOT NULL,
    period interval NOT NULL,

    PRIMARY KEY (id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE budget_categories (
    budget_id integer,
    category_id integer,

    PRIMARY KEY (budget_id, category_id),
    FOREIGN KEY (budget_id) REFERENCES budgets(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);
