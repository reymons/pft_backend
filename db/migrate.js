const { migrate } = require('postgres-migrations');
const path = require('path');

const { DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD } = process.env;

migrate(
  {
    host: DB_HOST,
    port: Number(DB_PORT),
    database: DB_NAME,
    user: DB_USER,
    password: DB_PASSWORD,
  },
  path.resolve(__dirname, '..', 'migrations'),
);
