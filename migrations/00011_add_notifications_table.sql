CREATE TABLE notifications (
    id serial,
    user_id integer NOT NULL,
    data jsonb NOT NULL,
    is_read bool NOT NULL DEFAULT FALSE,
    created_at timestamptz NOT NULL DEFAULT NOW(),

    PRIMARY KEY (id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
