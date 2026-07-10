CREATE TABLE categories (
    id serial,
    user_id integer,
    type varchar(50),
    custom_name varchar(50),

    PRIMARY KEY (id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE (type),
    UNIQUE (user_id, custom_name)
);

INSERT INTO categories(type)
VALUES ('groceries'), ('food'), ('furniture'), ('sports');
