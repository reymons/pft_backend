const { execSync } = require('child_process');

const { DB_PORT, DB_NAME, DB_USER, DB_PASSWORD } = process.env;

[
  `CREATE DATABASE ${DB_NAME}`,
  `CREATE USER ${DB_USER} WITH PASSWORD '${DB_PASSWORD}'`,
  `GRANT ALL PRIVILEGES ON DATABASE ${DB_NAME} TO ${DB_USER}`,
].forEach((cmd) => {
  execSync(`psql -U postgres -p ${DB_PORT} -c "${cmd}"`);
});
